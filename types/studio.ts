// ─── Green Pest Control Directory — Data Types ────────────────────────────────

export type CompanyChain =
  | "orkin"
  | "terminix"
  | "truly_nolen"
  | "aptive"
  | "abc_home"
  | "hometeam"
  | "massey"
  | "turner"
  | "ecoshield"
  | "independent";

export type ServiceType =
  | "general_pest"
  | "termite"
  | "rodent"
  | "bed_bug"
  | "mosquito"
  | "wildlife"
  | "cockroach"
  | "ant"
  | "fumigation"
  | "commercial"
  | "organic"
  | "lawn_pest";

export type EcoService =
  | "organic_treatments"
  | "ipm"
  | "botanical_products"
  | "pet_safe"
  | "child_safe"
  | "low_toxicity"
  | "essential_oil"
  | "reduced_risk"
  | "green_certified"
  | "eco_friendly_general";

export type EcoTier = "tier_1" | "tier_2" | "unclassified";

export type ListingTier = "free" | "claimed" | "paid";

// Keep these aliases so existing imports don't break during transition
export type StudioChain = CompanyChain;
export type DanceStyle = ServiceType;

export interface StudioHours {
  monday?:    string;
  tuesday?:   string;
  wednesday?: string;
  thursday?:  string;
  friday?:    string;
  saturday?:  string;
  sunday?:    string;
}

export interface Studio {
  id:                     number;
  slug:                   string;
  title:                  string;
  description:            string;
  phone:                  string;
  address:                string;
  city:                   string;
  state:                  string;
  zip:                    string;
  website?:               string;
  email?:                 string;
  hours?:                 StudioHours;
  studioChain:            CompanyChain;
  danceStyles:            ServiceType[];      // kept as danceStyles for backward compat
  serviceSpecialties?:    ServiceType[];      // new canonical name
  rating?:                number;
  reviewCount?:           number;
  tagline?:               string;
  foundedYear?:           number;
  yelpUrl?:               string;
  googleMapsUrl?:         string;
  facebookUrl?:           string;
  instagramUrl?:          string;
  amenities?:             string[];
  // Eco classification fields
  ecoTier?:               EcoTier;
  ecoServices?:           EcoService[];
  ecoVerified?:           boolean;
  ecoSource?:             string;
  // Pest control specific
  freeInspection?:        boolean;
  emergencyService?:      boolean;
  ecoFriendly?:           boolean;
  commercialService?:     boolean;
  residentialService?:    boolean;
  licensedBonded?:        boolean;
  satisfactionGuarantee?: boolean;
  serviceStartingPrice?:  string;
  // Listing
  featuredImage?:         string;
  claimed:                boolean;
  tier:                   ListingTier;
  cityState:              string;
}

export interface StudioCard {
  id:                number;
  slug:              string;
  title:             string;
  city:              string;
  state:             string;
  cityState:         string;
  studioChain:       CompanyChain;
  danceStyles:       ServiceType[];
  serviceSpecialties?: ServiceType[];
  ecoTier?:          EcoTier;
  ecoServices?:      EcoService[];
  featuredImage?:    string;
  tier:              ListingTier;
  description:       string;
  rating?:           number;
  reviewCount?:      number;
  tagline?:          string;
  phone?:            string;
  address?:          string;
  serviceStartingPrice?: string;
}

// ─── Search / Filter Types ────────────────────────────────────────────────────

export interface SearchParams {
  city?:     string;
  service?:  ServiceType;
  ecoTier?:  EcoTier;
}

// ─── Chain Display Config ─────────────────────────────────────────────────────

