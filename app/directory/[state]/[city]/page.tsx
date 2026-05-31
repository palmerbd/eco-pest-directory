import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getStudiosByCity, citySlugToName, getAllStudios, getMetroSlug, getMetroSuburbs } from "@/lib/wordpress";
import { CHAIN_CONFIG } from "@/types/studio";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ state: string; city: string }> }): Promise<Metadata> {
  const { state, city } = await params;
  const cityName = citySlugToName(city);
  const studios = await getStudiosByCity(city);
  if (!studios.length) return { title: "City Not Found" };
  const st = studios[0]?.state || state.toUpperCase();
  return {
    title: `Eco-Friendly Pest Control in ${cityName}, ${st} — ${studios.length} Green Providers`,
    description: `Compare ${studios.length} eco-friendly pest control companies in ${cityName}, ${st}. Filter by Eco-Certified providers, services, and ratings.`,
    alternates: { canonical: `https://www.greenpestdirectory.com/directory/${state}/${city}` },
  };
}

function decodeEntities(s: string) {
  return s.replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/&#x([0-9a-fA-F]+);/g, (_, n) => String.fromCharCode(parseInt(n, 16)))
    .replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&apos;/g, "'")
    .replace(/&rsquo;/g, "’").replace(/&lsquo;/g, "‘");
}

export default async function CityPage({ params }: { params: Promise<{ state: string; city: string }> }) {
  const { state: stateSlug, city } = await params;
  const cityName = citySlugToName(city);
  const studios = await getStudiosByCity(city);
  if (!studios.length) notFound();
  const st = studios[0]?.state || stateSlug.toUpperCase();
  const tier1 = studios.filter((s: any) => s.ecoTier === "tier_1").length;
  const avg = (studios.reduce((sum: number, s: any) => sum + (s.rating || 0), 0) / studios.length).toFixed(1);
  const metroSlug = getMetroSlug(city);
  const suburbs = metroSlug ? getMetroSuburbs(metroSlug).filter((s) => s !== city).slice(0, 8) : [];

  return (
    <>
      <section className="chero">
        <div className="wrap">
          <div className="crumb"><Link href="/">Home</Link><span>/</span><Link href={`/directory`}>{st}</Link><span>/</span>{cityName}</div>
          <h1>Eco-Friendly Pest Control in <span className="hl">{cityName}, {st}</span></h1>
          <p>Compare green, organic, and pet-safe pest control companies serving {cityName}. Eco-Certified providers listed first.</p>
          <div className="cstats">
            <div className="cstat"><b>{studios.length}</b><span>Companies</span></div>
            <div className="cstat"><b>{tier1}</b><span>Eco-Certified</span></div>
            <div className="cstat"><b>{avg}★</b><span>Avg. rating</span></div>
          </div>
        </div>
      </section>
      <section className="block" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <div className="results-meta"><h2>{studios.length} providers in {cityName}</h2></div>
          <div className="grid">
            {studios.map((s: any) => {
              const t1 = s.ecoTier === "tier_1";
              const chain = s.studioChain ? CHAIN_CONFIG[s.studioChain as keyof typeof CHAIN_CONFIG] : null;
              return (
                <article className="lcard" key={s.slug}>
                  <div className="rowtop">
                    <div><h3><Link href={`/directory/${stateSlug}/${city}/${s.slug}`}>{decodeEntities(s.title)}</Link></h3><div className="loc">📍 {s.city}, {s.state}</div></div>
                    <span className={`badge ${t1 ? "t1" : "t2"}`}>{t1 ? "✓ Eco-Certified" : "◆ Eco Options"}</span>
                  </div>
                  <div className="meta"><span className="chainbadge">{chain?.label || "Independent"}</span><Link className="btn btn-primary" href={`/directory/${stateSlug}/${city}/${s.slug}`}>View Details</Link></div>
                </article>);
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
      <section style={{ padding: "0 0 56px" }}><div className="wrap"><div className="ctastrip"><h2>Own a green pest company in {cityName}?</h2><p>Claim your free listing today.</p><Link className="btn btn-light" href="/claim">List Your Company →</Link></div></div></section>
    </>
  );
}
