import { Metadata } from "next";
import Link from "next/link";
import { CHAIN_CONFIG } from "@/types/studio";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Find Eco-Friendly Pest Control Companies",
  description: "Browse all eco-friendly pest control companies nationwide.",
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
    }
    return raw.map((post: any) => {
      const acf = post.acf || {};
      const specs = typeof acf.service_specialties === "string"
        ? acf.service_specialties.split(",").filter(Boolean)
        : (acf.service_specialties || ["general_pest"]);
      return {
        slug: post.slug,
        title: dec(post.title?.rendered || ""),
        city: acf.studio_city || "",
        state: acf.studio_state || "",
        ecoTier: acf.eco_tier || "unclassified",
        studioChain: acf.studio_chain || "independent",
        serviceSpecialties: specs,
        rating: Number(acf.studio_rating) || 0,
        reviewCount: Number(acf.studio_review_count) || 0,
      };
    });
  } catch {
    return [];
  }
}

export default async function BrowsePage({
  searchParams,
}: {
  searchParams: Promise<{ eco?: string; q?: string; state?: string }>;
}) {
  const sp = await searchParams;
  const ecoFilter = sp.eco || "";
  const qFilter = (sp.q || "").toLowerCase();
  const stateFilter = (sp.state || "").toLowerCase();

  const all = await fetchAll();
  const total = all.length;
  const tier1Count = all.filter((s) => s.ecoTier === "tier_1").length;
  const tier2Count = all.filter((s) => s.ecoTier === "tier_2").length;

  let filtered = all;
  if (ecoFilter === "tier_1") filtered = filtered.filter((s) => s.ecoTier === "tier_1");
  else if (ecoFilter === "tier_2") filtered = filtered.filter((s) => s.ecoTier === "tier_2");
  if (stateFilter) filtered = filtered.filter((s) => s.state.toLowerCase() === stateFilter);
  if (qFilter) filtered = filtered.filter((s) =>
    s.city.toLowerCase().includes(qFilter) ||
    s.state.toLowerCase().includes(qFilter) ||
    s.title.toLowerCase().includes(qFilter)
  );

  const heading = qFilter
    ? `Results for "${sp.q}"`
    : stateFilter
    ? `Providers in ${stateFilter.toUpperCase()}`
    : `Browse ${total} pest control`;

  return (
    <>
      <section className="chero" style={{ padding: "24px 0 36px" }}>
        <div className="wrap">
          <h1>Eco-Friendly Pest Control <span className="hl">Companies</span></h1>
          <p>{heading} companies offering green, organic, and pet-safe treatments nationwide.</p>
        </div>
      </section>

      <div className="wrap">
        <div className="filterbar" style={{ marginTop: "-20px", position: "relative", zIndex: 5 }}>
          <div className="seg">
            <Link href="/directory" style={!ecoFilter ? { background: "var(--accent)", color: "#fff", borderRadius: "999px", padding: "0.6rem 0.9rem", fontFamily: "Montserrat", fontWeight: 700, fontSize: "0.8rem" } : { padding: "0.6rem 0.9rem", fontFamily: "Montserrat", fontWeight: 700, fontSize: "0.8rem", color: "var(--muted)" }}>All ({total})</Link>
            <Link href="/directory?eco=tier_1" style={ecoFilter === "tier_1" ? { background: "var(--accent)", color: "#fff", borderRadius: "999px", padding: "0.6rem 0.9rem", fontFamily: "Montserrat", fontWeight: 700, fontSize: "0.8rem" } : { padding: "0.6rem 0.9rem", fontFamily: "Montserrat", fontWeight: 700, fontSize: "0.8rem", color: "var(--muted)" }}>Eco-Certified ({tier1Count})</Link>
            <Link href="/directory?eco=tier_2" style={ecoFilter === "tier_2" ? { background: "var(--accent)", color: "#fff", borderRadius: "999px", padding: "0.6rem 0.9rem", fontFamily: "Montserrat", fontWeight: 700, fontSize: "0.8rem" } : { padding: "0.6rem 0.9rem", fontFamily: "Montserrat", fontWeight: 700, fontSize: "0.8rem", color: "var(--muted)" }}>Eco Options ({tier2Count})</Link>
          </div>
          <div className="selects">
            <select aria-label="Service"><option>All Services</option><option>Termite</option><option>Bed Bug</option><option>Mosquito</option><option>Rodent</option></select>
            <select aria-label="Sort"><option>Eco-Friendly First</option><option>Rating</option><option>Name (A-Z)</option></select>
          </div>
        </div>
      </div>

      <section className="block" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <div className="results-meta">
            <h2>{filtered.length} eco-friendly providers</h2>
            <span>Showing 1-{Math.min(filtered.length, 100)}</span>
          </div>

          {filtered.length > 0 ? (
            <div className="grid">
              {filtered.slice(0, 100).map((s) => {
                const t1 = s.ecoTier === "tier_1";
                const chain = CHAIN_CONFIG[s.studioChain as keyof typeof CHAIN_CONFIG];
                return (
                  <article className="lcard" key={s.slug}>
                    <div className="rowtop">
                      <div>
                        <h3><Link href={`/directory/${s.state.toLowerCase()}/${s.city.toLowerCase().replace(/\s+/g, "-")}/${s.slug}`}>{s.title}</Link></h3>
                        <div className="loc">{"📍"} {s.city}{s.state ? `, ${s.state}` : ""}</div>
                      </div>
                      <span className={`badge ${t1 ? "t1" : "t2"}`}>{t1 ? "✓ Eco-Certified" : "◆ Eco Options"}</span>
                    </div>
                    {s.rating > 0 && (
                      <div className="stars">
                        <span className="s">{"★".repeat(Math.round(s.rating))}{"☆".repeat(5 - Math.round(s.rating))}</span>
                        <b>{s.rating.toFixed(1)}</b>
                        <span>({s.reviewCount})</span>
                      </div>
                    )}
                    <div className="chips">
                      {s.serviceSpecialties.slice(0, 3).map((svc: string) => (
                        <span className="chip" key={svc}>{SVC[svc] || svc.replace(/_/g, " ")}</span>
                      ))}
                    </div>
                    <div className="meta">
                      <span className="chainbadge">{chain?.label || "Independent"}</span>
                      <Link className="btn btn-primary" href={`/directory/${s.state.toLowerCase()}/${s.city.toLowerCase().replace(/\s+/g, "-")}/${s.slug}`}>View Details</Link>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div style={{ textAlign: "center", padding: "60px 20px", color: "var(--muted)" }}>
              <h3 style={{ fontSize: "1.3rem", color: "var(--dark)", marginBottom: "8px" }}>
                No providers found{qFilter ? ` for "${sp.q}"` : stateFilter ? ` in ${stateFilter.toUpperCase()}` : ""}
              </h3>
              <p>We are expanding coverage daily. Try searching for a nearby city or <Link href="/directory" style={{ color: "var(--accent)", fontWeight: 600 }}>browse all providers</Link>.</p>
            </div>
          )}
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
