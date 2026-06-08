import { unstable_noStore } from "next/cache";
import { productsMock } from "../products.mock";
import { Product, ProductImage, ProductVariant } from "../types";
import { createServerClient, hasSupabaseEnv } from "./server";

type ProductsResult = { data: Product[]; usingMock: boolean };
type ProductResult = {
  data: Product | null;
  images: ProductImage[];
  variants: ProductVariant[];
  usingMock: boolean;
};

const attachVariants = (
  products: Product[],
  variants: ProductVariant[]
): Product[] => {
  const variantsByProduct = new Map<string, ProductVariant[]>();
  for (const variant of variants) {
    const list = variantsByProduct.get(variant.product_id) ?? [];
    list.push(variant);
    variantsByProduct.set(variant.product_id, list);
  }

  return products.map((product) => ({
    ...product,
    variants: (variantsByProduct.get(product.id) ?? []).sort(
      (a, b) => a.sort_order - b.sort_order
    ),
  }));
};

const getMockProducts = () => productsMock.filter((item) => item.is_active);

export const getActiveProducts = async (): Promise<ProductsResult> => {
  unstable_noStore();
  if (!hasSupabaseEnv) {
    return { data: getMockProducts(), usingMock: true };
  }

  const supabase = createServerClient();
  if (!supabase) {
    return { data: getMockProducts(), usingMock: true };
  }

  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  if (error || !data) {
    return { data: getMockProducts(), usingMock: true };
  }

  const products = data as Product[];
  const productIds = products.map((product) => product.id);

  if (productIds.length === 0) {
    return { data: products, usingMock: false };
  }

  const { data: variants } = await supabase
    .from("product_variants")
    .select("id, product_id, length_value, stock_qty, sort_order, is_active")
    .in("product_id", productIds)
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  return {
    data: attachVariants(products, (variants ?? []) as ProductVariant[]),
    usingMock: false,
  };
};

export const getProductBySlug = async (
  slug: string
): Promise<ProductResult> => {
  unstable_noStore();
  const normalizedSlug = decodeURIComponent(slug).trim();

  if (!hasSupabaseEnv) {
    const product =
      getMockProducts().find((item) => item.slug === normalizedSlug) ?? null;
    return { data: product, images: [], variants: [], usingMock: true };
  }

  const supabase = createServerClient();
  if (!supabase) {
    const product =
      getMockProducts().find((item) => item.slug === normalizedSlug) ?? null;
    return { data: product, images: [], variants: [], usingMock: true };
  }

  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("slug", normalizedSlug)
    .eq("is_active", true)
    .order("created_at", { ascending: false })
    .limit(1);

  const product = data?.[0] as Product | undefined;

  if (error || !product) {
    if (error) {
      console.error("[products] Could not load product by slug", {
        slug: normalizedSlug,
        message: error.message,
      });
    }
    return { data: null, images: [], variants: [], usingMock: false };
  }

  const [{ data: images }, { data: variants }] = await Promise.all([
    supabase
      .from("product_images")
      .select("id, product_id, url, sort_order")
      .eq("product_id", product.id)
      .order("sort_order", { ascending: true }),
    supabase
      .from("product_variants")
      .select("id, product_id, length_value, stock_qty, sort_order, is_active")
      .eq("product_id", product.id)
      .eq("is_active", true)
      .order("sort_order", { ascending: true }),
  ]);

  return {
    data: {
      ...product,
      variants: (variants ?? []) as ProductVariant[],
    },
    images: (images ?? []) as ProductImage[],
    variants: (variants ?? []) as ProductVariant[],
    usingMock: false,
  };
};

export const getSimilarProducts = async (
  category: string,
  excludeId: string
): Promise<ProductsResult> => {
  unstable_noStore();
  if (!hasSupabaseEnv) {
    const data = getMockProducts()
      .filter((item) => item.category === category && item.id !== excludeId)
      .slice(0, 6);
    return { data, usingMock: true };
  }

  const supabase = createServerClient();
  if (!supabase) {
    const data = getMockProducts()
      .filter((item) => item.category === category && item.id !== excludeId)
      .slice(0, 6);
    return { data, usingMock: true };
  }

  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("is_active", true)
    .eq("category", category)
    .neq("id", excludeId)
    .order("created_at", { ascending: false })
    .limit(6);

  if (error || !data) {
    return { data: [], usingMock: false };
  }

  return { data: data as Product[], usingMock: false };
};

