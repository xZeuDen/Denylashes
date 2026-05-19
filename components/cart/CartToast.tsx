"use client";

import Link from "next/link";
import useCart from "./useCart";

const CartToast = () => {
  const { notice, dismissNotice } = useCart();

  if (!notice) {
    return null;
  }

  return (
    <div
      className="pointer-events-none fixed bottom-6 right-6 z-50 max-w-sm"
      role="status"
      aria-live="polite"
    >
      <div className="pointer-events-auto flex items-start gap-4 rounded-[18px] border border-border bg-white p-4 shadow-soft">
        <div className="flex-1">
          <p className="text-sm font-semibold text-ink">{notice.title}</p>
          <p className="mt-1 text-xs text-muted">{notice.message}</p>
          <Link
            href="/cart"
            className="mt-3 inline-flex text-xs font-semibold uppercase tracking-[0.2em] text-ink transition hover:text-ink/70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
            onClick={dismissNotice}
          >
            View cart
          </Link>
        </div>
        <button
          type="button"
          onClick={dismissNotice}
          aria-label="Dismiss notification"
          className="grid h-7 w-7 place-items-center rounded-full border border-border text-xs text-muted transition hover:border-ink/40 hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
        >
          ✕
        </button>
      </div>
    </div>
  );
};

export default CartToast;


