import { MetadataRoute } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.ballroomdancedirectory.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // /api/ and /_next/ are infrastructure — never crawl.
        // /admin is a password-gated internal tool — no SEO value.
        // NOTE: /claim, /dashboard, /upgrade are intentionally NOT listed here.
        // Those routes have noindex in their layout.tsx files. Robots.txt disallow
        // prevents Google from crawling the page, which means it can't see the
        // noindex directive and can't de-index them. Allowing crawl + noindex in
        // layout is the correct way to remove pages from Google's index.
        disallow: ["/api/", "/_next/", "/admin"],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
    host: BASE_URL,
  };
}
