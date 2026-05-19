"use client";

import { useMemo, useState } from "react";
import { Product } from "../lib/types";
import FiltersBar from "./FiltersBar";
import ProductCard from "./ProductCard";
import SearchBar from "./SearchBar";

const categories = ["All", "Lashes", "Tools", "Liquids", "Courses", "E-Books"];

type ProductGridProps = {
  products: Product[];
  usingMock?: boolean;
};

const ProductGrid = ({ products, usingMock }: ProductGridProps) => {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [sort, setSort] = useState("featured");

  const filteredProducts = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    let result = products.filter((product) => {
      const matchesCategory =
        activeCategory === "All" || product.category === activeCategory;
      const matchesQuery =
        !normalized ||
        product.title.toLowerCase().includes(normalized) ||
        product.category.toLowerCase().includes(normalized);
      return matchesCategory && matchesQuery;
    });

    if (sort === "price-low") {
      result = [...result].sort((a, b) => a.price_cents - b.price_cents);
    }
    if (sort === "price-high") {
      result = [...result].sort((a, b) => b.price_cents - a.price_cents);
    }
    if (sort === "newest") {
      result = [...result].sort(
        (a, b) => Date.parse(b.created_at) - Date.parse(a.created_at)
      );
    }

    return result;
  }, [products, query, activeCategory, sort]);

  const isDirty = Boolean(query) || activeCategory !== "All" || sort !== "featured";

  return (
    <section className="mx-auto flex w-full max-w-[1280px] flex-col gap-8 px-4 pb-24 pt-10 sm:px-6 lg:pb-32">
      <div className="flex flex-col gap-6 rounded-[20px] border border-border bg-white p-6 shadow-soft">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <SearchBar value={query} onChange={setQuery} />
          <div className="text-sm text-muted">
            Showing {filteredProducts.length} products
          </div>
        </div>
        <FiltersBar
          categories={categories}
          activeCategory={activeCategory}
          onCategoryChange={setActiveCategory}
          sort={sort}
          onSortChange={setSort}
          onClear={() => {
            setQuery("");
            setActiveCategory("All");
            setSort("featured");
          }}
          isDirty={isDirty}
        />
        {usingMock ? (
          <p className="rounded-[16px] border border-border bg-[#fff6fb] px-4 py-3 text-xs text-muted">
            Supabase env vars are missing, showing curated mock products for now.
          </p>
        ) : null}
      </div>

      {filteredProducts.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-[20px] border border-border bg-white p-12 text-center shadow-soft">
          <p className="text-sm text-muted">
            No products match your filters yet. Try clearing filters or searching
            a different category.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </section>
  );
};

export default ProductGrid;

