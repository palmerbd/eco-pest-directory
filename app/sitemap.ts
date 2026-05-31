import { MetadataRoute } from "next";
import { getAllStudios } from "@/lib/wordpress";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.greenpestdirectory.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const studios = await getAllStudios();

  // Company detail pages: /[state]/[city]/[slug]
  const companyEntries: MetadataRoute.Sitemap = studios.map((s: any) => {
    const state = (s.state || "us").toLowerCase();
    const city = (s.city || "unknown").toLowerCase().replace(/\s+/g, "-");
    return {
      url: `${BASE_URL}/${state}/${city}/${s.slug}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    };
  });

  // City pages: /[state]/[city] — deduplicated
  const citySet = new Set<string>();
  studios.forEach((s: any) => {
    const state = (s.state || "").toLowerCase();
    const city = (s.city || "").toLowerCase().replace(/\s+/g, "-");
    if (state && city) citySet.add(`${state}/${city}`);
  });
  const cityEntries: MetadataRoute.Sitemap = Array.from(citySet).map((path) => ({
    url: `${BASE_URL}/${path}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: new Date(), changeFrequency: "daily", priority: 1.0 },
    { url: `${BASE_URL}/directory`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${BASE_URL}/eco-friendly-pest-control`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE_URL}/organic-pest-control`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 },
    { url: `${BASE_URL}/pet-safe-pest-control`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 },
    { url: `${BASE_URL}/ipm-pest-control`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 },
    { url: `${BASE_URL}/about`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE_URL}/contact`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.4 },
    { url: `${BASE_URL}/claim`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE_URL}/privacy`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
    { url: `${BASE_URL}/terms`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
  ];

  return [...staticPages, ...cityEntries, ...companyEntries];
}
