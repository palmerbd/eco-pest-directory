// ─── POST /api/competition-override ──────────────────────────────────────────
// Upserts organizer-submitted edits into the competition_overrides table and
// revalidates the competition's detail page so changes go live immediately.
//
// Auth: caller must pass a valid Supabase access_token as Bearer.
// The claim must exist, belong to the authenticated user, and be approved.

import { NextRequest, NextResponse } from "next/server";
import { createClient }              from "@supabase/supabase-js";
import { supabaseAdmin }             from "@/lib/supabase-admin";
import { revalidatePath }            from "next/cache";

// ── Helpers ────────────────────────────────────────────────────────────────────

function sanitizeUrl(v: unknown): string | null {
  if (!v || typeof v !== "string" || v.trim() === "") return null;
  const s = v.trim();
  return s.startsWith("http") ? s : null;
}

function sanitizeDate(v: unknown): string | null {
  if (!v || typeof v !== "string" || v.trim() === "") return null;
  // Expect YYYY-MM-DD — basic format guard
  return /^\d{4}-\d{2}-\d{2}$/.test(v.trim()) ? v.trim() : null;
}

function sanitizeText(v: unknown, max = 1000): string | null {
  if (!v || typeof v !== "string" || v.trim() === "") return null;
  return v.trim().slice(0, max);
}

// ── POST ───────────────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {

  // 1. Validate Bearer token
  const auth  = req.headers.get("Authorization") ?? "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 2. Resolve the user from the token using the anon client
  const userClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
  const { data: { user }, error: authErr } = await userClient.auth.getUser(token);
  if (authErr || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 3. Parse body
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { claim_id } = body as { claim_id?: string };
  if (!claim_id) {
    return NextResponse.json({ error: "claim_id required" }, { status: 400 });
  }

  // 4. Verify the claim belongs to this user and is approved
  const { data: claim, error: claimErr } = await supabaseAdmin
    .from("competition_claims")
    .select("id, competition_slug, status")
    .eq("id", claim_id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (claimErr || !claim) {
    return NextResponse.json({ error: "Claim not found" }, { status: 404 });
  }
  if (claim.status !== "approved") {
    return NextResponse.json({ error: "Claim must be approved before editing" }, { status: 403 });
  }

  // 5. Build sanitized payload — only non-null values are persisted
  const payload = {
    competition_slug:      claim.competition_slug,
    claim_id:              claim.id,
    date_start:            sanitizeDate(body.date_start),
    date_end:              sanitizeDate(body.date_end),
    registration_deadline: sanitizeDate(body.registration_deadline),
    venue:                 sanitizeText(body.venue, 200),
    description:           sanitizeText(body.description, 500),
    website:               sanitizeUrl(body.website),
    registration_url:      sanitizeUrl(body.registration_url),
  };

  // 6. Upsert (insert on first save, update on subsequent saves)
  const { error: upsertErr } = await supabaseAdmin
    .from("competition_overrides")
    .upsert(payload, { onConflict: "competition_slug" });

  if (upsertErr) {
    console.error("competition-override upsert error:", upsertErr);
    return NextResponse.json({ error: upsertErr.message }, { status: 500 });
  }

  // 7. Revalidate the competition's detail page + index so changes are live immediately
  revalidatePath(`/competitions/${claim.competition_slug}`);
  revalidatePath("/competitions");

  return NextResponse.json({ ok: true, slug: claim.competition_slug });
}
