# Supabase Rebuild Notes

Use these steps to connect this app to a new Supabase project.

## 1. Create the project

1. Open https://supabase.com/dashboard/projects and create a new project.
2. Wait for the project to finish provisioning.
3. Open the project's SQL Editor.
4. Run `supabase/schema.sql`.
5. Run `supabase/seed.sql`.

## 2. Add the project keys locally

In Supabase, use the project's Connect dialog or Settings > API Keys to copy:

- Project URL
- Publishable key, or the legacy anon key

Update `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_PUBLISHABLE_OR_ANON_KEY
```

Do not put a secret key or service role key in `NEXT_PUBLIC_*` variables.

## 3. Create your admin login

1. Start the app with `npm run dev`.
2. Visit `/admin/login`.
3. Sign up with the email you want to use as admin.
4. In Supabase SQL Editor, run this with your email:

```sql
insert into public.admin_users (email)
values ('you@example.com')
on conflict (email) do nothing;
```

5. Sign out and sign in again at `/admin/login`.

The admin area checks `public.is_admin()`, which reads `public.admin_users`.

After your admin account is working, consider disabling public signups in
Supabase Auth settings or requiring email confirmation.

## 4. What the setup creates

- Tables: `products`, `product_images`, `orders`, `order_items`, `admin_users`
- Views: `v_latest_orders`, `v_sales_this_month`
- RPC: `is_admin()`
- Public storage bucket: `product-images`
- RLS policies for public product browsing and admin-only catalog/image/order management

## 5. Stripe launch upgrade

If you ran the schema before the Stripe checkout work was added, run
`supabase/launch-upgrade.sql` once in SQL Editor. This adds guest checkout,
customer, shipping, and Stripe payment fields to orders.
