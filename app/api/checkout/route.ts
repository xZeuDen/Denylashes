import { NextResponse } from "next/server";
import { createServiceRoleClient, hasSupabaseAdminEnv } from "../../../lib/supabase/admin";
import { getStripe, hasStripeEnv } from "../../../lib/stripe";
import type { Product, ProductVariant } from "../../../lib/types";

export const runtime = "nodejs";

type CheckoutPayload = {
  items?: Array<{
    productId?: string;
    variantId?: string;
    quantity?: number;
  }>;
};

type CheckoutProduct = Pick<
  Product,
  | "id"
  | "slug"
  | "title"
  | "price_cents"
  | "currency"
  | "type"
  | "short_desc"
  | "image_url"
  | "is_active"
>;

type CheckoutVariant = Pick<
  ProductVariant,
  "id" | "product_id" | "length_value" | "stock_qty" | "is_active"
>;

type CartLine = {
  productId: string;
  variantId: string | null;
  quantity: number;
};

const SHIPPING_COUNTRIES = ["IE", "GB"] as ["IE", "GB"];

const getBaseUrl = (request: Request) => {
  const origin = request.headers.get("origin");
  if (origin) return origin;
  return process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
};

const getCartLineKey = (productId: string, variantId: string | null) =>
  variantId ? `${productId}:${variantId}` : productId;

const normalizeCartItems = (items: CheckoutPayload["items"]) => {
  if (!Array.isArray(items) || items.length === 0) {
    return null;
  }

  const quantities = new Map<string, CartLine>();
  for (const item of items) {
    const productId = typeof item.productId === "string" ? item.productId : "";
    const variantId =
      typeof item.variantId === "string" && item.variantId.trim()
        ? item.variantId.trim()
        : null;
    const quantity = Number(item.quantity);

    if (!productId || !Number.isInteger(quantity) || quantity < 1 || quantity > 99) {
      return null;
    }

    const lineKey = getCartLineKey(productId, variantId);
    const existing = quantities.get(lineKey);
    if (existing) {
      existing.quantity += quantity;
    } else {
      quantities.set(lineKey, { productId, variantId, quantity });
    }
  }

  if (quantities.size === 0 || quantities.size > 50) {
    return null;
  }

  return Array.from(quantities.values());
};

const getErrorMessage = (error: unknown) =>
  error instanceof Error ? error.message : "Unknown checkout error.";

const cancelDraftOrder = async (
  supabase: ReturnType<typeof createServiceRoleClient>,
  orderId: string
) => {
  await supabase
    .from("orders")
    .update({
      status: "cancelled",
      cancelled_at: new Date().toISOString(),
    })
    .eq("id", orderId);
};

