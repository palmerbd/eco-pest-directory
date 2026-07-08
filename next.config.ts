import type { NextConfig } from "next";

const PROD_DOMAIN = "www.greenpestdirectory.com";
const VERCEL_URL = "eco-pest-directory.vercel.app";

// US state abbreviations for redirect matching
const STATE_ABBRS = "al|ak|az|ar|ca|co|ct|de|fl|ga|hi|id|il|in|ia|ks|ky|la|me|md|ma|mi|mn|ms|mo|mt|ne|nv|nh|nj|nm|ny|nc|nd|oh|ok|or|pa|ri|sc|sd|tn|tx|ut|vt|va|wa|wv|wi|wy|dc";

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
    ],
  },

  async redirects() {
    return [
      // Non-www → www
      {
        source: "/:path*",
        has: [{ type: "host", value: "greenpestdirectory.com" }],
        destination: `https://${PROD_DOMAIN}/:path*`,
        permanent: true,
      },
      // Old /studios routes → /directory
      {
        source: "/studios",
        destination: "/directory",
        permanent: true,
      },
      {
        source: "/studios/:path*",
        destination: "/directory",
        permanent: true,
      },
      // /{state}/{city} and /{state}/{city}/{slug} → /directory prefix
      // Fixes GSC 404 spike: Google crawled these without /directory/ prefix
      {
        source: `/:state(${STATE_ABBRS})/:city`,
        destination: "/directory/:state/:city",
        permanent: true,
      },
      {
        source: `/:state(${STATE_ABBRS})/:city/:slug`,
        destination: "/directory/:state/:city/:slug",
        permanent: true,
      },
    ];
  },

  async headers() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: VERCEL_URL }],
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      },
    ];
  },
};

export default nextConfig;
