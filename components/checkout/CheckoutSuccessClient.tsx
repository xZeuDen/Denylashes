"use client";

import { useEffect } from "react";
import Link from "next/link";
import useCart from "../cart/useCart";
import { formatEur } from "../../lib/format";

type CheckoutSuccessClientProps = {
  amountTotal: number | null;
  customerEmail: string | null;
  orderId: string | null;
  paymentStatus: string | null;
};

const CheckoutSuccessClient = ({
  amountTotal,
  customerEmail,
  orderId,
  paymentStatus,
}: CheckoutSuccessClientProps) => {
  const { clearCart } = useCart();

  useEffect(() => {
    clearCart();
  }, [clearCart]);

  const isPaid = paymentStatus === "paid";
  const hasOrderDetails =
    Boolean(orderId) || Boolean(customerEmail) || amountTotal !== null;

  return (
    <section className="mx-auto flex w-full max-w-[760px] flex-col gap-6 px-4 py-16 text-center sm:px-6">
      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted">
        {isPaid ? "Payment received" : "Order received"}
      </p>
      <h1 className="text-3xl font-semibold text-ink sm:text-4xl">
        Thank you for your order
      </h1>
      <p className="text-sm leading-6 text-muted">
        {isPaid
          ? "Your payment has been confirmed. A Stripe receipt will be sent to your email and Denylashes will prepare your order."
          : "Your checkout was received. Stripe may take a moment to finish confirmation, and your receipt will be sent by email."}
      </p>

      <div className="grid gap-3 rounded-[20px] border border-border bg-white p-6 text-left text-sm shadow-soft">
        {hasOrderDetails ? (
          <>
            {orderId ? (
              <div className="flex items-center justify-between gap-4">
                <span className="text-muted">Order</span>
                <span className="font-semibold text-ink">
                  {orderId.slice(0, 8).toUpperCase()}
                </span>
              </div>
            ) : null}
            {customerEmail ? (
              <div className="flex items-center justify-between gap-4">
                <span className="text-muted">Email</span>
                <span className="font-semibold text-ink">{customerEmail}</span>
              </div>
            ) : null}
            {amountTotal !== null ? (
              <div className="flex items-center justify-between gap-4 border-t border-border pt-3">
                <span className="text-muted">Total</span>
                <span className="font-semibold text-ink">
                  {formatEur(amountTotal)}
                </span>
              </div>
            ) : null}
          </>
        ) : (
          <p className="text-center text-sm text-muted">
            Your confirmation details will arrive by email. If you do not receive
            a Stripe receipt, contact support and we will check the order.
          </p>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/products"
          className="rounded-full border border-transparent bg-ink px-6 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-white transition hover:-translate-y-0.5 hover:shadow-soft focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
        >
          Continue shopping
        </Link>
        <Link
          href="/contact"
          className="rounded-full border border-border bg-white px-6 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-ink transition hover:-translate-y-0.5 hover:border-ink/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
        >
          Contact support
        </Link>
      </div>
    </section>
  );
};

export default CheckoutSuccessClient;
