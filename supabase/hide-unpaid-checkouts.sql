-- Run this once to hide unpaid Stripe checkout attempts from the admin order list.
-- Paid/refunded orders remain visible. Unpaid failed drafts are marked cancelled.

update public.orders
set
  status = 'cancelled',
  cancelled_at = coalesce(cancelled_at, now())
where status = 'pending'
  and stripe_session_id is null
  and paid_at is null;

drop view if exists public.v_latest_orders;

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

grant select on public.v_latest_orders to authenticated;
