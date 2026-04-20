# SEO Action Log — Ballroom Dance Directory

Weekly Google Search Console review log. Each entry is appended from the scheduled `gsc-weekly-review` task.

## 2026-04-20 Weekly GSC Review
- **Date range:** 2026-03-20 → 2026-04-17 (28 days)
- **Clicks (28d):** 24
- **Impressions:** 492
- **Avg CTR:** 4.9%
- **Avg Position:** 15.3

### Top Pages
1. /studios/frequency-dance-boulder — 2 clicks, 100 impr, 2.0% CTR, pos 6.5
2. /studios/lets-dance-austin-round-rock — 2 clicks, 28 impr, 7.1% CTR, pos 18.0
3. /studios/lets-dance-austin-round-rock-3 — 2 clicks, 15 impr, 13.3% CTR, pos 1.6
4. / — 1 click, 10 impr, 10.0% CTR, pos 3.3
5. /studios/aatma-dance-studio-chamblee — 1 click, 4 impr, 25.0% CTR, pos 18.3

### Close-to-Page-1 Opportunities (pos 4–15)
- "frequency dance boulder" — pos 6.6, 44 impr
- "absolute dance" — pos 9.1, 36 impr
- "accolades movement project" — pos 8.2, 25 impr

### Action Items
1. **[Content & Internal Linking]** — Effort: Medium | Impact: High
   Add internal links and expand content for pages ranking positions 4–15 ("frequency dance boulder", "absolute dance", "accolades movement project"). A content depth increase plus 2–3 internal links from high-traffic pages can push these to page 1.
2. **[Link Building]** — Effort: High | Impact: High
   Build 3–5 backlinks from local dance blogs or event sites this week. Average position is 15.3 — site authority needs a boost. Target local dance studios, event calendars, and dance association directories for easy, relevant links.

### Work Completed 2026-04-20
- **Content rewrite**: Expanded the WP excerpts for all three target studios via REST API (application password auth).
  - `frequency-dance-boulder` (ID 721) — new excerpt 962 chars (adult-focused, Front Range geography, 4.6★/54 reviews cited, practice-party mention).
  - `absolute-danz-ballroom-and-latin-menasha` (ID 4003) — new excerpt 920 chars, replaces the original 10-word boilerplate; adds Fox Valley geography (Appleton/Neenah/Oshkosh/Kaukauna), 5★/18 reviews, private-vs-group positioning.
  - `accolades-movement-project-bellevue` (ID 605) — new excerpt 970 chars; Seattle Eastside geography (Redmond/Kirkland/Sammamish/Issaquah), 5★, Eastside professional scheduling angle.
  - All excerpts are live on WP — pages will regenerate via ISR (revalidate=3600) within an hour.
- **Internal linking**: Added a "Studio Spotlights" section on the homepage (`app/page.tsx`) linking to all three target studios with rich anchor context (city, rating, style blurb). Homepage is the highest-authority page on the domain, so these links pass strong signal.
- **Link-building prep**: Created `docs/link-building-targets.md` — 27 prioritized outreach targets across 5 tiers (industry publications, wedding blogs, local city lifestyle, event calendars/directories, podcasts). Includes pitch angles, contact paths, cadence (5–8 pitches/week for 8 weeks), and a tracking-spreadsheet schema. Target: 8–12 new referring domains in 90 days.

### Deferred / Follow-ups
- Commit + push changes so the homepage updates deploy via Vercel (not done in this run — left for Don to review first).
- Populate `docs/link-outreach-tracker.xlsx` before starting Week 1 of outreach (Tier 2 wedding blogs).
- Consider adding featured-studio blocks to `/ballroom-dance-lessons` and `/latin-dance-lessons` style hubs next week if the homepage spotlight moves the needle on the three target queries.
