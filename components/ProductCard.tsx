"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { MouseEvent } from "react";
import { formatEur } from "../lib/format";
import { gradients } from "../lib/tokens";
import { Product } from "../lib/types";
import useCart from "./cart/useCart";

type ProductCardProps = {
  product: Product;
};

const ProductCard = ({ product }: ProductCardProps) => {
  const { addItem } = useCart();
  const router = useRouter();
  const productHref = `/products/${encodeURIComponent(product.slug)}`;

  const handleAddToCart = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    addItem(product, 1);
  };

  const handleBuyNow = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    addItem(product, 1);
    router.push("/checkout");
  };

  const isRemote = Boolean(product.image_url?.startsWith("http"));

  return (
    <article className="group flex h-full flex-col gap-4 overflow-hidden rounded-[20px] border border-border bg-white p-5 shadow-soft transition hover:-translate-y-1 hover:border-ink/20 hover:shadow-softer">
      <Link
        href={productHref}
        aria-label={`View ${product.title}`}
        className="flex flex-1 flex-col gap-4"
      >
        <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[18px] border border-border bg-[#faf7fb]">
          {product.image_url ? (
            <Image
              src={product.image_url}
              alt={product.title}
              fill
              sizes="(max-width: 768px) 90vw, (max-width: 1280px) 45vw, 280px"
              className="object-cover transition duration-300 group-hover:scale-[1.02]"
              unoptimized={isRemote}
            />
          ) : (
            <div
              className="flex h-full w-full items-center justify-center text-xs font-semibold uppercase tracking-[0.3em] text-muted"
              style={{
                background:
                  "linear-gradient(135deg, rgba(255, 214, 243, 0.7), rgba(255, 79, 216, 0.2))",
              }}
            >
              Denylashes
            </div>
          )}
        </div>
        <div className="flex flex-col gap-2">
          <div className="flex items-start justify-between gap-3">
            <h3 className="text-base font-semibold text-ink">{product.title}</h3>
            <span className="rounded-full border border-border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted">
              {product.category}
            </span>
          </div>
          <p className="text-sm text-muted">{formatEur(product.price_cents)}</p>
        </div>
      </Link>
      <div className="mt-auto grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={handleAddToCart}
          className="rounded-full border border-border bg-white px-4 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-ink transition hover:-translate-y-0.5 hover:border-ink/40 hover:shadow-soft focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
        >
          Add to cart
        </button>
        <button
          type="button"
          onClick={handleBuyNow}
          className="rounded-full border border-transparent px-4 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-ink transition hover:-translate-y-0.5 hover:shadow-soft focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
          style={{ backgroundImage: gradients.accent }}
        >
          Buy now
        </button>
      </div>
    </article>
  );
};

export default ProductCard;

