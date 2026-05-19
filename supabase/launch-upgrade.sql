-- Run this once if you already ran the original schema.sql before the Stripe launch work.
-- It upgrades orders for guest Stripe Checkout and adds customer/payment fields.

alter table public.orders
  alter column user_id drop not null;

alter table public.orders
  add column if not exists subtotal_cents integer not null default 0 check (subtotal_cents >= 0),
  add column if not exists shipping_cents integer not null default 0 check (shipping_cents >= 0),
  add column if not exists customer_email text,
  add column if not exists customer_name text,
  add column if not exists customer_phone text,
  add column if not exists billing_name text,
  add column if not exists billing_line1 text,
  add column if not exists billing_line2 text,
  add column if not exists billing_city text,
  add column if not exists billing_state text,
  add column if not exists billing_postal_code text,
  add column if not exists billing_country text,
  add column if not exists shipping_name text,
  add column if not exists shipping_line1 text,
  add column if not exists shipping_line2 text,
  add column if not exists shipping_city text,
  add column if not exists shipping_state text,
  add column if not exists shipping_postal_code text,
  add column if not exists shipping_country text,
  add column if not exists stripe_session_id text,
  add column if not exists stripe_payment_intent_id text,
  add column if not exists stripe_customer_id text,
  add column if not exists checkout_url text,
  add column if not exists source text not null default 'stripe_checkout',
  add column if not exists paid_at timestamptz,
  add column if not exists cancelled_at timestamptz;

alter table public.order_items
  add column if not exists line_total_cents integer not null default 0 check (line_total_cents >= 0),
  add column if not exists product_title text not null default '',
  add column if not exists product_slug text,
  add column if not exists product_image_url text,
  add column if not exists product_type text;

update public.orders
set subtotal_cents = total_cents
where subtotal_cents = 0 and total_cents > 0;

update public.order_items
set line_total_cents = unit_price_cents * qty
where line_total_cents = 0;

update public.order_items item
set
  product_title = product.title,
  product_slug = product.slug,
  product_image_url = product.image_url,
  product_type = product.type
from public.products product
where item.product_id = product.id
  and item.product_title = '';

create unique index if not exists orders_stripe_session_id_unique_idx
  on public.orders (stripe_session_id)
  where stripe_session_id is not null;

create unique index if not exists orders_stripe_payment_intent_id_unique_idx
  on public.orders (stripe_payment_intent_id)
  where stripe_payment_intent_id is not null;

create index if not exists orders_customer_email_idx on public.orders (customer_email);
create index if not exists orders_user_id_created_at_idx
  on public.orders (user_id, created_at desc);
create index if not exists order_items_order_id_idx on public.order_items (order_id);

drop view if exists public.v_latest_orders;
drop view if exists public.v_sales_this_month;

create view public.v_latest_orders
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

create view public.v_sales_this_month
with (security_invoker = true)
as
select
  coalesce(sum(total_cents) filter (where status = 'paid'), 0)::integer as total_cents,
  count(*) filter (where status = 'paid')::integer as orders_count
from public.orders
where created_at >= date_trunc('month', now());

grant select on public.v_latest_orders to authenticated;
grant select on public.v_sales_this_month to authenticated;
