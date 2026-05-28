# AUTONOMOUS WORKFLOW PATTERNS
> Pattern library for Claude to operate autonomously on Don's Windows machine.
> Read this file when starting any data pipeline, scraping job, or deployment task.
> All execution happens via Desktop Commander MCP — not the Linux sandbox.

---

## OPERATING ENVIRONMENT FACTS

- **Don's OS:** Windows 11
- **Node.js:** `C:\Program Files\nodejs\node.exe` (Python NOT installed)
- **Workspace root:** `C:\Users\fxtra\OneDrive\Desktop\Online Directories\[Niche]\Web Developer\`
- **Batch file staging area:** `C:\Users\fxtra\` (short path, no spaces, safe for cmd)
- **Sandbox:** Linux VM — cannot run Windows commands. Use Desktop Commander for all Windows execution.
- **HTTPS from sandbox:** Blocked by proxy. All HTTP calls must go through Chrome MCP or Desktop Commander.

---

## DESKTOP COMMANDER WORKFLOW

Three-step pattern for any script execution:

```
1. mcp__Desktop_Commander__write_file    → write the script to disk
2. mcp__Desktop_Commander__start_process → run it via a bat file
3. mcp__Desktop_Commander__read_process_output → read stdout/stderr
```

If the script runs long (>30s), poll `read_process_output` with increasing delay.
Use `interact_with_process` to send stdin to a running process if needed.

### Bat File Template (ALWAYS use this pattern)

Path-with-spaces in the workspace folder breaks Node.js when quoted inline in cmd.
The fix: write a bat file to `C:\Users\fxtra\` that uses `pushd` to cd first.

```batch
@echo off
pushd "C:\Users\fxtra\OneDrive\Desktop\Online Directories\[Niche]\Web Developer"
"C:\Program Files\nodejs\node.exe" script-name.js
popd
```

**Write the bat:** `mcp__Desktop_Commander__write_file` → path: `C:\Users\fxtra\run-[taskname].bat`
**Run the bat:** `mcp__Desktop_Commander__start_process` → command: `C:\Users\fxtra\run-[taskname].bat`
**Read output:** `mcp__Desktop_Commander__read_process_output` → use the PID returned by start_process

---

## NODE.JS SCRIPT STRUCTURE

All scripts follow this template to be resume-safe:

```javascript
const fs = require('fs');
const path = require('path');

// --- CONFIG ---
const INPUT_FILE  = 'input.csv';
const OUTPUT_FILE = 'output.csv';
const BATCH_SIZE  = 50;           // save every N rows
const DELAY_MS    = 1500;         // ms between API calls (respect rate limits)

// --- CSV PARSE ---
function parseCSV(text) {
  const lines = text.split('\n');
  const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
  return lines.slice(1)
    .filter(l => l.trim())
    .map(line => {
      const vals = [];
      let cur = '', inQ = false;
      for (const ch of line) {
        if (ch === '"') { inQ = !inQ; }
        else if (ch === ',' && !inQ) { vals.push(cur); cur = ''; }
        else cur += ch;
      }
      vals.push(cur);
      const row = {};
      headers.forEach((h, i) => { row[h] = (vals[i] || '').replace(/^"|"$/g, '').trim(); });
      return row;
    });
}

// --- CSV SERIALIZE ---
function toCSV(rows, headers) {
  const esc = v => `"${String(v || '').replace(/"/g, '""')}"`;
  return [headers.join(','), ...rows.map(r => headers.map(h => esc(r[h])).join(','))].join('\n');
}

// --- SAVE HELPER ---
function save(rows, headers) {
  fs.writeFileSync(OUTPUT_FILE, toCSV(rows, headers), 'utf8');
}

// --- DELAY HELPER ---
function delay(ms) { return new Promise(r => setTimeout(r, ms)); }

