import { NextResponse } from "next/server";

export const revalidate = 3600; // Cache for 1 hour

export async function GET(req: Request) {
  const url = new URL(req.url);
  const stateFilter = (url.searchParams.get("state") || "").toLowerCase();
  const ecoFilter = url.searchParams.get("eco") || "";
  const cityFilter = (url.searchParams.get("city") || "").toLowerCase();
  const limit = Math.min(Number(url.searchParams.get("limit") || "100"), 500);

  const wpUrl = process.env.WP_API_URL || process.env.NEXT_PUBLIC_WP_API_URL || "";

  try {
    let raw: any[] = [];
    for (let pg = 1; pg <= 20; pg++) {
      const res = await fetch(
        `${wpUrl}/wp/v2/pest_company?per_page=100&page=${pg}&status=publish&_fields=id,slug,title,acf`,
        { next: { revalidate: 3600 } }
      );
      if (!res.ok) break;
      const batch = await res.json();
      if (!batch.length) break;
      raw = raw.concat(batch);
    }

    let companies = raw.map((post: any) => {
      const acf = post.acf || {};
      return {
        name: (post.title?.rendered || "").replace(/&#\d+;/g, (m: string) => {
          const n = m.match(/\d+/);
          return n ? String.fromCharCode(Number(n[0])) : m;
        }).replace(/&amp;/g, "&"),
        slug: post.slug,
        city: acf.studio_city || "",
        state: acf.studio_state || "",
        phone: acf.studio_phone || "",
        website: acf.studio_website || "",
        rating: Number(acf.studio_rating) || null,
        reviewCount: Number(acf.studio_review_count) || null,
        ecoTier: acf.eco_tier || "unclassified",
        ecoServices: acf.eco_services ? acf.eco_services.split(",").filter(Boolean) : [],
        services: acf.service_specialties ? acf.service_specialties.split(",").filter(Boolean) : [],
        url: `https://www.greenpestdirectory.com/directory/${(acf.studio_state || "us").toLowerCase()}/${(acf.studio_city || "unknown").toLowerCase().replace(/\s+/g, "-")}/${post.slug}`,
      };
    });

    // Apply filters
    if (stateFilter) companies = companies.filter((c) => c.state.toLowerCase() === stateFilter);
    if (ecoFilter) companies = companies.filter((c) => c.ecoTier === ecoFilter);
    if (cityFilter) companies = companies.filter((c) => c.city.toLowerCase().includes(cityFilter));

    const total = companies.length;
    companies = companies.slice(0, limit);

    return NextResponse.json({
      directory: "Green Pest Directory",
      description: "America's first directory dedicated to eco-friendly pest control services",
      website: "https://www.greenpestdirectory.com",
      total,
      returned: companies.length,
      filters: { state: stateFilter || null, eco: ecoFilter || null, city: cityFilter || null, limit },
      companies,
    }, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch {
    return NextResponse.json({ error: "Failed to fetch companies" }, { status: 500 });
  }
}
