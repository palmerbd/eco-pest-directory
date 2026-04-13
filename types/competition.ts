// ─── Competition Data Types ────────────────────────────────────────────────────

export type CompStyle =
  | "standard"
  | "latin"
  | "smooth"
  | "rhythm"
  | "swing"
  | "country"
  | "multi";

export type CompLevel =
  | "professional"
  | "amateur"
  | "pro_am";

export type CompOrg = "NDCA" | "USA Dance" | "WDSF" | "Independent";

export type CompRegion =
  | "northeast"
  | "southeast"
  | "midwest"
  | "southwest"
  | "west"
  | "mountain";

export type CompTier = "free" | "claimed" | "paid";

// ── Display labels ─────────────────────────────────────────────────────────────

export const COMP_STYLE_LABELS: Record<CompStyle, string> = {
  standard: "International Standard",
  latin:    "International Latin",
  smooth:   "American Smooth",
  rhythm:   "American Rhythm",
  swing:    "Swing",
  country:  "Country Western",
  multi:    "Multi-Dance",
};

export const COMP_LEVEL_LABELS: Record<CompLevel, string> = {
  professional: "Professional",
  amateur:      "Amateur",
  pro_am:       "Pro/Am",
};

export const COMP_ORG_LABELS: Record<CompOrg, string> = {
  "NDCA":        "NDCA",
  "USA Dance":   "USA Dance",
  "WDSF":        "WDSF",
  "Independent": "Independent",
};

export const COMP_REGION_LABELS: Record<CompRegion, string> = {
  northeast: "Northeast",
  southeast: "Southeast",
  midwest:   "Midwest",
  southwest: "Southwest",
  west:      "West Coast",
  mountain:  "Mountain",
};

// Month names helper
export const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];

// ── Core interface ─────────────────────────────────────────────────────────────

export interface Competition {
  /** URL slug — e.g. "ohio-star-ball" */
  slug:                 string;
  /** Full competition name */
  name:                 string;
  /** ISO date string or null when exact dates are TBA */
  dateStart:            string | null;
  dateEnd:              string | null;
  /** Typical month (1–12) — displayed when dateStart is null */
  typicalMonth:         number;
  /** Venue / hotel name */
  venue:                string;
  city:                 string;
  state:                string;
  stateAbbr:            string;
  /** City slug matching studio city pages (e.g. "los-angeles") */
  citySlug:             string;
  region:               CompRegion;
  organization:         CompOrg;
  /** Dance styles offered at this competition */
  styles:               CompStyle[];
  /** Competitor levels offered (Pro, Amateur, Pro/Am) */
  levels:               CompLevel[];
  /** 2–3 sentence description */
  description:          string;
  website:              string;
  registrationUrl?:     string;
  registrationDeadline: string | null;
  /** Approximate per-dance entry fee range */
  entryFeeMin?:         number;
  entryFeeMax?:         number;
  /** True = appears in featured row on /competitions home */
  isFeatured:           boolean;
  isRecurring:          boolean;
  /** Listing tier — drives Featured badge / city page advertising */
  tier:                 CompTier;
}
