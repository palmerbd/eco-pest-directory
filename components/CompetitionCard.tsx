import Link from "next/link";
import Image from "next/image";
import {
  Competition,
  COMP_STYLE_LABELS,
  COMP_ORG_LABELS,
  COMP_LEVEL_LABELS,
  MONTHS,
} from "@/types/competition";

// ── Style → hero image map ────────────────────────────────────────────────────

const STYLE_IMAGE: Record<string, string> = {
  standard: "/images/ballroom.png",
  latin:    "/images/latin.png",
  smooth:   "/images/ballroom.png",
  rhythm:   "/images/latin.png",
  swing:    "/images/swing.png",
  country:  "/images/ballroom.png",
  multi:    "/images/competition.png",
};

function heroImage(comp: Competition): string {
  const primary = comp.styles[0];
  return (primary && STYLE_IMAGE[primary]) || "/images/competition.png";
}

// ── Org badge colours ─────────────────────────────────────────────────────────

const ORG_BADGE: Record<string, { color: string; bg: string }> = {
  "NDCA":        { color: "#7c2d12", bg: "#fef2f2" },
  "USA Dance":   { color: "#1e3a5f", bg: "#eff6ff" },
  "WDSF":        { color: "#14532d", bg: "#f0fdf4" },
  "Independent": { color: "#4b5563", bg: "#f3f4f6" },
};

// ── Date helpers ──────────────────────────────────────────────────────────────

function formatDateRange(comp: Competition): string {
  if (!comp.dateStart) {
    return `Typically ${MONTHS[comp.typicalMonth - 1]}`;
  }
  const start = new Date(comp.dateStart + "T12:00:00");
  const opts: Intl.DateTimeFormatOptions = { month: "short", day: "numeric", year: "numeric" };
  if (!comp.dateEnd || comp.dateEnd === comp.dateStart) {
    return start.toLocaleDateString("en-US", opts);
  }
  const end = new Date(comp.dateEnd + "T12:00:00");
  // Same month → "Jul 10–13, 2025"
  if (start.getMonth() === end.getMonth() && start.getFullYear() === end.getFullYear()) {
    return `${start.toLocaleDateString("en-US", { month: "short", day: "numeric" })}–${end.getDate()}, ${end.getFullYear()}`;
  }
  return `${start.toLocaleDateString("en-US", { month: "short", day: "numeric" })} – ${end.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`;
}

function isUpcoming(comp: Competition): boolean {
  if (!comp.dateStart) return false;
  return new Date(comp.dateStart + "T12:00:00") >= new Date();
}

// ── Component ─────────────────────────────────────────────────────────────────

export function CompetitionCard({ comp }: { comp: Competition }) {
  const badge   = ORG_BADGE[comp.organization] ?? ORG_BADGE["Independent"];
  const src     = heroImage(comp);
  const upcoming = isUpcoming(comp);

  return (
    <Link
      href={`/competitions/${comp.slug}`}
      className="group block bg-white rounded-2xl border border-gray-200 hover:border-yellow-400
                 hover:shadow-xl transition-all duration-200 overflow-hidden"
    >
      {/* Hero image strip */}
      <div className="relative h-36 overflow-hidden bg-gradient-to-br from-[#0c1428] to-[#1a2d5a]">
        <Image
          src={src}
          alt={`${comp.name} ballroom dance competition`}
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          className="object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />

        {/* Date pill — bottom left */}
        <div className="absolute bottom-2 left-3 flex items-center gap-1.5 px-2.5 py-1
                        rounded-full text-xs font-semibold text-white"
          style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)" }}>
          <svg className="w-3 h-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          {formatDateRange(comp)}
        </div>

        {/* Featured badge */}
        {comp.tier === "paid" && (
          <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full text-xs font-bold"
            style={{ background: "rgba(184,146,42,0.92)", color: "#fff" }}>
            ⭐ Featured
          </div>
        )}

        {/* Upcoming pill */}
        {upcoming && comp.tier !== "paid" && (
          <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full text-xs font-semibold"
            style={{ background: "rgba(21,128,61,0.85)", color: "#fff" }}>
            Upcoming
          </div>
        )}
      </div>

      {/* Card body */}
      <div className="p-5">
        {/* Org badge */}
        <div className="flex items-center justify-between mb-2">
          <span
            className="inline-block px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide"
            style={{ color: badge.color, background: badge.bg }}
          >
            {COMP_ORG_LABELS[comp.organization]}
          </span>
          {comp.isRecurring && (
            <span className="text-xs text-gray-400 italic">Annual</span>
          )}
        </div>

        {/* Name */}
        <h2 className="font-display font-bold text-gray-900 text-lg leading-snug mb-1
                       group-hover:text-yellow-800 transition-colors line-clamp-2">
          {comp.name}
        </h2>

        {/* Location */}
        <p className="flex items-center gap-1 text-sm text-gray-500 mb-3">
          <svg className="w-3.5 h-3.5 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          {comp.city}, {comp.state}
        </p>

        {/* Description */}
        <p className="text-sm text-gray-500 mb-4 line-clamp-2">{comp.description}</p>

        {/* Styles */}
        {comp.styles.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {comp.styles.slice(0, 4).map((s) => (
              <span key={s}
                className="px-2.5 py-0.5 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">
                {COMP_STYLE_LABELS[s]}
              </span>
            ))}
            {comp.styles.length > 4 && (
              <span className="px-2.5 py-0.5 bg-gray-100 text-gray-400 text-xs rounded-full">
                +{comp.styles.length - 4}
              </span>
            )}
          </div>
        )}

        {/* Levels */}
        <div className="flex flex-wrap gap-1.5">
          {comp.levels.map((l) => (
            <span key={l}
              className="px-2.5 py-0.5 text-xs font-medium rounded-full border"
              style={{ color: "#b8922a", borderColor: "#e8c560", background: "#fffbeb" }}>
              {COMP_LEVEL_LABELS[l]}
            </span>
          ))}
        </div>
      </div>

      <div className="px-5 pb-5 pt-0">
        <span className="text-sm font-bold tracking-wide transition-colors" style={{ color: "#b8922a" }}>
          View Competition Details →
        </span>
      </div>
    </Link>
  );
}
