"use client";

import React, { useState, useMemo, useCallback, useEffect } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  StudioCard,
  CHAIN_CONFIG,
  STYLE_LABELS,
  DANCE_STYLES,
  DanceStyle,
  StudioChain,
} from "@/types/studio";
import { getStudioPhotos, photoUrl } from "@/lib/studio-photos";

// ── Constants ─────────────────────────────────────────────────────────────────

const PAGE_SIZE = 24;

// ── Metro area expansion ──────────────────────────────────────────────────────
// Maps a major city name → all cities in that metro area.
// Allows "Dallas" to surface studios in Plano, Frisco, Irving, etc.
// Also covers state-level searches: "texas" or "tx" → state abbr match.

const METRO_CITIES: Record<string, string[]> = {
  // Texas
  "dallas": ["dallas","plano","irving","garland","carrollton","richardson","mesquite",
             "grand prairie","arlington","denton","frisco","mckinney","allen","lewisville",
             "flower mound","euless","bedford","hurst","grapevine","southlake","coppell",
             "addison","farmers branch","cedar hill","desoto","duncanville","mansfield",
             "rowlett","rockwall","forney","wylie","sachse","murphy","prosper","celina"],
  "fort worth": ["fort worth","arlington","mansfield","burleson","crowley","haltom city",
                 "north richland hills","watauga","keller","colleyville","euless","bedford",
                 "hurst","grapevine","southlake","benbrook","white settlement","lake worth"],
  "houston": ["houston","sugar land","pearland","pasadena","league city","baytown",
              "conroe","the woodlands","spring","katy","missouri city","friendswood",
              "stafford","galveston","friendswood","humble","deer park","la porte"],
  "san antonio": ["san antonio","new braunfels","schertz","cibolo","converse","universal city",
                  "live oak","selma","leon valley","helotes","boerne","pleasanton"],
  "austin": ["austin","round rock","cedar park","pflugerville","georgetown","kyle","buda",
             "san marcos","leander","hutto","manor","bastrop","lakeway","bee cave"],
  // Florida
  "miami": ["miami","miami beach","hialeah","coral gables","miami gardens","homestead",
            "doral","kendall","pembroke pines","miramar","hollywood","fort lauderdale",
            "boca raton","delray beach","pompano beach","north miami","opa locka"],
  "orlando": ["orlando","kissimmee","sanford","altamonte springs","oviedo","winter park",
              "apopka","clermont","st. cloud","celebration","lake buena vista","maitland",
              "casselberry","longwood","lake mary","deltona","daytona beach"],
  "tampa": ["tampa","st. petersburg","clearwater","largo","bradenton","sarasota","venice",
            "brandon","riverview","valrico","plant city","lakeland","dunedin","safety harbor",
            "new port richey","spring hill","wesley chapel","lutz","land o lakes"],
  // New York / New Jersey
  "new york": ["new york","brooklyn","queens","bronx","staten island","manhattan",
               "jersey city","newark","hoboken","yonkers","white plains","new rochelle",
               "mount vernon","stamford","bridgeport","long island city","flushing"],
  "long island": ["garden city","hempstead","mineola","valley stream","great neck",
                  "manhasset","port washington","roslyn","syosset","huntington","babylon",
                  "bay shore","commack","smithtown","hauppauge","central islip"],
  // California
  "los angeles": ["los angeles","santa monica","culver city","inglewood","hawthorne",
                  "torrance","gardena","compton","long beach","carson","lakewood",
                  "burbank","glendale","pasadena","monrovia","west hollywood","beverly hills",
                  "manhattan beach","hermosa beach","redondo beach","el segundo"],
  "san francisco": ["san francisco","oakland","berkeley","san jose","santa clara","sunnyvale",
                    "mountain view","palo alto","redwood city","san mateo","burlingame",
                    "daly city","south san francisco","fremont","hayward","milpitas",
                    "san rafael","marin","sausalito"],
  "san diego": ["san diego","chula vista","el cajon","santee","la mesa","national city",
                "escondido","oceanside","carlsbad","vista","san marcos","encinitas",
                "del mar","la jolla","coronado","imperial beach"],
  "sacramento": ["sacramento","elk grove","roseville","folsom","rocklin","lincoln",
                 "auburn","rancho cordova","citrus heights","natomas","davis","woodland"],
  // Illinois
  "chicago": ["chicago","evanston","skokie","oak park","cicero","berwyn","brookfield",
              "la grange","aurora","joliet","naperville","schaumburg","arlington heights",
              "palatine","des plaines","rosemont","lombard","glen ellyn","wheaton",
              "downers grove","oak lawn","orland park","tinley park","homewood"],
  // Georgia
  "atlanta": ["atlanta","marietta","sandy springs","roswell","alpharetta","johns creek",
              "dunwoody","brookhaven","smyrna","kennesaw","acworth","woodstock",
              "lawrenceville","duluth","norcross","decatur","tucker","stone mountain",
              "east point","college park","union city","newnan","mcdonough"],
  // Arizona
  "phoenix": ["phoenix","scottsdale","tempe","mesa","chandler","gilbert","glendale",
              "peoria","surprise","goodyear","avondale","buckeye","queen creek",
              "sun city","paradise valley","cave creek","fountain hills","ahwatukee"],
  // Colorado
  "denver": ["denver","aurora","lakewood","arvada","westminster","thornton","highlands ranch",
             "littleton","englewood","centennial","parker","castle rock","brighton",
             "boulder","longmont","broomfield","commerce city","federal heights"],
  // Washington
  "seattle": ["seattle","bellevue","redmond","kirkland","renton","kent","federal way",
              "auburn","tukwila","burien","des moines","seatac","lynnwood","edmonds",
              "bothell","woodinville","issaquah","sammamish","mercer island"],
  // Nevada
  "las vegas": ["las vegas","henderson","north las vegas","boulder city","pahrump",
                "summerlin","enterprise","spring valley","paradise","whitney"],
  // North Carolina
  "charlotte": ["charlotte","concord","gastonia","rock hill","huntersville","matthews",
                "mint hill","mooresville","cornelius","davidson","kannapolis","salisbury"],
  // Ohio
  "columbus": ["columbus","dublin","westerville","grove city","hilliard","upper arlington",
               "worthington","gahanna","reynoldsburg","pickerington","canal winchester"],
  "cleveland": ["cleveland","akron","lorain","elyria","parma","strongsville","lakewood",
                "euclid","mentor","willoughby","solon","beachwood","westlake","bay village"],
  // Michigan
  "detroit": ["detroit","warren","sterling heights","ann arbor","livonia","dearborn",
              "troy","novi","westland","canton","farmington hills","auburn hills",
              "pontiac","royal oak","southfield","birmingham","bloomfield hills"],
  // Pennsylvania
  "philadelphia": ["philadelphia","camden","wilmington","chester","norristown","king of prussia",
                   "ardmore","wayne","conshohocken","lansdale","doylestown","newtown",
                   "cherry hill","moorestown","mount laurel","marlton","voorhees"],
  // Minnesota
  "minneapolis": ["minneapolis","saint paul","bloomington","plymouth","maple grove","eden prairie",
                  "edina","burnsville","apple valley","eagan","coon rapids","brooklyn park",
                  "richfield","st. louis park","golden valley","fridley","roseville"],
  // Massachusetts
  "boston": ["boston","cambridge","somerville","quincy","brockton","newton","brookline",
             "waltham","watertown","worcester","framingham","natick","norwood","canton",
             "braintree","weymouth","randolph","malden","medford","arlington"],
  // Missouri
  "kansas city": ["kansas city","overland park","olathe","lee summit","independence",
                  "blue springs","lenexa","shawnee","leawood","liberty","raymore"],
  "st. louis": ["st. louis","saint louis","chesterfield","ballwin","florissant","hazelwood",
                "st. charles","st. peters","o'fallon","wentzville","kirkwood","clayton"],
  // Tennessee
  "nashville": ["nashville","murfreesboro","franklin","brentwood","hendersonville",
                "gallatin","smyrna","la vergne","nolensville","spring hill","columbia"],
  // Maryland / DC
  "washington": ["washington","washington dc","silver spring","bethesda","rockville",
                 "gaithersburg","germantown","arlington","alexandria","falls church",
                 "fairfax","reston","herndon","tysons","mclean","chantilly","manassas"],
  "baltimore": ["baltimore","towson","catonsville","dundalk","essex","parkville",
                "columbia","ellicott city","glen burnie","annapolis","bowie","laurel"],
  // Oregon
  "portland": ["portland","beaverton","hillsboro","gresham","lake oswego","tigard",
               "tualatin","sherwood","happy valley","clackamas","milwaukie","vancouver"],
};

