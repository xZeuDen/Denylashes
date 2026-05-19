"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatEur } from "../lib/format";
import { gradients } from "../lib/tokens";
import { Product } from "../lib/types";
import useCart from "./cart/useCart";
import QuantitySelector from "./QuantitySelector";

type ProductPurchasePanelProps = {
  product: Product;
};

const ProductPurchasePanel = ({ product }: ProductPurchasePanelProps) => {
  const { addItem } = useCart();
  const router = useRouter();
  const [quantity, setQuantity] = useState(1);

  const handleAddToCart = () => {
    addItem(product, quantity);
  };

  const handleBuyNow = () => {
    addItem(product, quantity);
    router.push("/checkout");
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-semibold text-ink">{product.title}</h1>
        <p className="mt-3 text-lg text-muted">
          {formatEur(product.price_cents)}
        </p>
      </div>
      <p className="text-sm text-muted">{product.short_desc}</p>
      <div className="flex flex-wrap items-center gap-3">
        <span className="rounded-full border border-border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted">
          {product.category}
        </span>
        <span className="rounded-full border border-border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted">
          {product.type}
        </span>
        <span className="rounded-full border border-border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted">
          {product.type === "digital" ? "Instant access after purchase" : "In stock"}
        </span>
      </div>
      <div className="flex flex-wrap items-center gap-4">
        <QuantitySelector value={quantity} onChange={setQuantity} />
        <button
          type="button"
          onClick={handleAddToCart}
          className="rounded-full border border-border bg-white px-6 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-ink transition hover:-translate-y-0.5 hover:border-ink/40 hover:shadow-soft focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
        >
          Add to cart
        </button>
        <button
          type="button"
          onClick={handleBuyNow}
          className="rounded-full border border-transparent px-6 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-ink transition hover:-translate-y-0.5 hover:shadow-soft focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
          style={{ backgroundImage: gradients.accent }}
        >
          Buy now
        </button>
      </div>
    </div>
  );
};

export default ProductPurchasePanel;
