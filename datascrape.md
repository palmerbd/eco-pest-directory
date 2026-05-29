# Data Scraping & Content Best Practices
### Green Pest Control Directory — Legal Compliance Guide
*Based on: Dance Directory Best Practices Guide & Legal Risk Assessment (March 31, 2026)*

---

## Overview

The composite legal risk of this directory is rated **ORANGE (High)** if scraping is used without mitigations. With all recommended practices in place, the residual risk drops to **GREEN (Low)**. The single biggest risk reducer: **avoid automated scraping entirely** and replace it with manual compilation + original content.

---

## 1. Data Collection — What We Can and Cannot Collect

### ✅ Allowed: Unprotectable Factual Data
Per *Feist Publications v. Rural Telephone Service* (1991), basic facts are not copyrightable. Safe to collect:

| Data Point | Source |
|---|---|
| Studio name (as it appears on storefront or business filings) | Google Maps, state business registrations |
| Street address | Google Maps, Secretary of State filings |
| Phone number | Google Maps, Google Places API (per its TOS) |
| Hours of operation | Google Maps |
| Types of dance offered (general categories only) | Google Maps, manual browsing of franchise locators |
| Website URL | Google Maps, franchise locator pages |

### ❌ Never Collect or Reproduce
- Studio descriptions or marketing copy (word-for-word OR paraphrased closely)
- Photographs from studio websites, social media, or marketing materials
- Franchise logos, wordmarks, or any branded graphics
- Instructor bios or class descriptions taken from studio sites
- Any content from a site that has `Disallow: /` or relevant paths in `robots.txt`

---

## 2. How to Collect Data — Approved Methods

### Approved Sources (in order of preference)
1. **Google Places API** — Programmatic access to publicly indexed business data. Must comply with Google's TOS. Safe for name, address, phone, hours, and category.
2. **State business registration databases** — Secretary of State filings confirm legal business names and registered addresses. Fully public record.
3. **Manual browsing of franchise locator pages** — You may visit franchise locator pages as a regular user and note factual information. **Do not automate this.**
4. **Direct outreach to individual studios** — Calling or emailing studios directly. Safest method legally, and builds relationship for the claim process.
5. **User/studio submissions** — Via the claim-your-listing process.

### Do's and Don'ts Table

| ✅ DO | ❌ DO NOT |
|---|---|
| Collect name, address, phone, hours from public sources | Scrape franchise corporate websites (arthurmurray.com, fredastaire.com, dancewithme.com) |
| Use Google Places API (per its TOS) | Use bots or automated tools to extract data from franchise sites |
| Browse franchise locator pages manually as a regular user | Bypass CAPTCHAs or rate limiters |
| Call studios directly to verify info | Copy studio descriptions or marketing text, even partially |
| Respect `robots.txt` on all sites | Download or reuse studio photographs from any source |
| Document your data source for each listing | Ignore Terms of Service prohibitions on automated collection |

---

## 3. Content Creation — All Descriptions Must Be Original

### The Core Rule
**Never copy, paraphrase closely, or adapt any text from franchise websites.** This includes corporate Arthur Murray, Fred Astaire, and Dance with Me sites, as well as individual studio pages. Copyright infringement risk is rated **YELLOW (Medium)** and becomes the primary exposure vector if we reproduce marketing language.

### Approved Description Template
Use this structure for all AI-generated or manually written listing descriptions:

> *[Studio Name] is a [Brand Name] franchise location at [address] in [city, state]. The studio offers [dance styles] for [beginner/intermediate/advanced] dancers. Contact them at [phone] or visit their website for class schedules and pricing.*

### Description Rules
- Keep descriptions **2–3 sentences**, factual and brief
- Never reproduce any language from the studio's website — **even partially**
- Do not make qualitative claims ("best studio in Dallas") unless quoting a verified user review with attribution
- Once a studio claims their listing, **let them replace the description entirely** with their own copy
- All AI-generated descriptions must be reviewed to ensure no inadvertent reproduction of source material

### Our Current Situation
The 124 studio descriptions generated via `generateDescription()` in the WP admin console are **original AI-generated copy** based on factual inputs (name, city, chain brand, rating). These comply with this standard. ✅

---

## 4. Photographs & Media

### Pre-Claim (Unclaimed Listings)
- Use a **generic placeholder image** or a licensed stock photo of a pest control company
- **Never** use photos from franchise websites, social media, or marketing materials
- **Never** use franchise logos or branded imagery anywhere on the site

### Post-Claim (Verified Studio Owner)
- Allow the studio owner to upload their own photos
- If we commission original photos (e.g., storefront from a public sidewalk), ensure they do not prominently feature copyrighted interior designs or proprietary materials

---

## 5. Trademark Usage — Nominative Fair Use

We are permitted to use brand names (Arthur Murray, Fred Astaire, Dance with Me) to **identify** the businesses in the directory. This is protected under the **nominative fair use doctrine**, provided all three conditions are met:

1. The studio is not readily identifiable without using the brand name ✅
2. We use only as much of the mark as necessary — **text name only, no logos** ✅
3. Our use does not suggest sponsorship, endorsement, or affiliation ✅ (requires active disclaimers)

### Trademark Do's and Don'ts

| ✅ DO | ❌ DO NOT |
|---|---|
| Use brand names in plain text to identify studios ("Arthur Murray Pest Control Company — Dallas") | Use franchise logos, wordmarks, or branded graphics anywhere |
| Include disclaimer on every page: "Not affiliated with [Brand]" | Use brand names in the domain name |
| Use brand names in title tags/meta descriptions factually | Imply endorsement: "Official Arthur Murray Directory" |
| Treat all franchise brand names consistently | Use brand names in paid advertising headlines without "not affiliated" disclaimer |

---

## 6. Required Disclaimers

Every page must carry these disclaimers:

### Site-Wide Footer
> "Green Pest Control Directory is an independent online directory. We are not affiliated with, endorsed by, or sponsored by any pest control company franchise or brand listed on this site. All trademarks are the property of their respective owners."

### Per-Listing Page
> "This listing is provided for informational purposes. Green Pest Control Directory is not affiliated with [Brand Name]. Information may not be current — please contact the studio directly to confirm details."

### About Page
The About page must clearly explain that the directory is an independent consumer resource, not operated by any franchise brand.

---

## 7. Pre-Claim Listing — What We Can Display

For a studio listing that has **not yet been claimed**, the following content is permitted:

| Content Type | Permitted? | Notes |
|---|---|---|
| Studio name | ✅ Yes | As it appears on public business filings |
| Street address | ✅ Yes | From Google Maps / public records |
| Phone number | ✅ Yes | Publicly listed |
| Hours of operation | ✅ Yes | From Google Maps |
| Dance styles (general categories) | ✅ Yes | Inferred from brand/category, not copied |
| Website URL (link only) | ✅ Yes | Link to their own site |
| Original written description | ✅ Yes | Must be fully original, factual, 2–3 sentences |
| Generic/stock placeholder photo | ✅ Yes | Must be licensed stock or generic placeholder |
| Google Maps embed (address pin) | ✅ Yes | Via Maps Embed API, standard usage |
| Aggregate rating (from Google) | ✅ Yes | With attribution to Google |
| "Unclaimed listing" badge | ✅ Yes | Clearly distinguishes verified vs. unverified |
| "Last updated" date | ✅ Yes | Communicates data currency to users |
| Franchise logo | ❌ No | Not without written permission |
| Photos from studio website | ❌ No | Copyright violation |
| Copied studio description | ❌ No | Copyright violation |
| Instructor names/bios | ❌ No | Privacy risk + possible copyright |
| Pricing data (scraped) | ⚠️ Caution | May be out of date; include disclaimer |

---

## 8. Claim-Your-Listing Process (Legal Best Practice)

The claim process is the **strongest legal asset** for the directory. It demonstrates good faith, gives studios control, and transforms the site from an aggregator into a platform.

**Verification methods (any one of):**
- Phone call to the listed number
- Email to a domain-matched address
- Postcard/PIN mailed to the studio address

**Once claimed, the studio owner can:**
- Edit their description
- Add their own photos
- Update hours, add booking links
- Manage reviews
- **Request full removal** of their listing (honor within 5 business days)

---

## 9. DMCA & Takedown Compliance

- Register a **DMCA designated agent** with the U.S. Copyright Office ($6 filing fee) — required before launch
- Post DMCA agent contact info on the site (Terms of Service page or dedicated Copyright page)
- Remove specified content within **24–48 hours** of a valid takedown notice
- Maintain a removal request log with timestamps

**If a cease-and-desist letter arrives:**
1. Acknowledge receipt within 48 hours
2. Forward to attorney immediately
3. Do not respond substantively without legal counsel
4. Remove flagged content immediately as good faith gesture
5. Document everything

---

## 10. Legal Risk Summary (Post-Mitigation)

| Risk Category | Original Score | Residual Score (with mitigations) |
|---|---|---|
| CFAA / Unauthorized Access | 🟡 YELLOW (6) | 🟢 GREEN (1) — Eliminated |
| Copyright Infringement | 🟡 YELLOW (9) | 🟢 GREEN (2) — Low |
| Trademark Infringement | 🟠 ORANGE (12) | 🟢 GREEN (4) — Low |
| Terms of Service Breach | 🟠 ORANGE (12) | 🟢 GREEN (1) — Eliminated |
| Unfair Competition | 🟡 YELLOW (6) | 🟢 GREEN (2) — Low |
| Data Privacy (CCPA) | 🟢 GREEN (4) | 🟢 GREEN (1) — Eliminated |
| **Composite** | **🟠 ORANGE — High** | **🟢 GREEN — Low** |

---

*This document is prepared as a practical compliance reference. It does not constitute legal advice. All practices should be reviewed by qualified IP/technology legal counsel before implementation.*
