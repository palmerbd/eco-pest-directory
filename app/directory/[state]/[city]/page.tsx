import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { citySlugToName, getMetroSlug, getMetroSuburbs } from "@/lib/wordpress";
import { CHAIN_CONFIG } from "@/types/studio";

export const dynamic = "force-dynamic";

const SVC = { general_pest:"General Pest", termite:"Termite", rodent:"Rodent", bed_bug:"Bed Bug", mosquito:"Mosquito", wildlife:"Wildlife", cockroach:"Cockroach", ant:"Ant", fumigation:"Fumigation", commercial:"Commercial", organic:"Organic", lawn_pest:"Lawn Pest" } as Record<string,string>;

async function fetchByCity(citySlug: string) {
  const wpUrl = process.env.WP_API_URL || process.env.NEXT_PUBLIC_WP_API_URL || "";
  const cityName = citySlugToName(citySlug).toLowerCase();
  try {
    const all: any[] = [];
    for (let page = 1; page <= 20; page++) {
      const res = await fetch(`${wpUrl}/wp/v2/pest_company?per_page=100&page=${page}&status=publish&_fields=id,slug,title,excerpt,acf`, { cache: "no-store" });
      if (!res.ok) break;
      const data = await res.json();
      if (!data.length) break;
      all.push(...data);
    }
    return all.filter((post: any) => {
      const city = (post.acf?.studio_city || "").toLowerCase();
      return city === cityName;
    }).map((post: any) => {
      const acf = post.acf || {};
      const specs = typeof acf.service_specialties === "string" ? acf.service_specialties.split(",").filter(Boolean) : (acf.service_specialties || ["general_pest"]);
      return {
        slug: post.slug,
        title: dec(post.title?.rendered || ""),
        city: acf.studio_city || "", state: acf.studio_state || "",
        rating: Number(acf.studio_rating) || 0, reviewCount: Number(acf.studio_review_count) || 0,
        ecoTier: acf.eco_tier || "unclassified", studioChain: acf.studio_chain || "independent",
        serviceSpecialties: specs, danceStyles: specs,
      };
    });
  } catch { return []; }
}

function dec(s: string) {
  return s.replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/&amp;/g, "&").replace(/&rsquo;/g, "’").replace(/&lsquo;/g, "‘");
}

export async function generateMetadata({ params }: { params: Promise<{ state: string; city: string }> }): Promise<Metadata> {
  const { state, city } = await params;
  const cityName = citySlugToName(city);
  const studios = await fetchByCity(city);
  if (!studios.length) return { title: "City Not Found" };
  const st = studios[0]?.state || state.toUpperCase();
  return {
    title: `Eco-Friendly Pest Control in ${cityName}, ${st} — ${studios.length} Green Providers`,
    description: `Compare ${studios.length} eco-friendly pest control companies in ${cityName}, ${st}. Filter by Eco-Certified providers, services, and ratings.`,
    alternates: { canonical: `https://www.greenpestdirectory.com/directory/${state}/${city}` },
  };
}

