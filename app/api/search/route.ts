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

// Reverse: abbreviation → full name
const STATE_NAMES: Record<string, string> = {};
for (const [name, abbr] of Object.entries(STATES)) STATE_NAMES[abbr] = name;

async function fetchAllCities(): Promise<Map<string, { city: string; state: string; count: number }>> {
  const wpUrl = process.env.WP_API_URL || process.env.NEXT_PUBLIC_WP_API_URL || "";
  const cities = new Map<string, { city: string; state: string; count: number }>();
  try {
    for (let page = 1; page <= 20; page++) {
      const res = await fetch(`${wpUrl}/wp/v2/pest_company?per_page=100&page=${page}&status=publish&_fields=acf`, { next: { revalidate: 3600 } });
      if (!res.ok) break;
      const data = await res.json();
      if (!data.length) break;
      for (const post of data) {
        const acf = post.acf || {};
        const city = (acf.studio_city || "").trim();
        const state = (acf.studio_state || "").trim().toLowerCase();
        if (!city || !state) continue;
        const key = `${state}/${city.toLowerCase().replace(/\s+/g, "-")}`;
        if (!cities.has(key)) cities.set(key, { city, state: state.toUpperCase(), count: 0 });
        cities.get(key)!.count++;
      }
    }
  } catch {}
  return cities;
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const q = (url.searchParams.get("q") || "").trim();
  const qLower = q.toLowerCase();

  if (!q) return NextResponse.redirect(new URL("/directory", url.origin));

  // 1. Try parsing "city, state" or "city state"
  const parts = q.split(/[,]+/).map(s => s.trim()).filter(Boolean);
  if (parts.length >= 2) {
    const statePart = parts[parts.length - 1].trim().toLowerCase();
    const cityPart = parts.slice(0, -1).join(" ").trim();
    // Check if last part is a state
    const stateWords = statePart.split(/\s+/);
    const lastWord = stateWords[stateWords.length - 1];
    let stateAbbr = "";
    if (lastWord.length === 2 && /^[a-z]{2}$/.test(lastWord)) stateAbbr = lastWord;
    else if (STATES[statePart]) stateAbbr = STATES[statePart];
    
    if (stateAbbr) {
      const citySlug = cityPart.toLowerCase().replace(/\s+/g, "-");
      return NextResponse.redirect(new URL(`/directory/${stateAbbr}/${citySlug}`, url.origin));
    }
  }

  // Also try "dallas tx" (space-separated, last word is state abbr)
  const spaceWords = qLower.split(/\s+/);
  if (spaceWords.length >= 2) {
    const lastWord = spaceWords[spaceWords.length - 1];
    if (lastWord.length === 2 && /^[a-z]{2}$/.test(lastWord)) {
      const citySlug = spaceWords.slice(0, -1).join("-");
      return NextResponse.redirect(new URL(`/directory/${lastWord}/${citySlug}`, url.origin));
    }
    // Check if last word(s) are a state name
    for (let i = spaceWords.length - 1; i >= 1; i--) {
      const possibleState = spaceWords.slice(i).join(" ");
      if (STATES[possibleState]) {
        const citySlug = spaceWords.slice(0, i).join("-");
        return NextResponse.redirect(new URL(`/directory/${STATES[possibleState]}/${citySlug}`, url.origin));
      }
    }
  }

  // 2. Check if it's a state name or abbreviation (before city search)
  if (qLower.length === 2 && STATE_NAMES[qLower]) {
    return NextResponse.redirect(new URL(`/directory?state=${qLower}`, url.origin));
  }
  if (STATES[qLower]) {
    return NextResponse.redirect(new URL(`/directory?state=${STATES[qLower]}`, url.origin));
  }

  // 3. Single word/phrase — search our database for matching cities
  const cities = await fetchAllCities();
  
  // Exact city match
  const exactMatches: Array<{ key: string; city: string; state: string; count: number }> = [];
  const partialMatches: Array<{ key: string; city: string; state: string; count: number }> = [];
  
  for (const [key, val] of cities) {
    const cityLower = val.city.toLowerCase();
    if (cityLower === qLower) {
      exactMatches.push({ key, ...val });
    } else if (cityLower.includes(qLower) || qLower.includes(cityLower)) {
      partialMatches.push({ key, ...val });
    }
  }

  // If exact match(es), pick the one with most listings
  if (exactMatches.length > 0) {
    exactMatches.sort((a, b) => b.count - a.count);
    return NextResponse.redirect(new URL(`/directory/${exactMatches[0].key}`, url.origin));
  }

  // If partial matches, pick best
  if (partialMatches.length > 0) {
    partialMatches.sort((a, b) => b.count - a.count);
    return NextResponse.redirect(new URL(`/directory/${partialMatches[0].key}`, url.origin));
  }



  // 4. No match — redirect to directory with search term (shows "no results" message)
  return NextResponse.redirect(new URL(`/directory?q=${encodeURIComponent(q)}`, url.origin));
}
