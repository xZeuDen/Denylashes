import AnnouncementBar from "../../../components/AnnouncementBar";
import HeaderNav from "../../../components/HeaderNav";
import NewsletterFooter from "../../../components/NewsletterFooter";
import CheckoutSuccessClient from "../../../components/checkout/CheckoutSuccessClient";
import { createServiceRoleClient, hasSupabaseAdminEnv } from "../../../lib/supabase/admin";
import { getStripe, hasStripeEnv } from "../../../lib/stripe";

export const dynamic = "force-dynamic";

type CheckoutSuccessPageProps = {
  searchParams: Promise<{
    session_id?: string;
  }>;
};

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

const getStringId = (value: string | StripeObjectWithId | null | undefined) => {
  if (!value) return null;
  return typeof value === "string" ? value : value.id;
};

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

const syncPaidOrderFromSession = async (session: CheckoutSession) => {
  const orderId = session.metadata?.order_id ?? session.client_reference_id;
  if (!orderId || !hasSupabaseAdminEnv || session.payment_status !== "paid") {
    return;
  }

  const customerDetails = session.customer_details;
  const shippingDetails = session.shipping_details;

  await createServiceRoleClient()
    .from("orders")
    .update({
      status: "paid",
      customer_email: customerDetails?.email ?? session.customer_email ?? null,
      customer_name: customerDetails?.name ?? null,
      customer_phone: customerDetails?.phone ?? null,
      stripe_customer_id: getStringId(session.customer),
      stripe_payment_intent_id: getStringId(session.payment_intent),
      stripe_session_id: session.id,
      paid_at: new Date().toISOString(),
      cancelled_at: null,
      ...addressToUpdate("billing", customerDetails?.name, customerDetails?.address),
      ...addressToUpdate("shipping", shippingDetails?.name, shippingDetails?.address),
    })
    .eq("id", orderId);
};

const CheckoutSuccessPage = async ({ searchParams }: CheckoutSuccessPageProps) => {
  const { session_id: sessionId } = await searchParams;
  let amountTotal: number | null = null;
  let customerEmail: string | null = null;
  let orderId: string | null = null;
  let paymentStatus: string | null = null;

  if (sessionId && hasStripeEnv) {
    try {
      const session = await getStripe().checkout.sessions.retrieve(sessionId);
      amountTotal = session.amount_total;
      customerEmail =
        session.customer_details?.email ?? session.customer_email ?? null;
      orderId = session.metadata?.order_id ?? session.client_reference_id ?? null;
      paymentStatus = session.payment_status;
      await syncPaidOrderFromSession(session as CheckoutSession);
    } catch {
      paymentStatus = null;
    }
  }

  return (
    <div className="min-h-screen bg-white text-ink">
      <AnnouncementBar />
      <HeaderNav />
      <main>
        <CheckoutSuccessClient
          amountTotal={amountTotal}
          customerEmail={customerEmail}
          orderId={orderId}
          paymentStatus={paymentStatus}
        />
      </main>
      <NewsletterFooter />
    </div>
  );
};

export default CheckoutSuccessPage;
