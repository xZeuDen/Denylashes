"use client";

import { Product } from "../lib/types";
import ProductCard from "./ProductCard";

type SimilarProductsProps = {
  products: Product[];
};

const SimilarProducts = ({ products }: SimilarProductsProps) => {
  if (!products.length) {
    return null;
  }

  return (
    <section className="mt-16">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-ink">Similar products</h2>
        <span className="text-sm text-muted">{products.length} items</span>
      </div>
      <div className="flex gap-6 overflow-x-auto pb-2 md:grid md:grid-cols-2 md:overflow-visible xl:grid-cols-4">
        {products.map((product) => (
          <div key={product.id} className="min-w-[240px] md:min-w-0">
            <ProductCard product={product} />
          </div>
        ))}
      </div>
    </section>
  );
};

export default SimilarProducts;

