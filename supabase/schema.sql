-- Denylashes Supabase rebuild schema.
-- Run this in the Supabase SQL Editor for a new project before seed.sql.

create extension if not exists pgcrypto;

create table if not exists public.admin_users (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique references auth.users(id) on delete cascade,
  email text unique,
  created_at timestamptz not null default now(),
  constraint admin_users_identity_check check (user_id is not null or email is not null)
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  price_cents integer not null check (price_cents >= 0),
  currency text not null default 'EUR' check (currency = 'EUR'),
  category text not null,
  type text not null default 'physical' check (type in ('physical', 'digital')),
  short_desc text not null default '',
  description text not null default '',
  image_url text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  url text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  length_value text not null,
  stock_qty integer not null default 0 check (stock_qty >= 0),
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  unique (product_id, length_value)
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  status text not null default 'pending' check (status in ('pending', 'paid', 'refunded', 'cancelled')),
  subtotal_cents integer not null default 0 check (subtotal_cents >= 0),
  shipping_cents integer not null default 0 check (shipping_cents >= 0),
  total_cents integer not null default 0 check (total_cents >= 0),
  currency text not null default 'EUR' check (currency = 'EUR'),
  customer_email text,
  customer_name text,
  customer_phone text,
  billing_name text,
  billing_line1 text,
  billing_line2 text,
  billing_city text,
  billing_state text,
  billing_postal_code text,
  billing_country text,
  shipping_name text,
  shipping_line1 text,
  shipping_line2 text,
  shipping_city text,
  shipping_state text,
  shipping_postal_code text,
  shipping_country text,
  stripe_session_id text unique,
  stripe_payment_intent_id text unique,
  stripe_customer_id text,
  checkout_url text,
  source text not null default 'stripe_checkout',
  paid_at timestamptz,
  cancelled_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  qty integer not null check (qty > 0),
  unit_price_cents integer not null check (unit_price_cents >= 0),
  line_total_cents integer not null default 0 check (line_total_cents >= 0),
  product_title text not null default '',
  product_slug text,
  product_image_url text,
  product_type text,
  variant_id uuid references public.product_variants(id) on delete set null,
  variant_length text,
  created_at timestamptz not null default now()
);

create index if not exists products_is_active_created_at_idx
  on public.products (is_active, created_at desc);
create index if not exists products_category_idx on public.products (category);
create index if not exists product_images_product_id_sort_order_idx
  on public.product_images (product_id, sort_order);
create index if not exists product_variants_product_id_sort_order_idx
  on public.product_variants (product_id, sort_order);
create index if not exists orders_user_id_created_at_idx
  on public.orders (user_id, created_at desc);
create index if not exists orders_customer_email_idx on public.orders (customer_email);
create index if not exists orders_stripe_session_id_idx on public.orders (stripe_session_id);
create index if not exists orders_stripe_payment_intent_id_idx on public.orders (stripe_payment_intent_id);
create index if not exists order_items_order_id_idx on public.order_items (order_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_products_updated_at on public.products;
create trigger set_products_updated_at
  before update on public.products
  for each row execute function public.set_updated_at();

drop trigger if exists set_orders_updated_at on public.orders;
create trigger set_orders_updated_at
  before update on public.orders
  for each row execute function public.set_updated_at();

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.admin_users admin
    where (admin.user_id is not null and admin.user_id = auth.uid())
       or (
        admin.email is not null
        and lower(admin.email) = lower(coalesce(auth.jwt() ->> 'email', ''))
      )
  );
$$;

grant usage on schema public to anon, authenticated;
grant execute on function public.is_admin() to anon, authenticated;

grant select on public.products to anon;
grant select, insert, update, delete on public.products to authenticated;
grant select on public.product_images to anon;
grant select, insert, update, delete on public.product_images to authenticated;
grant select on public.product_variants to anon;
grant select, insert, update, delete on public.product_variants to authenticated;
grant select, insert, update, delete on public.orders to authenticated;
grant select, insert, update, delete on public.order_items to authenticated;
grant select, insert, update, delete on public.admin_users to authenticated;

alter table public.admin_users enable row level security;
alter table public.products enable row level security;
alter table public.product_images enable row level security;
alter table public.product_variants enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;

