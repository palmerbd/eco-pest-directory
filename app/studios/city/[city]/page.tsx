import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getStudiosByCity, citySlugToName, getAllStudios,
  getMetroSlug, getMetroSuburbs,
} from "@/lib/wordpress";
import { StudioCard, CHAIN_CONFIG } from "@/types/studio";

export const revalidate = 86400;

export async function generateStaticParams() {
  const majorCities = [
    "new-york","los-angeles","chicago","houston","dallas","miami",
    "phoenix","san-antonio","san-diego","atlanta","austin","denver",
    "seattle","portland","boston","las-vegas","orlando","tampa",
    "charlotte","nashville",
  ];
  return majorCities.map((city) => ({ city }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ city: string }>;
}): Promise<Metadata> {
  const { city } = await params;
  const cityName = citySlugToName(city);
  const studios  = await getStudiosByCity(city);
  if (!studios.length) return { title: "City Not Found" };

  const state = studios[0]?.state || "";
  return {
    title: `Eco-Friendly Pest Control in ${cityName}, ${state} — ${studios.length} Green Providers`,
    description: `Compare ${studios.length} eco-friendly and organic pest control companies in ${cityName}, ${state}. Filter by Eco-Certified providers, services, and ratings. Free to search.`,
    alternates: {
      canonical: `https://www.greenpestdirectory.com/studios/city/${city}`,
    },
  };
}

