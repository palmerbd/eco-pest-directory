# NICHE SWAP GUIDE
> Every file and string that must change when cloning BDD for a new niche.
> Work through each section in order. Search-and-replace where noted.
> "BDD value" = what it says in the eco-friendly pest control codebase.
> "Your value" = what it should say in your new niche directory.

---

## GLOBAL SEARCH-AND-REPLACE (do these first)

Run these across the entire codebase before touching individual files.
Use VS Code "Replace in Files" or a script.

| Find | Replace with | Notes |
|---|---|---|
| `greenpestdirectory.com` | `[your-domain.com]` | All metadata, schema, canonical URLs |
| `www.greenpestdirectory.com` | `www.[your-domain.com]` | Canonical enforcement |
| `eco-pest-directory.vercel.app` | `[your-project].vercel.app` | Vercel URL in headers config |
| `Green Pest Control Directory` | `[Your Niche] Directory` | Site name in metadata, footer, nav |
| `eco-friendly pest control` | `[your niche]` | Lowercase body copy |
| `Eco-Friendly Pest Control` | `[Your Niche]` | Title case headings |
| `pest control company` | `[niche listing type]` | e.g. "yoga studio", "BJJ gym" |
| `Pest Control Company` | `[Niche Listing Type]` | Title case |
| `pest control companies` | `[niche listing types]` | Plural |
| `Pest Control Companies` | `[Niche Listing Types]` | Title case plural |
| `pest_company` | `[niche_slug]` | WP CPT slug — ALL occurrences |
| `ProfessionalService` | `[Schema.org type]` | schema.org type (see list below) |
| `178.156.197.177` | `[new Hetzner IP]` | WP API URL fallback |
| `178.156.197.177` | `[new Hetzner IP]` | Current WP server IP |

**schema.org types by niche:**
- Yoga / Pilates / Dance → `HealthAndBeautyBusiness` or `SportsActivityLocation`
- BJJ / Martial Arts → `SportsActivityLocation`
- Music lessons → `MusicSchool`
- Art studios → `ArtGallery` or `VisualArtsevent`
- Fitness / Personal training → `HealthClub`
- Tutoring / Education → `EducationalOrganization`
- (BDD uses `ProfessionalService`)

---

## FILE-BY-FILE CHANGES

### `next.config.ts`

1. Change `PROD_DOMAIN`:
   ```ts
   const PROD_DOMAIN = "www.[your-domain.com]";
   ```

2. Change `VERCEL_URL`:
   ```ts
   const VERCEL_URL = "[your-project].vercel.app";
   ```

3. **Delete all the redirects** in the `redirects()` array — those are BDD-specific slug fixes accumulated over months of Google indexing. Start with an empty array:
   ```ts
   async redirects() { return []; }
   ```
   You will add your own redirects as needed after launch.

4. Update Supabase storage hostname in `images.remotePatterns` to your new Supabase project ref.

---

### `app/layout.tsx`

```ts
export const metadata: Metadata = {
  metadataBase: new URL("https://www.[your-domain.com]"),
  title: {
    default: "[Niche] Directory — Find [Listing Types] Near You",
    template: "%s | [Your Niche] Directory",
  },
  description: "Find the best [listing type] near you. Browse [franchise chains if any] and independent [listing types] offering [specialties].",
  keywords: ["[keyword 1]", "[keyword 2]", "[keyword 3]"],
  openGraph: {
    type: "website",
    siteName: "[Your Niche] Directory",
  },
};
```

Font choice: BDD uses Playfair Display (elegant/serif) + Inter. For other niches:
- Fitness/Sports → `Montserrat` + `Inter`
- Music/Arts → `Merriweather` + `Inter`
- Modern/Tech → `DM Sans` + `Inter`
- Keep `Inter` as body font — change display font only

---

### `types/studio.ts`

This file defines the core data types. Rename it to `types/listing.ts` (optional) or edit in place.

**1. Rename the chain type** (or remove entirely if no franchise chains in your niche):
```ts
// BDD:
export type StudioChain = "fred_astaire" | "arthur_murray" | "dance_with_me" | "independent";

// New niche example (BJJ):
export type GymChain = "ufc_gym" | "gracie_barra" | "alliance_jiu_jitsu" | "independent";
// Or just: export type GymChain = "independent"; (if no major chains)
```

**2. Replace DanceStyle with your niche specialties:**
```ts
// BDD:
export type DanceStyle = "ballroom" | "latin" | "tango" | "salsa" | ... ;

// New niche example (yoga):
export type YogaStyle = "hatha" | "vinyasa" | "hot_yoga" | "yin" | "restorative" | "ashtanga" | "kundalini";
```

