import Stripe from "stripe";

let stripe: InstanceType<typeof Stripe> | null = null;

export const hasStripeEnv = Boolean(process.env.STRIPE_SECRET_KEY);

export const getStripe = () => {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error("STRIPE_SECRET_KEY is missing.");
  }

  if (!stripe) {
    stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2026-04-22.dahlia",
    });
  }

  return stripe;
};