// US state name → abbreviation (for "Texas" → "TX" style searches)
const STATE_NAMES: Record<string, string> = {
  "alabama":"AL","alaska":"AK","arizona":"AZ","arkansas":"AR","california":"CA",
  "colorado":"CO","connecticut":"CT","delaware":"DE","florida":"FL","georgia":"GA",
  "hawaii":"HI","idaho":"ID","illinois":"IL","indiana":"IN","iowa":"IA","kansas":"KS",
  "kentucky":"KY","louisiana":"LA","maine":"ME","maryland":"MD","massachusetts":"MA",
  "michigan":"MI","minnesota":"MN","mississippi":"MS","missouri":"MO","montana":"MT",
  "nebraska":"NE","nevada":"NV","new hampshire":"NH","new jersey":"NJ","new mexico":"NM",
  "new york":"NY","north carolina":"NC","north dakota":"ND","ohio":"OH","oklahoma":"OK",
  "oregon":"OR","pennsylvania":"PA","rhode island":"RI","south carolina":"SC",
  "south dakota":"SD","tennessee":"TN","texas":"TX","utah":"UT","vermont":"VT",
  "virginia":"VA","washington":"WA","west virginia":"WV","wisconsin":"WI","wyoming":"WY",
};

// Abbreviation → abbreviation identity map (so normalizeState("TX") works)
const STATE_ABBRS = new Set(Object.values(STATE_NAMES));