// --- MAIN ---
async function main() {
  const rows = parseCSV(fs.readFileSync(INPUT_FILE, 'utf8'));
  const headers = Object.keys(rows[0]);

  let processed = 0, skipped = 0, found = 0, errors = 0;

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];

    // RESUME SAFETY: skip if already has data
    if (row.target_field && row.target_field.trim()) {
      skipped++;
      continue;
    }

    try {
      // ... do work ...
      found++;
    } catch (e) {
      errors++;
      console.error(`[${i}] Error: ${e.message}`);
    }

    processed++;
    if (processed % BATCH_SIZE === 0) {
      save(rows, headers);
      console.log(`Saved at row ${i} — found: ${found}, errors: ${errors}`);
    }

    await delay(DELAY_MS);
  }

  save(rows, headers);
  console.log(`Done. Processed: ${processed}, skipped: ${skipped}, found: ${found}, errors: ${errors}`);
}

main().catch(console.error);
```

---

## CSV DESIGN RULES

1. **Always skip rows that already have data.** Check the target field before processing. This makes every script resumable after crash or interrupt.
2. **Save after every batch** (default: every 50 rows). Don't wait until the end.
3. **Never overwrite the source.** Read from `input.csv`, write to `output.csv` (or write back to same file in-place only after confirming the shape is correct).
4. **Log counts** — print `found / processed / skipped / errors` at every save and at the end.
5. **All column names lowercase_with_underscores.** No spaces in headers.

---

## GOOGLE MAPS SCRAPE PIPELINE

### Overview

Goal: 3,000–5,000 listings before launch. Run in batches of 20–50 cities per session.

### Step 1 — Generate city list

Use the 500 largest US cities for broad coverage. For regional directories, filter by state.
Write to `cities.csv` with columns: `city`, `state`, `done` (0/1).

### Step 2 — Places API Text Search

```javascript
// Endpoint: Places API (New) Text Search
// https://places.googleapis.com/v1/places:searchText

async function searchPlaces(query, apiKey) {
  const res = await fetch('https://places.googleapis.com/v1/places:searchText', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': apiKey,
      'X-Goog-FieldMask': [
        'places.id',
        'places.displayName',
        'places.formattedAddress',
        'places.location',
        'places.rating',
        'places.userRatingCount',
        'places.websiteUri',
        'places.nationalPhoneNumber',
        'places.businessStatus',
        'places.regularOpeningHours',
        'places.types',
        'places.googleMapsUri',
      ].join(','),
    },
    body: JSON.stringify({
      textQuery: query,          // e.g. 'yoga studio in Austin TX'
      maxResultCount: 20,        // max per call is 20
      languageCode: 'en',
    }),
  });
  return res.json();
}
```

**Search terms per city:** Run 3–5 queries per city to catch all sub-types.
Example for yoga niche: `["yoga studio", "hot yoga", "yoga classes", "yoga center"]`

**COST WARNING (2025 per-SKU pricing, no $200 credit):**
- Text Search (Pro): $0.017/call × 20 results = $0.00085 per result
- At 5 queries × 500 cities = 2,500 calls = $42.50 just for search
- Stay under 500 API calls/day to avoid surprise charges
- Check Google Cloud Console billing after first run

### Step 3 — Dedup and import to WP

After scraping, dedup on `place_id`. Then POST to WP REST API:

```javascript
// POST to WP REST API (requires JWT auth)
async function importToWP(listing, authToken, wpApiUrl, cptSlug) {
  const res = await fetch(`${wpApiUrl}/wp/v2/${cptSlug}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${authToken}`,
    },
    body: JSON.stringify({
      title:  listing.name,
      status: 'publish',
      acf: {
        studio_city:      listing.city,
        studio_state:     listing.state,
        studio_address:   listing.address,
        studio_phone:     listing.phone,
        studio_website:   listing.website,
        studio_rating:    listing.rating,
        studio_review_count: listing.reviewCount,
        google_maps_url:  listing.mapsUrl,
        studio_tier:      'free',
      },
    }),
  });
  return res.json();
}
```

**JWT auth:** POST to `{WP_API_URL}/jwt-auth/v1/token` with username + password to get bearer token. Token expires — refresh at start of each import session.

### Step 4 — Generate slug

WP auto-generates slugs from the title. If you need to control the slug:
```javascript
slug: listing.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
```

---

## EMAIL SCRAPE PIPELINE

### Use the built-in `/api/crawl-emails` route

BDD has a server-side API route that crawls a studio's website for email addresses. Call it from a Node.js script via HTTP (not directly from sandbox — use Desktop Commander to run the script on the Windows machine so it hits the live Vercel deployment):

```javascript
async function crawlEmail(slug, siteUrl) {
  const res = await fetch(
    `https://www.[your-domain.com]/api/crawl-emails?slug=${slug}&url=${encodeURIComponent(siteUrl)}`
  );
  const data = await res.json();
  return data.email || '';
}
```

Run against all rows where `website` is populated and `email` is empty.
Rate limit: 1 call per 2 seconds to avoid hammering Vercel and getting rate-limited.

---

## OWNER NAME SCRAPE PIPELINE

### Stage 1 — Extract from studio name (free, no network)

Many owner-operated studios use the owner's name in the business name:
- "Janet Smith Dance Studio" → owner_first: "Janet", owner_last: "Smith"

Run a regex against the `name` column before doing any web scraping.

```javascript
const NICHE_TRIGGER_WORDS = /\b(dance|dancing|ballroom|studio|studios|school|academy|center|arts|lessons)\b/i;