drop policy if exists "Admins can read admin users" on public.admin_users;
create policy "Admins can read admin users"
  on public.admin_users for select
  to authenticated
  using (public.is_admin());

drop policy if exists "Admins can manage admin users" on public.admin_users;
create policy "Admins can manage admin users"
  on public.admin_users for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "Anyone can read active products" on public.products;
create policy "Anyone can read active products"
  on public.products for select
  to public
  using (is_active = true or public.is_admin());

drop policy if exists "Admins can manage products" on public.products;
create policy "Admins can manage products"
  on public.products for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "Anyone can read active product images" on public.product_images;
create policy "Anyone can read active product images"
  on public.product_images for select
  to public
  using (
    public.is_admin()
    or exists (
      select 1
      from public.products product
      where product.id = product_images.product_id
        and product.is_active = true
    )
  );

drop policy if exists "Admins can manage product images" on public.product_images;
create policy "Admins can manage product images"
  on public.product_images for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "Anyone can read active product variants" on public.product_variants;
create policy "Anyone can read active product variants"
  on public.product_variants for select
  to public
  using (
    public.is_admin()
    or (
      is_active = true
      and exists (
        select 1
        from public.products product
        where product.id = product_variants.product_id
          and product.is_active = true
      )
    )
  );

drop policy if exists "Admins can manage product variants" on public.product_variants;
create policy "Admins can manage product variants"
  on public.product_variants for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "Users can read own orders or admins can read all orders" on public.orders;
create policy "Users can read own orders or admins can read all orders"
  on public.orders for select
  to authenticated
  using (user_id = auth.uid() or public.is_admin());

drop policy if exists "Users can create own orders" on public.orders;
create policy "Users can create own orders"
  on public.orders for insert
  to authenticated
  with check (user_id = auth.uid() or public.is_admin());

drop policy if exists "Admins can update orders" on public.orders;
create policy "Admins can update orders"
  on public.orders for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "Admins can delete orders" on public.orders;
create policy "Admins can delete orders"
  on public.orders for delete
  to authenticated
  using (public.is_admin());

drop policy if exists "Users can read own order items or admins can read all order items" on public.order_items;
create policy "Users can read own order items or admins can read all order items"
  on public.order_items for select
  to authenticated
  using (
    public.is_admin()
    or exists (
      select 1
      from public.orders orders
      where orders.id = order_items.order_id
        and orders.user_id = auth.uid()
    )
  );

drop policy if exists "Users can create own order items" on public.order_items;
create policy "Users can create own order items"
  on public.order_items for insert
  to authenticated
  with check (
    public.is_admin()
    or exists (
      select 1
      from public.orders orders
      where orders.id = order_items.order_id
        and orders.user_id = auth.uid()
    )
  );

drop policy if exists "Admins can update order items" on public.order_items;
create policy "Admins can update order items"
  on public.order_items for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "Admins can delete order items" on public.order_items;
create policy "Admins can delete order items"
  on public.order_items for delete
  to authenticated
  using (public.is_admin());

create or replace view public.v_latest_orders
with (security_invoker = true)
as
select
  id,
  user_id,
  customer_email,
  customer_name,
  status,
  total_cents,
  currency,
  stripe_session_id,
  created_at
from public.orders
where status in ('paid', 'refunded');

create or replace view public.v_sales_this_month
with (security_invoker = true)
as
select
  coalesce(sum(total_cents) filter (where status = 'paid'), 0)::integer as total_cents,
  count(*) filter (where status = 'paid')::integer as orders_count
from public.orders
where created_at >= date_trunc('month', now());

grant select on public.v_latest_orders to authenticated;
grant select on public.v_sales_this_month to authenticated;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'product-images',
  'product-images',
  true,
  10485760,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml']
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Product images are publicly readable" on storage.objects;
create policy "Product images are publicly readable"
  on storage.objects for select
  to public
  using (bucket_id = 'product-images');

drop policy if exists "Admins can upload product image files" on storage.objects;
create policy "Admins can upload product image files"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'product-images' and public.is_admin());

drop policy if exists "Admins can update product image files" on storage.objects;
create policy "Admins can update product image files"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'product-images' and public.is_admin())
  with check (bucket_id = 'product-images' and public.is_admin());

drop policy if exists "Admins can delete product image files" on storage.objects;
create policy "Admins can delete product image files"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'product-images' and public.is_admin());
