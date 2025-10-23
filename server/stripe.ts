import Stripe from "stripe";

const stripeKey = process.env.STRIPE_SECRET_KEY;

if (!stripeKey) {
  console.warn("STRIPE_SECRET_KEY is not set. Stripe checkout will not work until configured.");
}

export const stripe = stripeKey
  ? new Stripe(stripeKey, {
      apiVersion: "2025-09-30.clover",
    })
  : null;

export const PRICE_IDS = {
  starter: process.env.STRIPE_PRICE_STARTER ?? "price_1234_demo",
};
