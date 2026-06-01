import { NextResponse } from "next/server";

// US state name → abbreviation mapping
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

  if (!q) {
    return NextResponse.redirect(new URL("/directory", url.origin));
  }

  // Try to parse as "city, state" or "city state"
  const parts = q.split(/[,\s]+/).filter(Boolean);
  const citySlug = parts[0]?.replace(/\s+/g, "-") || q.replace(/\s+/g, "-");

  // Check if last part is a state abbreviation or name
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

  // Just a city name — redirect to directory with search
  return NextResponse.redirect(new URL(`/directory?q=${encodeURIComponent(q)}`, url.origin));
}
