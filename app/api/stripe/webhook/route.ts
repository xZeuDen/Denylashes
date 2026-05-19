import { NextResponse } from "next/server";
import { createServiceRoleClient, hasSupabaseAdminEnv } from "../../../../lib/supabase/admin";
import { getStripe, hasStripeEnv } from "../../../../lib/stripe";

export const runtime = "nodejs";

type StripeObjectWithId = { id: string };

type StripeAddress = {
  line1?: string | null;
  line2?: string | null;
  city?: string | null;
  state?: string | null;
  postal_code?: string | null;
  country?: string | null;
};

type CheckoutSession = {
  id: string;
  metadata?: Record<string, string> | null;
  client_reference_id?: string | null;
  payment_status?: string | null;
  customer_email?: string | null;
  customer?: string | StripeObjectWithId | null;
  payment_intent?: string | StripeObjectWithId | null;
  url?: string | null;
  customer_details?: {
    email?: string | null;
    name?: string | null;
    phone?: string | null;
    address?: StripeAddress | null;
  } | null;
  shipping_details?: {
    name?: string | null;
    address?: StripeAddress | null;
  } | null;
};

type PaymentIntent = {
  id: string;
  metadata?: Record<string, string> | null;
};

type Charge = {
  payment_intent?: string | StripeObjectWithId | null;
  amount_refunded: number;
  amount_captured: number;
};

const getStringId = (value: string | StripeObjectWithId | null | undefined) => {
  if (!value) return null;
  return typeof value === "string" ? value : value.id;
};

const getOrderId = (session: CheckoutSession) =>
  session.metadata?.order_id ?? session.client_reference_id ?? null;

const addressToUpdate = (
  prefix: "shipping" | "billing",
  name: string | null | undefined,
  address: StripeAddress | null | undefined
) => ({
  [`${prefix}_name`]: name ?? null,
  [`${prefix}_line1`]: address?.line1 ?? null,
  [`${prefix}_line2`]: address?.line2 ?? null,
  [`${prefix}_city`]: address?.city ?? null,
  [`${prefix}_state`]: address?.state ?? null,
  [`${prefix}_postal_code`]: address?.postal_code ?? null,
  [`${prefix}_country`]: address?.country ?? null,
});

const updateOrderFromSession = async (
  session: CheckoutSession,
  status: "paid" | "pending" | "cancelled"
) => {
  const orderId = getOrderId(session);
  const supabase = createServiceRoleClient();
  const now = new Date().toISOString();
  const customerDetails = session.customer_details;
  const shippingDetails = session.shipping_details;

  const update = {
    status,
    customer_email: customerDetails?.email ?? session.customer_email ?? null,
    customer_name: customerDetails?.name ?? null,
    customer_phone: customerDetails?.phone ?? null,
    stripe_customer_id: getStringId(session.customer),
    stripe_payment_intent_id: getStringId(session.payment_intent),
    stripe_session_id: session.id,
    checkout_url: session.url,
    paid_at: status === "paid" ? now : null,
    cancelled_at: status === "cancelled" ? now : null,
    ...addressToUpdate("billing", customerDetails?.name, customerDetails?.address),
    ...addressToUpdate("shipping", shippingDetails?.name, shippingDetails?.address),
  };

  if (orderId) {
    await supabase.from("orders").update(update).eq("id", orderId);
    return;
  }

  await supabase.from("orders").update(update).eq("stripe_session_id", session.id);
};

const updateOrderFromPaymentIntent = async (
  paymentIntent: PaymentIntent,
  status: "paid" | "cancelled"
) => {
  const orderId = paymentIntent.metadata?.order_id;
  if (!orderId) return;

  const now = new Date().toISOString();
  await createServiceRoleClient()
    .from("orders")
    .update({
      status,
      stripe_payment_intent_id: paymentIntent.id,
      paid_at: status === "paid" ? now : null,
      cancelled_at: status === "cancelled" ? now : null,
    })
    .eq("id", orderId);
};

export async function POST(request: Request) {
  if (!hasStripeEnv || !hasSupabaseAdminEnv || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json(
      { error: "Stripe webhook is not configured." },
      { status: 500 }
    );
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing Stripe signature." }, { status: 400 });
  }

  const body = await request.text();
  let event: {
    type: string;
    data: { object: unknown };
  };

  try {
    event = getStripe().webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Invalid signature.";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed":
    case "checkout.session.async_payment_succeeded": {
      const session = event.data.object as CheckoutSession;
      await updateOrderFromSession(
        session,
        session.payment_status === "paid" ? "paid" : "pending"
      );
      break;
    }
    case "checkout.session.expired":
    case "checkout.session.async_payment_failed": {
      await updateOrderFromSession(
        event.data.object as CheckoutSession,
        "cancelled"
      );
      break;
    }
    case "payment_intent.succeeded": {
      await updateOrderFromPaymentIntent(
        event.data.object as PaymentIntent,
        "paid"
      );
      break;
    }
    case "payment_intent.payment_failed":
    case "payment_intent.canceled": {
      await updateOrderFromPaymentIntent(
        event.data.object as PaymentIntent,
        "cancelled"
      );
      break;
    }
    case "charge.refunded": {
      const charge = event.data.object as Charge;
      const paymentIntentId =
        typeof charge.payment_intent === "string" ? charge.payment_intent : null;
      if (paymentIntentId && charge.amount_refunded >= charge.amount_captured) {
        await createServiceRoleClient()
          .from("orders")
          .update({ status: "refunded" })
          .eq("stripe_payment_intent_id", paymentIntentId);
      }
      break;
    }
    default:
      break;
  }

  return NextResponse.json({ received: true });
}
