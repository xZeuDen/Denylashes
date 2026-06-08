export type ProductType = "physical" | "digital";

export type Product = {
  id: string;
  slug: string;
  title: string;
  price_cents: number;
  currency: "EUR";
  category: string;
  type: ProductType;
  short_desc: string;
  description: string;
  image_url: string | null;
  is_active: boolean;
  created_at: string;
  variants?: ProductVariant[];
};

export type ProductImage = {
  id: string;
  product_id: string;
  url: string;
  sort_order: number | null;
};

export type ProductVariant = {
  id: string;
  product_id: string;
  length_value: string;
  stock_qty: number;
  sort_order: number;
  is_active: boolean;
};