export default async function CityPage({
  params,
}: {
  params: Promise<{ city: string }>;
}) {
  const { city } = await params;
  const cityName = citySlugToName(city);
  const studios  = await getStudiosByCity(city);
  if (!studios.length) notFound();

  const state = studios[0]?.state || "";
  const tier1Count = studios.filter((s: any) => s.ecoTier === "tier_1").length;
  const tier2Count = studios.length - tier1Count;
  const avgRating = (studios.reduce((sum: number, s: any) => sum + (s.rating || 0), 0) / studios.length).toFixed(1);

  // Nearby cities
  const metroSlug = getMetroSlug(city);
  const suburbs = metroSlug ? getMetroSuburbs(metroSlug).filter((s) => s !== city).slice(0, 8) : [];

  return (
    <>
      {/* ===================== CITY HERO ===================== */}
      <section className="chero">
        <div className="wrap">
          <div className="crumb">
            <Link href="/">Home</Link><span>/</span>
            <Link href={`/studios/city/${city}`}>{state}</Link><span>/</span>
            {cityName}
          </div>
          <h1>
            Eco-Friendly Pest Control in{" "}
            <span className="hl">{cityName}, {state}</span>
          </h1>
          <p>
            Compare green, organic, and pet-safe pest control companies serving{" "}
            {cityName} and surrounding areas. Eco-Certified providers are listed first.
          </p>
          <div className="cstats">
            <div className="cstat">
              <b>{studios.length}</b>
              <span>Companies</span>
            </div>
            <div className="cstat">
              <b>{tier1Count}</b>
              <span>Eco-Certified</span>
            </div>
            <div className="cstat">
              <b>{avgRating}★</b>
              <span>Avg. rating</span>
            </div>
          </div>
        </div>
      </section>

      {/* ===================== FILTER BAR ===================== */}
      <div className="wrap">
        <div className="filterbar" style={{ marginTop: "-26px", position: "relative", zIndex: 5 }}>
          <div className="seg">
            <button className="active">All ({studios.length})</button>
            <button>Eco-Certified ({tier1Count})</button>
            <button>Eco Options ({tier2Count})</button>
          </div>
          <div className="selects">
            <select aria-label="Service">
              <option>All Services</option>
              <option>Termite</option>
              <option>Bed Bug</option>
              <option>Mosquito</option>
              <option>Rodent</option>
              <option>General Pest</option>
            </select>
            <select aria-label="Sort">
              <option>Eco-Friendly First</option>
              <option>Rating</option>
              <option>Name (A–Z)</option>
            </select>
          </div>
        </div>
      </div>

      {/* ===================== RESULTS ===================== */}
      <section className="block" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <div className="results-meta">
            <h2>{studios.length} eco-friendly providers in {cityName}</h2>
            <span>Showing 1–{Math.min(studios.length, 9)} · Eco-Certified first</span>
          </div>

          <div className="grid">
            {studios.map((s: any) => {
              const isTier1 = s.ecoTier === "tier_1";
              const chain = s.studioChain ? CHAIN_CONFIG[s.studioChain as keyof typeof CHAIN_CONFIG] : null;
              return (
                <article className="lcard" key={s.slug}>
                  <div className="rowtop">
                    <div>
                      <h3>
                        <Link href={`/studios/${s.slug}`}>{s.title}</Link>
                      </h3>
                      <div className="loc">📍 {s.city}, {s.state}</div>
                    </div>
                    <span className={`badge ${isTier1 ? "t1" : "t2"}`}>
                      {isTier1 ? "✓ Eco-Certified" : "◆ Eco Options"}
                    </span>
                  </div>
                  <div className="stars">
                    <span className="s">
                      {"★".repeat(Math.round(s.rating || 0))}
                      {"☆".repeat(5 - Math.round(s.rating || 0))}
                    </span>
                    <b>{(s.rating || 0).toFixed(1)}</b>
                    <span>({s.reviewCount || 0})</span>
                  </div>
                  <div className="chips">
                    {(s.serviceSpecialties || s.danceStyles || []).slice(0, 3).map((svc: string) => (
                      <span className="chip" key={svc}>{svc}</span>
                    ))}
                  </div>
                  <div className="meta">
                    <span className="chainbadge">
                      {chain?.label || "Independent"}
                    </span>
                    <Link className="btn btn-primary" href={`/studios/${s.slug}`}>
                      View Details
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* ===================== NEARBY CITIES ===================== */}
      {suburbs.length > 0 && (
        <section className="nearby">
          <div className="wrap">
            <span className="eyebrow">Explore Nearby</span>
            <h2 style={{ fontSize: "clamp(1.4rem, 5vw, 1.9rem)", color: "var(--dark)", marginTop: "0.4rem" }}>
              Eco pest control in other {state} cities
            </h2>
            <div className="citychips">
              {suburbs.map((sub) => (
                <Link className="citychip" href={`/studios/city/${sub}`} key={sub}>
                  {citySlugToName(sub)}
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ===================== SEO CONTENT ===================== */}
      <section className="seo">
        <div className="wrap">
          <div className="panel">
            <h2>Finding green pest control in {cityName}</h2>
            <p>
              {cityName} homeowners increasingly want pest control that protects their
              families, pets, and green spaces — without harsh synthetic chemicals.
              The Green Pest Directory lists <strong>{studios.length} eco-conscious
              providers</strong> across the {cityName} metro, from fully Eco-Certified
              specialists to established companies offering dedicated organic service lines.
            </p>

            <h3>Eco-Certified vs. Eco Options in {cityName}</h3>
            <p>
              <strong>Eco-Certified (Tier 1)</strong> companies build their entire business
              around green methods — Integrated Pest Management, botanical products, and
              pet-safe application are the default. <strong>Eco Options (Tier 2)</strong> are
              conventional providers that offer eco-friendly treatments on request. Use the
              filter above to see only the level of commitment you want.
            </p>

            <div className="faq" style={{ marginTop: "22px" }}>
              <h3>Frequently asked questions</h3>
              <details open>
                <summary>
                  How much does eco-friendly pest control cost in {cityName}?{" "}
                  <span className="plus">+</span>
                </summary>
                <div className="ans">
                  Most {cityName} eco providers charge $40–$85 per visit for recurring
                  service, or $150–$400 for one-time targeted treatments. Eco-Certified
                  companies are typically priced in line with conventional providers in the area.
                </div>
              </details>
              <details>
                <summary>
                  How are companies ranked on this page?{" "}
                  <span className="plus">+</span>
                </summary>
                <div className="ans">
                  By default we show Eco-Certified (Tier 1) companies first, then Eco Options
                  (Tier 2), each ordered by rating and review count. You can change this with
                  the sort dropdown above.
                </div>
              </details>
            </div>
          </div>
        </div>
      </section>

      {/* ===================== CTA ===================== */}
      <section style={{ padding: "0 0 56px" }}>
        <div className="wrap">
          <div className="ctastrip">
            <h2>Own a green pest company in {cityName}?</h2>
            <p>
              Get found by {cityName} homeowners searching for eco-friendly providers.
              Claim your free listing today.
            </p>
            <Link className="btn btn-light" href="/claim">
              List Your Company →
            </Link>
          </div>
        </div>
      </section>

      {/* Schema.org */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            name: `Eco-Friendly Pest Control in ${cityName}, ${state}`,
            description: `Directory of ${studios.length} eco-friendly pest control companies serving ${cityName}, ${state}.`,
            url: `https://greenpestdirectory.com/studios/city/${city}`,
            breadcrumb: {
              "@type": "BreadcrumbList",
              itemListElement: [
                { "@type": "ListItem", position: 1, name: "Home", item: "https://greenpestdirectory.com" },
                { "@type": "ListItem", position: 2, name: state, item: `https://greenpestdirectory.com/studios/city/${city}` },
                { "@type": "ListItem", position: 3, name: cityName, item: `https://greenpestdirectory.com/studios/city/${city}` },
              ],
            },
          }),
        }}
      />
    </>
  );
}
