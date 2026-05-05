import type { NextConfig } from "next";

const PROD_DOMAIN = "www.ballroomdancedirectory.com";
const VERCEL_URL  = "ballroom-dance-directory.vercel.app";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/photo-*",
      },
      {
        protocol: "https",
        hostname: "pcthfpqwdrfszwasxfei.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },

  // ── Canonical enforcement ────────────────────────────────────────────────────
  // 1. Redirect non-www → www (consolidates link equity)
  // 2. Tell Google not to index the Vercel preview URL
  // 3. 301 redirects for GSC "Not found (404)" URLs — studios renamed/removed,
  //    duplicate-city-suffix slugs created during early scrape, and stale city routes.
  async redirects() {
    return [
      // ── Non-www → www ─────────────────────────────────────────────────────
      {
        source: "/:path*",
        has: [{ type: "host", value: "ballroomdancedirectory.com" }],
        destination: `https://${PROD_DOMAIN}/:path*`,
        permanent: true,
      },

      // ── Studio slug fixes: duplicate-city-suffix → cleaned slug ──────────
      // These slugs were created during the initial Google Places scrape before
      // slug deduplication ran; Google crawled them and now they 404.
      {
        source: "/studios/arthur-murray-dance-studio-temecula-temecula",
        destination: "/studios/arthur-murray-dance-studio-temecula",
        permanent: true,
      },
      {
        source: "/studios/arthur-murray-dance-studio-ventura-ventura-4",
        destination: "/studios/arthur-murray-dance-studio-ventura-4",
        permanent: true,
      },
      // Canadian locations — never belonged in US directory; send to root
      {
        source: "/studios/arthur-murray-dance-studio-coquitlam-coquitlam",
        destination: "/studios",
        permanent: true,
      },
      {
        source: "/studios/arthur-murray-dance-studio-victoria-victoria",
        destination: "/studios",
        permanent: true,
      },

      // ── Deleted / removed studios → main directory ────────────────────────
      {
        source: "/studios/the-ballet-school-performing-arts-walnut-creek",
        destination: "/studios",
        permanent: true,
      },
      {
        source: "/studios/top-tier-dance-coaching-corpus-christi",
        destination: "/studios",
        permanent: true,
      },
      {
        source: "/studios/fred-astaire-dance-studios-princeton",
        destination: "/studios",
        permanent: true,
      },
      {
        source: "/studios/mitchells-dance-studio-beverly",
        destination: "/studios",
        permanent: true,
      },

      // ── Stale city / city×style routes ───────────────────────────────────
      // lafayette-township was never a supported city slug; no studios exist there.
      {
        source: "/studios/city/lafayette-township",
        destination: "/studios",
        permanent: true,
      },
      // las-vegas salsa: no salsa studios in Las Vegas → redirect to city page
      {
        source: "/studios/city/las-vegas/style/salsa",
        destination: "/studios/city/las-vegas",
        permanent: true,
      },

      // ── Duplicate-city-suffix → clean slug (batch 2) ─────────────────────
      // Same scrape artifact as batch 1: city name appended twice during import.
      // Each clean slug exists in WordPress (verified by pattern from batch 1).
      {
        source: "/studios/arthur-murray-dance-studio-redwood-city-redwood-city-3",
        destination: "/studios/arthur-murray-dance-studio-redwood-city-3",
        permanent: true,
      },
      {
        source: "/studios/divadance-san-antonio-san-antonio-2",
        destination: "/studios/divadance-san-antonio-2",
        permanent: true,
      },
      {
        source: "/studios/arthur-murray-dance-studio-vancouver-wa-vancouver-3",
        destination: "/studios/arthur-murray-dance-studio-vancouver-wa-3",
        permanent: true,
      },
      {
        source: "/studios/arthur-murray-dance-studio-of-plano-plano",
        destination: "/studios/arthur-murray-dance-studio-of-plano",
        permanent: true,
      },
      {
        source: "/studios/arthur-murray-dance-studio-of-stockton-stockton-3",
        destination: "/studios/arthur-murray-dance-studio-of-stockton-3",
        permanent: true,
      },
      {
        source: "/studios/dance-with-me-the-woodlands-the-woodlands-2",
        destination: "/studios/dance-with-me-the-woodlands-2",
        permanent: true,
      },

      // ── Deleted / non-existent studios → main directory (batch 2) ────────
      {
        source: "/studios/image-ballroom-dance-academy-richardson-2",
        destination: "/studios",
        permanent: true,
      },
      {
        source: "/studios/my-heels-on-dance-houston",
        destination: "/studios",
        permanent: true,
      },
      {
        source: "/studios/clarity-dance-academy-midland",
        destination: "/studios",
        permanent: true,
      },
      {
        source: "/studios/pasofino-salsa-bachata-dance-studio-atlanta",
        destination: "/studios",
        permanent: true,
      },
      // Malformed slug (2-26 appears to be a scrape artifact in the name field)
      {
        source: "/studios/swingtime-center-dancing-2-26-fort-worth-2",
        destination: "/studios",
        permanent: true,
      },
      {
        source: "/studios/you-can-dance-dallas-addison",
        destination: "/studios",
        permanent: true,
      },

      // ── Wrong city slug ───────────────────────────────────────────────────
      // Google indexed /studios/city/new-york — correct slug is new-york-city
      {
        source: "/studios/city/new-york",
        destination: "/studios/city/new-york-city",
        permanent: true,
      },

      // ── Invalid city×style (Toledo not in directory) ─────────────────────
      {
        source: "/studios/city/toledo/style/ballroom",
        destination: "/studios",
        permanent: true,
      },

      // ── Misc stale / malformed root routes ───────────────────────────────
      // Doubled slug — correct page is /wedding-dance-lessons
      {
        source: "/wedding-dance-dance-lessons",
        destination: "/wedding-dance-lessons",
        permanent: true,
      },
      // Non-US studio (Tijuana, MX) — scraped near San Diego border
      {
        source: "/studios/academia-sm-tango-tijuana",
        destination: "/studios",
        permanent: true,
      },

      // ── Soft 404: /studios?style=X&city=Y ────────────────────────────────
      // The studios page ignores the "city" query param, so Google marks these
      // as soft 404s. Redirect to the clean /studios URL; users can filter
      // by style using the on-page controls.
      {
        source: "/studios",
        has: [{ type: "query", key: "city" }],
        destination: "/studios",
        permanent: true,
      },
    ];
  },

  async headers() {
    return [
      {
        // Block Googlebot from indexing the Vercel deployment URL
        source: "/:path*",
        has: [{ type: "host", value: VERCEL_URL }],
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      },
    ];
  },
};

export default nextConfig;