**3. Rename the main interfaces:**
```ts
// Rename Studio → Listing (or keep as Studio — it's internal)
// Rename StudioCard → ListingCard
// Rename StudioHours → Hours (optional)
```

**4. Update CHAIN_CONFIG** to match your franchise chains (or simplify to just `independent`):
```ts
export const CHAIN_CONFIG: Record<GymChain, { label: string; color: string; bg: string }> = {
  ufc_gym:         { label: "UFC Gym",         color: "#dc2626", bg: "#fee2e2" },
  gracie_barra:    { label: "Gracie Barra",    color: "#1e3a8a", bg: "#dbeafe" },
  alliance_jiu_jitsu: { label: "Alliance BJJ", color: "#065f46", bg: "#d1fae5" },
  independent:     { label: "Independent",     color: "#92400e", bg: "#fef3c7" },
};
```

**5. Update STYLE_LABELS** to match your niche specialties:
```ts
export const STYLE_LABELS: Record<YogaStyle, string> = {
  hatha:       "Hatha Yoga",
  vinyasa:     "Vinyasa",
  hot_yoga:    "Hot Yoga",
  yin:         "Yin Yoga",
  restorative: "Restorative",
  ashtanga:    "Ashtanga",
  kundalini:   "Kundalini",
};
```

**6. Update AMENITY_LABELS** for niche-relevant amenities:
```ts
// BJJ example:
export const AMENITY_LABELS: Record<string, string> = {
  parking:          "Free Parking",
  changing_rooms:   "Changing Rooms",
  showers:          "Showers",
  gi_rental:        "Gi Rental",
  kids_classes:     "Kids Classes",
  womens_only:      "Women's Only Classes",
  open_mat:         "Open Mat Sessions",
  competition_team: "Competition Team",
  wifi:             "Free WiFi",
};
```

**7. Remove niche-specific booleans** from the Studio interface:
```ts
// Remove from BDD that won't apply:
competitionTraining:    boolean;  // remove or rename
weddingDanceSpecialty:  boolean;  // remove
medalProgram:           boolean;  // remove

// Add niche-specific ones:
beginnerFriendly?:      boolean;
kidsClasses?:           boolean;
```

---

### `lib/wordpress.ts`

**1. Change the CPT endpoint:**
```ts
// BDD uses: /wp/v2/pest_company
// Yoga example: /wp/v2/yoga_studio
// BJJ example: /wp/v2/bjj_gym
// Search for "pest_company" and replace with your CPT slug
```

**2. Update detectChain() for your franchise chains:**
```ts
// BDD:
function detectChain(title: string): StudioChain {
  if (t.includes("fred astaire"))  return "fred_astaire";
  if (t.includes("arthur murray")) return "arthur_murray";
  if (t.includes("dance with me")) return "dance_with_me";
  return "independent";
}

// BJJ example:
function detectChain(title: string): GymChain {
  if (t.includes("gracie barra"))  return "gracie_barra";
  if (t.includes("ufc gym"))       return "ufc_gym";
  if (t.includes("alliance"))      return "alliance_jiu_jitsu";
  return "independent";
}
```

**3. Update STYLE_MAP** to match your ACF checkbox field values → your niche type:
```ts
// BDD maps WP ACF values → DanceStyle union
// Replace entirely with your niche's ACF checkbox values:
const STYLE_MAP: Record<string, YogaStyle> = {
  hatha:       "hatha",
  vinyasa:     "vinyasa",
  hot:         "hot_yoga",
  yin:         "yin",
  restorative: "restorative",
};
```

**4. Update mapWPPost()** — change the ACF field names to match your new ACF field group:
```ts
// Fields that stay the same (just mapping):
const city     = String(acf.studio_city   || "");
const state    = String(acf.studio_state  || "");
// etc.

// Fields to change for niche:
const styles = Array.isArray(acf.dance_styles)
  ? ...
// → change to:
const styles = Array.isArray(acf.[niche]_specialties)
  ? ...
```

---

### `app/studios/[slug]/page.tsx`

**Key copy changes:**
1. `"ProfessionalService"` → your schema.org type
2. `"Private dance lessons"` → `"[Your niche] sessions"` (in default description)
3. FAQ question templates — update to match niche terminology:
   - "What dance styles does X offer?" → "What [specialty] does X offer?"
   - "Does X teach beginners?" → keep, universally applicable
   - "Are lessons private or group?" → adapt to niche
4. `"wedding_dance"` specific FAQ block — remove entirely
5. `"Private Lessons"` label in pricing → match niche (e.g. "Sessions", "Classes")
6. `"America's premier resource for private dance instruction"` footer tagline → update

