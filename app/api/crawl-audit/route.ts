/**
 * /api/crawl-audit
 * ================
 * Crawls a batch of studio website URLs to extract:
 *   - Email addresses (mailto: links + regex)
 *   - Website tech signals (platform, SSL, mobile-ready, age indicators)
 *
 * No Google API calls — zero cost.
 *
 * POST /api/crawl-audit
 * Body: {
 *   studios: Array<{
 *     wp_id:    number,
 *     name:     string,
 *     city:     string,
 *     address:  string,
 *     phone:    string,
 *     website:  string   // empty string if studio has no website
 *   }>
 * }
 *
 * Returns: Array<AuditResult>
 *
 * Max batch size: 25 (Vercel Pro 60s timeout; each studio hits up to 3 URLs)
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

// ─── Types ────────────────────────────────────────────────────────────────────

export interface SiteAudit {
  has_ssl:         "Yes" | "No" | "N/A";
  mobile_ready:    "Yes" | "No" | "N/A";
  platform:        string;   // WordPress, Wix, Squarespace, GoDaddy, Joomla, Drupal, Weebly, Webflow, Showit, Custom, Unknown
  cms_version:     string;   // e.g. "WordPress 5.9" or ""
  copyright_year:  string;   // e.g. "2019" or ""
  has_flash:       "Yes" | "No" | "N/A";
  html_doctype:    "HTML5" | "Legacy" | "N/A";
  last_modified:   string;   // HTTP header value or ""
  site_age_signal: "Modern" | "Aging" | "Outdated" | "N/A";
  flags:           string;   // comma-joined list of triggered red/yellow flags
}

export interface AuditResult {
  wp_id:       number;
  name:        string;
  city:        string;
  address:     string;
  phone:       string;
  website:     string;
  has_website: "Yes" | "No";
  email:       string;
  email_status: "found" | "no_email" | "no_website" | "error";
  audit:       SiteAudit;
}

// ─── Email helpers ────────────────────────────────────────────────────────────

const EMAIL_RE = /[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/g;

const SKIP_EMAIL_DOMAINS = new Set([
  "sentry.io","example.com","wixpress.com","squarespace.com",
  "googleapis.com","gstatic.com","cloudflare.com","amazonaws.com",
  "schema.org","facebook.com","instagram.com","twitter.com",
  "youtube.com","yelp.com","google.com","pinterest.com",
  "tiktok.com","linkedin.com","wix.com","godaddy.com",
  "apple.com","microsoft.com","adobe.com","jquery.com",
  "w3.org","wordpress.org","bootstrapcdn.com","fontawesome.com",
]);

const SKIP_PREFIXES = ["noreply@","no-reply@","donotreply@","mailer@","bounce@","webmaster@","postmaster@"];

function cleanEmails(raw: string[], siteDomain: string): string[] {
  const filtered = raw.filter(e => {
    const lower = e.toLowerCase();
    const domain = lower.split("@")[1] ?? "";
    if ([...SKIP_EMAIL_DOMAINS].some(s => domain.includes(s))) return false;
    if (SKIP_PREFIXES.some(p => lower.startsWith(p))) return false;
    if (domain.match(/\.(png|jpg|gif|svg|webp|css|js|php)$/)) return false;
    if (e.length > 80 || e.length < 6) return false;
    if (!domain.includes(".") || domain.length < 4) return false;
    return true;
  });

  const sameDomain = filtered.filter(e =>
    e.toLowerCase().split("@")[1]?.includes(siteDomain)
  );
  const candidates = sameDomain.length ? sameDomain : filtered;
  return [...new Set(candidates.map(e => e.toLowerCase()))];
}

function pickBestEmail(emails: string[]): string {
  const preferred = emails.find(e =>
    /^(info|contact|hello|studio|dance|office|admin|booking|register|enquir)@/.test(e)
  );
  return preferred ?? emails[0];
}

// ─── Fetch helper ─────────────────────────────────────────────────────────────

interface FetchResult {
  html:          string;
  lastModified:  string;
  finalUrl:      string;   // after redirects
  ok:            boolean;
}

async function fetchPage(url: string, timeoutMs = 7000): Promise<FetchResult> {
  const empty: FetchResult = { html: "", lastModified: "", finalUrl: url, ok: false };
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; BDD-Audit/1.0; +https://ballroomdancedirectory.com)",
        "Accept": "text/html,application/xhtml+xml,*/*",
      },
      redirect: "follow",
    });
    clearTimeout(timer);
    if (!res.ok) return empty;
    const html = await res.text();
    return {
      html,
      lastModified: res.headers.get("last-modified") ?? "",
      finalUrl:     res.url ?? url,
      ok:           true,
    };
  } catch {
    return empty;
  }
}