function extractNameFromTitle(title) {
  const t = title.trim();
  // Pattern: "FirstName LastName [TriggerWord...]"
  const match = t.match(
    /^([A-Z][a-z'\-]{1,17}\s+[A-Z][a-z'\-]{1,17})(?:'s?)?\s+(?:dance|dancing|ballroom|studio|studios|school|academy|center)/i
  );
  if (match) {
    const [first, last] = match[1].split(/\s+/);
    return { first, last, source: 'studio_name' };
  }
  return null;
}
```

**Update trigger words** for the new niche:
- Yoga: `yoga|studio|wellness|center|institute|pilates`
- BJJ: `gym|academy|martial|arts|jiu|jitsu|grappling`
- Music: `music|school|academy|studio|lessons|conservatory`

### Stage 2 — Web scrape About/Team/Contact pages

```javascript
async function scrapeOwnerFromSite(websiteUrl) {
  const pagesToTry = ['/about', '/about-us', '/team', '/contact', '/our-story', '/meet-the-owner'];
  
  for (const page of pagesToTry) {
    try {
      const url = new URL(page, websiteUrl).href;
      const res = await fetch(url, { 
        signal: AbortSignal.timeout(8000),
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; DirectoryBot/1.0)' }
      });
      if (!res.ok) continue;
      const html = await res.text();
      const name = extractNameFromHTML(html);
      if (name) return { ...name, source: 'web_scrape' };
    } catch (_) {}
  }
  return null;
}
```

### Stage 3 — Post-scrape cleanup

After scraping, run the cleanup script to remove false positives. Key cleaning rules:
1. Normalize ALL-CAPS names (`JANET SMITH` → `Janet Smith`)
2. Strip trailing noise words (owner, founder, director, dance, studio, etc.)
3. Clear partial names ending in hyphen
4. Deduplicate words (`Cindy Cindy` → clear)
5. Block known celebrity/brand names
6. Block location strings (Ave, Hwy, Suite, Beverly Hills, etc.)
7. Must be exactly 2–3 words
8. Each word must start with uppercase
9. No single-letter non-initial words in the middle

---

## GIT PUSH PATTERN

The workspace `.git/` has stale Windows lock files. Always push via a fresh sandbox clone:

```bash
# In the Linux sandbox (Bash tool)
cd /tmp

# Clone with PAT embedded in URL
git clone https://[TOKEN]@github.com/palmerbd/[repo].git repo-push
cd repo-push

# Copy changed files from workspace
cp -r /sessions/great-hopeful-einstein/mnt/Web\ Developer/[project]/[changed-files] .

