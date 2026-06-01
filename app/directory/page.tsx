import { Metadata } from "next";
import Link from "next/link";
import { CHAIN_CONFIG } from "@/types/studio";

function decodeEntities(s) {
  return s.replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/&#x([0-9a-fA-F]+);/g, (_, n) => String.fromCharCode(parseInt(n, 16)))
    .replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/&rsquo;/g, "\u2019")
    .replace(/&lsquo;/g, "\u2018").replace(/&ndash;/g, "\u2013").replace(/&mdash;/g, "\u2014");
}

const SERVICE_DISPLAY = {
  general_pest: "General Pest", termite: "Termite", rodent: "Rodent",
  bed_bug: "Bed Bug", mosquito: "Mosquito", wildlife: "Wildlife",
  cockroach: "Cockroach", ant: "Ant", fumigation: "Fumigation",
  commercial: "Commercial", organic: "Organic", lawn_pest: "Lawn Pest",
};

export const revalidate = 3600; // ISR: refresh every hour

export const metadata: Metadata = {
  title: "Find Eco-Friendly Pest Control Companies",
  description: "Browse all eco-friendly pest control companies nationwide.",
};

async function fetchCompanies() {
  const wpUrl = process.env.WP_API_URL || process.env.NEXT_PUBLIC_WP_API_URL || "";
  const url = `${wpUrl}/wp/v2/pest_company?per_page=48&status=publish&page=1&_fields=id,slug,title,excerpt,acf`;
  
  console.log("[studios] Fetching from:", url);
  
  try {
    const res = await fetch(url, {
      cache: "no-store",
      headers: { "Content-Type": "application/json" },
    });
    
    console.log("[studios] Response status:", res.status);
    const total = Number(res.headers.get("X-WP-Total") || "0");
    console.log("[studios] X-WP-Total:", total);
    
    if (!res.ok) {
      console.error("[studios] Bad response:", res.status);
      return { studios: [], total: 0 };
    }
    
    const raw = await res.json();
    console.log("[studios] Raw items:", raw.length);
    
    const studios = raw.map((post: any) => {
      const acf = post.acf || {};
      const title = decodeEntities(post.title?.rendered || "");
      const city = acf.studio_city || acf.studio_address_city || "";
      const state = acf.studio_state || acf.studio_address_state || "";
      
      return {
        id: post.id,
        slug: post.slug,
        title,
        city,
        state,
        ecoTier: acf.eco_tier || "unclassified",
        studioChain: acf.studio_chain || "independent",
        danceStyles: (acf.service_specialties || "general_pest").split(","),
        serviceSpecialties: (acf.service_specialties || "general_pest").split(","),
        rating: Number(acf.studio_rating) || 0,
        reviewCount: Number(acf.studio_review_count) || 0,
        phone: acf.studio_phone || "",
        description: "",
        tier: acf.studio_tier || "free",
        cityState: `${city.toLowerCase().replace(/\s+/g, "-")}-${state.toLowerCase()}`,
      };
    });
    
    console.log("[studios] Mapped items:", studios.length);
    return { studios, total };
  } catch (err: any) {
    console.error("[studios] FETCH ERROR:", err.message);
    return { studios: [], total: 0 };
  }
}

export default async function CompaniesPage() {
  const { studios, total } = await fetchCompanies();

  return (
    <>
      <section className="chero" style={{ padding: "24px 0 36px" }}>
        <div className="wrap">
          <h1>Eco-Friendly Pest Control <span className="hl">Companies</span></h1>
          <p>Browse {total} pest control companies offering green, organic, and pet-safe treatments nationwide.</p>
        </div>
      </section>
      <div className="wrap">
        <div className="filterbar" style={{ marginTop: "-20px", position: "relative", zIndex: 5 }}>
          <div className="seg">
            <button className="active">All ({total})</button>
            <button>Eco-Certified</button>
            <button>Eco Options</button>
          </div>
          <div className="selects">
            <select aria-label="Service"><option>All Services</option><option>Termite</option><option>Bed Bug</option><option>Mosquito</option><option>Rodent</option></select>
            <select aria-label="Sort"><option>Eco-Friendly First</option><option>Rating</option><option>Name (A–Z)</option></select>
          </div>
        </div>
      </div>
      <section className="block" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <div className="results-meta">
            <h2>{total} eco-friendly providers</h2>
            <span>Showing 1–{Math.min(studios.length, 48)}</span>
          </div>
          <div className="grid">
            {studios.map((s: any) => {
              const isTier1 = s.ecoTier === "tier_1";
              const chain = CHAIN_CONFIG[s.studioChain as keyof typeof CHAIN_CONFIG];
              return (
                <article className="lcard" key={s.slug}>
                  <div className="rowtop">
                    <div>
                      <h3><Link href={`/directory/${(s.state || "us").toLowerCase()}/${(s.city || "unknown").toLowerCase().replace(/\s+/g, "-")}/${s.slug}`}>{s.title}</Link></h3>
                      <div className="loc">📍 {s.city}{s.state ? `, ${s.state}` : ""}</div>
                    </div>
                    <span className={`badge ${isTier1 ? "t1" : "t2"}`}>
                      {isTier1 ? "✓ Eco-Certified" : "◆ Eco Options"}
                    </span>
                  </div>
                  <div className="chips">
                    {s.serviceSpecialties?.slice(0, 3).map((svc: string) => (
                      <span className="chip" key={svc}>{SERVICE_DISPLAY[svc as keyof typeof SERVICE_DISPLAY] || svc.replace(/_/g, " ")}</span>
                    ))}
                  </div>
                  <div className="meta">
                    <span className="chainbadge">{chain?.label || "Independent"}</span>
                    <Link className="btn btn-primary" href={`/directory/${(s.state || "us").toLowerCase()}/${(s.city || "unknown").toLowerCase().replace(/\s+/g, "-")}/${s.slug}`}>View Details</Link>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>
      <section style={{ padding: "0 0 56px" }}>
        <div className="wrap">
          <div className="ctastrip">
            <h2>Run a green pest control company?</h2>
            <p>Get found by homeowners searching for eco-friendly providers. Claim your free listing in minutes.</p>
            <Link className="btn btn-light" href="/claim">List Your Company →</Link>
          </div>
        </div>
      </section>
    </>
  );
}