// ─── Platform detection ───────────────────────────────────────────────────────

interface PlatformInfo {
  platform:    string;
  cms_version: string;
}

function detectPlatform(html: string, finalUrl: string): PlatformInfo {
  const h = html.toLowerCase();

  // WordPress — generator meta and path patterns
  const wpGen = html.match(/<meta[^>]+name=["']generator["'][^>]+content=["']WordPress ([^"']+)["']/i);
  if (wpGen) return { platform: "WordPress", cms_version: `WordPress ${wpGen[1].trim()}` };
  if (h.includes("/wp-content/") || h.includes("/wp-includes/") || h.includes("wp-json"))
    return { platform: "WordPress", cms_version: "" };

  // Joomla
  const joomlaGen = html.match(/<meta[^>]+name=["']generator["'][^>]+content=["'](Joomla[^"']+)["']/i);
  if (joomlaGen) return { platform: "Joomla", cms_version: joomlaGen[1].trim() };
  if (h.includes("/media/jui/") || h.includes("joomla")) return { platform: "Joomla", cms_version: "" };

  // Drupal
  if (h.includes("/sites/default/files/") || h.includes("drupal.js") || h.includes("drupal-settings"))
    return { platform: "Drupal", cms_version: "" };

  // Wix
  if (h.includes("wix.com") || h.includes("wixstatic.com") || h.includes("_wixCssMap"))
    return { platform: "Wix", cms_version: "" };

  // Squarespace
  if (h.includes("squarespace.com") || h.includes("squarespace-cdn") || h.includes("sqspcdn"))
    return { platform: "Squarespace", cms_version: "" };

  // Weebly
  if (h.includes("weebly.com") || h.includes("editmysite.com") || h.includes("weeblycloud"))
    return { platform: "Weebly", cms_version: "" };

  // GoDaddy Website Builder
  if (h.includes("godaddy.com") || h.includes("secureserver.net") || h.includes("websitebuilder.com") || finalUrl.includes("godaddysites"))
    return { platform: "GoDaddy", cms_version: "" };

  // Webflow
  if (h.includes("webflow.com") || h.includes("webflow.io") || h.includes("data-wf-"))
    return { platform: "Webflow", cms_version: "" };

  // Showit
  if (h.includes("showit.co") || h.includes("showitcdn"))
    return { platform: "Showit", cms_version: "" };

  // Duda
  if (h.includes("dudaone.com") || h.includes("multiscreensite.com"))
    return { platform: "Duda", cms_version: "" };

  // HubSpot CMS
  if (h.includes("hs-scripts.com") || h.includes("hubspot.com/hs/"))
    return { platform: "HubSpot CMS", cms_version: "" };

  // Generic site builder signals
  const genMeta = html.match(/<meta[^>]+name=["']generator["'][^>]+content=["']([^"']{3,60})["']/i);
  if (genMeta) return { platform: genMeta[1].trim(), cms_version: "" };

  return { platform: "Custom / Unknown", cms_version: "" };
}

// ─── Age / tech signals ───────────────────────────────────────────────────────

function extractCopyrightYear(html: string): string {
  // Look for © or Copyright followed by a 4-digit year
  const m = html.match(/(?:©|&copy;|copyright)\s*(?:\d{4}\s*[-–—]\s*)?(\d{4})/i);
  if (m) return m[1];
  return "";
}

function detectDoctype(html: string): "HTML5" | "Legacy" {
  const firstLine = html.trimStart().substring(0, 200).toLowerCase();
  if (firstLine.includes("<!doctype html>")) return "HTML5";
  if (firstLine.includes("<!doctype")) return "Legacy";
  return "HTML5"; // no DOCTYPE at all → treat as modern default
}

function hasViewport(html: string): boolean {
  return /<meta[^>]+name=["']viewport["']/i.test(html);
}

function hasFlash(html: string): boolean {
  const h = html.toLowerCase();
  return h.includes(".swf") || h.includes("shockwave-flash") || h.includes("application/x-shockwave-flash");
}

function deriveAgeSignal(flags: string[]): "Modern" | "Aging" | "Outdated" {
  const redFlags   = ["No SSL", "No mobile viewport", "Has Flash", "Legacy DOCTYPE"];
  const yellowFlags= ["Copyright pre-2020", "Copyright pre-2022", "Old CMS version"];

  const reds   = flags.filter(f => redFlags.some(r => f.startsWith(r))).length;
  const yellows= flags.filter(f => yellowFlags.some(y => f.startsWith(y))).length;

  if (reds >= 2) return "Outdated";
  if (reds === 1 || yellows >= 2) return "Aging";
  return "Modern";
}

// ─── Main audit function ──────────────────────────────────────────────────────

const EMPTY_AUDIT: SiteAudit = {
  has_ssl: "N/A", mobile_ready: "N/A", platform: "",
  cms_version: "", copyright_year: "", has_flash: "N/A",
  html_doctype: "N/A", last_modified: "", site_age_signal: "N/A", flags: "",
};

async function auditStudio(studio: {
  wp_id: number; name: string; city: string;
  address: string; phone: string; website: string;
}): Promise<AuditResult> {
  const base: Omit<AuditResult, "email" | "email_status" | "audit"> = {
    wp_id:       studio.wp_id,
    name:        studio.name,
    city:        studio.city,
    address:     studio.address,
    phone:       studio.phone,
    website:     studio.website,
    has_website: studio.website ? "Yes" : "No",
  };

  if (!studio.website || !studio.website.startsWith("http")) {
    return { ...base, email: "", email_status: "no_website", audit: EMPTY_AUDIT };
  }

  let siteDomain: string;
  let baseUrl: string;
  let isHttps: boolean;
  try {
    const parsed = new URL(studio.website);
    siteDomain = parsed.hostname.replace(/^www\./, "");
    baseUrl    = `${parsed.protocol}//${parsed.hostname}`;
    isHttps    = parsed.protocol === "https:";
  } catch {
    return { ...base, email: "", email_status: "error", audit: EMPTY_AUDIT };
  }

  // Fetch homepage + /contact page in parallel
  const [homePage, contactPage] = await Promise.all([
    fetchPage(studio.website),
    fetchPage(`${baseUrl}/contact`),
  ]);

  // If homepage failed entirely, try /contact-us
  const contactUsPage = (!contactPage.ok) ? await fetchPage(`${baseUrl}/contact-us`) : null;

  const primaryPage = homePage.ok ? homePage : (contactPage.ok ? contactPage : contactUsPage);
  if (!primaryPage?.ok) {
    return { ...base, email: "", email_status: "error", audit: EMPTY_AUDIT };
  }

  const homeHtml    = homePage.html;
  const contactHtml = (contactPage.ok ? contactPage.html : contactUsPage?.html) ?? "";

  // ── Email extraction ───────────────────────────────────────
  const allEmails: string[] = [];

  for (const html of [homeHtml, contactHtml]) {
    const mailtoRe = /mailto:([^"'?\s>\\]+)/gi;
    let m: RegExpExecArray | null;
    while ((m = mailtoRe.exec(html)) !== null) {
      const e = m[1].split("?")[0].trim();
      if (e.includes("@")) allEmails.push(e);
    }
    allEmails.push(...(html.match(EMAIL_RE) ?? []));
  }

  const cleanedEmails = cleanEmails(allEmails, siteDomain);
  const email = cleanedEmails.length ? pickBestEmail(cleanedEmails) : "";

  // ── Tech audit ─────────────────────────────────────────────
  const { platform, cms_version } = detectPlatform(homeHtml, homePage.finalUrl ?? studio.website);
  const copyrightYear = extractCopyrightYear(homeHtml + contactHtml);
  const doctype       = detectDoctype(homeHtml);
  const mobileReady   = hasViewport(homeHtml);
  const flash         = hasFlash(homeHtml);
  const lastModified  = homePage.lastModified;

  // Build flags list
  const flags: string[] = [];
  if (!isHttps)       flags.push("No SSL");
  if (!mobileReady)   flags.push("No mobile viewport");
  if (flash)          flags.push("Has Flash");
  if (doctype === "Legacy") flags.push("Legacy DOCTYPE");
  if (copyrightYear) {
    const yr = parseInt(copyrightYear, 10);
    if (yr < 2020) flags.push(`Copyright pre-2020 (${copyrightYear})`);
    else if (yr < 2022) flags.push(`Copyright pre-2022 (${copyrightYear})`);
  }
  if (cms_version) {
    // Flag old WP versions (< 6.0)
    const wpVer = cms_version.match(/WordPress (\d+)/);
    if (wpVer && parseInt(wpVer[1]) < 6) flags.push(`Old CMS version (${cms_version})`);
    // Flag Joomla / Drupal — often neglected
    if (platform === "Joomla" || platform === "Drupal") flags.push(`Legacy CMS (${platform})`);
  }
  if (lastModified) {
    const modYear = new Date(lastModified).getFullYear();
    if (!isNaN(modYear) && modYear < 2021) flags.push(`Last-Modified ${modYear}`);
  }

  const audit: SiteAudit = {
    has_ssl:         isHttps ? "Yes" : "No",
    mobile_ready:    mobileReady ? "Yes" : "No",
    platform,
    cms_version,
    copyright_year:  copyrightYear,
    has_flash:       flash ? "Yes" : "No",
    html_doctype:    doctype,
    last_modified:   lastModified,
    site_age_signal: deriveAgeSignal(flags),
    flags:           flags.join(", "),
  };

  return {
    ...base,
    email,
    email_status: email ? "found" : "no_email",
    audit,
  };
}

// ─── Route handler ────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  let body: { studios?: Array<{
    wp_id: number; name: string; city: string;
    address: string; phone: string; website: string;
  }> };

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400, headers: CORS_HEADERS });
  }

  const studios = body.studios ?? [];
  if (!studios.length) {
    return NextResponse.json({ error: "No studios provided" }, { status: 400, headers: CORS_HEADERS });
  }
  if (studios.length > 25) {
    return NextResponse.json({ error: "Max batch size is 25" }, { status: 400, headers: CORS_HEADERS });
  }

  const settled = await Promise.allSettled(studios.map(auditStudio));

  const results: AuditResult[] = settled.map((r, i) => {
    if (r.status === "fulfilled") return r.value;
    return {
      wp_id:        studios[i].wp_id,
      name:         studios[i].name,
      city:         studios[i].city,
      address:      studios[i].address,
      phone:        studios[i].phone,
      website:      studios[i].website,
      has_website:  studios[i].website ? "Yes" : "No",
      email:        "",
      email_status: "error" as const,
      audit:        EMPTY_AUDIT,
    };
  });

  const withEmail   = results.filter(r => r.email).length;
  const withWebsite = results.filter(r => r.has_website === "Yes").length;
  const modern      = results.filter(r => r.audit.site_age_signal === "Modern").length;
  const aging       = results.filter(r => r.audit.site_age_signal === "Aging").length;
  const outdated    = results.filter(r => r.audit.site_age_signal === "Outdated").length;

  return NextResponse.json({
    total:        results.length,
    with_website: withWebsite,
    with_email:   withEmail,
    email_rate:   withWebsite ? `${Math.round((withEmail / withWebsite) * 100)}%` : "0%",
    site_signals: { modern, aging, outdated },
    results,
  }, { headers: CORS_HEADERS });
}
