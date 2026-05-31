import { NextResponse } from "next/server";
import { getStudio } from "@/lib/wordpress";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const slug = url.searchParams.get("slug") || "affordable-pest";
  const wpUrl = process.env.WP_API_URL || process.env.NEXT_PUBLIC_WP_API_URL || "NOT_SET";
  
  try {
    const studio = await getStudio(slug);
    return NextResponse.json({
      wpUrl,
      slug,
      found: !!studio,
      title: studio?.title || null,
      city: studio?.city || null,
      state: studio?.state || null,
    });
  } catch (err: any) {
    return NextResponse.json({
      wpUrl,
      slug,
      error: err.message,
      stack: err.stack?.split("\n").slice(0, 5),
    });
  }
}
