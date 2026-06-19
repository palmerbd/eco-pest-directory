import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { citySlugToName, getMetroSlug, getMetroSuburbs } from "@/lib/wordpress";
import { CHAIN_CONFIG } from "@/types/studio";
import { getCityIntroCopy } from "@/lib/seo-copy";

export const revalidate = 3600;

const SVC = { general_pest:"General Pest", termite:"Termite", rodent:"Rodent", bed_bug:"Bed Bug", mosquito:"Mosquito", wildlife:"Wildlife", cockroach:"Cockroach", ant:"Ant", fumigation:"Fumigation", commercial:"Commercial", organic:"Organic", lawn_pest:"Lawn Pest" } as Record<string,string>;

async function fetchByCity(citySlug: string) {
  const wpUrl = process.env.WP_API_URL || process.env.NEXT_PUBLIC_WP_API_URL || "";
  const cityName = citySlugToName(citySlug).toLowerCase();
  try {
    const all: any[] = [];
    for (let page = 1; page <= 20; page++) {
      const res = await fetch(`${wpUrl}/wp/v2/pest_company?per_page=100&page=${page}&status=publish&_fields=id,slug,title,excerpt,acf`, { next: { revalidate: 3600 } });
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
    .replace(/&amp;/g, "&").replace(/&rsquo;/g, "'").replace(/&lsquo;/g, "'");
}

export async function generateMetadata({ params }: { params: Promise<{ state: string; city: string }> }): Promise<Metadata> {
  const { state, city } = await params;
  const cityName = citySlugToName(city);
  const studios = await fetchByCity(city);
  if (!studios.length) return { title: "City Not Found" };
  const st = studios[0]?.state || state.toUpperCase();
  const tier1 = studios.filter((s: any) => s.ecoTier === "tier_1").length;
  return {
    title: `Eco-Friendly Pest Control in ${cityName}, ${st} — ${studios.length} Green Providers`,
    description: `Compare ${studios.length} eco-friendly pest control companies in ${cityName}, ${st}. ${tier1} Eco-Certified providers offering organic, pet-safe, and IPM-based treatments. Find green exterminators near you.`,
    alternates: { canonical: `https://www.greenpestdirectory.com/directory/${state}/${city}` },
  };
}

export default async function CityPage({ params, searchParams }: { params: Promise<{ state: string; city: string }>; searchParams: Promise<{ eco?: string; service?: string }> }) {
  const { state: stateSlug, city } = await params;
  const sp = await searchParams;
  const ecoFilter = sp.eco || "";
  const cityName = citySlugToName(city);
  const studios = await fetchByCity(city);
  if (!studios.length) notFound();
  const st = studios[0]?.state || stateSlug.toUpperCase();
  const tier1 = studios.filter((s: any) => s.ecoTier === "tier_1").length;
  const tier2 = studios.length - tier1;
  const filtered = ecoFilter === "tier_1" ? studios.filter((s: any) => s.ecoTier === "tier_1")
    : ecoFilter === "tier_2" ? studios.filter((s: any) => s.ecoTier === "tier_2")
    : studios;
  const avg = (studios.reduce((sum: number, s: any) => sum + (s.rating || 0), 0) / studios.length).toFixed(1);
  const metroSlug = getMetroSlug(city);
  const suburbs = metroSlug ? getMetroSuburbs(metroSlug).filter((s) => s !== city).slice(0, 8) : [];
  const introCopy = getCityIntroCopy(city);

  /* Collect top services for this city */
  const svcCount: Record<string,number> = {};
  studios.forEach((s: any) => (s.serviceSpecialties || []).forEach((sv: string) => { svcCount[sv] = (svcCount[sv] || 0) + 1; }));
  const topServices = Object.entries(svcCount).sort((a, b) => b[1] - a[1]).slice(0, 4).map(([k]) => SVC[k] || k.replace(/_/g, " "));

  /* FAQ data */
  const faqItems = [
    { q: `How much does eco-friendly pest control cost in ${cityName}?`, a: `Most ${cityName} eco providers charge $40–$85 per visit for recurring quarterly service, or $150–$400 for one-time treatments. Pricing is typically within 10–20% of conventional pest control in the ${cityName} area.` },
    { q: `How many eco-friendly pest control companies are in ${cityName}?`, a: `The Green Pest Directory lists ${studios.length} eco-friendly pest control providers in ${cityName}, ${st} — ${tier1} are Eco-Certified (Tier 1) and ${tier2} offer Eco Options (Tier 2).` },
    { q: `What is the difference between Eco-Certified and Eco Options?`, a: `Eco-Certified (Tier 1) companies in ${cityName} build their entire business around green, organic, and low-toxicity methods — it's their default approach. Eco Options (Tier 2) are conventional providers that offer dedicated eco-friendly service lines on request.` },
    { q: `Are eco-friendly pest control treatments safe for pets and children?`, a: `Yes. Eco-friendly providers in ${cityName} use EPA minimum-risk products, botanical formulations, and targeted application methods like gel bait stations and crack-and-crevice treatments that minimize exposure. Most treatments allow re-entry within 30–60 minutes once surfaces dry.` },
    { q: `What pests do eco-friendly companies in ${cityName} treat?`, a: `${cityName} eco providers handle the full range of common pests including ${topServices.length > 0 ? topServices.join(", ").toLowerCase() : "general pest, termite, rodent, and mosquito"} control. Many also offer wildlife exclusion and lawn pest management using integrated pest management (IPM) techniques.` },
    { q: `How are companies ranked on this page?`, a: `By default we show Eco-Certified (Tier 1) providers first, then Eco Options (Tier 2), each ordered by customer rating. You can filter by eco tier or sort by name using the controls above.` },
  ];

  return (
    <>
      <section className="chero">
        <div className="wrap">
          <div className="crumb"><Link href="/">Home</Link><span>/</span><Link href={`/directory/${stateSlug}`}>{st}</Link><span>/</span>{cityName}</div>
          <h1>Eco-Friendly Pest Control in <span className="hl">{cityName}, {st}</span></h1>
          <p>{introCopy}</p>
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
            <Link href={`/directory/${stateSlug}/${city}`} style={!ecoFilter ? {background:"var(--accent)",color:"#fff",borderRadius:"999px",padding:"0.6rem 0.9rem",fontFamily:"Montserrat",fontWeight:700,fontSize:"0.8rem"} : {padding:"0.6rem 0.9rem",fontFamily:"Montserrat",fontWeight:700,fontSize:"0.8rem",color:"var(--muted)"}}>All ({studios.length})</Link>
            <Link href={`/directory/${stateSlug}/${city}?eco=tier_1`} style={ecoFilter==="tier_1" ? {background:"var(--accent)",color:"#fff",borderRadius:"999px",padding:"0.6rem 0.9rem",fontFamily:"Montserrat",fontWeight:700,fontSize:"0.8rem"} : {padding:"0.6rem 0.9rem",fontFamily:"Montserrat",fontWeight:700,fontSize:"0.8rem",color:"var(--muted)"}}>Eco-Certified ({tier1})</Link>
            <Link href={`/directory/${stateSlug}/${city}?eco=tier_2`} style={ecoFilter==="tier_2" ? {background:"var(--accent)",color:"#fff",borderRadius:"999px",padding:"0.6rem 0.9rem",fontFamily:"Montserrat",fontWeight:700,fontSize:"0.8rem"} : {padding:"0.6rem 0.9rem",fontFamily:"Montserrat",fontWeight:700,fontSize:"0.8rem",color:"var(--muted)"}}>Eco Options ({tier2})</Link>
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
            <h2>{filtered.length} eco-friendly providers in {cityName}</h2>
            <span>Showing 1–{Math.min(filtered.length, 9)} · Eco-Certified first</span>
          </div>
          <div className="grid">
            {filtered.map((s: any) => {
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
        <h2>Finding green pest control in {cityName}, {st}</h2>
        <p>{cityName} homeowners increasingly want pest control that protects their families, pets, and green spaces. The Green Pest Directory lists <strong>{studios.length} eco-conscious providers</strong> in the {cityName} metro — {tier1} fully Eco-Certified companies that build their business around green methods, plus {tier2} conventional providers offering dedicated eco-friendly service lines.</p>
        <h3>Eco-Certified vs. Eco Options in {cityName}</h3>
        <p><strong>Eco-Certified (Tier 1)</strong> companies center their brand on green, organic, and low-toxicity pest control — it is their default service, not an upsell. <strong>Eco Options (Tier 2)</strong> are conventional providers that maintain dedicated eco-friendly programs you can request. Both tiers are verified and listed to help {cityName} homeowners find the right level of green commitment.</p>
        <h3>What to expect from eco-friendly service in {cityName}</h3>
        <p>Eco providers in {cityName} typically use integrated pest management (IPM) — inspecting your property, identifying the specific pest species, sealing entry points, and applying targeted treatments only where needed. Products include botanical sprays, gel bait stations, diatomaceous earth, and EPA minimum-risk formulations that are safe for families, pets, and the local environment.</p>

        <div className="faq" style={{ marginTop: "22px" }}>
          <h3>Frequently asked questions</h3>
          {faqItems.map((item, i) => (
            <details key={i} open={i === 0}><summary>{item.q} <span className="plus">+</span></summary><div className="ans">{item.a}</div></details>
          ))}
        </div>
      </div></div></section>

      <section className="seo" style={{ paddingTop: 0 }}><div className="wrap"><div className="panel">
        <h3>Related guides</h3>
        <p style={{ color: "var(--muted)", marginBottom: "12px" }}>Learn more about green pest control methods used by {cityName} providers:</p>
        <div className="citychips">
          <Link className="citychip" href="/eco-friendly-pest-control">What Is Eco-Friendly Pest Control?</Link>
          <Link className="citychip" href="/organic-pest-control">Organic Pest Control Guide</Link>
          <Link className="citychip" href="/pet-safe-pest-control">Pet-Safe Treatments</Link>
          <Link className="citychip" href="/ipm-pest-control">IPM Explained</Link>
          <Link className="citychip" href="/termite-control">Eco Termite Control</Link>
          <Link className="citychip" href="/mosquito-control">Green Mosquito Control</Link>
        </div>
      </div></div></section>

      <section style={{ padding: "0 0 56px" }}><div className="wrap"><div className="ctastrip">
        <h2>Own a green pest company in {cityName}?</h2>
        <p>Get found by {cityName} homeowners searching for eco-friendly providers. Claim your free listing today.</p>
        <Link className="btn btn-light" href="/claim">List Your Company →</Link>
      </div></div></section>

      {/* BreadcrumbList Schema */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://www.greenpestdirectory.com" },
          { "@type": "ListItem", "position": 2, "name": st, "item": `https://www.greenpestdirectory.com/directory/${stateSlug}` },
          { "@type": "ListItem", "position": 3, "name": cityName, "item": `https://www.greenpestdirectory.com/directory/${stateSlug}/${city}` },
        ],
      })}} />

      {/* CollectionPage Schema */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        "name": `Eco-Friendly Pest Control in ${cityName}, ${st}`,
        "description": `Compare ${studios.length} eco-friendly pest control companies in ${cityName}, ${st}.`,
        "url": `https://www.greenpestdirectory.com/directory/${stateSlug}/${city}`,
        "numberOfItems": studios.length,
        "isPartOf": { "@type": "WebSite", "name": "Green Pest Directory", "url": "https://www.greenpestdirectory.com" },
      })}} />

      {/* FAQPage Schema */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": faqItems.map((item) => ({
          "@type": "Question",
          "name": item.q,
          "acceptedAnswer": { "@type": "Answer", "text": item.a },
        })),
      })}} />
    </>
  );
}
