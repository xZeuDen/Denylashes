import type { ProductVariant } from "./types";

export const getCartLineKey = (productId: string, variantId?: string | null) =>
  variantId ? `${productId}:${variantId}` : productId;

export const hasLengthVariants = (variants?: ProductVariant[]) =>
  Boolean(variants && variants.length > 0);
