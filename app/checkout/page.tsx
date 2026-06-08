"use client";

import Link from "next/link";
import { useState } from "react";
import AnnouncementBar from "../../components/AnnouncementBar";
import HeaderNav from "../../components/HeaderNav";
import NewsletterFooter from "../../components/NewsletterFooter";
import useCart from "../../components/cart/useCart";
import { formatEur } from "../../lib/format";

const CheckoutPage = () => {
  const { items, getLineKey } = useCart();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const subtotalCents = items.reduce(
    (sum, item) => sum + item.product.price_cents * item.quantity,
    0
  );

  const startCheckout = async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((item) => ({
            productId: item.product.id,
            variantId: item.variant?.id,
            quantity: item.quantity,
          })),
        }),
      });

      const responseText = await response.text();
      let data: { url?: string; error?: string } = {};

      try {
        data = responseText ? JSON.parse(responseText) : {};
      } catch {
        data = {
          error:
            responseText ||
            "Checkout returned an invalid response. Check the Vercel function logs.",
        };
      }

      if (!response.ok || !data.url) {
        throw new Error(data.error ?? "Could not start checkout.");
      }

      window.location.assign(data.url);
    } catch (checkoutError) {
      setError(
        checkoutError instanceof Error
          ? checkoutError.message
          : "Could not start checkout."
      );
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-ink">
      <AnnouncementBar />
      <HeaderNav />
      <main className="mx-auto flex w-full max-w-[1280px] flex-col gap-10 px-4 py-12 sm:px-6">
        <div className="flex flex-col gap-2">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted">
            Checkout
          </p>
          <h1 className="text-3xl font-semibold text-ink">
            Secure Stripe checkout
          </h1>
          <p className="max-w-2xl text-sm text-muted">
            Review your bag, then continue to Stripe to pay by card, Apple Pay,
            Google Pay, or any payment method enabled in your Stripe account.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.6fr)]">
          <section className="flex flex-col gap-4 rounded-[20px] border border-border bg-white p-6 shadow-soft">
            <h2 className="text-lg font-semibold text-ink">Cart summary</h2>
            {items.length === 0 ? (
              <p className="text-sm text-muted">
                Your cart is empty. Add products to start checkout.
              </p>
            ) : (
              <ul className="space-y-3 text-sm text-muted">
                {items.map((item) => (
                  <li
                    key={getLineKey(item)}
                    className="flex items-start justify-between gap-4"
                  >
                    <span>
                      {item.product.title}
                      {item.variant ? ` (${item.variant.length_value})` : ""} x{" "}
                      {item.quantity}
                    </span>
                    <span>
                      {formatEur(item.product.price_cents * item.quantity)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <aside className="flex flex-col gap-4 rounded-[20px] border border-border bg-white p-6 shadow-soft">
            <h2 className="text-lg font-semibold text-ink">Order total</h2>
            <div className="flex items-center justify-between text-sm text-muted">
              <span>Subtotal</span>
              <span>{formatEur(subtotalCents)}</span>
            </div>
            <div className="flex items-center justify-between text-sm text-muted">
              <span>Delivery</span>
              <span>Free</span>
            </div>
            <div className="flex items-center justify-between border-t border-border pt-3 text-base font-semibold text-ink">
              <span>Total</span>
              <span>{formatEur(subtotalCents)}</span>
            </div>

            {error ? (
              <p className="rounded-[16px] border border-border bg-[#fff0f3] px-4 py-3 text-xs text-muted">
                {error}
              </p>
            ) : null}

            <button
              type="button"
              disabled={items.length === 0 || isSubmitting}
              onClick={startCheckout}
              className="rounded-full border border-transparent bg-ink px-6 py-3 text-center text-xs font-semibold uppercase tracking-[0.2em] text-white transition hover:-translate-y-0.5 hover:shadow-soft focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? "Opening Stripe..." : "Pay securely"}
            </button>
            <Link
              href="/cart"
              className="rounded-full border border-border bg-white px-6 py-3 text-center text-xs font-semibold uppercase tracking-[0.2em] text-ink transition hover:-translate-y-0.5 hover:border-ink/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
            >
              Back to cart
            </Link>
            <p className="text-xs leading-5 text-muted">
              Your payment is processed by Stripe. Denylashes never stores card
              details.
            </p>
          </aside>
        </div>
      </main>
      <NewsletterFooter />
    </div>
  );
};

export default CheckoutPage;
