# Launch Checklist

## Required before going live

- Run `supabase/launch-upgrade.sql` in Supabase if the project already used the earlier schema.
- Add `SUPABASE_SERVICE_ROLE_KEY`, `STRIPE_SECRET_KEY`, and `STRIPE_WEBHOOK_SECRET` to production env vars.
- Set `NEXT_PUBLIC_SITE_URL` to the live domain.
- Add the Stripe webhook endpoint: `/api/stripe/webhook`.
- Test a Stripe test checkout with card `4242 4242 4242 4242`.
- Confirm a paid order appears in `/admin/orders`.
- Configure `SMTP_FROM` and `CONTACT_TO_EMAIL` so contact/newsletter forms work.
- Add `NEXT_PUBLIC_INSTAGRAM_URL` and `NEXT_PUBLIC_TIKTOK_URL`, or the footer social links will route to contact.
- Replace test product data and remove any test catalog items.
- Confirm product images, prices, descriptions, and active/inactive status.
- Confirm delivery countries. Checkout currently collects shipping for Ireland and the United Kingdom.
- Review `/shipping`, `/returns`, `/privacy`, and `/terms` text before publishing.
- Confirm tax/VAT handling with a qualified accountant before accepting live payments.

## Payment flow now implemented

- Cart validates product IDs and quantities server-side.
- Server fetches live Supabase prices before creating Stripe Checkout.
- Supabase order is created as `pending`.
- Stripe webhook marks the order `paid`, `cancelled`, or `refunded`.
- Success page clears the customer cart after payment.

## Known business decisions still needed

- Exact delivery timelines and carrier process.
- Digital product fulfillment method after payment.
- Final legal review of policy and terms pages for the production domain.
