import type { NextConfig } from "next";

const PROD_DOMAIN = "www.greenpestdirectory.com";
const VERCEL_URL  = "eco-pest-directory.vercel.app";

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
