// ─── POST /api/stripe/competition-checkout ────────────────────────────────────
// Creates a Stripe Checkout Session for the $199/yr Featured Competition plan.
// Called from /competitions/upgrade by an approved claim owner.
//
// Request headers: Authorization: Bearer <supabase_access_token>
// Request body:    { claim_id, owner_email }
// Returns:         { url } — redirect the browser to this Stripe-hosted URL

import { NextRequest, NextResponse } from "next/server";
import { createClient }              from "@supabase/supabase-js";
import { stripe, COMP_FEATURED_PRICE_ID } from "@/lib/stripe";
import { supabaseAdmin }             from "@/lib/supabase-admin";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.greenpestdirectory.com";

export async function POST(req: NextRequest) {
  try {
    // 1. Validate Bearer token
    const auth  = req.headers.get("Authorization") ?? "";
    const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Resolve user from token
    const userClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    );
    const { data: { user }, error: authErr } = await userClient.auth.getUser(token);
    if (authErr || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 3. Parse body
    const { claim_id, owner_email } = await req.json();
    if (!claim_id || !owner_email) {
      return NextResponse.json({ error: "Missing claim_id or owner_email" }, { status: 400 });
    }

    // 4. Verify claim belongs to this user and is approved
    const { data: claim, error: claimErr } = await supabaseAdmin
      .from("competition_claims")
      .select("id, competition_slug, competition_name, tier, stripe_customer_id")
      .eq("id", claim_id)
      .eq("user_id", user.id)
      .eq("status", "approved")
      .maybeSingle();

    if (claimErr || !claim) {
      return NextResponse.json({ error: "Claim not found or not eligible" }, { status: 404 });
    }
    if (claim.tier === "featured") {
      return NextResponse.json({ error: "This competition is already on the Featured plan" }, { status: 409 });
    }

    // 5. Reuse existing Stripe customer or create new one
    let customerId = claim.stripe_customer_id;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: owner_email,
        name:  claim.competition_name,
        metadata: {
          claim_id,
          competition_slug: claim.competition_slug,
        },
      });
      customerId = customer.id;

      await supabaseAdmin
        .from("competition_claims")
        .update({ stripe_customer_id: customerId })
        .eq("id", claim_id);
    }

    // 6. Create Stripe Checkout Session ($199/yr, one-time annual subscription)
    const session = await stripe.checkout.sessions.create({
      customer:   customerId,
      mode:       "subscription",
      line_items: [{ price: COMP_FEATURED_PRICE_ID, quantity: 1 }],
      success_url: `${SITE_URL}/competitions/upgrade/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url:  `${SITE_URL}/competitions/dashboard`,
      metadata: {
        claim_id,
        competition_slug: claim.competition_slug,
      },
      subscription_data: {
        metadata: {
          claim_id,
          competition_slug: claim.competition_slug,
        },
      },
      allow_promotion_codes: true,
    });

    return NextResponse.json({ url: session.url });

  } catch (err) {
    console.error("POST /api/stripe/competition-checkout error:", err);
    return NextResponse.json({ error: "Failed to create checkout session" }, { status: 500 });
  }
}
