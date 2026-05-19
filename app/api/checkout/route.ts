import { NextResponse } from "next/server";
import { createServiceRoleClient, hasSupabaseAdminEnv } from "../../../lib/supabase/admin";
import { getStripe, hasStripeEnv } from "../../../lib/stripe";
import type { Product } from "../../../lib/types";

export const runtime = "nodejs";

type CheckoutPayload = {
  items?: Array<{
    productId?: string;
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

const SHIPPING_COUNTRIES = ["IE", "GB"] as ["IE", "GB"];

const getBaseUrl = (request: Request) => {
  const origin = request.headers.get("origin");
  if (origin) return origin;
  return process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
};

const normalizeCartItems = (items: CheckoutPayload["items"]) => {
  if (!Array.isArray(items) || items.length === 0) {
    return null;
  }

  const quantities = new Map<string, number>();
  for (const item of items) {
    const productId = typeof item.productId === "string" ? item.productId : "";
    const quantity = Number(item.quantity);

    if (!productId || !Number.isInteger(quantity) || quantity < 1 || quantity > 99) {
      return null;
    }

    quantities.set(productId, (quantities.get(productId) ?? 0) + quantity);
  }

  if (quantities.size === 0 || quantities.size > 50) {
    return null;
  }

  return quantities;
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

  const quantities = normalizeCartItems(payload.items);
  if (!quantities) {
    return NextResponse.json({ error: "Your cart is empty or invalid." }, { status: 400 });
  }

  const productIds = Array.from(quantities.keys());
  const supabase = createServiceRoleClient();

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

  const orderProducts = productIds.map((productId) => {
    const product = productsById.get(productId)!;
    return {
      product,
      quantity: quantities.get(productId)!,
      lineTotalCents: product.price_cents * quantities.get(productId)!,
    };
  });

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
      status: "pending",
      subtotal_cents: subtotalCents,
      shipping_cents: shippingCents,
      total_cents: totalCents,
      currency,
      source: "stripe_checkout",
    })
    .select("id")
    .single();

  if (orderError || !order) {
    return NextResponse.json(
      { error: "Could not create your order." },
      { status: 500 }
    );
  }

  const orderItems = orderProducts.map(({ product, quantity, lineTotalCents }) => ({
    order_id: order.id,
    product_id: product.id,
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
    await supabase.from("orders").update({ status: "cancelled" }).eq("id", order.id);
    return NextResponse.json(
      { error: "Could not save your order items." },
      { status: 500 }
    );
  }

  const baseUrl = getBaseUrl(request);
  const stripe = getStripe();
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    client_reference_id: order.id,
    customer_creation: "always",
    billing_address_collection: "auto",
    phone_number_collection: { enabled: true },
    line_items: orderProducts.map(({ product, quantity }) => ({
      quantity,
      price_data: {
        currency: product.currency.toLowerCase(),
        unit_amount: product.price_cents,
        product_data: {
          name: product.title,
          description: product.short_desc || undefined,
          images: product.image_url?.startsWith("http")
            ? [product.image_url]
            : undefined,
          metadata: {
            product_id: product.id,
            product_slug: product.slug,
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

  const { error: updateError } = await supabase
    .from("orders")
    .update({
      stripe_session_id: session.id,
      checkout_url: session.url,
    })
    .eq("id", order.id);

  if (updateError || !session.url) {
    return NextResponse.json(
      { error: "Could not start Stripe Checkout." },
      { status: 500 }
    );
  }

  return NextResponse.json({ url: session.url });
}
