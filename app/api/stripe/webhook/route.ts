// ─── POST /api/stripe/webhook ─────────────────────────────────────────────────
// Receives Stripe webhook events and updates Supabase + WordPress accordingly.
//
// Events handled:
//   checkout.session.completed   → subscription started  → tier = "paid"
//   customer.subscription.deleted → subscription cancelled → tier = "claimed"
//   invoice.payment_failed        → payment issue         → log only (grace period)
//
// IMPORTANT: This route must export a raw body parser config (no JSON parsing).

import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { supabaseAdmin } from "@/lib/supabase-admin";
import type Stripe from "stripe";

const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET!;
const WP_API_URL     = process.env.WP_API_URL || "http://5.78.144.42/wp-json";
const WP_APP_USER    = process.env.WP_APP_USER!;
const WP_APP_PASSWORD = process.env.WP_APP_PASSWORD!;

function wpAuthHeader() {
  return "Basic " + Buffer.from(`${WP_APP_USER}:${WP_APP_PASSWORD}`).toString("base64");
}

// Update WP studio_tier field (non-fatal if it fails)
async function updateWpTier(studioSlug: string, tier: "claimed" | "paid") {
  try {
    // Look up the studio ID from WP by slug
    const searchRes = await fetch(
      `${WP_API_URL}/wp/v2/dance_studio?slug=${studioSlug}&_fields=id`,
      { headers: { Authorization: wpAuthHeader() } }
    );
    if (!searchRes.ok) return;
    const studios = await searchRes.json() as Array<{ id: number }>;
    if (!studios.length) return;

    const studioId = studios[0].id;
    await fetch(`${WP_API_URL}/wp/v2/dance_studio/${studioId}`, {
      method: "POST",
      headers: {
        "Content-Type":  "application/json",
        "Authorization": wpAuthHeader(),
      },
      body: JSON.stringify({ acf: { studio_tier: tier } }),
    });
  } catch (err) {
    console.warn(`[webhook] WP tier update failed for ${studioSlug}:`, err);
  }
}

export async function POST(req: NextRequest) {
  const body      = await req.text();
  const signature = req.headers.get("stripe-signature") ?? "";

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, WEBHOOK_SECRET);
  } catch (err) {
    console.error("[webhook] Signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  // ── checkout.session.completed → subscription activated ────────────────────
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const claimId     = session.metadata?.claim_id;
    const studioSlug  = session.metadata?.studio_slug;
    const subId       = session.subscription as string;

    if (!claimId) {
      console.warn("[webhook] checkout.session.completed missing claim_id");
      return NextResponse.json({ received: true });
    }

    // Update Supabase: store subscription ID + set tier = paid
    const { error } = await supabaseAdmin
      .from("claims")
      .update({
        stripe_subscription_id: subId,
        tier: "paid",
      })
      .eq("id", claimId);

    if (error) console.error("[webhook] Supabase update error:", error);

    // Update WP
    if (studioSlug) await updateWpTier(studioSlug, "paid");

    console.log(`[webhook] ✅ Subscription activated — claim ${claimId}, studio ${studioSlug}`);
  }

  // ── customer.subscription.deleted → subscription cancelled ─────────────────
  else if (event.type === "customer.subscription.deleted") {
    const sub = event.data.object as Stripe.Subscription;
    const studioSlug = sub.metadata?.studio_slug;

    // Find claim by subscription ID
    const { data: claim } = await supabaseAdmin
      .from("claims")
      .select("id, studio_slug")
      .eq("stripe_subscription_id", sub.id)
      .maybeSingle();

    if (claim) {
      await supabaseAdmin
        .from("claims")
        .update({ tier: "claimed", stripe_subscription_id: null })
        .eq("id", claim.id);

      const slug = studioSlug || claim.studio_slug;
      if (slug) await updateWpTier(slug, "claimed");

      console.log(`[webhook] ⏹ Subscription cancelled — claim ${claim.id}, studio ${slug}`);
    }
  }

  // ── invoice.payment_failed → log, no immediate action ────────────────────
  else if (event.type === "invoice.payment_failed") {
    const invoice = event.data.object as Stripe.Invoice;
    console.warn(`[webhook] ⚠️ Payment failed — customer ${invoice.customer}, attempt ${invoice.attempt_count}`);
    // Stripe will retry automatically. After 3 failures it cancels the subscription,
    // which fires customer.subscription.deleted and is handled above.
  }

  return NextResponse.json({ received: true });
}
