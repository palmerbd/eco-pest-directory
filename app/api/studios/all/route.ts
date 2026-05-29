// ─── /api/studios/all ──────────────────────────────────────────────────────────
// Returns all published pest control companies as a StudioCard[] in one response.
// Used by StudioSearch (client-side) when a filter is applied — lets /studios
// stay ISR-cached instead of force-dynamic, with the full dataset loaded lazily
// only when the user actually needs it.
//
// Delegates to getAllStudios() from lib/wordpress which already handles WP
// pagination, ACF mapping, chain detection, and style normalisation. The
// underlying fetch calls are cached at 1 hr via Next.js data cache so
// repeated calls within an hour are near-instant.
//
// Response: { studios: StudioCard[], total: number }

import { NextResponse } from "next/server";
import { getAllStudios } from "@/lib/wordpress";

export async function GET() {
  try {
    const studios = await getAllStudios();
    return NextResponse.json({ studios, total: studios.length }, {
      headers: {
        // Browsers and CDN may cache this for up to 5 minutes; the real
        // heavy cache is the Next.js data cache on the WP fetches (1 hr).
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
      },
    });
  } catch (err) {
    console.error("[/api/studios/all] error:", err);
    return NextResponse.json({ error: "Failed to fetch studios" }, { status: 502 });
  }
}