export async function POST(request: Request) {
  if (!hasStripeEnv || !hasSupabaseAdminEnv) {
    return NextResponse.json(
      {
        error:
          "Checkout is not configured. Add Stripe and Supabase server env vars.",
      },
      { status: 500 }
    );
  }

  let payload: CheckoutPayload;
  try {
    payload = (await request.json()) as CheckoutPayload;
  } catch {
    return NextResponse.json({ error: "Invalid checkout payload." }, { status: 400 });
  }

  const cartLines = normalizeCartItems(payload.items);
  if (!cartLines) {
    return NextResponse.json({ error: "Your cart is empty or invalid." }, { status: 400 });
  }

  const productIds = Array.from(new Set(cartLines.map((line) => line.productId)));

  let supabase: ReturnType<typeof createServiceRoleClient>;

  try {
    supabase = createServiceRoleClient();
  } catch (error) {
    console.error("[checkout] Supabase admin client failed", error);
    return NextResponse.json(
      { error: "Supabase server connection is not configured correctly." },
      { status: 500 }
    );
  }

  const { data: products, error: productsError } = await supabase
    .from("products")
    .select(
      "id, slug, title, price_cents, currency, type, short_desc, image_url, is_active"
    )
    .in("id", productIds)
    .eq("is_active", true);

  if (productsError) {
    return NextResponse.json(
      { error: "Could not validate cart products." },
      { status: 500 }
    );
  }

  const productsById = new Map(
    ((products ?? []) as CheckoutProduct[]).map((product) => [product.id, product])
  );

  if (productsById.size !== productIds.length) {
    return NextResponse.json(
      { error: "One or more products are no longer available." },
      { status: 400 }
    );
  }

  const variantsById = new Map<string, CheckoutVariant>();
  const variantsByProductId = new Map<string, CheckoutVariant[]>();

  const physicalProductIds = productIds.filter(
    (productId) => productsById.get(productId)?.type === "physical"
  );

  if (physicalProductIds.length > 0) {
    const { data: productVariants, error: productVariantsError } = await supabase
      .from("product_variants")
      .select("id, product_id, length_value, stock_qty, is_active")
      .in("product_id", physicalProductIds)
      .eq("is_active", true);

    if (productVariantsError) {
      return NextResponse.json(
        { error: "Could not validate product lengths." },
        { status: 500 }
      );
    }

    for (const variant of (productVariants ?? []) as CheckoutVariant[]) {
      variantsById.set(variant.id, variant);
      const list = variantsByProductId.get(variant.product_id) ?? [];
      list.push(variant);
      variantsByProductId.set(variant.product_id, list);
    }
  }

  for (const productId of productIds) {
    const product = productsById.get(productId)!;
    const productVariants = variantsByProductId.get(productId) ?? [];
    if (product.type === "physical" && productVariants.length > 0) {
      const linesForProduct = cartLines.filter((line) => line.productId === productId);
      for (const line of linesForProduct) {
        if (!line.variantId) {
          return NextResponse.json(
            { error: `${product.title} requires a length selection.` },
            { status: 400 }
          );
        }
      }
    }
  }

  const orderProducts = [];
  for (const line of cartLines) {
    const product = productsById.get(line.productId)!;
    const variant = line.variantId ? variantsById.get(line.variantId) : null;

    if (line.variantId) {
      if (!variant || variant.product_id !== product.id) {
        return NextResponse.json(
          { error: "One or more selected lengths are no longer available." },
          { status: 400 }
        );
      }

      if (variant.stock_qty < line.quantity) {
        return NextResponse.json(
          {
            error:
              variant.stock_qty <= 0
                ? `${product.title} (${variant.length_value}) is out of stock.`
                : `Only ${variant.stock_qty} left for ${product.title} (${variant.length_value}).`,
          },
          { status: 400 }
        );
      }
    }

    orderProducts.push({
      product,
      variant,
      quantity: line.quantity,
      lineTotalCents: product.price_cents * line.quantity,
    });
  }

  const currency = "EUR";
  const subtotalCents = orderProducts.reduce(
    (sum, item) => sum + item.lineTotalCents,
    0
  );
  const shippingCents = 0;
  const totalCents = subtotalCents + shippingCents;
  const hasPhysicalProducts = orderProducts.some(
    ({ product }) => product.type === "physical"
  );

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      status: "cancelled",
      subtotal_cents: subtotalCents,
      shipping_cents: shippingCents,
      total_cents: totalCents,
      currency,
      source: "stripe_checkout",
      cancelled_at: new Date().toISOString(),
    })
    .select("id")
    .single();

  if (orderError || !order) {
    return NextResponse.json(
      { error: "Could not create your order." },
      { status: 500 }
    );
  }

  const orderItems = orderProducts.map(({ product, variant, quantity, lineTotalCents }) => ({
    order_id: order.id,
    product_id: product.id,
    variant_id: variant?.id ?? null,
    variant_length: variant?.length_value ?? null,
    qty: quantity,
    unit_price_cents: product.price_cents,
    line_total_cents: lineTotalCents,
    product_title: product.title,
    product_slug: product.slug,
    product_image_url: product.image_url,
    product_type: product.type,
  }));

  const { error: itemsError } = await supabase.from("order_items").insert(orderItems);
  if (itemsError) {
    await cancelDraftOrder(supabase, order.id);
    return NextResponse.json(
      { error: "Could not save your order items." },
      { status: 500 }
    );
  }

  const baseUrl = getBaseUrl(request);
  let session: Awaited<ReturnType<ReturnType<typeof getStripe>["checkout"]["sessions"]["create"]>>;

  try {
    const stripe = getStripe();
    session = await stripe.checkout.sessions.create({
      mode: "payment",
      client_reference_id: order.id,
      customer_creation: "always",
      billing_address_collection: "auto",
      phone_number_collection: { enabled: true },
      line_items: orderProducts.map(({ product, variant, quantity }) => ({
        quantity,
        price_data: {
          currency: product.currency.toLowerCase(),
          unit_amount: product.price_cents,
          product_data: {
            name: variant
              ? `${product.title} — ${variant.length_value}`
              : product.title,
            description: product.short_desc || undefined,
            images: product.image_url?.startsWith("http")
              ? [product.image_url]
              : undefined,
            metadata: {
              product_id: product.id,
              product_slug: product.slug,
              ...(variant
                ? {
                    variant_id: variant.id,
                    variant_length: variant.length_value,
                  }
                : {}),
            },
          },
        },
      })),
      metadata: {
        order_id: order.id,
      },
      payment_intent_data: {
        metadata: {
          order_id: order.id,
        },
      },
      shipping_address_collection: hasPhysicalProducts
        ? { allowed_countries: SHIPPING_COUNTRIES }
        : undefined,
      shipping_options: hasPhysicalProducts
        ? [
            {
              shipping_rate_data: {
                type: "fixed_amount",
                display_name: "Free tracked delivery",
                fixed_amount: {
                  amount: shippingCents,
                  currency: currency.toLowerCase(),
                },
              },
            },
          ]
        : undefined,
      success_url: `${baseUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/checkout/cancelled`,
    });
  } catch (error) {
    console.error("[checkout] Stripe Checkout session failed", error);
    await cancelDraftOrder(supabase, order.id);
    return NextResponse.json(
      { error: `Stripe Checkout error: ${getErrorMessage(error)}` },
      { status: 500 }
    );
  }

  const { error: updateError } = await supabase
    .from("orders")
    .update({
      stripe_session_id: session.id,
      checkout_url: session.url,
    })
    .eq("id", order.id);

  if (updateError || !session.url) {
    console.error("[checkout] Could not save Stripe session", updateError);
    await cancelDraftOrder(supabase, order.id);
    return NextResponse.json(
      { error: "Could not start Stripe Checkout." },
      { status: 500 }
    );
  }

  return NextResponse.json({ url: session.url });
}