/**
 * Normalize any state string to an uppercase 2-letter abbreviation.
 * Handles full names ("Texas" → "TX"), abbreviations ("tx" → "TX"),
 * and mixed case ("New york" → "NY"). Returns "" if unrecognized.
 */
function normalizeState(s: string): string {
  if (!s) return "";
  const lower = s.toLowerCase().trim();
  if (STATE_NAMES[lower]) return STATE_NAMES[lower];
  const upper = s.toUpperCase().trim();
  if (upper.length === 2 && STATE_ABBRS.has(upper)) return upper;
  return "";
}

/**
 * Compare a studio's stored state value against a search abbreviation.
 * Handles WP storing states as full names ("Texas"), abbreviations ("TX"),
 * or any mixed case variant.
 */
function stateMatches(storedState: string, searchAbbr: string): boolean {
  if (!storedState || !searchAbbr) return false;
  // Try normalizing stored value first
  const normalized = normalizeState(storedState);
  if (normalized) return normalized === searchAbbr.toUpperCase();
  // Fallback: raw case-insensitive comparison
  return storedState.toUpperCase() === searchAbbr.toUpperCase();
}

/**
 * Expand a search query to a set of city names to match against.
 * Returns null when no metro/state expansion applies (use normal text search).
 */
function expandQuery(q: string): { cities: string[] | null; stateAbbr: string | null } {
  const lower = q.toLowerCase().trim();
  // Direct metro match
  if (METRO_CITIES[lower]) {
    return { cities: METRO_CITIES[lower], stateAbbr: null };
  }
  // State full name → abbreviation
  if (STATE_NAMES[lower]) {
    return { cities: null, stateAbbr: STATE_NAMES[lower] };
  }
  // State abbreviation directly (e.g. "TX", "FL")
  const upper = q.toUpperCase().trim();
  const allAbbrs = new Set(Object.values(STATE_NAMES));
  if (upper.length === 2 && allAbbrs.has(upper)) {
    return { cities: null, stateAbbr: upper };
  }
  return { cities: null, stateAbbr: null };
}

const SELECT_CLASS =
  "px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white text-gray-700 " +
  "focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent " +
  "cursor-pointer hover:border-gray-300 transition-colors";

// ── Star rating ───────────────────────────────────────────────────────────────

function Stars({ rating }: { rating: number }) {
  const full  = Math.floor(rating);
  const half  = rating % 1 >= 0.5;
  const empty = 5 - full - (half ? 1 : 0);
  return (
    <span className="flex items-center gap-0.5 text-sm" aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: full  }).map((_, i) => (
        <span key={`f${i}`} style={{ color: "#e8c560" }}>★</span>
      ))}
      {half && <span style={{ color: "#e8c560" }}>½</span>}
      {Array.from({ length: empty }).map((_, i) => (
        <span key={`e${i}`} className="text-gray-300">★</span>
      ))}
      <span className="ml-1 text-gray-500 text-xs">{rating.toFixed(1)}</span>
    </span>
  );
}