export default async function CityPage({ params }: { params: Promise<{ state: string; city: string }> }) {
  const { state: stateSlug, city } = await params;
  const cityName = citySlugToName(city);
  const studios = await fetchByCity(city);
  if (!studios.length) notFound();
  const st = studios[0]?.state || stateSlug.toUpperCase();
  const tier1 = studios.filter((s: any) => s.ecoTier === "tier_1").length;
  const tier2 = studios.length - tier1;
  const avg = (studios.reduce((sum: number, s: any) => sum + (s.rating || 0), 0) / studios.length).toFixed(1);
  const metroSlug = getMetroSlug(city);
  const suburbs = metroSlug ? getMetroSuburbs(metroSlug).filter((s) => s !== city).slice(0, 8) : [];

  return (
    <>
      <section className="chero">
        <div className="wrap">
          <div className="crumb"><Link href="/">Home</Link><span>/</span><Link href="/directory">{st}</Link><span>/</span>{cityName}</div>
          <h1>Eco-Friendly Pest Control in <span className="hl">{cityName}, {st}</span></h1>
          <p>Compare green, organic, and pet-safe pest control companies serving {cityName} and surrounding areas. Eco-Certified providers are listed first.</p>
          <div className="cstats">
            <div className="cstat"><b>{studios.length}</b><span>Companies</span></div>
            <div className="cstat"><b>{tier1}</b><span>Eco-Certified</span></div>
            <div className="cstat"><b>{avg}★</b><span>Avg. rating</span></div>
          </div>
        </div>
      </section>

      <div className="wrap">
        <div className="filterbar" style={{ marginTop: "-26px", position: "relative", zIndex: 5 }}>
          <div className="seg">
            <button className="active">All ({studios.length})</button>
            <button>Eco-Certified ({tier1})</button>
            <button>Eco Options ({tier2})</button>
          </div>
          <div className="selects">
            <select aria-label="Service"><option>All Services</option><option>Termite</option><option>Bed Bug</option><option>Mosquito</option><option>Rodent</option><option>General Pest</option></select>
            <select aria-label="Sort"><option>Eco-Friendly First</option><option>Rating</option><option>Name (A–Z)</option></select>
          </div>
        </div>
      </div>

      <section className="block" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <div className="results-meta">
            <h2>{studios.length} eco-friendly providers in {cityName}</h2>
            <span>Showing 1–{Math.min(studios.length, 9)} · Eco-Certified first</span>
          </div>
          <div className="grid">
            {studios.map((s: any) => {
              const t1 = s.ecoTier === "tier_1";
              const chain = s.studioChain ? CHAIN_CONFIG[s.studioChain as keyof typeof CHAIN_CONFIG] : null;
              const svcs = (s.serviceSpecialties || s.danceStyles || []).slice(0, 3);
              const stars = "★".repeat(Math.round(s.rating || 0)) + "☆".repeat(5 - Math.round(s.rating || 0));
              return (
                <article className="lcard" key={s.slug}>
                  <div className="rowtop">
                    <div>
                      <h3><Link href={`/directory/${stateSlug}/${city}/${s.slug}`}>{dec(s.title)}</Link></h3>
                      <div className="loc">📍 {s.city}, {s.state}</div>
                    </div>
                    <span className={`badge ${t1 ? "t1" : "t2"}`}>{t1 ? "✓ Eco-Certified" : "◆ Eco Options"}</span>
                  </div>
                  {(s.rating > 0) && (
                    <div className="stars"><span className="s">{stars}</span><b>{(s.rating || 0).toFixed(1)}</b><span>({s.reviewCount || 0})</span></div>
                  )}
                  <div className="chips">
                    {svcs.map((svc: string) => (
                      <span className="chip" key={svc}>{SVC[svc] || svc.replace(/_/g, " ")}</span>
                    ))}
                  </div>
                  <div className="meta">
                    <span className="chainbadge">{chain?.label || "Independent"}</span>
                    <Link className="btn btn-primary" href={`/directory/${stateSlug}/${city}/${s.slug}`}>View Details</Link>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {suburbs.length > 0 && (
        <section className="nearby"><div className="wrap"><span className="eyebrow">Explore Nearby</span>
          <h2 style={{ fontSize: "clamp(1.4rem,5vw,1.9rem)", color: "var(--dark)", marginTop: "0.4rem" }}>Eco pest control in other {st} cities</h2>
          <div className="citychips">{suburbs.map((sub) => (<Link className="citychip" href={`/directory/${stateSlug}/${sub}`} key={sub}>{citySlugToName(sub)}</Link>))}</div>
        </div></section>
      )}

      <section className="seo"><div className="wrap"><div className="panel">
        <h2>Finding green pest control in {cityName}</h2>
        <p>{cityName} homeowners increasingly want pest control that protects their families, pets, and green spaces. The Green Pest Directory lists <strong>{studios.length} eco-conscious providers</strong> across the {cityName} metro.</p>
        <h3>Eco-Certified vs. Eco Options in {cityName}</h3>
        <p><strong>Eco-Certified (Tier 1)</strong> companies build their entire business around green methods. <strong>Eco Options (Tier 2)</strong> are conventional providers that offer eco-friendly treatments on request.</p>
        <div className="faq" style={{ marginTop: "22px" }}>
          <h3>Frequently asked questions</h3>
          <details open><summary>How much does eco-friendly pest control cost in {cityName}? <span className="plus">+</span></summary><div className="ans">Most {cityName} eco providers charge $40–$85 per visit for recurring service, or $150–$400 for one-time treatments.</div></details>
          <details><summary>How are companies ranked on this page? <span className="plus">+</span></summary><div className="ans">By default we show Eco-Certified (Tier 1) first, then Eco Options (Tier 2), each ordered by rating.</div></details>
        </div>
      </div></div></section>

      <section style={{ padding: "0 0 56px" }}><div className="wrap"><div className="ctastrip">
        <h2>Own a green pest company in {cityName}?</h2>
        <p>Get found by {cityName} homeowners. Claim your free listing today.</p>
        <Link className="btn btn-light" href="/claim">List Your Company →</Link>
      </div></div></section>
    </>
  );
}
