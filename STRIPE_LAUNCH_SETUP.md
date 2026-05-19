# Stripe Launch Setup

Use this after your Stripe account is created.

## 1. Database upgrade

If your Supabase project already ran the first rebuild SQL, run
`supabase/launch-upgrade.sql` in the Supabase SQL Editor.

Fresh projects can run `supabase/schema.sql` directly because it already includes
the Stripe-ready order fields.

## 2. Stripe keys

In Stripe Dashboard, copy your secret key and add it to `.env.local`:

```env
STRIPE_SECRET_KEY=sk_test_...
```

Keep this server-only. Do not use a `NEXT_PUBLIC_` prefix.

## 3. Supabase service role

In Supabase Project Settings > API Keys, copy the service role key and add:

```env
SUPABASE_SERVICE_ROLE_KEY=...
```

This is needed only by server routes and webhooks to create/update orders. Do
not expose it in browser code.

## 4. Webhook endpoint

In Stripe Dashboard > Developers > Webhooks, add:

```text
https://YOUR_DOMAIN.com/api/stripe/webhook
```

Subscribe to these events:

- `checkout.session.completed`
- `checkout.session.async_payment_succeeded`
- `checkout.session.async_payment_failed`
- `checkout.session.expired`
- `payment_intent.succeeded`
- `payment_intent.payment_failed`
- `payment_intent.canceled`
- `charge.refunded`

Reveal the webhook signing secret and add:

```env
STRIPE_WEBHOOK_SECRET=whsec_...
```

## 5. Before switching to live mode

- Replace `sk_test_...` with the live Stripe secret key.
- Replace `whsec_...` with the live webhook endpoint secret.
- Set `NEXT_PUBLIC_SITE_URL` to the production URL.
- Enable Stripe receipts in Stripe Dashboard if you want automatic customer receipts.
- Confirm shipping/tax settings with your accountant before taking live orders.
