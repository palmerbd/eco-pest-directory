import { NextResponse } from "next/server";

export async function GET() {
  const wpUrl = process.env.WP_API_URL || process.env.NEXT_PUBLIC_WP_API_URL || "NOT_SET";
  
  try {
    const res = await fetch(`${wpUrl}/wp/v2/pest_company?per_page=3&_fields=id,slug,title,acf`, {
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
    });
    const status = res.status;
    const text = await res.text();
    let data;
    try { data = JSON.parse(text); } catch { data = text.slice(0, 500); }
    
    return NextResponse.json({
      wpUrl,
      fetchStatus: status,
      totalHeader: res.headers.get("X-WP-Total"),
      sampleData: Array.isArray(data) ? data.length + " items" : data,
    });
  } catch (err: any) {
    return NextResponse.json({
      wpUrl,
      error: err.message,
    });
  }
}
