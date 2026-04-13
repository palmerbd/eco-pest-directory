import { MetadataRoute } from "next";
import { getAllStudios, getBlogSlugs } from "@/lib/wordpress";
import { COMPETITIONS } from "@/lib/competitions-data";
import { COMP_REGION_LABELS, COMP_STYLE_LABELS } from "@/types/competition";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.privatedancedirectory.com";

const CITIES = [
  "los-angeles",
  "chicago",
  "dallas",
  "miami",
  "houston",
  "new-york",
  "austin",
  "atlanta",
  "seattle",
  "denver",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [studios, blogSlugs] = await Promise.all([getAllStudios(), getBlogSlugs()]);

  const studioEntries: MetadataRoute.Sitemap = studios.map((studio) => ({
    url: `${BASE_URL}/studios/${studio.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  const cityEntries: MetadataRoute.Sitemap = CITIES.map((city) => ({
    url: `${BASE_URL}/studios/city/${city}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  const blogEntries: MetadataRoute.Sitemap = blogSlugs.map((slug) => ({
    url: `${BASE_URL}/blog/${slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.75,
  }));

  // ── Competition routes ──────────────────────────────────────────────────────
  const competitionEntries: MetadataRoute.Sitemap = COMPETITIONS.map((c) => ({
    url: `${BASE_URL}/competitions/${c.slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.75,
  }));

  const competitionRegionEntries: MetadataRoute.Sitemap = Object.keys(COMP_REGION_LABELS).map((r) => ({
    url: `${BASE_URL}/competitions/region/${r}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  const competitionStyleEntries: MetadataRoute.Sitemap = Object.keys(COMP_STYLE_LABELS).map((s) => ({
    url: `${BASE_URL}/competitions/style/${s}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  const staticEntries: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/studios`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/competitions`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/blog`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
  ];

  return [
    ...staticEntries,
    ...cityEntries,
    ...studioEntries,
    ...blogEntries,
    ...competitionEntries,
    ...competitionRegionEntries,
    ...competitionStyleEntries,
  ];
}
