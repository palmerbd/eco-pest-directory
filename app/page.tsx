import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Green Pest Directory — Find Eco-Friendly Pest Control Near You",
  description: "Discover 2,600+ eco-friendly pest control companies across the US. Find green, organic, and pet-safe pest control services in your area.",
  alternates: { canonical: "https://www.greenpestdirectory.com" },
};


export default async function HomePage() {
  // Fetch featured listings directly from WP REST API
  let featured: any[] = [];
  try {
    const wpUrl = process.env.WP_API_URL || process.env.NEXT_PUBLIC_WP_API_URL || "";
    const res = await fetch(`${wpUrl}/wp/v2/pest_company?per_page=8&status=publish&_fields=id,slug,title,acf`, { next: { revalidate: 3600 } });
    const raw = await res.json();
    featured = (raw || []).map((post: any) => {
      const acf = post.acf || {};
      const title = (post.title?.rendered || "").replace(/&#(\d+);/g, (_:any,n:any) => String.fromCharCode(Number(n))).replace(/&amp;/g,"&");
      const specs = typeof acf.service_specialties === "string" ? achf.service_specialties.split(",").filter(Boolean) : [];
      return {
        slug: post.slug, title, city: acf.studio_city || "", state: acf.studio_state || "",
        rating: Number(acf.studio_rating) || 0, reviewCount: Number(acf.studio_review_count) || 0,
        ecoTier: acf.eco_tier || "unclassified", chain: acf.studio_chain || "independent",
        serviceSpecialties: specs,
      };
    });
  } catch {}

  return (
    <>
      {/* ===================== HERO ===================== */}
      <section className="hero">
        <div className="wrap">
          <div className="hero-grid">
            <div className="hero-copy">
              <span className="hero-pill">
                🛡️ America&apos;s first eco-only pest control directory
              </span>
              <h1>
                Find <span className="hl">Eco-Friendly</span> Pest Control Near
                You
