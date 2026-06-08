"use client";

import Image from "next/image";
import Link from "next/link";
import AnnouncementBar from "../../components/AnnouncementBar";
import HeaderNav from "../../components/HeaderNav";
import NewsletterFooter from "../../components/NewsletterFooter";
import QuantitySelector from "../../components/QuantitySelector";
import useCart from "../../components/cart/useCart";
import { formatEur } from "../../lib/format";

const CartPage = () => {
  const { items, removeItem, updateQty, clearCart, getLineKey } = useCart();

  const subtotalCents = items.reduce(
    (sum, item) => sum + item.product.price_cents * item.quantity,
    0
  );
  const shippingCents = items.length ? 0 : 0;
  const totalCents = subtotalCents + shippingCents;

  return (
    <div className="min-h-screen bg-white text-ink">
      <AnnouncementBar />
      <HeaderNav />
      <main className="mx-auto flex w-full max-w-[1280px] flex-col gap-10 px-4 py-12 sm:px-6">
        <div className="flex flex-col gap-2">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted">
            Your cart
          </p>
          <h1 className="text-3xl font-semibold text-ink">Shopping bag</h1>
        </div>

        {items.length === 0 ? (
          <div className="flex flex-col items-center gap-4 rounded-[20px] border border-border bg-white p-12 text-center shadow-soft">
            <p className="text-sm text-muted">
              Your cart is empty. Build your next beauty ritual with Denylashes
              essentials.
            </p>
            <Link
              href="/products"
              className="rounded-full border border-border bg-white px-6 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-ink transition hover:-translate-y-0.5 hover:border-ink/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
            >
              Continue shopping
            </Link>
          </div>
        ) : (
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
            <div className="flex flex-col gap-6">
              {items.map((item) => {
                const lineKey = getLineKey(item);
                const isRemote = Boolean(item.product.image_url?.startsWith("http"));
                const maxQty = item.variant?.stock_qty;
                return (
                  <div
                    key={lineKey}
                    className="flex flex-col gap-4 rounded-[20px] border border-border bg-white p-5 shadow-soft sm:flex-row sm:items-center"
                  >
                    <div className="relative h-28 w-28 overflow-hidden rounded-[16px] border border-border bg-[#faf7fb]">
                      {item.product.image_url ? (
                        <Image
                          src={item.product.image_url}
                          alt={item.product.title}
                          fill
                          sizes="112px"
                          className="object-cover"
                          unoptimized={isRemote}
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-[10px] font-semibold uppercase tracking-[0.3em] text-muted">
                          Denylashes
                        </div>
                      )}
                    </div>
                    <div className="flex flex-1 flex-col gap-2">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <h2 className="text-base font-semibold text-ink">
                          {item.product.title}
                        </h2>
                        <span className="text-sm text-muted">
                          {formatEur(item.product.price_cents)}
                        </span>
                      </div>
                      <p className="text-xs text-muted">
                        {item.product.short_desc}
                        {item.variant ? ` · Length ${item.variant.length_value}` : ""}
                      </p>
                      <div className="flex flex-wrap items-center gap-4">
                        <QuantitySelector
                          value={item.quantity}
                          onChange={(value) => updateQty(lineKey, value)}
                          max={maxQty && maxQty > 0 ? maxQty : undefined}
                        />
                        <button
                          type="button"
                          onClick={() => removeItem(lineKey)}
                          className="text-xs font-semibold uppercase tracking-[0.2em] text-muted transition hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <aside className="flex flex-col gap-6 rounded-[20px] border border-border bg-white p-6 shadow-soft">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-ink">Order summary</h2>
                <button
                  type="button"
                  onClick={clearCart}
                  className="text-xs font-semibold uppercase tracking-[0.2em] text-muted transition hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
                >
                  Clear
                </button>
              </div>
              <div className="flex flex-col gap-3 text-sm text-muted">
                <div className="flex items-center justify-between">
                  <span>Subtotal</span>
                  <span>{formatEur(subtotalCents)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Delivery</span>
                  <span>{shippingCents === 0 ? "Free" : formatEur(shippingCents)}</span>
                </div>
                <div className="flex items-center justify-between border-t border-border pt-3 text-base font-semibold text-ink">
                  <span>Total</span>
                  <span>{formatEur(totalCents)}</span>
                </div>
              </div>
              <div className="flex flex-col gap-3">
                <Link
                  href="/checkout"
                  className="rounded-full border border-transparent bg-ink px-6 py-3 text-center text-xs font-semibold uppercase tracking-[0.2em] text-white transition hover:-translate-y-0.5 hover:shadow-soft focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
                >
                  Checkout
                </Link>
                <Link
                  href="/products"
                  className="rounded-full border border-border bg-white px-6 py-3 text-center text-xs font-semibold uppercase tracking-[0.2em] text-ink transition hover:-translate-y-0.5 hover:border-ink/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
                >
                  Continue shopping
                </Link>
              </div>
            </aside>
          </div>
        )}
      </main>
      <NewsletterFooter />
    </div>
  );
};

export default CartPage;


