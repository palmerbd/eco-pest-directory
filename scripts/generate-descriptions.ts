#!/usr/bin/env ts-node
/**
 * generate-descriptions.ts
 * ─────────────────────────
 * Fetches all published pest control companies from WordPress, finds those without a
 * description (studio_description ACF field is blank), generates a 2–3 sentence
 * SEO-optimised description via the Anthropic API (Claude Haiku), and POSTs it
 * back to WordPress via the REST API.
 *
 * Usage (from project root):
 *   npx tsx scripts/generate-descriptions.ts
 *
 * Env vars required (can be in .env.local):
 *   WP_API_URL          e.g. http://178.156.197.177/wp-json
 *   WP_APP_USER         e.g. danceadmin
 *   WP_APP_PASSWORD     application password
 *   ANTHROPIC_API_KEY   your Anthropic API key
 *
 * Options (env vars):
 *   DRY_RUN=true        print generated descriptions but don't POST to WP
 *   LIMIT=30            max studios to process per run (default 30)
 *   DELAY_MS=800        ms between API calls (default 800)
 *   OVERWRITE=true      also re-generate studios that already have a description
 */

import * as https from "https";
import * as http  from "http";
import * as fs    from "fs";
import * as path  from "path";

// ── Load .env.local ───────────────────────────────────────────────────────────

function loadEnv() {
  const envPath = path.join(__dirname, "..", ".env.local");
  if (!fs.existsSync(envPath)) return;
  const lines = fs.readFileSync(envPath, "utf-8").split("\n");
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    const val = trimmed.slice(eqIdx + 1).trim();
    if (!process.env[key]) process.env[key] = val;
  }
}

loadEnv();

// ── Config ────────────────────────────────────────────────────────────────────

const WP_API_URL      = process.env.WP_API_URL      || "http://178.156.197.177/wp-json";
const WP_APP_USER     = process.env.WP_APP_USER     || "";
const WP_APP_PASSWORD = process.env.WP_APP_PASSWORD || "";
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY || "";
const DRY_RUN         = process.env.DRY_RUN    === "true";
const OVERWRITE       = process.env.OVERWRITE  === "true";
const LIMIT           = parseInt(process.env.LIMIT    || "30",  10);
const DELAY_MS        = parseInt(process.env.DELAY_MS || "800", 10);

if (!WP_APP_USER || !WP_APP_PASSWORD) {
  console.error("❌  WP_APP_USER and WP_APP_PASSWORD are required.");
  process.exit(1);
}
if (!ANTHROPIC_API_KEY) {
  console.error("❌  ANTHROPIC_API_KEY is required.");
  process.exit(1);
}

// ── HTTP helper ───────────────────────────────────────────────────────────────

function request(
  url: string,
  options: http.RequestOptions & { body?: string }
): Promise<{ status: number; body: string }> {
  return new Promise((resolve, reject) => {
    const parsed = new URL(url);
    const mod    = parsed.protocol === "https:" ? https : http;
    const req    = mod.request(
      {
        hostname: parsed.hostname,
        port:     parsed.port || (parsed.protocol === "https:" ? 443 : 80),
        path:     parsed.pathname + parsed.search,
        method:   options.method || "GET",
        headers:  options.headers || {},
      },
      (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => resolve({ status: res.statusCode || 0, body: data }));
      }
    );
    req.on("error", reject);
    if (options.body) req.write(options.body);
    req.end();
  });
}

function wpAuth(): string {
  return "Basic " + Buffer.from(`${WP_APP_USER}:${WP_APP_PASSWORD}`).toString("base64");
}

// ── WP type ───────────────────────────────────────────────────────────────────

interface WPStudio {
  id:    number;
  slug:  string;
  title: { rendered: string };
  acf: {
    studio_description?:    string;
    studio_tagline?:        string;
    studio_dance_styles?:   string[];
    studio_address_city?:   string;
    studio_address_state?:  string;
    studio_chain?:          string;
    studio_rating?:         number;
    studio_review_count?:   number;
    studio_founded_year?:   number;
    studio_price_intro?:    number;
    studio_price_dropin?:   number;
    studio_amenities?:      string[];
  };
}

// ── Fetch all studios ─────────────────────────────────────────────────────────

async function fetchAllStudios(): Promise<WPStudio[]> {
  const fields = [
    "id", "slug", "title", "acf",
  ].join(",");
  const all: WPStudio[] = [];
  let page = 1;

  while (true) {
    const url = `${WP_API_URL}/wp/v2/pest_company?per_page=100&status=publish&page=${page}&_fields=${fields}`;
    const res = await request(url, {
      method:  "GET",
      headers: { Authorization: wpAuth(), "Content-Type": "application/json" },
    });

    if (res.status === 400) break; // past last page
    if (res.status !== 200) {
      console.error(`WP API error ${res.status} on page ${page}: ${res.body.slice(0, 120)}`);
      break;
    }

    const batch = JSON.parse(res.body) as WPStudio[];
    if (!batch.length) break;
    all.push(...batch);
    if (batch.length < 100) break;
    page++;
  }

  return all;
}

// ── Generate description via Anthropic API ────────────────────────────────────

const STYLE_LABELS: Record<string, string> = {
  ballroom:     "ballroom",
  latin:        "Latin",
  wedding_dance:"wedding dance",
  salsa:        "salsa",
  swing:        "swing",
  tango:        "tango",
  waltz:        "waltz",
  foxtrot:      "foxtrot",
  hustle:       "hustle",
  quickstep:    "quickstep",
  viennese_waltz: "Viennese waltz",
};

