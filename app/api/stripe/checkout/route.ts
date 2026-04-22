// ─── POST /api/stripe/checkout ────────────────────────────────────────────────
// Creates a Stripe Checkout Session for the $49/mo promotional Featured Listing plan (reg. $99/mo).
// Called from /upgrade by a verified/approved claim owner.
//
// Request body: { claim_id, studio_title, owner_email }
// Returns:      { url } — redirect the browser to this Stripe-hosted URL

import { NextRequest, NextResponse } from "next/server";
import { stripe, FEATURED_PRICE_ID } from "@/lib/stripe";
import { supabaseAdmin } from "@/lib/supabase-admin";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.ballroomdancedirectory.com";

export async function POST(req: NextRequest) {
  try {
    const { claim_id, studio_title, owner_email } = await req.json();

    if (!claim_id || !owner_email) {
      return NextResponse.json({ error: "Missing claim_id or owner_email" }, { status: 400 });
    }

    // Verify claim exists and is approved/verified
    const { data: claim, error } = await supabaseAdmin
      .from("claims")
      .select("id, studio_slug, studio_title, stripe_customer_id, tier")
      .eq("id", claim_id)
      .in("status", ["verified", "approved"])
      .maybeSingle();

    if (error || !claim) {
      return NextResponse.json({ error: "Claim not found or not eligible for upgrade" }, { status: 404 });
    }

    if (claim.tier === "paid") {
      return NextResponse.json({ error: "This listing is already on the Featured plan" }, { status: 409 });
    }

    // Reuse existing Stripe customer or create new one
    let customerId = claim.stripe_customer_id;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: owner_email,
        name:  studio_title || claim.studio_title,
        metadata: {
          claim_id,
          studio_slug: claim.studio_slug,
        },
      });
      customerId = customer.id;

      // Store customer ID immediately so we can match it on webhook
      await supabaseAdmin
        .from("claims")
        .update({ stripe_customer_id: customerId })
        .eq("id", claim_id);
    }

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      customer:   customerId,
      mode:       "subscription",
      line_items: [{ price: FEATURED_PRICE_ID, quantity: 1 }],
      success_url: `${SITE_URL}/upgrade/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url:  `${SITE_URL}/dashboard`,
      metadata: {
        claim_id,
        studio_slug: claim.studio_slug,
      },
      subscription_data: {
        metadata: {
          claim_id,
          studio_slug: claim.studio_slug,
        },
      },
      allow_promotion_codes: true,
    });

    return NextResponse.json({ url: session.url });

  } catch (err) {
    console.error("POST /api/stripe/checkout error:", err);
    return NextResponse.json({ error: "Failed to create checkout session" }, { status: 500 });
  }
}