# Commit and push
HOME=/sessions/great-hopeful-einstein git config --global user.name "palmerbd"
HOME=/sessions/great-hopeful-einstein git config --global user.email "bpalmer@abilenewebsitedesign.com"
git add .
git commit -m "description of change"
git push origin main
```

Vercel watches `main` and auto-deploys on every push. No Vercel CLI needed.

**Token location:** `/sessions/great-hopeful-einstein/.git-credentials` (stored from previous session).
If missing, check memory file `reference_github_token.md` for regeneration instructions.

---

## VERCEL DEPLOY PATTERN

1. Push to `main` branch → Vercel deploys automatically (30–120 seconds)
2. Check deploy status at `vercel.com/[team]/[project]` via Chrome MCP
3. Check environment variables at Vercel → Project → Settings → Environment Variables
4. **Never use Vercel CLI** — not installed; push pattern is sufficient

### Environment variables to set on new project

```
WP_API_URL                = http://[HETZNER_IP]/wp-json
NEXT_PUBLIC_WP_API_URL    = http://[HETZNER_IP]/wp-json
NEXT_PUBLIC_SUPABASE_URL  = https://[ref].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY = [anon key]
SUPABASE_SERVICE_ROLE_KEY = [service role key]
RESEND_API_KEY            = [from resend.com]
RESEND_FROM_EMAIL         = leads@[domain.com]
STRIPE_SECRET_KEY         = [from stripe.com]
STRIPE_WEBHOOK_SECRET     = [from stripe webhook config]
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY = [from stripe.com]
```

---

## WP REST API WRITE PATTERN

```javascript
// Step 1: Get JWT token (do this once per session)
async function getWPToken(apiUrl, user, pass) {
  const res = await fetch(`${apiUrl}/jwt-auth/v1/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: user, password: pass }),
  });
  const data = await res.json();
  return data.token;
}

// Step 2: Create a listing (CPT post)
async function createListing(apiUrl, token, cptSlug, listing) {
  const res = await fetch(`${apiUrl}/wp/v2/${cptSlug}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({
      title:  listing.name,
      status: 'publish',
      slug:   listing.slug,
      acf:    listing.acfFields,
    }),
  });
  return res.json();
}

