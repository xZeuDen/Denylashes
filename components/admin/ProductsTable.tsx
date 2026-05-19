"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { createBrowserClient } from "../../lib/supabase/client";
import { Product } from "../../lib/types";
import { formatEur } from "../../lib/format";
import { useAdminToast } from "./AdminShell";

const categoryOptions = [
  "All",
  "Lashes",
  "Tools",
  "Liquids",
  "Courses",
  "E-Books",
];

const ProductsTable = () => {
  const supabase = useMemo(() => createBrowserClient(), []);
  const { pushToast } = useAdminToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [loading, setLoading] = useState(true);

  const loadProducts = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      pushToast({
        tone: "error",
        title: "Could not load products",
        message: error.message,
      });
    }

    setProducts((data ?? []) as Product[]);
    setLoading(false);
  }, [pushToast, supabase]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return products.filter((product) => {
      const matchesQuery =
        !normalized ||
        product.title.toLowerCase().includes(normalized) ||
        product.slug.toLowerCase().includes(normalized);
      const matchesCategory =
        category === "All" || product.category === category;
      return matchesQuery && matchesCategory;
    });
  }, [products, query, category]);

  const toggleActive = async (product: Product) => {
    const nextValue = !product.is_active;
    setProducts((prev) =>
      prev.map((item) =>
        item.id === product.id ? { ...item, is_active: nextValue } : item
      )
    );

    const { error } = await supabase
      .from("products")
      .update({ is_active: nextValue })
      .eq("id", product.id);

    if (error) {
      pushToast({
        tone: "error",
        title: "Update failed",
        message: error.message,
      });
      setProducts((prev) =>
        prev.map((item) =>
          item.id === product.id ? { ...item, is_active: product.is_active } : item
        )
      );
      return;
    }

    pushToast({
      tone: "success",
      title: nextValue ? "Product activated" : "Product hidden",
    });
  };

  return (
    <section className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted">
            Products
          </p>
          <h2 className="text-2xl font-semibold text-ink">
            Manage the catalog
          </h2>
        </div>
        <Link
          href="/admin/products/new"
          className="rounded-full border border-transparent bg-ink px-5 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-white transition hover:-translate-y-0.5 hover:shadow-soft"
        >
          Add product
        </Link>
      </div>

      <div className="flex flex-wrap items-center gap-3 rounded-[18px] border border-border bg-white p-4 shadow-soft">
        <input
          type="search"
          placeholder="Search by title or slug"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          className="flex-1 rounded-full border border-border bg-white px-4 py-2 text-sm text-ink shadow-soft focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
          aria-label="Search products"
        />
        <select
          value={category}
          onChange={(event) => setCategory(event.target.value)}
          className="rounded-full border border-border bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-ink shadow-soft focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
        >
          {categoryOptions.map((option) => (
            <option key={option} value={option}>
              {option === "All" ? "All categories" : option}
            </option>
          ))}
        </select>
      </div>

      <div className="overflow-hidden rounded-[20px] border border-border bg-white shadow-soft">
        <table className="w-full text-left text-sm">
          <thead className="bg-[#fff6fb] text-xs uppercase tracking-[0.2em] text-muted">
            <tr>
              <th className="px-4 py-3">Title</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Price</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td className="px-4 py-6 text-sm text-muted" colSpan={5}>
                  Loading products…
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td className="px-4 py-6 text-sm text-muted" colSpan={5}>
                  No products found.
                </td>
              </tr>
            ) : (
              filtered.map((product) => (
                <tr key={product.id} className="border-t border-border">
                  <td className="px-4 py-4">
                    <p className="font-semibold text-ink">{product.title}</p>
                    <p className="text-xs text-muted">{product.slug}</p>
                  </td>
                  <td className="px-4 py-4 text-xs uppercase tracking-[0.2em] text-muted">
                    {product.category}
                  </td>
                  <td className="px-4 py-4 text-sm text-muted">
                    {formatEur(product.price_cents)}
                  </td>
                  <td className="px-4 py-4">
                    <button
                      type="button"
                      onClick={() => toggleActive(product)}
                      className={`rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] transition ${
                        product.is_active
                          ? "border-ink bg-ink text-white"
                          : "border-border text-muted hover:border-ink/40 hover:text-ink"
                      }`}
                    >
                      {product.is_active ? "Active" : "Inactive"}
                    </button>
                  </td>
                  <td className="px-4 py-4 text-right">
                    <Link
                      href={`/admin/products/${product.id}`}
                      className="text-xs font-semibold uppercase tracking-[0.2em] text-ink transition hover:text-ink/70"
                    >
                      Quick edit
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default ProductsTable;


