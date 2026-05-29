// ─── Stripe Client (server-side only) ────────────────────────────────────────
// Never import this in client components — STRIPE_SECRET_KEY is server-only.

import Stripe from "stripe";

const stripeKey = process.env.STRIPE_SECRET_KEY || "";

export const stripe = stripeKey
  ? new Stripe(stripeKey, { apiVersion: "2025-01-27.acacia" })
  : (null as any);

export const FEATURED_PRICE_ID = process.env.STRIPE_PRICE_ID || "";
export const COMP_FEATURED_PRICE_ID = process.env.STRIPE_COMP_PRICE_ID || "";
