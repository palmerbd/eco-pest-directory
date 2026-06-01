import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const q = (url.searchParams.get("q") || "").trim().toLowerCase();
  
  if (!q) {
    return NextResponse.redirect(new URL("/directory", req.url));
  }

  const wpUrl = process.env.WP_API_URL || process.env.NEXT_PUBLIC_WP_API_URL || "";
  
  try {
    // Search WP for matching companies
    const res = await fetch(
      `${wpUrl}/wp/v2/pest_company?per_page=100&status=publish&_fields=acf`,
      { cache: "no-store" }
    );
    const posts = await res.json();
    
    // Find matching cities
    const cityMatches = new Map<string, { city: string; state: string; count: number }>();
    for (const post of posts) {
      const acf = post.acf || {};
      const city = (acf.studio_city || "").toLowerCase();
      const state = (acf.studio_state || "").toLowerCase();
      
      if (city.includes(q) || state.includes(q) || `${city}, ${state}`.includes(q)) {
        const key = `${state}/${city.replace(/\s+/g, "-")}`;
        if (!cityMatches.has(key)) {
          cityMatches.set(key, { city: acf.studio_city, state: acf.studio_state, count: 0 });
        }
        cityMatches.get(key)!.count++;
      }
    }
    
    // If exact city match, redirect to city page
    if (cityMatches.size === 1) {
      const [path] = cityMatches.keys();
      return NextResponse.redirect(new URL(`/directory/${path}`, req.url));
    }
    
    // If multiple matches or no match, go to directory with search param
    return NextResponse.redirect(new URL(`/directory?q=${encodeURIComponent(q)}`, req.url));
  } catch {
    return NextResponse.redirect(new URL(`/directory?q=${encodeURIComponent(q)}`, req.url));
  }
}
