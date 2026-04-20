/**
 * /api/admin/claims
 * ─────────────────
 * Returns all studio claims with owner + profile data for the admin dashboard.
 * Protected by ADMIN_SECRET env var — caller must pass it as a Bearer token.
 *
 * GET /api/admin/claims
 * Authorization: Bearer <ADMIN_SECRET>
 */

import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

function isAuthorized(req: NextRequest): boolean {
  const auth  = req.headers.get("authorization") ?? "";
  const token = auth.replace(/^Bearer\s+/i, "").trim();
  return token === process.env.ADMIN_SECRET;
}

export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Fetch all claims + join studio_profiles
  const { data: claims, error } = await supabaseAdmin
    .from("claims")
    .select(`
      id,
      studio_id,
      studio_slug,
      studio_title,
      owner_name,
      owner_email,
      owner_phone,
      status,
      tier,
      stripe_subscription_id,
      created_at,
      updated_at,
      studio_profiles (
        custom_description,
        facebook_url,
        instagram_url,
        promo_text,
        show_google_reviews
      )
    `)
    .in("status", ["verified", "approved"])
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Admin claims fetch error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Separate into tiers
  const claimed  = (claims ?? []).filter(c => c.tier === "claimed");
  const featured = (claims ?? []).filter(c => c.tier === "paid");

  return NextResponse.json({
    claimed,
    featured,
    total: (claims ?? []).length,
  });
}
