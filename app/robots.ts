import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",
          "/admin/",
          "/dashboard/",
          "/claim/callback",
          "/upgrade/",
          "/_next/",
        ],
      },
      {
        userAgent: "GPTBot",
        allow: ["/", "/llms.txt", "/eco-friendly-pest-control", "/organic-pest-control", "/pet-safe-pest-control", "/ipm-pest-control", "/directory"],
      },
      {
        userAgent: "ChatGPT-User",
        allow: ["/", "/llms.txt", "/api/public/"],
      },
      {
        userAgent: "anthropic-ai",
        allow: ["/", "/llms.txt", "/api/public/"],
      },
      {
        userAgent: "PerplexityBot",
        allow: ["/", "/llms.txt", "/api/public/"],
      },
    ],
    sitemap: "https://www.greenpestdirectory.com/sitemap.xml",
  };
}
