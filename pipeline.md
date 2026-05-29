# Green Pest Control Directory — Project Pipeline

**Live URL:** https://www.greenpestdirectory.com *(also: https://eco-pest-directory.vercel.app)*
**GitHub:** https://github.com/palmerbd/ballroom-dance-directory
**Last Updated:** 2026-04-02 (Session 8 — ISR end-to-end test confirmed: WP save_post hook → /api/revalidate → HTTP 200 revalidated:true. Hook lives in hello.php on Hetzner; fires to dance-directory.vercel.app until custom domain added to Vercel.)

---

## Overall Progress

```
PHASE 1: Foundation      ████████████████████  100%  ✅ COMPLETE
PHASE 2: Data Layer      ██████████████████░░   90%  🔄 IN PROGRESS (photos still empty)
PHASE 3: Frontend        ██████████████████░░   90%  ✅ MOSTLY COMPLETE (photos/map/pricing open)
PHASE 4: SEO Launch      ██████████████████░░   90%  🔄 IN PROGRESS (photos last big item)
PHASE 5: Monetization    ████████░░░░░░░░░░░░   40%  🔄 IN PROGRESS (claim ✅, paid tier next)
PHASE 6: Scale & Automate███░░░░░░░░░░░░░░░░░   15%  🔄 IN PROGRESS (932 studios ✅, automation next)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
OVERALL        [█████████████████░░░]  ~84% Complete
               ▲ YOU ARE HERE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Key: ✅ done  🔄 in progress  ⏳ not started
Last significant moves: ISR end-to-end confirmed ✅ | Claim flow fully deployed ✅ | 932 studios live ✅
Next unlock: Studio photos → unblocks Phase 3 detail pages + Phase 4 visual depth
Next revenue: Stripe paid tier (Phase 5.2) → first $199/mo subscription
```

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        PUBLIC INTERNET                          │
│                    greenpestdirectory.com                   │
└──────────────────────────┬──────────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────────┐
│                    VERCEL (Edge / CDN)                          │
│              Next.js 15 · App Router · ISR                      │
│                                                                 │
│  /                      → Homepage (hero, browse by style)      │
│  /studios               → All studios + search/filter UI       │
│  /studios/[slug]        → Individual studio detail page        │
│  /studios/city/[city]   → City landing pages                   │
│  /[style]-dance-lessons → Style landing pages ✅ Live           │
│  /api/revalidate        → ISR webhook endpoint                 │
│  /sitemap.xml           → Dynamic sitemap (auto-generated)     │
│  /robots.txt            → Robots config                        │
└──────────────────────────┬──────────────────────────────────────┘
                           │ REST API (ISR, server-side)
┌──────────────────────────▼──────────────────────────────────────┐
│              HETZNER VPS · 178.156.197.177 (CX22)                  │
│              WordPress (Headless) · PHP 8.3 · MySQL 8          │
│                                                                 │
│  Custom Post Type: pest_company                                 │
│  ACF Pro fields: address, phone, styles, hours, rating, etc.   │
│  REST endpoint: /wp-json/wp/v2/pest_company                    │
│  Plugins: ACF Pro, WPGraphQL, JWT Auth, Yoast SEO              │
└─────────────────────────────────────────────────────────────────┘
```

---

## Tech Stack

| Layer | Technology | Status |
|---|---|---|
| Frontend Framework | Next.js 15 (App Router) | ✅ Live |
| Hosting / CDN | Vercel | ✅ Live |
| CMS / Data | WordPress (Headless) | ✅ Live |
| CMS Hosting | Hetzner VPS CX22 | ✅ Live |
| Custom Fields | ACF Pro | ✅ Live |
| Styling | Tailwind CSS + custom nav/gold theme | ✅ Live |
| Type System | TypeScript — StudioCard, DanceStyle, etc. | ✅ Live |
| Auth (claim flow) | Supabase | ✅ Live (project: pcthfpqwdrfszwasxfei) |
| Payments | Stripe Subscriptions | ⏳ Planned |
| Email | Resend | ⏳ Planned |
| DNS | Namecheap → Vercel | ✅ Live (2026-04-01) |
| SSL | Let's Encrypt (via Vercel) | ✅ Auto on deploy |
| SEO | Yoast (WP) + Next.js Metadata API | ✅ Live |
| Schema.org | JSON-LD on studio + city pages | ✅ Live |
| AI Content | Claude Haiku (Anthropic API) | ⏳ Planned |

---

## PHASE 1 — Foundation & Infrastructure ✅ COMPLETE

### 1.1 Server Setup
- [x] Hetzner VPS provisioned (CX22, Ubuntu 24.04, 178.156.197.177)
- [x] Nginx + PHP 8.3-fpm + MySQL 8.0 installed via cloud-init
- [x] WordPress installed (headless config, table prefix `dd_`)
- [x] WP-CLI installed
- [x] WordPress admin created: `danceadmin` / `danceadmin2024`

### 1.2 WordPress Configuration
- [x] Custom post type registered: `pest_company`
- [x] ACF Pro installed and activated
- [x] ACF field group created: "Pest Control Company Details" — all fields:
  - `studio_address_street`, `studio_address_city`, `studio_address_state`, `studio_address_zip`
  - `studio_phone`, `studio_email`, `studio_website`
  - `studio_dance_styles` (checkbox — valid values: ballroom, latin, tango, salsa, swing, waltz, foxtrot, wedding, social, competitive)
  - `studio_price_intro`, `studio_price_monthly`, `studio_price_dropin`
  - `studio_amenities`, `studio_gallery`, `studio_instructors`
  - `studio_hours_mon` through `studio_hours_sun`
  - `studio_yelp_url`, `studio_google_maps_url`, `studio_facebook_url`, `studio_instagram_url`
  - `studio_rating`, `studio_review_count`, `studio_tagline`, `studio_founded_year`
- [x] WPGraphQL plugin installed
- [x] JWT Authentication plugin installed
- [x] Yoast SEO installed

### 1.3 GitHub Repository
- [x] Repo created: `palmerbd/ballroom-dance-directory`
- [x] Next.js 15 project scaffolded
- [x] TypeScript configured
- [x] Tailwind CSS configured
- [x] Git credentials stored in VM (`/sessions/.../dance-push`)

### 1.4 Vercel Deployment
- [x] Vercel project created: `palmerbds-projects/ballroom-dance-directory`
- [x] GitHub → Vercel auto-deploy pipeline connected
- [x] Environment variable: `NEXT_PUBLIC_WP_API_URL=http://178.156.197.177/wp-json`
- [x] Production URL live: https://eco-pest-directory.vercel.app
- [x] Auto SSL via Vercel

