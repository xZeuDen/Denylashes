"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { ProductImage } from "../lib/types";

type ProductGalleryProps = {
  mainImage: string | null;
  images: ProductImage[];
  title: string;
};

const ProductGallery = ({ mainImage, images, title }: ProductGalleryProps) => {
  const galleryImages = useMemo(() => {
    const unique = images
      .map((image) => image.url)
      .filter((url): url is string => Boolean(url));
    if (mainImage) {
      return [mainImage, ...unique.filter((url) => url !== mainImage)];
    }
    return unique;
  }, [images, mainImage]);

  const [active, setActive] = useState(galleryImages[0] ?? mainImage ?? "");
  const isRemote = Boolean(active?.startsWith("http"));

  return (
    <div className="flex flex-col gap-4">
      <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[22px] border border-border bg-[#faf7fb] shadow-soft">
        {active ? (
          <Image
            src={active}
            alt={title}
            fill
            sizes="(max-width: 768px) 90vw, 520px"
            className="object-cover"
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
      {galleryImages.length > 1 ? (
        <div className="flex flex-wrap gap-3">
          {galleryImages.map((url) => {
            const isActive = url === active;
            const isThumbRemote = Boolean(url.startsWith("http"));
            return (
              <button
                key={url}
                type="button"
                onClick={() => setActive(url)}
                aria-label="View product image"
                className={`relative h-20 w-20 overflow-hidden rounded-[14px] border transition ${
                  isActive
                    ? "border-ink"
                    : "border-border hover:-translate-y-0.5 hover:border-ink/40"
                }`}
              >
                <Image
                  src={url}
                  alt={title}
                  fill
                  sizes="80px"
                  className="object-cover"
                  unoptimized={isThumbRemote}
                />
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
};

export default ProductGallery;


