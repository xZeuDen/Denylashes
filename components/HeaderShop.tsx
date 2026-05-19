"use client";

import Link from "next/link";
import useCart from "./cart/useCart";

const HeaderShop = () => {
  const { cartCount } = useCart();

  return (
    <header className="border-b border-border bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-[1280px] items-center justify-between px-4 py-6 sm:px-6">
        <Link href="/" className="wordmark text-2xl font-semibold text-ink">
          Denylashes
        </Link>
        <nav className="flex items-center gap-6 text-sm text-ink">
          <Link
            href="/products"
            className="transition hover:text-ink/70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
          >
            Products
          </Link>
          <Link
            href="/cart"
            className="relative inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-ink transition hover:-translate-y-0.5 hover:border-ink/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
            aria-label="Cart"
          >
            Cart
            <span className="grid h-6 min-w-[24px] place-items-center rounded-full bg-ink px-2 text-[11px] font-semibold text-white">
              {cartCount}
            </span>
          </Link>
        </nav>
      </div>
    </header>
  );
};

export default HeaderShop;


