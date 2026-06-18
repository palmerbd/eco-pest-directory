import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getAllStudios } from "@/lib/wordpress";
import { getStateIntroCopy } from "@/lib/seo-copy";

export const revalidate = 3600;

// All 50 states + DC
const STATE_NAMES: Record<string, string> = {
  al: "Alabama", ak: "Alaska", az: "Arizona", ar: "Arkansas", ca: "California",
  co: "Colorado", ct: "Connecticut", de: "Delaware", dc: "District of Columbia",
  fl: "Florida", ga: "Georgia", hi: "Hawaii", id: "Idaho", il: "Illinois",
  in: "Indiana", ia: "Iowa", ks: "Kansas", ky: "Kentucky", la: "Louisiana",
  me: "Maine", md: "Maryland", ma: "Massachusetts", mi: "Michigan", mn: "Minnesota",
  ms: "Mississippi", mo: "Missouri", mt: "Montana", ne: "Nebraska", nv: "Nevada",
  nh: "New Hampshire", nj: "New Jersey", nm: "New Mexico", ny: "New York",
  nc: "North Carolina", nd: "North Dakota", oh: "Ohio", ok: "Oklahoma", or: "Oregon",
  pa: "Pennsylvania", ri: "Rhode Island", sc: "South Carolina", sd: "South Dakota",
  tn: "Tennessee", tx: "Texas", ut: "Utah", vt: "Vermont", va: "Virginia",
  wa: "Washington", wv: "West Virginia", wi: "Wisconsin", wy: "Wyoming",
};

function stateNameToSlug(name: string): string {
  return name.toLowerCase().replace(/\s+/g, "-");
}

export async function generateMetadata({ params }: { params: Promise<{ state: string }> }): Promise<Metadata> {
  const { state } = await params;
  const stateName = STATE_NAMES[state.toLowerCase()];
  if (!stateName) return { title: "State Not Found" };

  const all = await getAllStudios();
  const stateStudios = all.filter((s: any) => (s.state || "").toLowerCase() === state.toLowerCase());
  const count = stateStudios.length;

  return {
    title: `Eco-Friendly Pest Control in ${stateName} — ${count} Green Providers`,
    description: `Browse ${count} eco-friendly pest control companies across ${stateName}. Find Eco-Certified and green providers by city — organic, pet-safe, and IPM-based pest control near you.`,
    alternates: { canonical: `https://www.greenpestdirectory.com/directory/${state.toLowerCase()}` },
  };
}

export async function generateStaticParams() {
  const all = await getAllStudios();
  const states = new Set<string>();
  all.forEach((s: any) => {
    const st = (s.state || "").toLowerCase();
    if (st && STATE_NAMES[st]) states.add(st);
  });
  return Array.from(states).map((state) => ({ state }));
}

