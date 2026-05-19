import { unstable_noStore } from "next/cache";
import { productsMock } from "../products.mock";
import { Product, ProductImage } from "../types";
import { createServerClient, hasSupabaseEnv } from "./server";

type ProductsResult = { data: Product[]; usingMock: boolean };
type ProductResult = {
  data: Product | null;
  images: ProductImage[];
  usingMock: boolean;
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

  return { data: data as Product[], usingMock: false };
};

export const getProductBySlug = async (
  slug: string
): Promise<ProductResult> => {
  unstable_noStore();
  if (!hasSupabaseEnv) {
    const product = getMockProducts().find((item) => item.slug === slug) ?? null;
    return { data: product, images: [], usingMock: true };
  }

  const supabase = createServerClient();
  if (!supabase) {
    const product = getMockProducts().find((item) => item.slug === slug) ?? null;
    return { data: product, images: [], usingMock: true };
  }

  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  if (error || !data) {
    return { data: null, images: [], usingMock: false };
  }

  const { data: images } = await supabase
    .from("product_images")
    .select("id, product_id, url, sort_order")
    .eq("product_id", data.id)
    .order("sort_order", { ascending: true });

  return {
    data: data as Product,
    images: (images ?? []) as ProductImage[],
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