// ── Studio card ───────────────────────────────────────────────────────────────

function StudioListCard({ studio }: { studio: StudioCard }) {
  const chain  = CHAIN_CONFIG[studio.studioChain];
  const styles = studio.danceStyles.slice(0, 4);
  const photos = getStudioPhotos(studio.id, studio.danceStyles, studio.studioChain);
  const heroSrc = studio.featuredImage || photoUrl(photos.hero, 600, 240);

  return (
    <Link
      href={`/studios/${studio.slug}`}
      className="group block bg-white rounded-2xl border border-gray-200 hover:border-yellow-400
                 hover:shadow-xl transition-all duration-200 overflow-hidden"
    >
      {/* Card photo strip */}
      <div className="relative h-36 overflow-hidden bg-gradient-to-br from-[#0c1428] to-[#1a2d5a]">
        <Image
          src={heroSrc}
          alt={photos.hero.alt}
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          className="object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {/* Gradient overlay bottom */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        {/* Featured badge on image */}
        {studio.tier === "paid" && (
          <div className="absolute top-2 right-2 flex items-center gap-1 px-2 py-0.5 rounded-full
                          text-xs font-bold"
            style={{ background: "rgba(184,146,42,0.9)", color: "#fff" }}>
            ⭐ Featured
          </div>
        )}
      </div>

      <div className="p-6">
        <div className="flex items-center justify-between mb-3">
          <span
            className="inline-block px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide"
            style={{ color: chain.color, background: chain.bg }}
          >
            {chain.label}
          </span>
        </div>

        <h2 className="font-display font-bold text-gray-900 text-xl leading-snug mb-1
                       group-hover:text-yellow-800 transition-colors">
          {studio.title}
        </h2>

        {studio.tagline ? (
          <p className="text-sm text-gray-500 italic mb-3">{studio.tagline}</p>
        ) : studio.description ? (
          <p className="text-sm text-gray-500 mb-3 line-clamp-2">{studio.description}</p>
        ) : null}

        {studio.tier !== "free"
          ? studio.rating
            ? (
              <div className="flex items-center gap-2 mb-3">
                <Stars rating={studio.rating} />
                {studio.reviewCount ? (
                  <span className="text-xs text-gray-400">({studio.reviewCount.toLocaleString()} reviews)</span>
                ) : null}
              </div>
            ) : null
          : (
            <p className="text-xs text-amber-700/70 italic mb-3">
              Claim listing to show live rating
            </p>
          )
        }

        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-600 mb-4">
          {(studio.city || studio.state) && (
            <span className="flex items-center gap-1">
              <svg className="w-3.5 h-3.5 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {studio.city}{studio.city && studio.state ? ", " : ""}{studio.state}
            </span>
          )}
          {studio.phone && (
            <span className="flex items-center gap-1">
              <svg className="w-3.5 h-3.5 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.948V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 7V5z" />
              </svg>
              {studio.phone}
            </span>
          )}
          {studio.privateLessonRate && (
            <span className="flex items-center gap-1 font-medium" style={{ color: "#b8922a" }}>
              <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              From {studio.privateLessonRate}
            </span>
          )}
        </div>

        {styles.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {styles.map((style) => (
              <span key={style}
                className="px-2.5 py-0.5 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">
                {STYLE_LABELS[style as DanceStyle]}
              </span>
            ))}
            {studio.danceStyles.length > 4 && (
              <span className="px-2.5 py-0.5 bg-gray-100 text-gray-400 text-xs rounded-full">
                +{studio.danceStyles.length - 4} more
              </span>
            )}
          </div>
        )}
      </div>

      <div className="px-6 pb-5 pt-0">
        <span className="text-sm font-bold tracking-wide transition-colors" style={{ color: "#b8922a" }}>
          View Studio Details →
        </span>
      </div>
    </Link>
  );
}

// ── Server-pagination link builder ───────────────────────────────────────────

