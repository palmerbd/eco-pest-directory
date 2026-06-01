import { NextResponse } from "next/server";

const STATES: Record<string, string> = {
  alabama:"al",alaska:"ak",arizona:"az",arkansas:"ar",california:"ca",colorado:"co",
  connecticut:"ct",delaware:"de",florida:"fl",georgia:"ga",hawaii:"hi",idaho:"id",
  illinois:"il",indiana:"in",iowa:"ia",kansas:"ks",kentucky:"ky",louisiana:"la",
  maine:"me",maryland:"md",massachusetts:"ma",michigan:"mi",minnesota:"mn",
  mississippi:"ms",missouri:"mo",montana:"mt",nebraska:"ne",nevada:"nv",
  "new hampshire":"nh","new jersey":"nj","new mexico":"nm","new york":"ny",
  "north carolina":"nc","north dakota":"nd",ohio:"oh",oklahoma:"ok",oregon:"or",
  pennsylvania:"pa","rhode island":"ri","south carolina":"sc","south dakota":"sd",
  tennessee:"tn",texas:"tx",utah:"ut",vermont:"vt",virginia:"va",washington:"wa",
  "west virginia":"wv",wisconsin:"wi",wyoming:"wy","district of columbia":"dc",
};

export async function GET(req: Request) {
  const url = new URL(req.url);
  const q = (url.searchParams.get("q") || "").trim().toLowerCase();

  if (!q) return NextResponse.redirect(new URL("/directory", url.origin));

  // Parse "city, state" or "city state"
  const parts = q.split(/[,\s]+/).filter(Boolean);
  const lastPart = parts[parts.length - 1]?.toLowerCase();
  let stateSlug = "";

  if (lastPart && lastPart.length === 2 && /^[a-z]{2}$/.test(lastPart)) {
    stateSlug = lastPart;
  } else if (lastPart && STATES[lastPart]) {
    stateSlug = STATES[lastPart];
  }

  if (stateSlug && parts.length > 1) {
    const city = parts.slice(0, -1).join("-");
    return NextResponse.redirect(new URL(`/directory/${stateSlug}/${city}`, url.origin));
  }

  // No state provided — search WP for matching cities
  const wpUrl = process.env.WP_API_URL || process.env.NEXT_PUBLIC_WP_API_URL || "";
  try {
    const all: any[] = [];
    for (let page = 1; page <= 10; page++) {
      const res = await fetch(`${wpUrl}/wp/v2/pest_company?per_page=100&page=${page}&status=publish&_fields=acf`, { next: { revalidate: 3600 } });
      if (!res.ok) break;
      const data = await res.json();
      if (!data.length) break;
      all.push(...data);
    }

    // Find cities matching the query
    const matches = new Map<string, { city: string; state: string; count: number }>();
    for (const post of all) {
      const acf = post.acf || {};
      const city = (acf.studio_city || "").toLowerCase();
      const state = (acf.studio_state || "").toLowerCase();
      if (city.includes(q) || q.includes(city)) {
        const key = `${state}/${city.replace(/\s+/g, "-")}`;
        if (!matches.has(key)) {
          matches.set(key, { city: acf.studio_city, state: acf.studio_state, count: 0 });
        }
        matches.get(key)!.count++;
      }
    }

    // Best match — redirect to city page
    if (matches.size >= 1) {
      // Pick the one with the most listings
      let best = "";
      let bestCount = 0;
      for (const [key, val] of matches) {
        if (val.count > bestCount) { best = key; bestCount = val.count; }
      }
      if (best) {
        return NextResponse.redirect(new URL(`/directory/${best}`, url.origin));
      }
    }
  } catch {}

  // Fallback — go to directory
  return NextResponse.redirect(new URL(`/directory?q=${encodeURIComponent(q)}`, url.origin));
}
