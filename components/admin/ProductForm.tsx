"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "../../lib/supabase/client";
import { Product } from "../../lib/types";
import { useAdminToast } from "./AdminShell";

type ProductFormProps = {
  productId?: string;
};

const categoryOptions = [
  "Lashes",
  "Tools",
  "Liquids",
  "Courses",
  "E-Books",
];

const typeOptions = ["physical", "digital"];

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

const ProductForm = ({ productId }: ProductFormProps) => {
  const supabase = useMemo(() => createBrowserClient(), []);
  const router = useRouter();
  const { pushToast } = useAdminToast();
  const [loading, setLoading] = useState(Boolean(productId));
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [slugTouched, setSlugTouched] = useState(false);
  const [mainImageFile, setMainImageFile] = useState<File | null>(null);
  const [form, setForm] = useState({
    title: "",
    slug: "",
    price: "",
    category: "Lashes",
    type: "physical",
    short_desc: "",
    description: "",
    is_active: true,
    image_url: "",
  });

  useEffect(() => {
    if (!productId) {
      return;
    }

    const loadProduct = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("id", productId)
        .maybeSingle();

      if (error || !data) {
        pushToast({
          tone: "error",
          title: "Could not load product",
          message: error?.message,
        });
        setLoading(false);
        return;
      }

      const product = data as Product;
      setForm({
        title: product.title,
        slug: product.slug,
        price: (product.price_cents / 100).toFixed(2),
        category: product.category,
        type: product.type,
        short_desc: product.short_desc ?? "",
        description: product.description ?? "",
        is_active: product.is_active,
        image_url: product.image_url ?? "",
      });
      setLoading(false);
    };

    loadProduct();
  }, [productId, pushToast, supabase]);

  const updateField = (field: string, value: string | boolean) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
      ...(field === "title" && !slugTouched
        ? { slug: slugify(String(value)) }
        : {}),
    }));
  };

  const removeExistingMainImage = async (imageUrl: string) => {
    const publicIndex = imageUrl.indexOf("/product-images/");
    if (publicIndex === -1) {
      return;
    }
    const path = imageUrl.slice(publicIndex + "/product-images/".length);
    await supabase.storage.from("product-images").remove([path]);
  };

  const uploadMainImage = async (id: string, file: File) => {
    setUploading(true);
    const path = `${id}/main-${Date.now()}-${file.name}`;
    const { error } = await supabase.storage
      .from("product-images")
      .upload(path, file, { upsert: false });

    if (error) {
      setUploading(false);
      throw new Error(error.message);
    }

    const { data } = supabase.storage
      .from("product-images")
      .getPublicUrl(path);

    if (form.image_url) {
      await removeExistingMainImage(form.image_url);
    }

    const { error: updateError } = await supabase
      .from("products")
      .update({ image_url: data.publicUrl })
      .eq("id", id);

    if (updateError) {
      setUploading(false);
      throw new Error(updateError.message);
    }

    setForm((prev) => ({ ...prev, image_url: data.publicUrl }));
    setMainImageFile(null);
    setUploading(false);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);

    const priceNumber = Number.parseFloat(form.price);
    const price_cents = Number.isFinite(priceNumber)
      ? Math.round(priceNumber * 100)
      : 0;

    const payload = {
      title: form.title,
      slug: form.slug,
      price_cents,
      currency: "EUR",
      category: form.category,
      type: form.type,
      short_desc: form.short_desc,
      description: form.description,
      is_active: form.is_active,
      image_url: form.image_url || null,
    };

    if (productId) {
      const { error } = await supabase
        .from("products")
        .update(payload)
        .eq("id", productId);

      if (error) {
        pushToast({
          tone: "error",
          title: "Update failed",
          message: error.message,
        });
        setSaving(false);
        return;
      }

      if (mainImageFile) {
        try {
          await uploadMainImage(productId, mainImageFile);
        } catch (err) {
          pushToast({
            tone: "error",
            title: "Image upload failed",
            message: err instanceof Error ? err.message : undefined,
          });
        }
      }

      pushToast({ tone: "success", title: "Product updated" });
      setSaving(false);
      return;
    }

    const { data, error } = await supabase
      .from("products")
      .insert(payload)
      .select("id")
      .single();

    if (error || !data) {
      pushToast({
        tone: "error",
        title: "Create failed",
        message: error?.message,
      });
      setSaving(false);
      return;
    }

    if (mainImageFile) {
      try {
        await uploadMainImage(data.id, mainImageFile);
      } catch (err) {
        pushToast({
          tone: "error",
          title: "Image upload failed",
          message: err instanceof Error ? err.message : undefined,
        });
      }
    }

    pushToast({ tone: "success", title: "Product created" });
    router.push(`/admin/products/${data.id}`);
  };

  const handleDelete = async () => {
    if (!productId) return;
    setSaving(true);
    const { error } = await supabase
      .from("products")
      .delete()
      .eq("id", productId);

    if (error) {
      pushToast({
        tone: "error",
        title: "Delete failed",
        message: error.message,
      });
      setSaving(false);
      return;
    }

    pushToast({ tone: "success", title: "Product deleted" });
    router.push("/admin/products");
  };

  return (
    <section className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted">
            {productId ? "Edit product" : "New product"}
          </p>
          <h2 className="text-2xl font-semibold text-ink">
            {productId ? "Update catalog item" : "Create a new product"}
          </h2>
        </div>
        {productId ? (
          <button
            type="button"
            onClick={() => setShowDelete(true)}
            className="rounded-full border border-border px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-ink transition hover:-translate-y-0.5 hover:border-ink/40"
          >
            Delete
          </button>
        ) : null}
      </div>

      {loading ? (
        <div className="rounded-[18px] border border-border bg-white p-6 text-sm text-muted shadow-soft">
          Loading product…
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="grid gap-6 rounded-[22px] border border-border bg-white p-6 shadow-soft"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-muted">
              Title
              <input
                type="text"
                required
                value={form.title}
                onChange={(event) => updateField("title", event.target.value)}
                className="rounded-[18px] border border-border bg-white px-4 py-3 text-sm text-ink shadow-soft focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
              />
            </label>
            <label className="flex flex-col gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-muted">
              Slug
              <input
                type="text"
                required
                value={form.slug}
                onChange={(event) => {
                  setSlugTouched(true);
                  updateField("slug", event.target.value);
                }}
                className="rounded-[18px] border border-border bg-white px-4 py-3 text-sm text-ink shadow-soft focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
              />
            </label>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <label className="flex flex-col gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-muted">
              Price (EUR)
              <input
                type="number"
                min="0"
                step="0.01"
                required
                value={form.price}
                onChange={(event) => updateField("price", event.target.value)}
                className="rounded-[18px] border border-border bg-white px-4 py-3 text-sm text-ink shadow-soft focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
              />
            </label>
            <label className="flex flex-col gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-muted">
              Category
              <select
                value={form.category}
                onChange={(event) => updateField("category", event.target.value)}
                className="rounded-[18px] border border-border bg-white px-4 py-3 text-sm text-ink shadow-soft focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
              >
                {categoryOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-muted">
              Type
              <select
                value={form.type}
                onChange={(event) => updateField("type", event.target.value)}
                className="rounded-[18px] border border-border bg-white px-4 py-3 text-sm text-ink shadow-soft focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
              >
                {typeOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <label className="flex flex-col gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-muted">
            Short description
            <textarea
              rows={2}
              value={form.short_desc}
              onChange={(event) => updateField("short_desc", event.target.value)}
              className="rounded-[18px] border border-border bg-white px-4 py-3 text-sm text-ink shadow-soft focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
            />
          </label>

          <label className="flex flex-col gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-muted">
            Description
            <textarea
              rows={5}
              value={form.description}
              onChange={(event) => updateField("description", event.target.value)}
              className="rounded-[18px] border border-border bg-white px-4 py-3 text-sm text-ink shadow-soft focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
            />
          </label>

          <label className="flex flex-col gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-muted">
            Main image upload
            <input
              type="file"
              accept="image/*"
              onChange={(event) =>
                setMainImageFile(event.target.files?.[0] ?? null)
              }
              className="rounded-[18px] border border-border bg-white px-4 py-3 text-sm text-ink shadow-soft focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
            />
          </label>
          <div className="flex flex-wrap items-center gap-3 text-xs text-muted">
            <span>
              {mainImageFile
                ? `Selected: ${mainImageFile.name}`
                : form.image_url
                ? "Current image is set."
                : "No main image yet."}
            </span>
            {form.image_url ? (
              <button
                type="button"
                onClick={() => updateField("image_url", "")}
                className="text-xs font-semibold uppercase tracking-[0.2em] text-ink transition hover:text-ink/70"
              >
                Remove current image
              </button>
            ) : null}
          </div>

          <label className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.2em] text-muted">
            <input
              type="checkbox"
              checked={form.is_active}
              onChange={(event) => updateField("is_active", event.target.checked)}
              className="h-4 w-4 accent-black"
            />
            Active
          </label>

          <div className="flex flex-wrap items-center justify-end gap-3">
            <button
              type="submit"
              disabled={saving || uploading}
              className="rounded-full border border-transparent bg-ink px-6 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-white transition hover:-translate-y-0.5 hover:shadow-soft disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving || uploading ? "Saving…" : "Save product"}
            </button>
          </div>
        </form>
      )}

      {showDelete ? (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-[20px] border border-border bg-white p-6 shadow-soft">
            <h3 className="text-lg font-semibold text-ink">
              Delete this product?
            </h3>
            <p className="mt-2 text-sm text-muted">
              This will remove the product and all associated images.
            </p>
            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowDelete(false)}
                className="rounded-full border border-border px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-ink"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                className="rounded-full border border-transparent bg-ink px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white"
              >
                Confirm delete
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
};

export default ProductForm;
