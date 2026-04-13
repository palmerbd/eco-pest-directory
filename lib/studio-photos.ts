// ─── Studio Photo System ──────────────────────────────────────────────────────
// Custom photos live in /public/images/ and are served as static Next.js assets.
// The localSrc field takes priority over the Unsplash CDN fallback.
// Unsplash fallbacks are retained in case a local file is ever removed.

import type { DanceStyle, StudioChain } from "@/types/studio";

export interface UnsplashPhoto {
  id:          string;
  alt:         string;
  authorName:  string;
  authorUrl:   string;
  /** If set, this local /public path is used instead of the Unsplash CDN */
  localSrc?:   string;
}

export interface StudioPhotoSet {
  hero:   UnsplashPhoto;
  left:   UnsplashPhoto;
  right:  UnsplashPhoto;
}

// ─── Local photo helpers ──────────────────────────────────────────────────────

function local(src: string, alt: string): UnsplashPhoto {
  return { id: "", alt, authorName: "", authorUrl: "", localSrc: src };
}

/**
 * Returns the best URL for a photo — prefers a local /public asset if
 * `localSrc` is set, otherwise falls back to the Unsplash CDN.
 */
export function photoUrl(
  photo:  UnsplashPhoto,
  width  = 800,
  height = 500,
): string {
  if (photo.localSrc) return photo.localSrc;
  return unsplashUrl(photo.id, width, height);
}

export function unsplashUrl(photoId: string, width = 800, height = 500): string {
  return `https://images.unsplash.com/photo-${photoId}?auto=format&fit=crop&w=${width}&h=${height}&q=80`;
}

// ─── Photo pools (4 slots each — rotated by studio ID) ───────────────────────

const BALLROOM_PHOTOS: UnsplashPhoto[] = [
  local("/images/ballroom.png", "Elegant couple performing a ballroom dance"),
  local("/images/ballroom.png", "Elegant couple performing a ballroom dance"),
  local("/images/ballroom.png", "Elegant couple performing a ballroom dance"),
  local("/images/ballroom.png", "Elegant couple performing a ballroom dance"),
];

const WALTZ_PHOTOS: UnsplashPhoto[] = [
  local("/images/waltz.png", "Graceful waltz couple in flowing motion"),
  local("/images/waltz.png", "Graceful waltz couple in flowing motion"),
  local("/images/waltz.png", "Graceful waltz couple in flowing motion"),
  local("/images/waltz.png", "Graceful waltz couple in flowing motion"),
];

const LATIN_PHOTOS: UnsplashPhoto[] = [
  local("/images/latin.png", "Latin dance couple in elegant performance"),
  local("/images/latin.png", "Latin dance couple in elegant performance"),
  local("/images/latin.png", "Latin dance couple in elegant performance"),
  local("/images/latin.png", "Latin dance couple in elegant performance"),
];

const SALSA_PHOTOS: UnsplashPhoto[] = [
  local("/images/salsa.png", "Energetic salsa dancers in motion"),
  local("/images/salsa.png", "Energetic salsa dancers in motion"),
  local("/images/salsa.png", "Energetic salsa dancers in motion"),
  local("/images/salsa.png", "Energetic salsa dancers in motion"),
];

const TANGO_PHOTOS: UnsplashPhoto[] = [
  local("/images/tango.png", "Passionate tango embrace"),
  local("/images/tango.png", "Passionate tango embrace"),
  local("/images/tango.png", "Passionate tango embrace"),
  local("/images/tango.png", "Passionate tango embrace"),
];

const WEDDING_PHOTOS: UnsplashPhoto[] = [
  local("/images/wedding.png", "Couple sharing their first wedding dance"),
  local("/images/wedding.png", "Couple sharing their first wedding dance"),
  local("/images/wedding.png", "Couple sharing their first wedding dance"),
  local("/images/wedding.png", "Couple sharing their first wedding dance"),
];

const SWING_PHOTOS: UnsplashPhoto[] = [
  local("/images/swing.png", "Swing dancers performing with energy"),
  local("/images/swing.png", "Swing dancers performing with energy"),
  local("/images/swing.png", "Swing dancers performing with energy"),
  local("/images/swing.png", "Swing dancers performing with energy"),
];

const COMPETITION_PHOTOS: UnsplashPhoto[] = [
  local("/images/competition.png", "Competitive dancers on stage"),
  local("/images/competition.png", "Competitive dancers on stage"),
  local("/images/competition.png", "Competitive dancers on stage"),
  local("/images/competition.png", "Competitive dancers on stage"),
];

const STUDIO_INTERIOR_PHOTOS: UnsplashPhoto[] = [
  local("/images/ballroom.png", "Professional dance studio interior"),
  local("/images/ballroom.png", "Professional dance studio interior"),
  local("/images/ballroom.png", "Professional dance studio interior"),
];

// ─── Style → photo pool mapping ───────────────────────────────────────────────

const STYLE_PHOTO_MAP: Partial<Record<DanceStyle, UnsplashPhoto[]>> = {
  ballroom:      BALLROOM_PHOTOS,
  waltz:         WALTZ_PHOTOS,
  foxtrot:       BALLROOM_PHOTOS,
  latin:         LATIN_PHOTOS,
  salsa:         SALSA_PHOTOS,
  cha_cha:       LATIN_PHOTOS,
  rumba:         LATIN_PHOTOS,
  tango:         TANGO_PHOTOS,
  wedding_dance: WEDDING_PHOTOS,
  swing:         SWING_PHOTOS,
  competition:   COMPETITION_PHOTOS,
};

const CHAIN_PHOTO_MAP: Record<StudioChain, UnsplashPhoto[]> = {
  fred_astaire:  BALLROOM_PHOTOS,
  arthur_murray: BALLROOM_PHOTOS,
  dance_with_me: LATIN_PHOTOS,
  independent:   STUDIO_INTERIOR_PHOTOS,
};

// ─── Photo selection ──────────────────────────────────────────────────────────

function pick(pool: UnsplashPhoto[], studioId: number, offset = 0): UnsplashPhoto {
  return pool[(studioId + offset) % pool.length];
}

export function getStudioPhotos(
  studioId:    number,
  danceStyles: DanceStyle[],
  chain:       StudioChain,
): StudioPhotoSet {
  const primaryPool   = (danceStyles[0] && STYLE_PHOTO_MAP[danceStyles[0]]) || BALLROOM_PHOTOS;
  const secondaryPool = (danceStyles[1] && STYLE_PHOTO_MAP[danceStyles[1]]) || primaryPool;
  const accentPool    = CHAIN_PHOTO_MAP[chain];
  return {
    hero:  pick(primaryPool,   studioId, 0),
    left:  pick(secondaryPool, studioId, 1),
    right: pick(accentPool,    studioId, 2),
  };
}
