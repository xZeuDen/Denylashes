import AnnouncementBar from "../../../components/AnnouncementBar";
import HeaderNav from "../../../components/HeaderNav";
import NewsletterFooter from "../../../components/NewsletterFooter";
import CheckoutSuccessClient from "../../../components/checkout/CheckoutSuccessClient";
import { getStripe, hasStripeEnv } from "../../../lib/stripe";

export const dynamic = "force-dynamic";

type CheckoutSuccessPageProps = {
  searchParams: {
    session_id?: string;
  };
};

const CheckoutSuccessPage = async ({ searchParams }: CheckoutSuccessPageProps) => {
  const sessionId = searchParams.session_id;
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
