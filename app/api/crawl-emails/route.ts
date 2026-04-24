/**
 * /api/crawl-emails
 * =================
 * Crawls a batch of studio website URLs for email addresses.
 * No Google API calls — zero cost.
 *
 * POST /api/crawl-emails
 * Body: { studios: Array<{ name: string, website: string }> }
 * Returns: Array<{ name, website, email, status }>
 *
 * Max batch size: 30 (Vercel Pro 60s timeout)
 */

import { NextRequest, NextResponse } from "next/server";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

const EMAIL_RE = /[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/g;

const SKIP_DOMAINS = new Set([
  "sentry.io", "example.com", "wixpress.com", "squarespace.com",
  "googleapis.com", "gstatic.com", "cloudflare.com", "amazonaws.com",
  "schema.org", "facebook.com", "instagram.com", "twitter.com",
  "youtube.com", "yelp.com", "google.com", "pinterest.com",
  "tiktok.com", "linkedin.com", "wix.com", "godaddy.com",
]);

const SKIP_PREFIXES = ["noreply@", "no-reply@", "donotreply@", "mailer@", "bounce@"];

function cleanEmails(raw: string[], siteDomain: string): string[] {
  const filtered = raw.filter(e => {
    const lower = e.toLowerCase();
    const domain = lower.split("@")[1] ?? "";
    if ([...SKIP_DOMAINS].some(s => domain.includes(s))) return false;
    if (SKIP_PREFIXES.some(p => lower.startsWith(p))) return false;
    if (domain.match(/\.(png|jpg|gif|svg|webp|css|js)$/)) return false;
    if (e.length > 80 || e.length < 6) return false;
    if (!domain.includes(".") || domain.length < 4) return false;
    return true;
  });

  // Prefer emails on the same domain as the website
  const sameDomain = filtered.filter(e =>
    e.toLowerCase().split("@")[1]?.includes(siteDomain)
  );

  const candidates = sameDomain.length ? sameDomain : filtered;
  return [...new Set(candidates.map(e => e.toLowerCase()))];
}

async function scrapeEmailsFromUrl(url: string): Promise<string[]> {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 5000);
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; BDD-Directory/1.0; +https://ballroomdancedirectory.com)",
        "Accept": "text/html,application/xhtml+xml",
      },
      redirect: "follow",
    });
    clearTimeout(timer);
    if (!res.ok) return [];

    const html = await res.text();
    const emails: string[] = [];

    // mailto: links (highest quality signal)
    const mailtoRe = /mailto:([^"'?\s>\\]+)/gi;
    let m;
    while ((m = mailtoRe.exec(html)) !== null) {
      const e = m[1].split("?")[0].trim();
      if (e.includes("@")) emails.push(e);
    }

    // Raw regex scan
    emails.push(...(html.match(EMAIL_RE) ?? []));

    return emails;
  } catch {
    return [];
  }
}

async function findEmailForStudio(website: string): Promise<string | null> {
  if (!website || !website.startsWith("http")) return null;

  let siteDomain: string;
  let base: string;
  try {
    const parsed = new URL(website);
    siteDomain = parsed.hostname.replace(/^www\./, "");
    base = `${parsed.protocol}//${parsed.hostname}`;
  } catch {
    return null;
  }

  // Try homepage, /contact, /contact-us in sequence
  const urlsToTry = [website, `${base}/contact`, `${base}/contact-us`];

  for (const url of urlsToTry) {
    const raw = await scrapeEmailsFromUrl(url);
    const cleaned = cleanEmails(raw, siteDomain);
    if (cleaned.length) {
      // Pick the most likely "info/contact" email, then shortest
      const preferred = cleaned.find(e =>
        /^(info|contact|hello|studio|dance|office|admin|booking)@/.test(e)
      );
      return preferred ?? cleaned[0];
    }
  }

  return null;
}

export async function POST(req: NextRequest) {
  let body: { studios?: Array<{ name: string; website: string }> };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const studios = body.studios ?? [];
  if (!studios.length) {
    return NextResponse.json({ error: "No studios provided" }, { status: 400 });
  }
  if (studios.length > 40) {
    return NextResponse.json({ error: "Max batch size is 40" }, { status: 400 });
  }

  const results = await Promise.allSettled(
    studios.map(async (s) => {
      const email = await findEmailForStudio(s.website);
      return {
        name: s.name,
        website: s.website,
        email: email ?? "",
        status: email ? "found" : "no_email",
      };
    })
  );

  const output = results.map((r, i) =>
    r.status === "fulfilled"
      ? r.value
      : { name: studios[i].name, website: studios[i].website, email: "", status: "error" }
  );

  const found = output.filter(r => r.email).length;

  return NextResponse.json({
    total: output.length,
    found,
    hit_rate: `${Math.round((found / output.length) * 100)}%`,
    results: output,
  }, { headers: CORS_HEADERS });
}