export const CHAIN_CONFIG: Record<CompanyChain, { label: string; color: string; bg: string }> = {
  orkin:        { label: "Orkin",                   color: "#c0392b", bg: "#fce4e4" },
  terminix:     { label: "Terminix",                color: "#1a5276", bg: "#d4e6f1" },
  truly_nolen:  { label: "Truly Nolen",             color: "#d4ac0d", bg: "#fef9e7" },
  aptive:       { label: "Aptive Environmental",    color: "#1e8449", bg: "#d5f5e3" },
  abc_home:     { label: "ABC Home & Commercial",   color: "#2e4053", bg: "#d5d8dc" },
  hometeam:     { label: "HomeTeam Pest Defense",   color: "#7d3c98", bg: "#ebdef0" },
  massey:       { label: "Massey Services",         color: "#0e6655", bg: "#d0ece7" },
  turner:       { label: "Turner Pest Control",     color: "#784212", bg: "#fdebd0" },
  ecoshield:    { label: "EcoShield Pest Solutions", color: "#27ae60", bg: "#d5f5e3" },
  independent:  { label: "Independent",             color: "#566573", bg: "#eaecee" },
};

export const SERVICE_LABELS: Record<ServiceType, string> = {
  general_pest: "General Pest Control",
  termite:      "Termite Control",
  rodent:       "Rodent Control",
  bed_bug:      "Bed Bug Treatment",
  mosquito:     "Mosquito Control",
  wildlife:     "Wildlife Removal",
  cockroach:    "Cockroach Control",
  ant:          "Ant Control",
  fumigation:   "Fumigation",
  commercial:   "Commercial Pest Control",
  organic:      "Organic/Green Pest Control",
  lawn_pest:    "Lawn & Ornamental Pest Control",
};

// Backward compat alias
export const STYLE_LABELS = SERVICE_LABELS;

export const ECO_SERVICE_LABELS: Record<EcoService, string> = {
  organic_treatments:   "Organic Treatments",
  ipm:                  "Integrated Pest Management (IPM)",
  botanical_products:   "Botanical/Plant-Based Products",
  pet_safe:             "Pet-Safe Treatments",
  child_safe:           "Child-Safe Treatments",
  low_toxicity:         "Low-Toxicity Solutions",
  essential_oil:        "Essential Oil Treatments",
  reduced_risk:         "EPA Reduced-Risk Products",
  green_certified:      "Green Certified",
  eco_friendly_general: "Eco-Friendly Options",
};

export const SERVICE_TYPES: ServiceType[] = [
  "general_pest", "termite", "rodent", "bed_bug", "mosquito",
  "wildlife", "cockroach", "ant", "fumigation", "commercial",
  "organic", "lawn_pest",
];

// Backward compat alias
export const DANCE_STYLES = SERVICE_TYPES;

export const AMENITY_LABELS: Record<string, string> = {
  free_inspections:       "Free Inspections",
  same_day_service:       "Same-Day Service",
  emergency_service:      "Emergency/24-7 Service",
  eco_friendly:           "Eco-Friendly Products",
  pet_safe:               "Pet-Safe Treatments",
  child_safe:             "Child-Safe Treatments",
  ipm_approach:           "Integrated Pest Management",
  organic_products:       "Organic Products",
  satisfaction_guarantee: "Satisfaction Guarantee",
  free_estimates:         "Free Estimates",
  recurring_plans:        "Recurring Service Plans",
  commercial_service:     "Commercial Services",
  residential_service:    "Residential Services",
  licensed_bonded:        "Licensed & Bonded",
  military_discount:      "Military/Senior Discount",
  online_booking:         "Online Booking",
};

// Chain detection from company name
export function detectChain(title: string): CompanyChain {
  const t = title.toLowerCase();
  if (t.includes("orkin"))       return "orkin";
  if (t.includes("terminix"))    return "terminix";
  if (t.includes("truly nolen")) return "truly_nolen";
  if (t.includes("aptive"))      return "aptive";
  if (t.includes("abc home"))    return "abc_home";
  if (t.includes("hometeam"))    return "hometeam";
  if (t.includes("massey"))      return "massey";
  if (t.includes("turner pest")) return "turner";
  if (t.includes("ecoshield"))   return "ecoshield";
  return "independent";
}
