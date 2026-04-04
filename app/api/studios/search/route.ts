// ─── /api/studios/search ───────────────────────────────────────────────────────────────────────────────────
// Server-side proxy for WP studio lookups, used by the claim page.
// Avoids mixed-content errors (HTTPS page → HTTP WP backend).
//
// Query params (one required):
//   ?slug=buertis-dance-studio   → exact slug lookup
//   ?q=Arthur+Murray             → free-text search (per_page=8)

import { NextRequest, NextResponse } from "next/server";

const WP_API = process.env.NEXT_PUBLIC_WP_API_URL || "http://5.78.144.42/wp-json";

interface WPStudio {
  id:    number;
  slug:  string;
  title: { rendered: string };
  acf:   { studio_address_city?: string; studio_address_state?: string };
}

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const slug = searchParams.get("slug");
  const q    = searchParams.get("q");

  if (!slug && !q) {
    return NextResponse.json({ error: "slug or q required" }, { status: 400 });
  }

  let wpUrl: string;
  if (slug) {
    wpUrl = `${WP_API}/wp/v2/dance_studio?slug=${encodeURIComponent(slug)}&_fields=id,slug,title,acf&status=publish`;
  } else {
    wpUrl = `${WP_API}/wp/v2/dance_studio?search=${encodeURIComponent(q!)}&per_page=8&_fields=id,slug,title,acf&status=publish`;
  }

  try {
    const res = await fetch(wpUrl, { next: { revalidate: 60 } });
    if (!res.ok) {
      return NextResponse.json({ error: `WP API error ${res.status}` }, { status: 502 });
    }
    const data: WPStudio[] = await res.json();
    const studios = data.map((p) => ({
      id:    p.id,
      slug:  p.slug,
      title: p.title?.rendered || "",
      city:  p.acf?.studio_address_city  || "",
      state: p.acf?.studio_address_state || "",
    }));
    return NextResponse.json(studios);
  } catch (err) {
    console.error("[/api/studios/search] fetch error:", err);
    return NextResponse.json({ error: "Failed to reach WP API" }, { status: 502 });
  }
}
