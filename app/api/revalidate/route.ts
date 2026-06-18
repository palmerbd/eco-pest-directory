// ─── ISR Revalidation Webhook ─────────────────────────────────────────────────
// WordPress fires this when a pest_company post is published or updated.
// Next.js regenerates affected pages within seconds — no full rebuild needed.
//
// ── WordPress setup ──────────────────────────────────────────────────────────
// Add to WP functions.php (or a mu-plugin):
//
//   define('WP_REVALIDATE_SECRET', 'your-secret-here'); // match Vercel env var
//   define('WP_REVALIDATE_URL', 'https://greenpestdirectory.com/api/revalidate');
//
//   function gpd_revalidate_on_save($post_id, $post, $update) {
//     if ($post->post_type !== 'pest_company' || $post->post_status !== 'publish') return;
//     $slug = $post->post_name;
//     $city = strtolower(str_replace(' ', '-', get_field('company_city', $post_id) ?? ''));
//     $styles = get_field('service_specialties', $post_id) ?? [];
//     wp_remote_post(WP_REVALIDATE_URL, [
//       'body'    => json_encode(['secret' => WP_REVALIDATE_SECRET, 'slug' => $slug, 'city' => $city, 'styles' => $styles]),
//       'headers' => ['Content-Type' => 'application/json'],
//       'timeout' => 10,
//       'blocking' => false,
//     ]);
//   }
//   add_action('save_post', 'gpd_revalidate_on_save', 10, 3);
//
// ── Vercel setup ─────────────────────────────────────────────────────────────
// Add environment variable in Vercel dashboard:
//   WP_REVALIDATE_SECRET = <generate a random 32-char string>
//
// ── Test from terminal ───────────────────────────────────────────────────────
//   curl -X POST https://greenpestdirectory.com/api/revalidate \
//     -H "Content-Type: application/json" \
//     -d '{"secret":"your-secret","slug":"orkin-houston-tx"}'

import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { secret, slug, city, styles } = body;

    // Validate secret token
    if (!process.env.WP_REVALIDATE_SECRET || secret !== process.env.WP_REVALIDATE_SECRET) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const revalidated: string[] = [];

    // Always revalidate directory listing + homepage
    revalidatePath("/directory");
    revalidated.push("/directory");
    revalidatePath("/");
    revalidated.push("/");

    // Revalidate the specific company detail page
    if (slug) {
      revalidatePath("/directory");
      revalidated.push("/directory");
    }

    // Revalidate the city page
    if (city) {
      revalidatePath("/directory");
      revalidated.push("/directory");
    }

    // Revalidate any matching specialty landing pages
    const STYLE_PAGE_MAP: Record<string, string> = {
      eco_friendly: "/eco-friendly-pest-control",
      organic:      "/organic-pest-control",
      pet_safe:     "/pet-safe-pest-control",
      ipm:          "/ipm-pest-control",
    };

    if (Array.isArray(styles)) {
      for (const style of styles) {
        const path = STYLE_PAGE_MAP[style];
        if (path && !revalidated.includes(path)) {
          revalidatePath(path);
          revalidated.push(path);
        }
      }
    }

    return NextResponse.json({
      revalidated: true,
      paths: revalidated,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    return NextResponse.json(
      { error: "Revalidation failed", detail: String(err) },
      { status: 500 }
    );
  }
}
