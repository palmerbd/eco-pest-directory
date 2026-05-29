/**
 * /api/admin/bulk-import
 * ======================
 * Temporary admin endpoint for bulk-importing scraped studios into WordPress.
 * Accepts batches of up to 25 studios and creates pest_company posts.
 *
 * POST /api/admin/bulk-import
 * Authorization: Bearer <ADMIN_SECRET>
 * Body: { studios: Array<{ name, city, address, phone, website, email, google_maps_url }> }
 *
 * Returns: { created, skipped, errors, results }
 */

import { NextRequest, NextResponse } from "next/server";

const WP_API_URL      = process.env.WP_API_URL!;
const WP_APP_USER     = process.env.WP_APP_USER!;
const WP_APP_PASSWORD = process.env.WP_APP_PASSWORD!;

function wpAuthHeader(): string {
  return "Basic " + Buffer.from(`${WP_APP_USER}:${WP_APP_PASSWORD}`).toString("base64");
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .substring(0, 80);
}

function isAuthorized(req: NextRequest): boolean {
  const auth  = req.headers.get("authorization") ?? "";
  const token = auth.replace(/^Bearer\s+/i, "").trim();
  return token === process.env.ADMIN_SECRET;
}

export async function POST(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { studios?: any[] };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const studios = body.studios ?? [];
  if (!studios.length) {
    return NextResponse.json({ error: "No studios provided" }, { status: 400 });
  }
  if (studios.length > 25) {
    return NextResponse.json({ error: "Max batch size is 25" }, { status: 400 });
  }

  const results: any[] = [];
  let created = 0;
  let skipped = 0;

  for (const s of studios) {
    const name = (s.name ?? "").trim();
    if (!name) { skipped++; continue; }

    const cityShort = (s.city ?? "").split(",")[0].trim();
    const slug = slugify(`${name}-${cityShort}`);

    const postData = {
      title:  name,
      slug,
      status: "publish",
      acf: {
        studio_address:  s.address   ?? "",
        studio_phone:    s.phone     ?? "",
        studio_website:  s.website   ?? "",
        studio_email:    s.email     ?? "",
        google_maps_url: s.google_maps_url ?? "",
        studio_city:     s.city      ?? "",
      },
    };

    try {
      let res = await fetch(`${WP_API_URL}/wp/v2/pest_company`, {
        method: "POST",
        headers: {
          "Content-Type":  "application/json",
          "Authorization": wpAuthHeader(),
        },
        body: JSON.stringify(postData),
      });

      // Handle slug collision
      if (res.status === 422) {
        postData.slug = slug + "-" + Math.floor(Math.random() * 900 + 100);
        res = await fetch(`${WP_API_URL}/wp/v2/pest_company`, {
          method: "POST",
          headers: {
            "Content-Type":  "application/json",
            "Authorization": wpAuthHeader(),
          },
          body: JSON.stringify(postData),
        });
      }

      const data = await res.json();

      if (res.status === 201 || res.status === 200) {
        created++;
        results.push({ name, id: data.id, slug: data.slug, status: "created" });
      } else {
        results.push({ name, status: "error", code: res.status, message: data?.message ?? "" });
      }
    } catch (e: any) {
      results.push({ name, status: "error", message: e.message });
    }
  }

  return NextResponse.json({ created, skipped, total: studios.length, results });
}
