import { MetadataRoute } from "next";
import { getAllStudios, getBlogSlugs } from "@/lib/wordpress";
import { COMPETITIONS } from "@/lib/competitions-data";
import { COMP_REGION_LABELS, COMP_STYLE_LABELS } from "@/types/competition";
import { DANCE_STYLES } from "@/types/studio";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.ballroomdancedirectory.com";

const CITIES = [
  "los-angeles", "new-york-city", "chicago", "houston", "dallas",
  "miami", "phoenix", "atlanta", "seattle", "denver",
  "las-vegas", "boston", "san-diego", "austin", "tampa",
  "nashville", "orlando", "portland", "san-antonio", "minneapolis",
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

  // City × Style intersection pages — high-value SEO targets
  const cityStyleEntries: MetadataRoute.Sitemap = CITIES.flatMap((city) =>
    DANCE_STYLES.map((style) => ({
      url: `${BASE_URL}/studios/city/${city}/style/${style.replace(/_/g, "-")}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.65,
    }))
  );

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
    ...cityStyleEntries,
    ...studioEntries,
    ...blogEntries,
    ...competitionEntries,
    ...competitionRegionEntries,
    ...competitionStyleEntries,
  ];
}
