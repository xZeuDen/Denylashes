import Link from "next/link";
import AnnouncementBar from "../../../components/AnnouncementBar";
import HeaderNav from "../../../components/HeaderNav";
import NewsletterFooter from "../../../components/NewsletterFooter";

const CheckoutCancelledPage = () => {
  return (
    <div className="min-h-screen bg-white text-ink">
      <AnnouncementBar />
      <HeaderNav />
      <main className="mx-auto flex w-full max-w-[760px] flex-col gap-6 px-4 py-16 text-center sm:px-6">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted">
          Checkout cancelled
        </p>
        <h1 className="text-3xl font-semibold text-ink sm:text-4xl">
          Your bag is still saved
        </h1>
        <p className="text-sm leading-6 text-muted">
          No payment was taken. You can return to checkout when you are ready,
          or keep browsing the catalog.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/checkout"
            className="rounded-full border border-transparent bg-ink px-6 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-white transition hover:-translate-y-0.5 hover:shadow-soft focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
          >
            Return to checkout
          </Link>
          <Link
            href="/products"
            className="rounded-full border border-border bg-white px-6 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-ink transition hover:-translate-y-0.5 hover:border-ink/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
          >
            Continue shopping
          </Link>
        </div>
      </main>
      <NewsletterFooter />
    </div>
  );
};

export default CheckoutCancelledPage;