export default async function StatePage({ params }: { params: Promise<{ state: string }> }) {
  const { state } = await params;
  const stateCode = state.toLowerCase();
  const stateName = STATE_NAMES[stateCode];
  if (!stateName) notFound();

  const all = await getAllStudios();
  const stateStudios = all.filter((s: any) => (s.state || "").toLowerCase() === stateCode);
  if (!stateStudios.length) notFound();

  // Derive state slug for SEO copy (e.g. "North Carolina" -> "north-carolina")
  const stateSlug = stateNameToSlug(stateName);
  const introCopy = getStateIntroCopy(stateSlug);

  // Group by city
  const cityMap = new Map<string, { name: string; slug: string; count: number; ecoCertified: number }>();
  stateStudios.forEach((s: any) => {
    const cityName = s.city || "Unknown";
    const citySlug = cityName.toLowerCase().replace(/\s+/g, "-");
    if (cityMap.has(citySlug)) {
      const entry = cityMap.get(citySlug)!;
      entry.count++;
      if (s.ecoTier === "tier_1") entry.ecoCertified++;
    } else {
      cityMap.set(citySlug, {
        name: cityName,
        slug: citySlug,
        count: 1,
        ecoCertified: s.ecoTier === "tier_1" ? 1 : 0,
      });
    }
  });

  const cities = Array.from(cityMap.values()).sort((a, b) => b.count - a.count);
  const totalCompanies = stateStudios.length;
  const totalCities = cities.length;
  const totalEcoCertified = stateStudios.filter((s: any) => s.ecoTier === "tier_1").length;

  // JSON-LD schemas
  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://www.greenpestdirectory.com" },
      { "@type": "ListItem", position: 2, name: "Directory", item: "https://www.greenpestdirectory.com/directory" },
      { "@type": "ListItem", position: 3, name: stateName, item: `https://www.greenpestdirectory.com/directory/${stateCode}` },
    ],
  };

  const collectionLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `Eco-Friendly Pest Control in ${stateName}`,
    description: `Browse ${totalCompanies} eco-friendly pest control companies across ${totalCities} cities in ${stateName}.`,
    url: `https://www.greenpestdirectory.com/directory/${stateCode}`,
    numberOfItems: totalCompanies,
    provider: {
      "@type": "Organization",
      name: "Green Pest Directory",
      url: "https://www.greenpestdirectory.com",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionLd) }}
      />

      {/* Hero */}
      <section className="chero">
        <div className="wrap">
          <div className="crumb">
            <Link href="/">Home</Link>
            <span>/</span>
            <Link href="/directory">Directory</Link>
            <span>/</span>
            {stateName}
          </div>
          <h1>
            Eco-Friendly Pest Control in <span className="hl">{stateName}</span>
          </h1>
          <p>{introCopy}</p>
          <div className="cstats">
            <div className="cstat">
              <b>{totalCompanies}</b>
              <span>Companies</span>
            </div>
            <div className="cstat">
              <b>{totalCities}</b>
              <span>Cities</span>
            </div>
            <div className="cstat">
              <b>{totalEcoCertified}</b>
              <span>Eco-Certified</span>
            </div>
          </div>
        </div>
      </section>

      {/* City Grid */}
      <section className="block">
        <div className="wrap">
          <h2 style={{ fontSize: "clamp(1.4rem,5vw,1.9rem)", color: "var(--dark)", marginBottom: "1.2rem" }}>
            Browse by city in {stateName}
          </h2>
          <div className="grid">
            {cities.map((c) => (
              <article className="lcard" key={c.slug}>
                <div className="rowtop">
                  <div>
                    <h3>
                      <Link href={`/directory/${stateCode}/${c.slug}`}>{c.name}</Link>
                    </h3>
                  </div>
                </div>
                <div className="chips">
                  <span className="chip">{c.count} {c.count === 1 ? "company" : "companies"}</span>
                  {c.ecoCertified > 0 && (
                    <span className="chip" style={{ background: "var(--green-light, #e8f5e9)", color: "var(--green, #2e7d32)" }}>
                      {c.ecoCertified} Eco-Certified
                    </span>
                  )}
                </div>
                <div className="meta">
                  <Link className="btn btn-primary" href={`/directory/${stateCode}/${c.slug}`}>
                    View Providers →
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* SEO Content */}
      <section className="seo">
        <div className="wrap">
          <div className="panel">
            <h2>Green pest control across {stateName}</h2>
            <p>
              The Green Pest Directory lists <strong>{totalCompanies} eco-friendly pest control companies</strong> across{" "}
              <strong>{totalCities} cities</strong> in {stateName}. Our providers are categorized by their commitment
              to environmentally responsible pest management.
            </p>
            <h3>Eco-Certified vs. Eco Options</h3>
            <p>
              <strong>Eco-Certified (Tier 1)</strong> companies build their entire business around green methods —
              organic treatments, integrated pest management, and pet-safe solutions are their standard, not an
              add-on. <strong>Eco Options (Tier 2)</strong> are conventional providers that offer eco-friendly
              treatments on request.
            </p>
            <div className="faq" style={{ marginTop: "22px" }}>
              <h3>Frequently asked questions</h3>
              <details open>
                <summary>
                  How much does eco-friendly pest control cost in {stateName}?{" "}
                  <span className="plus">+</span>
                </summary>
                <div className="ans">
                  Most eco-friendly providers in {stateName} charge $40–$85 per visit for recurring service,
                  or $150–$400 for one-time treatments. Prices vary by city, pest type, and property size.
                </div>
              </details>
              <details>
                <summary>
                  How are cities ranked on this page? <span className="plus">+</span>
                </summary>
                <div className="ans">
                  Cities are sorted by the number of eco-friendly pest control providers available, with
                  the most-served cities listed first.
                </div>
              </details>
              <details>
                <summary>
                  What does &ldquo;Eco-Certified&rdquo; mean? <span className="plus">+</span>
                </summary>
                <div className="ans">
                  Eco-Certified companies have been verified as primarily using green, organic, or IPM-based
                  pest control methods. They prioritize low-toxicity treatments, biological controls, and
                  prevention-first strategies.
                </div>
              </details>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: "0 0 56px" }}>
        <div className="wrap">
          <div className="ctastrip">
            <h2>Own a green pest company in {stateName}?</h2>
            <p>Get found by homeowners across {stateName}. Claim your free listing today.</p>
            <Link className="btn btn-light" href="/claim">
              List Your Company →
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