function PageLink({
  page,
  current,
  total,
  label,
  className,
}: {
  page: number;
  current: number;
  total: number;
  label: React.ReactNode;
  className?: string;
}) {
  const disabled = page < 1 || page > total || page === current;
  const href     = page === 1 ? "/studios" : `/studios?page=${page}`;
  const active   = page === current;

  if (disabled) {
    return (
      <span
        className={`${className ?? ""} opacity-40 cursor-not-allowed select-none`}
        aria-disabled="true"
      >
        {label}
      </span>
    );
  }
  return (
    <Link
      href={href}
      scroll={true}
      className={`${className ?? ""} ${active ? "border-yellow-400 text-yellow-800 bg-yellow-50" : ""}`}
      aria-current={active ? "page" : undefined}
    >
      {label}
    </Link>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────

export function StudioSearch({
  studios,
  currentPage,
  totalPages,
  totalStudios,
}: {
  studios: StudioCard[];
  currentPage: number;
  totalPages: number;
  totalStudios: number;
}) {
  const searchParams = useSearchParams();
  const router       = useRouter();
  const pathname     = usePathname();

  // ── Read initial state from URL params ────────────────────────────────────
  const [query,       setQuery]       = useState(() => searchParams.get("q")      ?? "");
  const [city,        setCity]        = useState(() => searchParams.get("city")   ?? "");
  const [stateSearch, setStateSearch] = useState(() => searchParams.get("state")  ?? "");
  const [style,       setStyle]       = useState(() => searchParams.get("style")  ?? "");
  const [chain,       setChain]       = useState(() => searchParams.get("chain")  ?? "");
  const [minRating,   setMinRating]   = useState(() => Number(searchParams.get("rating") ?? "0"));
  const [sortBy,      setSortBy]      = useState(() => searchParams.get("sort")   ?? "rating");
  const [page,        setPage]        = useState(() => Math.max(1, Number(searchParams.get("page") ?? "1")));

  const hasFilters = !!(query || city || stateSearch || style || chain || minRating);

  // ── Derive city list directly from live data ──────────────────────────────
  const cities = useMemo(() => {
    const seen = new Set<string>();
    studios.forEach((s) => { if (s.city) seen.add(s.city); });
    return Array.from(seen).sort();
  }, [studios]);

  // ── Sync state → URL ──────────────────────────────────────────────────────
  const updateURL = useCallback(
    (updates: Record<string, string | number>) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(updates).forEach(([k, v]) => {
        // Remove param when it equals the default value (keeps URLs clean)
        if (v === "" || v === 0 || (k === "sort" && v === "rating") || (k === "page" && v === 1)) {
          params.delete(k);
        } else {
          params.set(k, String(v));
        }
      });
      const qs = params.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [searchParams, router, pathname]
  );

  // ── Filter change handlers ────────────────────────────────────────────────
  function handleQuery(v: string)       { setQuery(v);       setPage(1); updateURL({ q: v,      page: 1 }); }
  function handleCity(v: string)        { setCity(v);        setPage(1); updateURL({ city: v,   page: 1 }); }
  function handleStateSearch(v: string) { setStateSearch(v); setPage(1); updateURL({ state: v,  page: 1 }); }
  function handleStyle(v: string)       { setStyle(v);       setPage(1); updateURL({ style: v,  page: 1 }); }
  function handleChain(v: string)       { setChain(v);       setPage(1); updateURL({ chain: v,  page: 1 }); }
  function handleRating(v: number)      { setMinRating(v);   setPage(1); updateURL({ rating: v, page: 1 }); }
  function handleSort(v: string)        { setSortBy(v);      setPage(1); updateURL({ sort: v,   page: 1 }); }
  function handlePage(v: number)        { setPage(v);                    updateURL({ page: v }); }

  function clearFilters() {
    setQuery(""); setCity(""); setStateSearch(""); setStyle(""); setChain(""); setMinRating(0); setPage(1);
    router.replace(pathname, { scroll: false });
  }

  // ── Filter + sort ─────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    let result = studios;

    if (query.trim()) {
      const q   = query.trim().toLowerCase();
      const exp = expandQuery(q);

      if (exp.stateAbbr) {
        // State search: "Texas" or "TX" → show all studios in that state.
        // stateMatches() handles WP storing full names OR abbreviations.
        const abbr = exp.stateAbbr.toUpperCase();
        result = result.filter((s) => stateMatches(s.state, abbr));
      } else if (exp.cities) {
        // Metro expansion: "Dallas" → DFW suburb set
        // Include studios whose city is in the metro, OR whose name/address contains the query
        const metroSet = new Set(exp.cities);
        result = result.filter((s) =>
          metroSet.has(s.city.toLowerCase()) ||
          s.title.toLowerCase().includes(q) ||
          (s.address || "").toLowerCase().includes(q)
        );
      } else {
        // Default text search: name, city (partial), address
        result = result.filter(
          (s) =>
            s.title.toLowerCase().includes(q) ||
            s.city.toLowerCase().includes(q) ||
            s.state.toLowerCase().includes(q) ||
            (s.address || "").toLowerCase().includes(q)
        );
      }
    }

    if (city)  result = result.filter((s) => s.city === city);

    // State filter: accepts abbreviation ("TX"), full name ("Texas"), or partial match.
    // Uses stateMatches() so it works whether WP stores "Texas" or "TX".
    if (stateSearch.trim()) {
      const searchAbbr = normalizeState(stateSearch.trim());
      if (searchAbbr) {
        // Recognized state — use bidirectional normalization
        result = result.filter((s) => stateMatches(s.state, searchAbbr));
      } else {
        // Unknown input: partial text match on stored value
        const sq = stateSearch.trim().toLowerCase();
        result = result.filter((s) =>
          s.state.toLowerCase().includes(sq) ||
          normalizeState(s.state).toLowerCase().includes(sq)
        );
      }
    }

    if (style)     result = result.filter((s) => s.danceStyles.includes(style as DanceStyle));
    if (chain)     result = result.filter((s) => s.studioChain === (chain as StudioChain));
    if (minRating) result = result.filter((s) => s.rating !== undefined && s.rating >= minRating);

    // Sort within each tier group, then float paid listings to top
    const sortFn = (a: StudioCard, b: StudioCard): number => {
      if (sortBy === "rating")  return (b.rating ?? 0) - (a.rating ?? 0);
      if (sortBy === "reviews") return (b.reviewCount ?? 0) - (a.reviewCount ?? 0);
      if (sortBy === "name")    return a.title.localeCompare(b.title);
      return 0;
    };

    const paid = result.filter((s) => s.tier === "paid").sort(sortFn);
    const rest = result.filter((s) => s.tier !== "paid").sort(sortFn);

    return [...paid, ...rest];
  }, [studios, query, city, stateSearch, style, chain, minRating, sortBy]);

  // ── Pagination ────────────────────────────────────────────────────────────
  // When filters are active: client-side pagination over filtered subset.
  // When browsing unfiltered: server-side pagination via ?page=N links.
  const clientTotalPages  = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage          = Math.min(page, clientTotalPages);
  const pageStudios       = hasFilters
    ? filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)
    : filtered; // server already gave us 48 studios for the current page

  // Auto-correct page if filters shrink results below current page
  useEffect(() => {
    if (page > clientTotalPages && clientTotalPages > 0) {
      setPage(1);
      updateURL({ page: 1 });
    }
  }, [page, clientTotalPages, updateURL]);

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <>
      {/* ── Sticky filter bar ─────────────────────────────────────────────── */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-20 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 space-y-3">

          {/* Search input */}
          <div className="relative">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"
              fill="none" stroke="currentColor" viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={query}
              onChange={(e) => handleQuery(e.target.value)}
              placeholder="Search studios by name or city…"
              className="w-full pl-10 pr-10 py-2.5 border border-gray-200 rounded-xl text-sm
                         focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
            />
            {query && (
              <button
                onClick={() => handleQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                aria-label="Clear search"
              >
                ✕
              </button>
            )}
          </div>

          {/* Filter dropdowns */}
          <div className="flex flex-wrap gap-2 items-center">

            {/* City — auto-populated from live data */}
            <select value={city} onChange={(e) => handleCity(e.target.value)} className={SELECT_CLASS}>
              <option value="">All Cities</option>
              {cities.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>

            {/* State — free-text, accepts abbreviation or full name */}
            <div className="relative">
              <input
                type="text"
                value={stateSearch}
                onChange={(e) => handleStateSearch(e.target.value)}
                placeholder="State (e.g. TX)"
                className="px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white text-gray-700
                           focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent
                           hover:border-gray-300 transition-colors w-36 pr-7"
              />
              {stateSearch && (
                <button
                  onClick={() => handleStateSearch("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs"
                  aria-label="Clear state"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Dance style */}
            <select value={style} onChange={(e) => handleStyle(e.target.value)} className={SELECT_CLASS}>
              <option value="">All Styles</option>
              {DANCE_STYLES.map((s) => (
                <option key={s} value={s}>{STYLE_LABELS[s]}</option>
              ))}
            </select>

            {/* Chain / Studio type */}
            <select value={chain} onChange={(e) => handleChain(e.target.value)} className={SELECT_CLASS}>
              <option value="">All Types</option>
              {(Object.entries(CHAIN_CONFIG) as [StudioChain, { label: string }][]).map(([k, v]) => (
                <option key={k} value={k}>{v.label}</option>
              ))}
            </select>

            {/* Min rating */}
            <select
              value={minRating}
              onChange={(e) => handleRating(Number(e.target.value))}
              className={SELECT_CLASS}
            >
              <option value={0}>Any Rating</option>
              <option value={4}>4☁ &amp; up</option>
              <option value={4.5}>4.5★ &amp; up</option>
            </select>

            {/* Sort */}
            <select value={sortBy} onChange={(e) => handleSort(e.target.value)} className={SELECT_CLASS}>
              <option value="rating">Top Rated</option>
              <option value="reviews">Most Reviewed</option>
              <option value="name">A → Z</option>
            </select>

            {/* Clear button */}
            {hasFilters && (
              <button
                onClick={clearFilters}
                className="px-3 py-2 text-sm font-medium text-gray-500 hover:text-gray-900
                           border border-gray-200 rounded-lg hover:border-gray-300 transition-colors bg-white"
              >
                ✕ Clear filters
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── Results ───────────────────────────────────────────────────────── */}
      <section className="py-10 px-4 sm:px-6" style={{ background: "#f9f6f0" }}>
        <div className="max-w-6xl mx-auto">

          {/* Count + active filter chips */}
          <div className="flex flex-wrap items-center gap-3 mb-6">
            <p className="text-sm text-gray-500">
              {hasFilters ? (
                <>
                  <span className="font-semibold text-gray-800">{filtered.length}</span>{" "}
                  studio{filtered.length !== 1 ? "s" : ""} match your filters
                  {clientTotalPages > 1 && (
                    <span className="text-gray-400"> — page {safePage} of {clientTotalPages}</span>
                  )}
                </>
              ) : (
                <>
                  <span className="font-semibold text-gray-800">
                    {((currentPage - 1) * 48 + 1).toLocaleString()}–
                    {Math.min(currentPage * 48, totalStudios).toLocaleString()}
                  </span>{" "}
                  of{" "}
                  <span className="font-semibold text-gray-800">{totalStudios.toLocaleString()}</span>{" "}
                  studios — page {currentPage} of {totalPages}
                </>
              )}
            </p>

            {city && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-yellow-50 border border-yellow-200
                               text-yellow-800 text-xs font-medium rounded-full">
                {city}
                <button onClick={() => handleCity("")} className="ml-0.5 hover:text-yellow-600">✕</button>
              </span>
            )}
            {stateSearch && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-yellow-50 border border-yellow-200
                               text-yellow-800 text-xs font-medium rounded-full">
                State: {stateSearch.toUpperCase()}
                <button onClick={() => handleStateSearch("")} className="ml-0.5 hover:text-yellow-600">✕</button>
              </span>
            )}
            {style && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-yellow-50 border border-yellow-200
                               text-yellow-800 text-xs font-medium rounded-full">
                {STYLE_LABELS[style as DanceStyle]}
                <button onClick={() => handleStyle("")} className="ml-0.5 hover:text-yellow-600">✕</button>
              </span>
            )}
            {chain && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-yellow-50 border border-yellow-200
                               text-yellow-800 text-xs font-medium rounded-full">
                {CHAIN_CONFIG[chain as StudioChain]?.label}
                <button onClick={() => handleChain("")} className="ml-0.5 hover:text-yellow-600">✕</button>
              </span>
            )}
            {minRating > 0 && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-yellow-50 border border-yellow-200
                               text-yellow-800 text-xs font-medium rounded-full">
                {minRating}☁ &amp; up
                <button onClick={() => handleRating(0)} className="ml-0.5 hover:text-yellow-600">✕</button>
              </span>
            )}
          </div>

          {/* Grid or empty state */}
          {filtered.length === 0 ? (
            <div className="text-center py-24">
              <div className="text-5xl mb-4">🕺</div>
              <p className="text-gray-500 text-lg mb-2">No studios match your filters.</p>
              <p className="text-gray-400 text-sm mb-6">Try removing a filter or broadening your search.</p>
              <button
                onClick={clearFilters}
                className="px-6 py-2.5 rounded-lg font-bold text-gray-900 hover:brightness-110 transition-all"
                style={{ background: "linear-gradient(135deg, #b8922a, #e8c560)" }}
              >
                Clear All Filters
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {pageStudios.map((studio) => (
                  <StudioListCard key={studio.id} studio={studio} />
                ))}
              </div>

              {/* ── Pagination ─────────────────────────────────────────── */}
              {hasFilters ? (
                /* Client-side pagination — used only when filters are active */
                clientTotalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-12 flex-wrap">
                    <button
                      onClick={() => { handlePage(safePage - 1); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                      disabled={safePage === 1}
                      className="px-4 py-2 text-sm font-medium rounded-lg border border-gray-200 bg-white
                                 text-gray-700 hover:border-gray-300 disabled:opacity-40 disabled:cursor-not-allowed
                                 transition-colors"
                    >
                      ← Prev
                    </button>

                    {Array.from({ length: clientTotalPages }, (_, i) => i + 1)
                      .filter((p) => p === 1 || p === clientTotalPages || Math.abs(p - safePage) <= 2)
                      .reduce<(number | "…")[]>((acc, p, idx, arr) => {
                        if (idx > 0 && (p as number) - (arr[idx - 1] as number) > 1) acc.push("…");
                        acc.push(p);
                        return acc;
                      }, [])
                      .map((item, idx) =>
                        item === "…" ? (
                          <span key={`ellipsis-${idx}`} className="px-2 text-gray-400 select-none">…</span>
                        ) : (
                          <button
                            key={item}
                            onClick={() => { handlePage(item as number); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                            className={`w-10 py-2 text-sm font-medium rounded-lg border transition-colors
                              ${safePage === item
                                ? "border-yellow-400 text-yellow-800 bg-yellow-50"
                                : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
                              }`}
                          >
                            {item}
                          </button>
                        )
                      )}

                    <button
                      onClick={() => { handlePage(safePage + 1); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                      disabled={safePage === clientTotalPages}
                      className="px-4 py-2 text-sm font-medium rounded-lg border border-gray-200 bg-white
                                 text-gray-700 hover:border-gray-300 disabled:opacity-40 disabled:cursor-not-allowed
                                 transition-colors"
                    >
                      Next →
                    </button>
                  </div>
                )
              ) : (
                /* Server-side pagination — used when browsing without filters */
                totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-12 flex-wrap">
                    <PageLink
                      page={currentPage - 1}
                      current={currentPage}
                      total={totalPages}
                      label="← Prev"
                      className="px-4 py-2 text-sm font-medium rounded-lg border border-gray-200 bg-white
                                 text-gray-700 hover:border-gray-300 transition-colors"
                    />

                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                      .filter((p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 2)
                      .reduce<(number | "…")[]>((acc, p, idx, arr) => {
                        if (idx > 0 && (p as number) - (arr[idx - 1] as number) > 1) acc.push("…");
                        acc.push(p);
                        return acc;
                      }, [])
                      .map((item, idx) =>
                        item === "…" ? (
                          <span key={`ellipsis-${idx}`} className="px-2 text-gray-400 select-none">…</span>
                        ) : (
                          <PageLink
                            key={item}
                            page={item as number}
                            current={currentPage}
                            total={totalPages}
                            label={item}
                            className="w-10 py-2 text-sm font-medium rounded-lg border border-gray-200 bg-white
                                       text-gray-700 hover:border-gray-300 transition-colors text-center"
                          />
                        )
                      )}

                    <PageLink
                      page={currentPage + 1}
                      current={currentPage}
                      total={totalPages}
                      label="Next →"
                      className="px-4 py-2 text-sm font-medium rounded-lg border border-gray-200 bg-white
                                 text-gray-700 hover:border-gray-300 transition-colors"
                    />
                  </div>
                )
              )}
            </>
          )}
        </div>
      </section>
    </>
  );
}
