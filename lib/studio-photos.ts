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

// ─── Photo pools (4 slots each — rotated by company ID) ───────────────────────

const PEST_PHOTOS: UnsplashPhoto[] = [
  local("/images/ballroom.png", "Professional pest control service in action"),
  local("/images/ballroom.png", "Professional pest control service in action"),
  local("/images/ballroom.png", "Professional pest control service in action"),
  local("/images/ballroom.png", "Professional pest control service in action"),
];

const COMPANY_INTERIOR_PHOTOS: UnsplashPhoto[] = [
  local("/images/ballroom.png", "Professional pest control company interior"),
  local("/images/ballroom.png", "Professional pest control company interior"),
  local("/images/ballroom.png", "Professional pest control company interior"),
];

// ─── Service type → photo pool mapping ───────────────────────────────────────

const STYLE_PHOTO_MAP: Partial<Record<DanceStyle, UnsplashPhoto[]>> = {
  general_pest: PEST_PHOTOS,
  termite:      PEST_PHOTOS,
  rodent:       PEST_PHOTOS,
  bed_bug:      PEST_PHOTOS,
  mosquito:     PEST_PHOTOS,
  wildlife:     PEST_PHOTOS,
  cockroach:    PEST_PHOTOS,
  ant:          PEST_PHOTOS,
  fumigation:   PEST_PHOTOS,
  commercial:   PEST_PHOTOS,
  organic:      PEST_PHOTOS,
  lawn_pest:    PEST_PHOTOS,
};

const CHAIN_PHOTO_MAP: Record<StudioChain, UnsplashPhoto[]> = {
  orkin:        PEST_PHOTOS,
  terminix:     PEST_PHOTOS,
  truly_nolen:  PEST_PHOTOS,
  aptive:       PEST_PHOTOS,
  abc_home:     PEST_PHOTOS,
  hometeam:     PEST_PHOTOS,
  massey:       PEST_PHOTOS,
  turner:       PEST_PHOTOS,
  ecoshield:    PEST_PHOTOS,
  independent:  COMPANY_INTERIOR_PHOTOS,
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
  const primaryPool   = (danceStyles[0] && STYLE_PHOTO_MAP[danceStyles[0]]) || PEST_PHOTOS;
  const secondaryPool = (danceStyles[1] && STYLE_PHOTO_MAP[danceStyles[1]]) || primaryPool;
  const accentPool    = CHAIN_PHOTO_MAP[chain];
  return {
    hero:  pick(primaryPool,   studioId, 0),
    left:  pick(secondaryPool, studioId, 1),
    right: pick(accentPool,    studioId, 2),
  };
}
