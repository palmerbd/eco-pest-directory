// ─── /api/studios/search ────────────────────────────────────────────────────────────────────
// Server-side proxy for WP studio lookups, used by the claim page.
// Avoids mixed-content errors (HTTPS page → HTTP WP backend).
//
// Query params (one required):
//   ?slug=green-pest-company   → exact slug lookup
//   ?q=Arthur+Murray             → free-text search (per_page=8)

import { NextRequest, NextResponse } from "next/server";

const WP_API = process.env.NEXT_PUBLIC_WP_API_URL || "http://178.156.197.177/wp-json";

// WordPress REST API returns titles with HTML entities (e.g. &#8217; for ’). Decode
// them server-side so the claim form (and anywhere else we use the title) shows
// clean text rather than literal entity strings.
function decodeHtmlEntities(str: string): string {
  return str
    .replace(/&#(\d+);/g,           (_, n) => String.fromCharCode(Number(n)))
    .replace(/&#x([0-9a-fA-F]+);/g,  (_, n) => String.fromCharCode(parseInt(n, 16)))
    .replace(/&amp;/g,   "&")
    .replace(/&lt;/g,    "<")
    .replace(/&gt;/g,    ">")
    .replace(/&quot;/g,  '"')
    .replace(/&apos;/g,  "'")
    .replace(/&rsquo;/g, "\u2019")
    .replace(/&lsquo;/g, "\u2018")
    .replace(/&ldquo;/g, "\u201C")
    .replace(/&rdquo;/g, "\u201D")
    .replace(/&ndash;/g, "\u2013")
    .replace(/&mdash;/g, "\u2014");
}

interface WPStudio {
  id:    number;
  slug:  string;
  title: { rendered: string };
  acf:   { studio_city?: string; studio_state?: string };
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
    wpUrl = `${WP_API}/wp/v2/pest_company?slug=${encodeURIComponent(slug)}&_fields=id,slug,title,acf&status=publish`;
  } else {
    wpUrl = `${WP_API}/wp/v2/pest_company?search=${encodeURIComponent(q!)}&per_page=8&_fields=id,slug,title,acf&status=publish`;
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
      title: decodeHtmlEntities(p.title?.rendered || ""),
      city:  p.acf?.studio_city  || "",
      state: p.acf?.studio_state || "",
    }));
    return NextResponse.json(studios);
  } catch (err) {
    console.error("[/api/studios/search] fetch error:", err);
    return NextResponse.json({ error: "Failed to reach WP API" }, { status: 502 });
  }
}