---

## PHASE 2 — Data Layer 🔄 IN PROGRESS (~80%)

### 2.1 Studio Data Architecture
- [x] TypeScript types defined (`types/studio.ts`):
  - `StudioCard`, `Studio`, `DanceStyle`, `StudioChain`, `ListingTier`
  - `CHAIN_CONFIG` — Fred Astaire, Arthur Murray, Dance With Me, Independent
  - `STYLE_LABELS` — display names for all dance styles
  - `DANCE_STYLES` — filter dropdown array (ballroom, latin, tango, salsa, swing, waltz, foxtrot, wedding_dance, competition)
  - `AMENITY_LABELS`
- [x] `lib/wordpress.ts` — WP REST API client:
  - `getAllStudios(perPage)` — paginated fetch with `X-WP-TotalPages` support
  - `getStudio(slug)` — single studio by slug
  - `getAllStudioSlugs()` — for `generateStaticParams`
  - `getStudiosByCity(citySlug)` — city page data
  - `mapWPPost()` — WP REST response → Studio type
  - `decodeHtmlEntities()` — decodes `&#8217;` etc. from WP titles/excerpts
  - `detectChain()` — auto-detects Fred Astaire / Arthur Murray / Dance With Me from title
  - `STYLE_MAP` — maps WP ACF checkbox values → frontend DanceStyle union

### 2.2 Data Scraping Pipeline (Google Places)
- [x] Google Maps JavaScript SDK pipeline built
- [x] Script runs from WordPress admin browser console (VM network restrictions bypass)
- [x] Pipeline: `google.maps.places.PlacesService` → textSearch → getDetails → WP REST API POST
- [x] Authentication: WP nonce from `wpApiSettings.nonce` (admin console only)
- [x] Texas franchise scraper script built (`scraping-scripts/texas-franchise-scraper.js`) — run 2026-04-01 ✅
- [x] New markets scraper built (`scraping-scripts/new-markets-scraper.js`) — run 2026-04-01 ✅
- [x] **636 real studios now live in WordPress** across 10+ markets:
  - Los Angeles: **26 studios** (including suburbs: Santa Monica, Burbank, Pasadena, etc.)
  - Miami: **22 studios** (including suburbs: Coral Gables, Hialeah, Aventura, etc.)
  - Chicago: **19 studios** (including suburbs: Evanston, Naperville, Schaumburg, etc.)
  - Houston: **19 studios** (including suburbs: The Woodlands, Sugar Land, Pearland, etc.)
  - Dallas: **16 studios** (city only — suburbs listed separately)
  - Texas (rest of state): **~184 studios** — Austin, San Antonio, Fort Worth, El Paso, Corpus Christi, and 15+ more cities ✅ NEW
  - New York City + NJ: franchise + independent studios ✅ NEW
  - Atlanta: franchise + independent studios ✅ NEW
  - Seattle + Bellevue/Eastside: franchise + independent studios ✅ NEW
  - Denver + Colorado Springs + Boulder: franchise + independent studios ✅ NEW
- [x] All studios have real data: name, address, phone, hours, Google rating, review count, Maps URL
- [x] All studio excerpts (descriptions) enriched with generated copy (2026-03-31)
- [x] Dance styles batch-updated for all 124 studios:
  - All studios: ballroom, latin, tango, waltz, foxtrot, wedding_dance
  - Studios with "ballroom" in name or chain studios: + competition
  - Studios with "salsa" / related keywords: + salsa
  - Studios with "swing" keywords: + swing

