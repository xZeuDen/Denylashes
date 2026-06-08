"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { hasLengthVariants } from "../lib/cart";
import { formatEur } from "../lib/format";
import { gradients } from "../lib/tokens";
import { Product, ProductVariant } from "../lib/types";
import useCart from "./cart/useCart";
import QuantitySelector from "./QuantitySelector";

type ProductPurchasePanelProps = {
  product: Product;
  variants?: ProductVariant[];
};

const ProductPurchasePanel = ({
  product,
  variants = product.variants ?? [],
}: ProductPurchasePanelProps) => {
  const { addItem } = useCart();
  const router = useRouter();
  const [quantity, setQuantity] = useState(1);
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);

  const activeVariants = useMemo(
    () => variants.filter((variant) => variant.is_active),
    [variants]
  );
  const requiresVariant = product.type === "physical" && hasLengthVariants(activeVariants);

  const selectedVariant = useMemo(
    () => activeVariants.find((variant) => variant.id === selectedVariantId) ?? null,
    [activeVariants, selectedVariantId]
  );

  useEffect(() => {
    if (!requiresVariant) {
      setSelectedVariantId(null);
      return;
    }

    const firstInStock =
      activeVariants.find((variant) => variant.stock_qty > 0) ?? activeVariants[0];
    setSelectedVariantId(firstInStock?.id ?? null);
    setQuantity(1);
  }, [activeVariants, requiresVariant]);

  useEffect(() => {
    setQuantity(1);
  }, [selectedVariantId]);

  const maxQuantity = requiresVariant
    ? selectedVariant?.stock_qty ?? 0
    : undefined;

  const stockLabel = (() => {
    if (product.type === "digital") {
      return "Instant access after purchase";
    }
    if (!requiresVariant) {
      return "In stock";
    }
    if (!selectedVariant) {
      return "Out of stock";
    }
    if (selectedVariant.stock_qty <= 0) {
      return "Out of stock";
    }
    if (selectedVariant.stock_qty <= 5) {
      return `Only ${selectedVariant.stock_qty} left`;
    }
    return "In stock";
  })();

  const isOutOfStock = requiresVariant
    ? !selectedVariant || selectedVariant.stock_qty <= 0
    : false;

  const canPurchase = !isOutOfStock;

  const handleAddToCart = () => {
    if (!canPurchase) return;
    if (requiresVariant && !selectedVariant) return;
    addItem(product, quantity, selectedVariant);
  };

  const handleBuyNow = () => {
    if (!canPurchase) return;
    if (requiresVariant && !selectedVariant) return;
    addItem(product, quantity, selectedVariant);
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
        <span
          className={`rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] ${
            isOutOfStock
              ? "border-[#f2c7cf] bg-[#fff0f3] text-[#9b4b5d]"
              : "border-border text-muted"
          }`}
        >
          {stockLabel}
        </span>
      </div>

      {requiresVariant ? (
        <div className="flex flex-col gap-3">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">
            Length
          </p>
          <div className="flex flex-wrap gap-2">
            {activeVariants.map((variant) => {
              const isSelected = variant.id === selectedVariantId;
              const isVariantOutOfStock = variant.stock_qty <= 0;
              return (
                <button
                  key={variant.id}
                  type="button"
                  disabled={isVariantOutOfStock}
                  onClick={() => setSelectedVariantId(variant.id)}
                  className={`rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${
                    isVariantOutOfStock
                      ? "cursor-not-allowed border-border bg-[#faf7fb] text-muted opacity-60"
                      : isSelected
                      ? "border-ink bg-ink text-white"
                      : "border-border bg-white text-ink hover:-translate-y-0.5 hover:border-ink/40"
                  }`}
                >
                  {variant.length_value}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}

      <div className="flex flex-wrap items-center gap-4">
        <QuantitySelector
          value={quantity}
          onChange={setQuantity}
          max={maxQuantity && maxQuantity > 0 ? maxQuantity : undefined}
        />
        <button
          type="button"
          onClick={handleAddToCart}
          disabled={!canPurchase}
          className="rounded-full border border-border bg-white px-6 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-ink transition hover:-translate-y-0.5 hover:border-ink/40 hover:shadow-soft focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
        >
          Add to cart
        </button>
        <button
          type="button"
          onClick={handleBuyNow}
          disabled={!canPurchase}
          className="rounded-full border border-transparent px-6 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-ink transition hover:-translate-y-0.5 hover:shadow-soft focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
          style={{ backgroundImage: gradients.accent }}
        >
          Buy now
        </button>
      </div>
    </div>
  );
};

export default ProductPurchasePanel;
