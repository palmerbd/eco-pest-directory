// ─── GET /api/claim/status?slug=xxx ──────────────────────────────────────────
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function GET(req: NextRequest) {
  const slug = req.nextUrl.searchParams.get("slug");
  if (!slug) return NextResponse.json({ claimed: false }, { status: 400 });
  try {
    const { data } = await supabaseAdmin.from("claims").select("status")
      .eq("studio_slug", slug).in("status", ["verified", "approved"]).maybeSingle();
    return NextResponse.json({ claimed: !!data, status: data?.status || null });
  } catch { return NextResponse.json({ claimed: false }); }
}