### 2.3 Data Quality Issues — Known / Remaining
- [x] **Studio descriptions** — all 932 studios enriched with original chain-aware copy (2026-04-01) ✅
- [ ] **Studio photos** — gallery fields are empty; must come from owner uploads, commissioned photography, or licensed stock only (Google Places API NOT permitted per legal memo 2026-04-02)
- [ ] **Pricing** — `studio_price_dropin`, `studio_price_intro`, `studio_price_monthly` mostly unpopulated
- [ ] **Taglines** — mostly empty; would strengthen studio cards
- [ ] **City filter granularity** — suburbs (Frisco, Plano) appear as separate cities rather than under Dallas metro
- [ ] **Chain detection** — most 124 studios are independent; no Fred Astaire / Arthur Murray detected by name

### 2.4 ISR Revalidation ✅ COMPLETE
- [x] `/api/revalidate` webhook endpoint coded and fixed (correct slug structure, style page revalidation map added)
- [x] `save_post_pest_company` hook injected into `hello.php` (Hello Dolly plugin) on Hetzner — fires on every `pest_company` publish/update ✅
- [x] `WP_REVALIDATE_SECRET` set in Vercel env vars dashboard ✅
- [x] **End-to-end test passed 2026-04-02** — WP save → `wp_remote_post` → `/api/revalidate` → `HTTP 200 {"revalidated":true}` ✅
  - Revalidated paths confirmed: `/studios/[slug]`, `/studios`, `/`
  - City path also revalidates when `city` meta field is populated
- [x] Standalone plugin reference: `docs/wp-revalidate-plugin.php` (use this when migrating off Hello Dolly)
- [x] WP hook URL updated to `https://www.greenpestdirectory.com/api/revalidate` in `hello.php` ✅ 2026-04-02

---

## PHASE 3 — Frontend (Next.js) 🔄 IN PROGRESS (~80%)

### 3.1 Pages Built

| Page | Route | Status | Notes |
|---|---|---|---|
| Homepage | `/` | ✅ Live | Hero, Browse by Style, Chain brands, Why Private Lessons |
| All Studios | `/studios` | ✅ Live | ISR 30min, full filter UI |
| Studio Detail | `/studios/[slug]` | ✅ Live | ISR 60min, Schema.org JSON-LD |
| City Landing | `/studios/city/[city]` | ✅ Live | ISR 60min, Schema.org ItemList, sidebar |
| Style Landing | `/[style]-dance-lessons` | ✅ Live | All 6 built: ballroom, latin, tango, wedding, swing, competition |
| About | `/about` | ✅ Live | Independent directory explanation, trademark notice |
| Terms of Service | `/terms` | ✅ Live | Draft — needs attorney review before domain launch |
| Privacy Policy | `/privacy` | ✅ Live | Draft — needs attorney review before domain launch |
| Contact / Claim | `/contact` | ✅ Live | Claim, correction, removal request, partnership CTA |
| Search Results | `/studios?q=...` | ✅ Fixed | Homepage form now routes to /studios with query params (2026-04-01) |
| Claim Your Listing | `/claim` | ✅ Built | 3-step wizard, magic link auth, Supabase backend |
| Claim Callback | `/claim/callback` | ✅ Built | Magic link exchange → inserts claim → redirects to dashboard |
| Studio Dashboard | `/dashboard` | ✅ Built | Claim status, studio link, upgrade teaser |