**Schema.org type:** Change `"@type": "ProfessionalService"` to your schema.org type.

---

### `app/studios/page.tsx` (Directory Index)

Update the metadata description and h1 copy:
```ts
description: "Browse [N]+ [listing types] across America. Filter by city, [specialty], and rating. [Franchise names if any] and elite independent [listing types] offering [specialty 1], [specialty 2], and [specialty 3].",
```

---

### `app/page.tsx` (Homepage)

The homepage hero, search form, and feature sections all reference "pest control companies", "ballroom", etc. Update all copy to match niche. Check for:
- Hero headline and subheading
- Search placeholder text
- Feature section bullets
- CTA text

---

### `components/SiteNav.tsx`

Update:
- Site name/logo text
- Navigation links (remove dance-specific style pages: `/ballroom-dance-lessons`, `/wedding-dance-lessons`, etc.)
- Replace with niche-relevant hub pages

---

### `components/LeadCaptureForm.tsx`

Copy changes only — the form logic is universal:
- `"Send a Message"` → keep or rename to `"Request Information"`
- `"Your message goes directly to the studio owner"` → update to niche owner type

---

### `app/dashboard/page.tsx`

Minor copy only:
- `"$49/mo promo rate"` — update if pricing differs
- Feature descriptions for the Featured tier upgrade CTA

---

### `app/api/crawl-emails/route.ts`

No changes needed — works for any niche website.

### `app/api/crawl-owners/route.ts`

Update the `tryStudioName()` regex — it currently looks for dance-related trigger words:
```ts
// BDD:
/^([A-Z][a-z'\-]{1,17}\s+[A-Z][a-z'\-]{1,17})(?:'s?)?\s+(?:dance|dancing|ballroom|studio|studios|school|academy|...)/i

// Update the trigger words for your niche:
// Yoga: yoga|studio|wellness|center|institute
// BJJ: gym|academy|martial|arts|jiu|jitsu|grappling
// Music: music|school|academy|studio|lessons|conservatory
```

---

### Niche-Specific Style Hub Pages

BDD has style-specific landing pages:
- `/ballroom-dance-lessons`
- `/wedding-dance-lessons`
- `/latin-dance-lessons`
- etc.

**Delete all of these** — they are dance-specific. Create new hub pages for your niche:
- Yoga: `/hot-yoga-studios`, `/yoga-near-me`, `/beginner-yoga`
- BJJ: `/bjj-gyms`, `/brazilian-jiu-jitsu-near-me`, `/bjj-for-beginners`

---

### `app/sitemap.ts`

Update the hardcoded routes list — remove dance style hub pages, add your niche hub pages.

---

### `app/robots.ts`

No changes needed unless you want to change the crawl rules.

---

## COLOR PALETTE SWAP

BDD colors (defined inline via Tailwind and style props):
- Dark navy: `#0c1428` / `#1a2d5a` (hero gradients)
- Gold accent: `#b8922a` / `#e8c560` (CTAs, highlights)
- Warm background: `#f8f7f4`

To change the palette, run a global find-and-replace across all `.tsx` and `.css` files:

| BDD color | Replace with |
|---|---|
| `#0c1428` | `[your dark 1]` |
| `#1a2d5a` | `[your dark 2]` |
| `#b8922a` | `[your accent dark]` |
| `#e8c560` | `[your accent light]` |
| `#fdf8f0` | `[your accent bg]` |
| `#f8f7f4` | `[your page bg]` |

**Suggested palettes by niche:**
- Yoga/Wellness: deep teal `#0d3330` / `#1a5e58` + sage green `#4a8c70` / `#89c4a8`
- BJJ/Martial Arts: charcoal `#1a1a2e` / `#16213e` + red `#c0392b` / `#e74c3c`
- Music: deep plum `#2d1b4e` / `#4a2d7a` + warm gold `#c9a227` / `#f5d060`
- Fitness: dark slate `#0f1923` / `#1c2b3a` + electric blue `#0066cc` / `#3399ff`

---

## QUICK SANITY CHECKLIST (after making all changes)

- [ ] `grep -r "ballroomdancedirectory" .` returns 0 results
- [ ] `grep -r "pest_company" . --include="*.ts" --include="*.tsx"` returns 0 results
- [ ] `grep -r "ProfessionalService" .` returns 0 results
- [ ] Homepage loads without errors (`npm run dev`)
- [ ] TypeScript compiles (`npm run build`) — check for type errors from renamed types
- [ ] `/studios` page renders listing cards
- [ ] Single listing page renders without crashing
- [ ] No "Green Pest Control Directory" text visible anywhere on the site