// Step 3: Update an existing listing
async function updateListing(apiUrl, token, cptSlug, postId, fields) {
  const res = await fetch(`${apiUrl}/wp/v2/${cptSlug}/${postId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ acf: fields }),
  });
  return res.json();
}
```

**WP default credentials (new directories):**
- User: `danceadmin`
- Password: `DanceAdmin2026!`
- API URL: `https://wp.[domain.com]/wp-json` (use HTTPS subdomain — NOT bare IP)

> **Note on Wordfence:** If Wordfence is active on the WP server, whitelist your script's IP in Wordfence → Firewall → Allowlisted IPs before running any bulk import. Wordfence rate-limits rapid REST POSTs and can temporarily block repeated JWT token fetches. See CLONE-CHECKLIST.md Step 6 for details.

---

## HETZNER SSH PATTERN

When commands need to run on the WP server itself (plugin install, MySQL tuning, etc.):

1. **Write a shell script** to the workspace via Desktop Commander
2. **scp the script** to the server via a bat file:
   ```batch
   @echo off
   scp "C:\Users\fxtra\setup.sh" root@[SERVER_IP]:/root/setup.sh
   ssh root@[SERVER_IP] "bash /root/setup.sh"
   ```
3. **Read output** via `read_process_output`

Or use WP-CLI remotely if SSH key is set up.

**Credentials:**
```
Server IP: [from CLONE-CHECKLIST.md after provisioning]
User: root
Auth: SSH key (Don's existing key added at Hetzner creation time)
```

---

## SUPABASE MIGRATION PATTERN

All 5 BDD migrations apply unchanged to any new directory. Run them via Supabase SQL editor:

```
001_claims.sql         — claimed_studios table (owner claims)
002_stripe.sql         — stripe_customers, stripe_subscriptions
003_gbp_connections.sql — google_business_profile_connections
004_studio_profiles.sql — studio_profiles, studio_photos, studio_reviews
005_competition_claims.sql — competition_claims (duplicate detection)
```

After migrations, update Row Level Security policies if needed (see BDD Supabase project as reference).

---

## STATS / AUDIT SCRIPT PATTERN

Quick one-off script to count, check, or report on CSV data:

```javascript
const fs = require('fs');

function parseCSV(text) {
  const lines = text.split('\n');
  const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
  return lines.slice(1).filter(l => l.trim()).map(line => {
    const vals = [];
    let cur = '', inQ = false;
    for (const ch of line) {
      if (ch === '"') { inQ = !inQ; }
      else if (ch === ',' && !inQ) { vals.push(cur); cur = ''; }
      else cur += ch;
    }
    vals.push(cur);
    const row = {};
    headers.forEach((h, i) => { row[h] = (vals[i] || '').replace(/^"|"$/g, '').trim(); });
    return row;
  });
}

const rows = parseCSV(fs.readFileSync('your-file.csv', 'utf8'));

console.log('Total rows:', rows.length);
console.log('Has website:', rows.filter(r => r.website).length);
console.log('Has email:',  rows.filter(r => r.email).length);
// add more checks...
```

Write to `C:\Users\fxtra\stats.js` and run via bat.

---

## CLEANUP / DEDUPLICATE PATTERN

When scraping produces duplicates (same business from multiple search queries):

```javascript
// Dedup by place_id (Google) or by normalized name+city
const seen = new Map();
const deduped = [];
for (const row of rows) {
  const key = row.place_id || `${row.name.toLowerCase().trim()}|${row.city.toLowerCase().trim()}`;
  if (!seen.has(key)) {
    seen.set(key, true);
    deduped.push(row);
  }
}
console.log(`Deduped: ${rows.length} → ${deduped.length}`);
```

---

## QUICK REFERENCE — ACTIVE NICHE DIRECTORIES

| Directory | Niche | Domain | WP IP | CPT Slug | GitHub |
|---|---|---|---|---|---|
| BDD (original) | Ballroom dance | ballroomdancedirectory.com | 5.78.218.239 | dance_studio | palmerbd/ballroom-dance-directory |
| Hoopz | Youth basketball | hoopzconnect.com | 5.78.203.79 | team / player / ... | palmerbd/hoops-directory |
| [Next] | [niche] | [domain] | [IP] | [slug] | palmerbd/[repo] |

---

## COMMON FAILURE MODES

| Symptom | Likely cause | Fix |
|---|---|---|
| Script hangs silently | fetch() with no timeout | Add `AbortSignal.timeout(8000)` |
| "Cannot read properties of undefined" on CSV parse | Extra BOM or CRLF line endings | Add `.replace(/^﻿/, '')` after `readFileSync` |
| WP REST 401 Unauthorized | JWT token expired | Re-fetch token at start of session |
| WP REST 403 on token fetch | Wordfence blocked IP — brute-force protection on repeated `/jwt-auth/v1/token` POSTs | WP Admin → Wordfence → Firewall → Allowlisted IPs → add your current external IP |
| WP REST 403 mid-import (then recovers) | Wordfence WAF rate-limiting on rapid REST POSTs | Whitelist IP (see above) OR add `await delay(2000)` between each POST |
| WP REST 403 Forbidden | ACF Pro not active or field group not assigned to CPT | Check WP Admin → ACF → Field Groups |
| Vercel build fails after niche swap | TypeScript type errors from renamed types | Run `npm run build` locally and fix type errors before pushing |
| Vercel env vars show old domain | Vercel caches env vars — redeploy required | Vercel → Deployments → Redeploy (not from cache) |
| `grep -r "dance_studio"` still finds hits | Missed a file in NICHE-SWAP-GUIDE.md | Check `lib/`, `app/api/`, `components/` manually |
| Desktop Commander bat file does nothing | Path variable expansion failed in cmd | Verify bat uses `pushd` pattern, not `SET WD=...` |
