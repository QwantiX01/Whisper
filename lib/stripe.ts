import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-02-24.acacia",
  typescript: true,
});

export const PLANS = {
  PRO: {
    name: "Pro",
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID!,
    price: 9,
    currency: "usd",
    interval: "month",
  },
} as const;
