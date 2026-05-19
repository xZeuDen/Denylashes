"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { createBrowserClient } from "../../lib/supabase/client";
import { ProductImage } from "../../lib/types";
import { useAdminToast } from "./AdminShell";

type ImageManagerProps = {
  productId: string;
};

const ImageManager = ({ productId }: ImageManagerProps) => {
  const supabase = useMemo(() => createBrowserClient(), []);
  const { pushToast } = useAdminToast();
  const [images, setImages] = useState<ProductImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const loadImages = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("product_images")
      .select("*")
      .eq("product_id", productId)
      .order("sort_order", { ascending: true });

    if (error) {
      pushToast({
        tone: "error",
        title: "Could not load images",
        message: error.message,
      });
    }
    setImages((data ?? []) as ProductImage[]);
    setLoading(false);
  }, [productId, pushToast, supabase]);

  useEffect(() => {
    loadImages();
  }, [loadImages]);

  const handleUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);

    const uploads: ProductImage[] = [];

    for (const file of Array.from(files)) {
      const path = `${productId}/${Date.now()}-${file.name}`;
      const { error } = await supabase.storage
        .from("product-images")
        .upload(path, file, { upsert: false });

      if (error) {
        pushToast({
          tone: "error",
          title: "Upload failed",
          message: error.message,
        });
        continue;
      }

      const { data } = supabase.storage
        .from("product-images")
        .getPublicUrl(path);

      const sort_order = images.length + uploads.length;

      const { data: inserted, error: insertError } = await supabase
        .from("product_images")
        .insert({
          product_id: productId,
          url: data.publicUrl,
          sort_order,
        })
        .select("*")
        .single();

      if (insertError || !inserted) {
        pushToast({
          tone: "error",
          title: "Could not save image",
          message: insertError?.message,
        });
        continue;
      }

      uploads.push(inserted as ProductImage);
    }

    if (uploads.length) {
      setImages((prev) => [...prev, ...uploads]);
      pushToast({ tone: "success", title: "Images uploaded" });
    }

    setUploading(false);
  };

  const updateOrder = async (updated: ProductImage[]) => {
    setImages(updated);
    await Promise.all(
      updated.map((image, index) =>
        supabase
          .from("product_images")
          .update({ sort_order: index })
          .eq("id", image.id)
      )
    );
  };

  const moveImage = (id: string, direction: "up" | "down") => {
    const index = images.findIndex((image) => image.id === id);
    if (index < 0) return;
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= images.length) return;
    const updated = [...images];
    [updated[index], updated[targetIndex]] = [updated[targetIndex], updated[index]];
    updateOrder(updated);
  };

  const removeImage = async (image: ProductImage) => {
    const { error } = await supabase
      .from("product_images")
      .delete()
      .eq("id", image.id);

    if (error) {
      pushToast({
        tone: "error",
        title: "Delete failed",
        message: error.message,
      });
      return;
    }

    const publicIndex = image.url.indexOf("/product-images/");
    if (publicIndex !== -1) {
      const path = image.url.slice(publicIndex + "/product-images/".length);
      await supabase.storage.from("product-images").remove([path]);
    }

    setImages((prev) => prev.filter((item) => item.id !== image.id));
    pushToast({ tone: "success", title: "Image removed" });
  };

  return (
    <section className="flex flex-col gap-4 rounded-[22px] border border-border bg-white p-6 shadow-soft">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted">
            Gallery
          </p>
          <h3 className="text-lg font-semibold text-ink">Product images</h3>
        </div>
        <label className="rounded-full border border-border bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-ink transition hover:-translate-y-0.5 hover:border-ink/40">
          {uploading ? "Uploading…" : "Upload"}
          <input
            type="file"
            multiple
            className="hidden"
            onChange={(event) => handleUpload(event.target.files)}
            disabled={uploading}
          />
        </label>
      </div>

      {loading ? (
        <p className="text-sm text-muted">Loading images…</p>
      ) : images.length === 0 ? (
        <p className="text-sm text-muted">
          No gallery images yet. Upload a few to build the product gallery.
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {images.map((image, index) => (
            <div
              key={image.id}
              className="flex flex-col gap-3 rounded-[16px] border border-border bg-white p-3"
            >
              <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[14px] border border-border bg-[#faf7fb]">
                <Image
                  src={image.url}
                  alt="Product image"
                  fill
                  sizes="240px"
                  className="object-cover"
                  unoptimized
                />
              </div>
              <div className="flex items-center justify-between text-xs text-muted">
                <span>#{index + 1}</span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => moveImage(image.id, "up")}
                    className="rounded-full border border-border px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-ink transition hover:border-ink/40"
                  >
                    Up
                  </button>
                  <button
                    type="button"
                    onClick={() => moveImage(image.id, "down")}
                    className="rounded-full border border-border px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-ink transition hover:border-ink/40"
                  >
                    Down
                  </button>
                  <button
                    type="button"
                    onClick={() => removeImage(image)}
                    className="rounded-full border border-border px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-ink transition hover:border-ink/40"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

export default ImageManager;


