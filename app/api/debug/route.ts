import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const slug = url.searchParams.get("slug") || "affordable-pest";
  const wpUrl = process.env.WP_API_URL || process.env.NEXT_PUBLIC_WP_API_URL || "";

  try {
    // Raw fetch - skip mapWPPost entirely
    const apiUrl = `${wpUrl}/wp/v2/pest_company?_fields=id,slug,title,excerpt,acf&slug=${slug}&status=publish`;
    const res = await fetch(apiUrl, { cache: "no-store", headers: { "Content-Type": "application/json" } });
    const raw = await res.json();
    
    if (!raw.length) return NextResponse.json({ error: "No posts found", apiUrl, status: res.status });
    
    const post = raw[0];
    const acf = post.acf || {};
    
    return NextResponse.json({
      id: post.id,
      slug: post.slug,
      title: post.title?.rendered,
      acfKeys: Object.keys(acf),
      city: acf.studio_city || acf.studio_address_city || "MISSING",
      state: acf.studio_state || acf.studio_address_state || "MISSING",
      phone: acf.studio_phone || "MISSING",
      ecoTier: acf.eco_tier || "MISSING",
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message, stack: err.stack?.split("\n").slice(0, 5) });
  }
}