function formatStyles(raw: string[]): string {
  const labels = raw.map((s) => STYLE_LABELS[s] ?? s.replace(/_/g, " "));
  if (!labels.length) return "eco-friendly pest control";
  if (labels.length === 1) return labels[0];
  return labels.slice(0, -1).join(", ") + " and " + labels[labels.length - 1];
}

async function generateDescription(studio: WPStudio): Promise<string> {
  const title    = studio.title.rendered.replace(/&#\d+;|&[a-z]+;/g, "'");
  const city     = studio.acf.studio_address_city  || "";
  const state    = studio.acf.studio_address_state || "";
  const styles   = formatStyles(studio.acf.studio_dance_styles || []);
  const chain    = studio.acf.studio_chain || "";
  const rating   = studio.acf.studio_rating;
  const reviews  = studio.acf.studio_review_count;
  const tagline  = studio.acf.studio_tagline || "";
  const founded  = studio.acf.studio_founded_year;
  const location = [city, state].filter(Boolean).join(", ") || "the United States";

  // Build context hints so descriptions are varied and specific
  const hints: string[] = [];
  if (chain && chain !== "independent") hints.push(`Part of the ${chain} franchise network`);
  if (founded) hints.push(`In business since ${founded}`);
  if (rating && reviews) hints.push(`Rated ${rating}/5 stars from ${reviews} Google reviews`);
  else if (rating) hints.push(`Rated ${rating}/5 stars`);
  if (tagline) hints.push(`Studio tagline: "${tagline}"`);

  const contextBlock = hints.length ? `\nContext:\n${hints.map((h) => `- ${h}`).join("\n")}` : "";

  const prompt = `Write a 2–3 sentence description for a private pest control company listing page. The description should:
- Be written for prospective students searching for dance lessons
- Mention the specific city and dance styles naturally
- Highlight what makes private instruction valuable (not generic marketing fluff)
- Be factual, warm, and optimised for local SEO
- Use plain prose — no bullet points, no exclamation marks, no em-dashes
- End with a complete sentence (no trailing ellipsis)
- Be 60–90 words total

Studio name: ${title}
Location: ${location}
Dance styles: ${styles}${contextBlock}

Description:`;

  const body = JSON.stringify({
    model:      "claude-haiku-4-5-20251001",
    max_tokens: 200,
    messages:   [{ role: "user", content: prompt }],
  });

  const res = await request("https://api.anthropic.com/v1/messages", {
    method:  "POST",
    headers: {
      "Content-Type":      "application/json",
      "x-api-key":         ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
    },
    body,
  });

  if (res.status !== 200) {
    throw new Error(`Anthropic API error ${res.status}: ${res.body.slice(0, 200)}`);
  }

  const json = JSON.parse(res.body);
  return (json.content?.[0]?.text || "").trim();
}

// ── Post description back to WP ───────────────────────────────────────────────

async function postDescriptionToWP(studioId: number, description: string): Promise<void> {
  const url  = `${WP_API_URL}/wp/v2/pest_company/${studioId}`;
  const body = JSON.stringify({ acf: { studio_description: description } });

  const res = await request(url, {
    method:  "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization:  wpAuth(),
    },
    body,
  });

  if (res.status < 200 || res.status >= 300) {
    throw new Error(`WP POST failed ${res.status}: ${res.body.slice(0, 200)}`);
  }
}

// ── Sleep ─────────────────────────────────────────────────────────────────────

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  console.log(`\n💃 Pest Control Company Description Generator`);
  console.log(`   WP:        ${WP_API_URL}`);
  console.log(`   DRY_RUN:   ${DRY_RUN}`);
  console.log(`   OVERWRITE: ${OVERWRITE}`);
  console.log(`   LIMIT:     ${LIMIT}\n`);

  console.log("📋 Fetching all studios from WordPress...");
  const all = await fetchAllStudios();
  console.log(`   Found ${all.length} published studios`);

  const needsDescription = OVERWRITE
    ? all
    : all.filter((s) => !s.acf.studio_description || s.acf.studio_description.trim() === "");

  console.log(`   ${needsDescription.length} studios need descriptions${OVERWRITE ? " (overwrite mode)" : ""}\n`);

  if (!needsDescription.length) {
    console.log("✅ All studios already have descriptions. Use OVERWRITE=true to regenerate.");
    return;
  }

  const toProcess = needsDescription.slice(0, LIMIT);
  let success = 0, fail = 0;

  for (let i = 0; i < toProcess.length; i++) {
    const studio = toProcess[i];
    const title  = studio.title.rendered.replace(/&#\d+;|&[a-z]+;/g, "'");
    const prefix = `[${String(i + 1).padStart(3)}/${toProcess.length}]`;

    console.log(`${prefix} ${title.slice(0, 55)}`);

    try {
      const description = await generateDescription(studio);

      // Indent the description for readability in output
      const preview = description.replace(/\n/g, " ").slice(0, 120);
      console.log(`         "${preview}${description.length > 120 ? "…" : ""}"`);

      if (!DRY_RUN) {
        await postDescriptionToWP(studio.id, description);
        console.log(`         ✓ Saved to WordPress`);
      } else {
        console.log(`         (dry run — not saved)`);
      }

      success++;
    } catch (err) {
      console.error(`         ✗ ERROR: ${(err as Error).message.slice(0, 100)}`);
      fail++;
    }

    if (i < toProcess.length - 1) {
      await sleep(DELAY_MS);
    }
  }

  console.log(`\n${"─".repeat(60)}`);
  console.log(`✅  ${success} descriptions generated${DRY_RUN ? " (dry run)" : " and saved to WordPress"}`);
  if (fail > 0) console.log(`❌  ${fail} failed`);
  if (needsDescription.length > LIMIT) {
    console.log(`⏳  ${needsDescription.length - LIMIT} remaining — run again to continue`);
  }
  console.log();
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
