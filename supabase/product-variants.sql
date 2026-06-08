-- Add Length variants with per-variant stock tracking.
-- Run in Supabase SQL Editor on an existing project.

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

create index if not exists product_variants_product_id_sort_order_idx
  on public.product_variants (product_id, sort_order);

alter table public.order_items
  add column if not exists variant_id uuid references public.product_variants(id) on delete set null,
  add column if not exists variant_length text;

alter table public.product_variants enable row level security;

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

grant select on public.product_variants to anon;
grant select, insert, update, delete on public.product_variants to authenticated;
