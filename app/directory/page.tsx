import { Metadata } from "next";
import Link from "next/link";
import { CHAIN_CONFIG } from "@/types/studio";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Find Eco-Friendly Pest Control Companies",
  description: "Browse all eco-friendly pest control companies nationwide.",
  alternates: { canonical: "https://www.greenpestdirectory.com/directory" },
};

const SVC: Record<string, string> = {
  general_pest: "General Pest", termite: "Termite", rodent: "Rodent",
  bed_bug: "Bed Bug", mosquito: "Mosquito", wildlife: "Wildlife",
  cockroach: "Cockroach", ant: "Ant", fumigation: "Fumigation",
  commercial: "Commercial", organic: "Organic", lawn_pest: "Lawn Pest",
};

function dec(s: string) {
  return s.replace(/&#(\d+);/g, (_: any, n: any) => String.fromCharCode(Number(n)))
    .replace(/&amp;/g, "&").replace(/&rsquo;/g, "'").replace(/&lsquo;/g, "'");
}

async function fetchAll() {
  const wpUrl = process.env.WP_API_URL || process.env.NEXT_PUBLIC_WP_API_URL || "";
  try {
    let raw: any[] = [];
    for (let pg = 1; pg <= 20; pg++) {
      const res = await fetch(
        `${wpUrl}/wp/v2/pest_company?per_page=100&page=${pg}&status=publish&_fields=id,slug,title,acf`,
        { next: { revalidate: 3600 } }
      );
      if (!res.ok) break;
      const batch = await res.json();
      if (!batch.length) break;
      raw = raw.concat(batch);
