// ─── Stripe Client (server-side only) ────────────────────────────────────────────
// Never import this in client components — STRIPE_SECRET_KEY is server-only.

import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-01-27.acacia",
});

// Shared price ID for the $49/mo Featured Listing plan
export const FEATURED_PRICE_ID = process.env.STRIPE_PRICE_ID!;
