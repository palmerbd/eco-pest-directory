// ─── POST /api/stripe/webhook ─────────────────────────────────────────────────
// Receives Stripe webhook events and updates Supabase + WordPress accordingly.
//
// Events handled:
//   checkout.session.completed    → subscription started
//     • metadata.studio_slug      → claims table, tier = "paid"
//     • metadata.competition_slug → competition_claims table, tier = "featured"
//   customer.subscription.deleted → subscription cancelled (both studio + competition)
//   invoice.payment_failed        → log only (grace period; Stripe retries automatically)
//
// IMPORTANT: This route must export a raw body parser config (no JSON parsing).

import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { supabaseAdmin } from "@/lib/supabase-admin";
import type Stripe from "stripe";

const WEBHOOK_SECRET  = process.env.STRIPE_WEBHOOK_SECRET!;
const WP_API_URL      = process.env.WP_API_URL || "http://178.156.197.177/wp-json";
const WP_APP_USER     = process.env.WP_APP_USER!;
const WP_APP_PASSWORD = process.env.WP_APP_PASSWORD!;

// GHL Workflow #2 — fires when a Stripe payment confirms a Featured studio upgrade
const GHL_STRIPE_WEBHOOK = "https://services.leadconnectorhq.com/hooks/gKAwJUdSQ6QMlAc0QXWb/webhook-trigger/bffde7d8-2595-416c-a347-8726edf35fcf";

// GHL Workflow #3 — fires when a studio subscription is cancelled (cancellation save drip)
// TODO: Replace with actual Workflow #3 inbound webhook URL once created in GHL
const GHL_CANCEL_WEBHOOK = "";

function wpAuthHeader() {
  return "Basic " + Buffer.from(`${WP_APP_USER}:${WP_APP_PASSWORD}`).toString("base64");
}

// ── Studio: Update WP studio_tier field (non-fatal if it fails) ───────────────
async function updateWpTier(studioSlug: string, tier: "claimed" | "paid") {
  try {
    const searchRes = await fetch(
      `${WP_API_URL}/wp/v2/pest_company?slug=${studioSlug}&_fields=id`,
      { headers: { Authorization: wpAuthHeader() } }
    );
    if (!searchRes.ok) return;
    const studios = await searchRes.json() as Array<{ id: number }>;
    if (!studios.length) return;

    const studioId = studios[0].id;
    await fetch(`${WP_API_URL}/wp/v2/pest_company/${studioId}`, {
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
    const session        = event.data.object as Stripe.Checkout.Session;
    const claimId        = session.metadata?.claim_id;
    const studioSlug     = session.metadata?.studio_slug;
    const competitionSlug = session.metadata?.competition_slug;
    const subId          = session.subscription as string;

    if (!claimId) {
      console.warn("[webhook] checkout.session.completed missing claim_id");
      return NextResponse.json({ received: true });
    }

    // ── Competition checkout ──────────────────────────────────────────────────
    if (competitionSlug) {
      const { error } = await supabaseAdmin
        .from("competition_claims")
        .update({
          stripe_subscription_id: subId,
          tier: "featured",
        })
        .eq("id", claimId);

      if (error) console.error("[webhook] competition_claims update error:", error);

      console.log(`[webhook] ✅ Competition Featured activated — claim ${claimId}, comp ${competitionSlug}`);
    }

    // ── Studio checkout ───────────────────────────────────────────────────────
    else {
      const { error } = await supabaseAdmin
        .from("claims")
        .update({
          stripe_subscription_id: subId,
          tier: "paid",
        })
        .eq("id", claimId);

      if (error) console.error("[webhook] claims update error:", error);
      if (studioSlug) await updateWpTier(studioSlug, "paid");

      // Fire GHL Workflow #2 — moves contact to Featured (Paid) stage (non-fatal)
      try {
        const ownerEmail = session.customer_email
          ?? (session.customer_details as { email?: string } | null)?.email
          ?? "";
        await fetch(GHL_STRIPE_WEBHOOK, {
          method:  "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            claim_id: claimId,
            email:    ownerEmail,
            tier:     "paid",
          }),
        });
      } catch (ghlErr) {
        console.warn("[webhook] GHL webhook error:", ghlErr);
      }

      console.log(`[webhook] ✅ Studio Featured activated — claim ${claimId}, studio ${studioSlug}`);
    }
  }

  // ── customer.subscription.deleted → subscription cancelled ─────────────────
  else if (event.type === "customer.subscription.deleted") {
    const sub             = event.data.object as Stripe.Subscription;
    const studioSlug      = sub.metadata?.studio_slug;
    const competitionSlug = sub.metadata?.competition_slug;

    // ── Competition cancellation ──────────────────────────────────────────────
    if (competitionSlug) {
      const { data: claim } = await supabaseAdmin
        .from("competition_claims")
        .select("id, competition_slug")
        .eq("stripe_subscription_id", sub.id)
        .maybeSingle();

      if (claim) {
        await supabaseAdmin
          .from("competition_claims")
          .update({ tier: "free", stripe_subscription_id: null })
          .eq("id", claim.id);

        console.log(`[webhook] ⏹ Competition Featured cancelled — claim ${claim.id}, comp ${competitionSlug || claim.competition_slug}`);
      }
    }

    // ── Studio cancellation ───────────────────────────────────────────────────
    else {
      const { data: claim } = await supabaseAdmin
        .from("claims")
        .select("id, studio_slug, owner_email")
        .eq("stripe_subscription_id", sub.id)
        .maybeSingle();

      if (claim) {
        await supabaseAdmin
          .from("claims")
          .update({ tier: "claimed", stripe_subscription_id: null })
          .eq("id", claim.id);

        const slug = studioSlug || claim.studio_slug;
        if (slug) await updateWpTier(slug, "claimed");

        // Fire GHL Workflow #3 — moves contact to cancellation save drip (non-fatal)
        if (GHL_CANCEL_WEBHOOK && claim.owner_email) {
          try {
            await fetch(GHL_CANCEL_WEBHOOK, {
              method:  "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                email:        claim.owner_email,
                studio_slug:  slug,
                claim_id:     claim.id,
                tier:         "cancelled",
              }),
            });
          } catch (ghlErr) {
            console.warn("[webhook] GHL cancel webhook error:", ghlErr);
          }
        }

        console.log(`[webhook] ⏹ Studio Featured cancelled — claim ${claim.id}, studio ${slug}`);
      }
    }
  }

  // ── invoice.payment_failed → log, no immediate action ────────────────────
  else if (event.type === "invoice.payment_failed") {
    const invoice = event.data.object as Stripe.Invoice;
    console.warn(
      `[webhook] ⚠️ Payment failed — customer ${invoice.customer}, attempt ${invoice.attempt_count}`
    );
    // Stripe retries automatically. After 3 failures it fires
    // customer.subscription.deleted, handled above.
  }

  return NextResponse.json({ received: true });
}