### 3.2 Search & Filter UI — `/studios`
- [x] Text search (name, city, address)
- [x] City dropdown (Los Angeles, Chicago, Dallas, Miami, Houston, New York, Atlanta, Seattle, Denver, Austin — expanded 2026-04-01)
- [x] Dance style dropdown (ballroom, latin, tango, salsa, swing, waltz, foxtrot, wedding, competition)
- [x] Studio type / chain dropdown (All Types, Fred Astaire, Arthur Murray, Dance With Me, Independent)
- [x] Minimum rating filter (Any, 4★+, 4.5★+)
- [x] Sort by (Top Rated, Most Reviewed, A→Z)
- [x] Active filter chips with individual clear buttons
- [x] Result count with contextual text ("X studios match your filters")
- [x] Empty state with "Clear All Filters" CTA
- [x] Client-side (no server round-trips on filter change)
- [ ] URL-synced filter state (filters don't persist on share/refresh)
- [ ] Pagination or infinite scroll (all 124 load at once — will need pagination at ~300+)

### 3.3 Studio Detail Page — `/studios/[slug]`
- [x] Studio name (H1), city/state location
- [x] Chain badge (color-coded: Fred Astaire blue, Arthur Murray green, Independent gold)
- [x] Star rating display
- [x] Dance style tags
- [x] Phone number
- [x] Address
- [x] Hours of operation (Mon–Sun)
- [x] Description (enriched copy from WP excerpt)
- [x] Google Maps directions link
- [x] Schema.org JSON-LD (LocalBusiness)
- [x] Meta title: `[Studio Name] — [City, ST] | Private Dance Directory`
- [x] Meta description from studio description
- [ ] **Studio photos / gallery** — empty; no images loaded
- [ ] **Embedded Google Map** — has directions link but no map embed
- [ ] **Pricing section** — most studios have no pricing data
- [ ] **Lead capture form** — paid tier feature (requires Supabase + Stripe)
- [x] **Claim this listing** CTA — ClaimBadge component (Verified Owner badge or "Claim your listing" link) ✅
- [ ] **Related studios** (same city) — not built

### 3.4 City Landing Pages — `/studios/city/[city]`
- [x] Dynamic route, SSG via `generateStaticParams`
- [x] City-specific intro copy (5 main cities hardcoded)
- [x] "Pro Tip" sidebar panel per city
- [x] Studio grid with rating + styles
- [x] Schema.org ItemList with all studios
- [x] Meta title + OG tags
- [x] Average rating computed and displayed
- [x] Browse other cities sidebar
- [ ] **Suburb cities have no city content** — CITY_CONTENT only covers 5 main metros
- [ ] **Breadcrumb structured data** (Schema.org BreadcrumbList)

### 3.5 SEO Infrastructure
- [x] `app/sitemap.ts` — dynamic, includes all studio slugs + city pages + static pages
- [x] `app/robots.ts` — configured
- [x] `app/layout.tsx` — global metadata with `template: "%s | Private Dance Directory"`
- [x] Open Graph tags on all major pages
- [x] Schema.org JSON-LD on studio detail (LocalBusiness) and city pages (ItemList)
- [x] Canonical URLs
- [x] **Style landing pages** — all 6 built and live ✅
- [x] **Google Search Console** — property verified (HTML file method), sitemap submitted ✅ 2026-04-01
- [x] **Bing Webmaster Tools** — submitted via GSC import (greenpestdirectory.com + sitemap imported) ✅ 2026-04-01

### 3.6 Design System
- [x] Color palette: Navy `#0c1428` / `#1a2d5a`, Gold `#b8922a` / `#e8c560`, Cream `#f9f6f0`
- [x] Typography: Playfair Display (display) + system sans
- [x] Sticky filter bar on `/studios`
- [x] Card hover effects (border gold, shadow)
- [x] Gold gradient accent bar on cards
- [x] Responsive grid (1 col → 2 col → 3 col)
- [x] Breadcrumb navigation on studio and city pages
- [ ] Dark mode (not planned)
- [ ] Mobile nav menu (currently footer nav only)

### 3.7 Bug Fixes Applied
- [x] Em dash encoding fix — was stored as raw UTF-8 bytes (E2 80 94), now `\u2014`
- [x] HTML entity decoding — `&#8217;` (apostrophe) etc. decoded in `decodeHtmlEntities()`
- [x] Duplicate page title suffix — layout template `%s | Private Dance Directory` was doubling on some pages
- [x] Studios page title cleaned (`Find Private Pest Control Companies Near You | Private Dance Directory`)
- [x] ACF style value mismatch — `cha_cha` / `rumba` are not valid WP checkbox values; removed from STYLE_MAP and filter dropdown
- [x] UTF-8 mojibake on studio detail page — ★ ✓ · ← → all replaced with `{"\uXXXX"}` Unicode escapes
- [x] `classNama` typo fixed → `className` on Reviews section

---

## PHASE 4 — SEO Launch 🔄 IN PROGRESS (~40%)

### 4.1 Style Landing Pages ✅ COMPLETE
- [x] `/ballroom-dance-lessons` — hero, intro copy, style grid, studio cards, FAQ
- [x] `/latin-dance-lessons`
- [x] `/tango-dance-lessons`
- [x] `/wedding-dance-lessons`
- [x] `/swing-dance-lessons`
- [x] `/competition-dance-lessons`
- [x] Homepage "Browse by Style" cards now resolve (no more 404s)

### 4.2 Studio Photos ⚠️ LEGAL CONSTRAINT
- ❌ ~~Google Places Photo API~~ — **NOT PERMITTED** (Google Maps TOS prohibits use in directory listings — Hard Rule #2 from Legal Memo 2026-04-02)
- ❌ ~~Scraping photos from franchise websites, Yelp, or social media~~ — NOT PERMITTED (copyright, no valid license)
- [ ] **Approved path A:** Studio owner uploads photos after claiming their listing (primary source)
- [ ] **Approved path B:** Commission original exterior photography from public sidewalks
- [ ] **Approved path C:** Licensed stock photography as placeholders (Shutterstock, Adobe Stock, Unsplash commercial)
- [ ] **Approved path D:** Branded "Photo coming soon" placeholder image for unclaimed listings
- [ ] Build photo upload UI in claim flow (studio owners upload during or after claiming)
- [ ] Audit all listing photos quarterly to confirm valid licenses (per ongoing compliance checklist)

### 4.3 ISR Webhook Wiring ✅ COMPLETE
- [x] Next.js `/api/revalidate` route updated — correct slug paths, style page map, WP code documented
- [x] `save_post_pest_company` hook added to `hello.php` on Hetzner WP ✅
- [x] `WP_REVALIDATE_SECRET` set in Vercel env vars ✅
- [x] **End-to-end test confirmed 2026-04-02** — WP save → HTTP 200 `{"revalidated":true}` ✅

### 4.4 Domain & DNS ✅ COMPLETE
- [x] Domain: `greenpestdirectory.com` (registered via Namecheap)
- [x] A record `@` → `76.76.21.21` set in Namecheap Advanced DNS
- [x] CNAME `www` → `4040a9428ac2006d.vercel-dns-017.com` set (Vercel recommended record)
- [x] Custom domain added in Vercel project settings — all three entries Valid Configuration ✅
- [x] SSL auto-provisioned via Vercel (Let's Encrypt) ✅
- [x] Site live at https://www.greenpestdirectory.com (confirmed 2026-04-01) ✅
- [x] `NEXT_PUBLIC_SITE_URL=https://www.greenpestdirectory.com` set in Vercel (All Environments) ✅ 2026-04-01

### 4.5 Search Console Submission
**Status: UNBLOCKED — custom domain is now live ✅**
- [x] Style landing pages live ✅
- [ ] Studio photos populated (still empty — optional before submission)
- [x] ISR webhook working ✅
- [x] Custom domain live ✅ (2026-04-01)
- [x] **Submit sitemap to Google Search Console** ✅ 2026-04-01 — sitemap.xml submitted, Google processing
- [x] **Submit to Bing Webmaster Tools** ✅ 2026-04-01 — GSC import completed; greenpestdirectory.com + 1 sitemap live in Bing Webmaster Tools
- [x] Set `NEXT_PUBLIC_SITE_URL=https://www.greenpestdirectory.com` in Vercel ✅ 2026-04-01

### 4.6 Content Depth — Priority Pages
- [x] About page (`/about`) — live ✅
- [x] Terms of Service (`/terms`) — draft live, needs attorney review ✅
- [x] Privacy Policy (`/privacy`) — draft live, needs attorney review ✅
- [x] Contact page (`/contact`) — live ✅
- [ ] Homepage: replace placeholder "500+ studios" with real count
- [ ] Enrich city landing page copy for suburb cities (currently no content)
- [ ] Add FAQ schema markup to studio detail pages

---

## PHASE 5 — Monetization ⏳ NOT STARTED

### 5.1 Studio Claim Flow ✅ FULLY DEPLOYED 2026-04-02
- [x] **Supabase project created** — `dance-directory` org, project ref `pcthfpqwdrfszwasxfei`, East US (N. Virginia), ACTIVE_HEALTHY ✅
- [x] **SQL migration run** — `claims` table created with all 11 columns, RLS policies, auto-updated_at trigger ✅
- [x] **WP Application Password generated** — `danceadmin / Vercel Claim Flow` (stored in `.env.local` as `WP_APP_PASSWORD`) ✅
- [x] **All env vars added to Vercel** — NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY, WP_APP_USER, WP_APP_PASSWORD ✅
- [x] **Supabase auth configured** — site_url set to `https://www.greenpestdirectory.com`, redirect allow-list includes both prod + localhost ✅
- [x] `@supabase/supabase-js` installed ✅
- [x] `lib/supabase.ts` — browser client + Claim type ✅
- [x] `lib/supabase-admin.ts` — server-side service role client ✅
- [x] `supabase/migrations/001_claims.sql` — claims table + RLS policies ✅
- [x] `app/claim/page.tsx` — 3-step wizard (search studio → enter owner info → email sent) ✅
- [x] `app/claim/callback/page.tsx` — magic link callback, exchanges code for session, posts to API ✅
- [x] `app/api/claim/route.ts` — records claim in Supabase + patches WP `studio_tier` ✅
- [x] `app/api/claim/status/route.ts` — GET endpoint for per-studio claim status ✅
- [x] `components/ClaimBadge.tsx` — client component showing Verified badge or Claim CTA ✅
- [x] `app/dashboard/page.tsx` — owner dashboard with claim status + upgrade teaser ✅
- [x] Studio detail pages updated with ClaimBadge component ✅
- [x] `types/studio.ts` — ListingTier updated to include `"claimed"` ✅

### 5.2 Featured (Paid) Tier — $199/month
- [ ] Stripe Subscriptions integration
- [ ] Build `/upgrade` flow for claimed studio owners
- [ ] Paid tier unlocks on studio detail page:
  - Lead capture form (name, email, message → studio owner's inbox)
  - "Featured" badge on listing card
  - Priority placement in search results (sorted above free listings)
  - Enhanced profile: logo, banner image, promo video embed
- [ ] Resend integration — leads emailed to studio owner immediately
- [ ] WP field: `tier` updated to `"paid"` on Stripe subscription activation
- [ ] GoHighLevel CRM integration for studio owner lead management

### 5.3 Studio Outreach Campaign
- [ ] Identify top 20-30 studios per market by review count and rating
- [ ] Build outreach email sequence (Resend or GoHighLevel)
- [ ] Pitch: "You're already listed. 500+ students search here monthly. $199/mo to get their contact info."
- [ ] Track opens/clicks/responses
- [ ] Sales call → Stripe checkout link

---

## PHASE 6 — Scale & Automation ⏳ NOT STARTED

### 6.1 Expand to New Markets ✅ COMPLETE (Round 1)
- [x] Phase 1 markets: LA, Miami, Dallas, Chicago, Houston ✅ scraped
- [x] Texas (statewide franchise sweep): Austin, San Antonio, Fort Worth, El Paso + 15 more cities ✅ scraped 2026-04-01
- [x] New York City + NJ: Arthur Murray, Fred Astaire, Dance With Me + independent ✅ scraped 2026-04-01
- [x] Atlanta: franchise + independent studios ✅ scraped 2026-04-01
- [x] Seattle + Eastside (Bellevue, Kirkland, Redmond): franchise + independent ✅ scraped 2026-04-01
- [x] Denver + Colorado Springs + Boulder: franchise + independent ✅ scraped 2026-04-01
- [x] **636 total studios in WP** (up from 124) ✅
- [x] New markets scraper script: `scraping-scripts/new-markets-scraper.js` ✅
- [x] **Tier 1 markets scraper built + run** (`scraping-scripts/tier1-markets-scraper.js`) ✅ 2026-04-01
  - **Result: 277 new studios created | 9 failed | 0 duplicates → 932 total studios in WP**
  - **Description enrichment: 218 studios updated with original chain-aware copy**
  - Las Vegas NV: 12 queries (Arthur Murray, Fred Astaire, Dance With Me, Henderson, Summerlin, independent/latin/competitive)
  - Phoenix AZ: 15 queries (franchise + Tempe, Chandler, Mesa, Glendale, Gilbert)
  - Scottsdale AZ: 8 queries (franchise + Paradise Valley + independent)
  - Minneapolis MN: 14 queries (franchise + St Paul, Edina, Bloomington, Plymouth, Eden Prairie + swing)
  - Nashville TN: 12 queries (franchise + Brentwood, Franklin, Murfreesboro + wedding dance)
  - Boston MA: 16 queries (franchise + Cambridge, Newton, Brookline, Woburn, Wellesley, Natick + competitive)
  - 70 total queries across 6 markets — run from WP admin console (same pipeline as prior scrapers)
- [x] **Tier 1 scraper run** ✅ 2026-04-01 — 277 new studios, 932 total
- [ ] Next wave: San Diego, Portland (Tier 2 scraper)
- [ ] Target: 1,000+ studios across 20+ markets

### 6.2 AI Content Automation (Claude Haiku)
- [ ] Daily scheduled script: scan for studios with no description → generate with Haiku
- [ ] Auto-generate FAQ sections for studio detail pages
- [ ] Auto-generate city/style landing page copy variations for A/B testing
- [ ] Neighborhood-level landing pages (e.g., `/studios/city/los-angeles/hollywood`)

### 6.3 Additional Niche Directories (Replication)
- [ ] The ballroom directory proves the platform model
- [ ] Next directories to build using the same WP + Next.js stack:
  - Yoga Studios Directory
  - Martial Arts / BJJ Directory
  - Music Lessons Directory
  - Pilates Studios Directory
- [ ] Each new directory: ~2-week build using established pipeline
- [ ] Shared infrastructure: same Hetzner WP backend (separate DB/CPT per directory)

### 6.4 SEO Automation
- [ ] Automated internal linking between related studios (same city, same style)
- [ ] Auto-generated "Top 10" style posts for each city × style combination
- [ ] Google News sitemap for blog/content posts (if content strategy added)
- [ ] Ahrefs / SEMrush tracking setup for keyword rank monitoring

### 6.5 Lead Generation Infrastructure
- [ ] GoHighLevel pipeline: New Lead → Auto-email to studio → Follow-up sequence
- [ ] Studio owner dashboard (or GoHighLevel white-label): see their leads
- [ ] Analytics: which studios get the most clicks? (for upgrade upsell)

### 6.6 Automated Franchise Scraper — WP Plugin on Hetzner (Final Build Item)
- [ ] Build WordPress plugin that runs server-side on Hetzner (no browser required)
- [ ] Uses Google Places REST API directly (server-to-server, no CORS issues)
- [ ] Franchise-only queries: Arthur Murray, Fred Astaire, Dance With Me — all target markets
- [ ] Deduplication logic: checks existing WP slugs before inserting to avoid duplicates
- [ ] Runs via WP-Cron on monthly schedule
- [ ] Inserts new locations automatically; skips studios already in database
- [ ] Sends email notification to admin when new studios are found and added
- [ ] Requires: server-side Google API key added to Hetzner `.env` or WP options

---

## Key Files Reference

```
ballroom-dance-directory/
├── app/
│   ├── layout.tsx              # Global layout, metadata template, fonts
│   ├── page.tsx                # Homepage (hero, style browse, chain brands)
│   ├── globals.css             # Tailwind base + custom fonts
│   ├── sitemap.ts              # Dynamic sitemap (all studios + cities)
│   ├── robots.ts               # Robots.txt config
│   ├── api/
│   │   └── revalidate/route.ts # ISR webhook endpoint (wired but not triggered from WP yet)
│   └── studios/
│       ├── page.tsx            # /studios — All studios, ISR 30min
│       ├── StudioSearch.tsx    # Client-side search/filter component (all logic here)
│       ├── [slug]/
│       │   └── page.tsx        # /studios/[slug] — Individual studio detail
│       └── city/
│           └── [city]/
│               └── page.tsx    # /studios/city/[city] — City landing pages
├── lib/
│   └── wordpress.ts            # WP REST API client, mapWPPost, entity decoder
├── types/
│   └── studio.ts               # All TS types, CHAIN_CONFIG, STYLE_LABELS, DANCE_STYLES
├── scripts/
│   └── fetch-studios.mjs       # (Legacy) Node.js fetch script
└── scraping.md                 # Full Google Places → WP scraping pipeline docs
```

---

## Infrastructure Credentials (Reference)

| Service | URL / Access |
|---|---|
| WordPress Admin | http://178.156.197.177/wp-admin — `danceadmin` / `danceadmin2024` |
| Hetzner Console | https://console.hetzner.cloud — API Token in memory |
| Vercel Dashboard | https://vercel.com/palmerbd/ballroom-dance-directory |
| GitHub Repo | https://github.com/palmerbd/ballroom-dance-directory |
| Git Push Token | Stored in `/sessions/.../dance-push` remote URL |

---

## LEGAL COMPLIANCE CHECKLIST ⚠️

*Based on: Dance Directory Best Practices Guide & Legal Risk Assessment (March 31, 2026)*
*Overall pre-mitigation risk: ORANGE (High) → With mitigations applied: GREEN (Low)*

---

### ☑ PRE-LAUNCH: Critical (Must Complete Before Going Live on Custom Domain)

#### Data & Content
- [ ] **Verify all 124 studio descriptions are original** — AI-generated copy only; zero text reproduced from any franchise website. Audit `studio_excerpt` content for copied language.
- [ ] **Confirm no studio photos sourced from franchise sites** — Current placeholder images must be licensed stock or generic. No images from arthurmurray.com, fredastaire.com, or dancewithme.com.
- [ ] **Remove all franchise logos from the site** — Search entire codebase for any logo files or `<img>` tags referencing branded imagery.
- [ ] **Document data source for each listing** — Add a `data_source` ACF field to WP recording how each studio was collected (Google Places API, manual entry, etc.).

#### Legal Disclaimers (Must Be Live Before Custom Domain)
- [x] **Site-wide footer disclaimer** — Live in `app/layout.tsx`, appears on every page ✅
- [x] **Per-listing disclaimer** — Amber bar live on every studio detail page with Claim CTA ✅
- [x] **About page** — `/about` live ✅
- [x] **Terms of Service page** — `/terms` draft live ✅ *(attorney review still needed)*
- [x] **Privacy Policy page** — `/privacy` draft live ✅ *(attorney review still needed)*

#### DMCA & Removal Infrastructure
- [ ] **Register DMCA designated agent** — File at copyright.gov/dmca-directory ($6). Required before domain launch. *(YOU need to do this)*
- [x] **DMCA agent contact info posted** — Listed in `/terms` page ✅
- [x] **Removal request process built** — `/contact` page handles claim, correction, and removal requests ✅
- [x] **Claim-your-listing CTA on all studio pages** — Amber bar links to `/contact` on every detail page ✅

#### Attorney Review
- [ ] **IP/technology attorney review of site content** — Have attorney review all disclaimer language, the About page, Terms, Privacy Policy, and at least a sample of listing descriptions before custom domain launch. *(Risk Assessment: Strongly Recommended)*
- [ ] **Domain name cleared for trademark conflicts** — Confirm `greenpestdirectory.com` contains no registered trademark terms. (Note: "Green Pest Control Directory" is generic/descriptive — likely clear, but attorney should confirm.)
- [ ] **E&O and general liability insurance obtained** — Errors & Omissions insurance covering intellectual property claims. *(Risk Assessment: Strongly Recommended)*

#### Franchise Brand Outreach
- [x] **Arthur Murray outreach email drafted** — `outreach-emails/arthur-murray-outreach.md` ✅
- [x] **Fred Astaire outreach email drafted** — `outreach-emails/fred-astaire-outreach.md` ✅
- [x] **Dance With Me outreach email drafted** — `outreach-emails/dance-with-me-outreach.md` ✅
- [ ] **Send all three emails and document responses** — Verify contact emails on each brand site before sending. *(YOU need to do this)*

---

### ☑ ONGOING: Operational Compliance (After Launch)

| Action | Frequency | Owner |
|---|---|---|
| Review all listing content for accuracy | Monthly | Content |
| Audit site for any inadvertently copied content | Quarterly | Legal/Content |
| Review franchise brand TOS for changes (arthurmurray.com, fredastaire.com, dancewithme.com) | Quarterly | Legal |
| Process pending claim and removal requests | Weekly | Operations |
| Review and respond to all legal correspondence | As received (48hr SLA) | Legal |
| Update disclaimer language as needed | Annually | Legal |
| Renew E&O and liability insurance | Annually | Operations |
| Renew DMCA agent registration | Per USCO rules | Legal |
| Monitor scraping/directory case law developments | Quarterly | Legal |
| Document all franchise brand outreach and responses | Ongoing | Business Dev |

---

### ☑ DATA COLLECTION STANDARDS (Permanent Rules)

These rules apply to all future data collection — new markets, new scraping runs, and new directories:

- [ ] **Never scrape franchise corporate websites** (arthurmurray.com, fredastaire.com, dancewithme.com) — not even once
- [ ] **Always check `robots.txt`** before collecting from any domain. Respect all `Disallow` directives.
- [ ] **Never bypass CAPTCHAs or rate limiters**
- [ ] **Never copy studio descriptions** — all copy must be original AI-generated or manually written
- [ ] **Use Google Places API as primary data source** (per Google's TOS)
- [ ] **Never use franchise logos or branded images** anywhere on any directory page
- [ ] **Store data source with each record** in WP (`data_source` ACF field) — required for audit trail
- [ ] **Instructor personal data** (names, bios, emails) — do not publish without studio owner consent; privacy risk under state laws

---

### Risk Score Summary

| Risk Category | Pre-Launch Risk | Post-Mitigation Target |
|---|---|---|
| CFAA / Unauthorized Access | 🟡 YELLOW (6) | 🟢 GREEN — Avoid scraping franchise sites |
| Copyright Infringement | 🟡 YELLOW (9) | 🟢 GREEN — Original descriptions only |
| Trademark Infringement | 🟠 ORANGE (12) | 🟢 GREEN — Disclaimers + nominative use only |
| Terms of Service Breach | 🟠 ORANGE (12) | 🟢 GREEN — Don't scrape ToS-restricted sites |
| Unfair Competition | 🟡 YELLOW (6) | 🟢 GREEN — Good faith + claim process |
| Data Privacy (CCPA) | 🟢 GREEN (4) | 🟢 GREEN — No personal data scraped |

---

## Immediate Next Steps (Prioritized)

```
DONE ✅  →  Footer + per-listing disclaimers (live)
            /about + /terms + /privacy + /contact (live)
            All 6 style landing pages (live)
            ISR webhook — Next.js route + WP hook + Vercel secret (FULLY WIRED) ✅
            3 franchise outreach emails (drafted in project folder)
            Mojibake character encoding fixes (live)
            Texas statewide franchise scraper — ~184 new studios ✅
            New markets scraper (NYC, Atlanta, Seattle, Austin, Denver) — ~300 new studios ✅
            655 total studios in WordPress ✅
            Description enrichment — all 655 studios have original copy (2026-04-01) ✅
            Tier 1 scraper run (Las Vegas, Phoenix, Scottsdale, Minneapolis, Nashville, Boston) — 277 new studios ✅ (2026-04-01)
            932 total studios in WordPress ✅ (2026-04-01)
            Description enrichment — all 932 studios have original copy ✅ (2026-04-01)
            CUSTOM DOMAIN LIVE — https://www.greenpestdirectory.com ✅ (2026-04-01)
            Homepage search fixed — routes to /studios with query params ✅ (2026-04-01)
            Email updated site-wide to info@greenpestdirectory.com ✅ (2026-04-01)
            NEXT_PUBLIC_SITE_URL set in Vercel (All Environments) ✅ (2026-04-01)
            /studios city dropdown expanded to 10 markets ✅ (2026-04-01)
            Google Search Console: property verified + sitemap submitted ✅ (2026-04-01)
            Bing Webmaster Tools: greenpestdirectory.com submitted via GSC import ✅ (2026-04-01)
            Tier 1 markets scraper built + run (Las Vegas, Phoenix, Scottsdale, Minneapolis, Nashville, Boston) ✅ (2026-04-01)
            932 total studios, all descriptions enriched ✅ (2026-04-01)
            Claim Flow fully built (Supabase auth, /claim, /dashboard, API routes, Verified badge) ✅ (2026-04-01)
            ──────────────────────────────────────────────────
YOU DO   →  A. Push code to GitHub (git add . && git commit && git push)
            B. Create Supabase project → add env vars to Vercel + .env.local
            C. Run supabase/migrations/001_claims.sql in Supabase SQL Editor
            D. Generate WP Application Password → add WP_APP_PASSWORD to Vercel
            E. Set Supabase auth redirect URL to /claim/callback
            F. Send franchise outreach emails (verify contacts first)
            G. Engage IP attorney for Terms/Privacy review
            H. Register DMCA agent — copyright.gov ($6)
            ──────────────────────────────────────────────────
NEXT UP  →  1. Build Paid Tier (Stripe + lead capture form) — Step 2 of monetization
            2. Resend integration — transactional emails for claim confirmation + leads
            ──────────────────────────────────────────────────
THEN     →  5. Studio Outreach Campaign
            6. Next wave markets (San Diego, Phoenix, Portland, Nashville)
            ──────────────────────────────────────────────────
LATER    →  8. Additional Niche Directories (yoga, martial arts, etc.)
            9. Next wave markets (San Diego, Phoenix, Portland, Nashville)
            10. Automated franchise scraper WP plugin (section 6.6)
```

---

*Pipeline document created 2026-03-31. Update this file at the start of each work session.*
