import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CHAIN_CONFIG } from "@/types/studio";

export const revalidate = 3600;

const SVC: Record<string,string> = { general_pest:"General Pest", termite:"Termite", rodent:"Rodent", bed_bug:"Bed Bug", mosquito:"Mosquito", wildlife:"Wildlife", cockroach:"Cockroach", ant:"Ant", fumigation:"Fumigation", commercial:"Commercial", organic:"Organic", lawn_pest:"Lawn Pest" };

function dec(s: string) {
  return s.replace(/&#(\d+);/g, (_:any, n:any) => String.fromCharCode(Number(n)))
    .replace(/&amp;/g, "&").replace(/&rsquo;/g, "'").replace(/&lsquo;/g, "'");
}

async function fetchCompany(slug: string) {
  const wpUrl = process.env.WP_API_URL || process.env.NEXT_PUBLIC_WP_API_URL || "";
  try {
    const res = await fetch(`${wpUrl}/wp/v2/pest_company?slug=${slug}&status=publish&_fields=id,slug,title,excerpt,acf`, { next: { revalidate: 3600 } });
    const posts = await res.json();
    if (!posts?.length) return null;
    const post = posts[0];
    const acf = post.acf || {};
    const specs = typeof acf.service_specialties === "string" ? acf.service_specialties.split(",").filter(Boolean) : (acf.service_specialties || ["general_pest"]);
    return {
      studioId:    post.id,
      title:       dec(post.title?.rendered || ""),
      city:        acf.studio_city || "", state: acf.studio_state || "",
      address:     acf.studio_address || "", zip: acf.studio_zip || "",
      phone:       acf.studio_phone || "", website: acf.studio_website || "",
      rating:      Number(acf.studio_rating) || 0, reviewCount: Number(acf.studio_review_count) || 0,
      ecoTier:     acf.eco_tier || "unclassified",
      studioTier:  acf.studio_tier || "free",
      studioChain: acf.studio_chain || "independent",
      description: dec((post.excerpt?.rendered || "").replace(/<[^>]+>/g, "").trim()),
      services:    specs,
      hours: { monday: acf.hours_monday||"", tuesday: acf.hours_tuesday||"", wednesday: acf.hours_wednesday||"",
               thursday: acf.hours_thursday||"", friday: acf.hours_friday||"", saturday: acf.hours_saturday||"", sunday: acf.hours_sunday||"" },
    };
  } catch { return null; }
}

export async function generateMetadata({ params }: { params: Promise<{ state: string; city: string; slug: string }> }): Promise<Metadata> {
  const { state, city, slug } = await params;
  const s = await fetchCompany(slug);
  if (!s) return { title: "Company Not Found" };
  const loc = [s.city, s.state].filter(Boolean).join(", ");
  return {
    title: `${s.title} — ${s.ecoTier === "tier_1" ? "Eco-Certified" : "Eco Options"} in ${loc}`,
    description: s.description || `${s.title} is a pest control company in ${loc}.`,
    alternates: { canonical: `https://www.greenpestdirectory.com/directory/${state}/${city}/${slug}` },
  };
}

export default async function CompanyPage({ params }: { params: Promise<{ state: string; city: string; slug: string }> }) {
  const { state: stateSlug, city: citySlug, slug } = await params;
  const s = await fetchCompany(slug);
  if (!s) notFound();
  const loc = [s.city, s.state].filter(Boolean).join(", ");
  const t1 = s.ecoTier === "tier_1";
  const isClaimed = s.studioTier === "claimed" || s.studioTier === "paid";
  const chain = CHAIN_CONFIG[s.studioChain as keyof typeof CHAIN_CONFIG];
  const stars = "★".repeat(Math.round(s.rating)) + "☆".repeat(5 - Math.round(s.rating));
  const days = ["monday","tuesday","wednesday","thursday","friday","saturday","sunday"];
  const ecoMethods = [
    { icon: "🌱", label: "Organic Treatments", desc: "Plant-derived, EPA minimum-risk formulations." },
    { icon: "♻️", label: "Integrated Pest Management", desc: "Prevention-first approach." },
    { icon: "🐾", label: "Pet-Safe Application", desc: "Safe for dogs, cats, and pets." },
    { icon: "🌼", label: "Botanical Products", desc: "Essential-oil based barriers." },
  ];

  const claimHref = `/claim?id=${s.studioId}&slug=${slug}&title=${encodeURIComponent(s.title)}&city=${citySlug}&state=${stateSlug}`;
  const mapsQuery = encodeURIComponent((s.address ? `${s.address} ` : "") + loc);

  return (
    <>
      <div className="wrap"><div className="crumb">
        <Link href="/">Home</Link><span>/</span>
        <Link href="/directory">{s.state}</Link><span>/</span>
        <Link href={`/directory/${stateSlug}/${citySlug}`}>{s.city}</Link><span>/</span>
        {s.title}
      </div></div>

      <section className="dhero"><div className="wrap"><div className="dhero-card">
        <div className="dh-top"><div className="dh-title">
          <span className={`badge ${t1 ? "t1" : "t2"}`}>{t1 ? "✓ Eco-Certified" : "◆ Eco Options Available"}</span>
          {isClaimed && (
            <span className="badge" style={{ background: "#e8f5e9", color: "#2e7d32", border: "1px solid #a5d6a7", marginLeft: "6px" }}>
              ✓ Verified Owner
            </span>
          )}
          <h1>{s.title}</h1>
          <div className="dh-loc">📍 {s.address ? `${s.address}, ` : ""}{loc}
            <span className="badge t2" style={{ marginLeft: "0.3rem" }}>{chain?.label || "Independent"}</span>
          </div>
          <div className="dh-rating"><span className="s">{stars}</span><b>{s.rating.toFixed(1)}</b><span>· {s.reviewCount} reviews</span></div>
        </div></div>
        <div className="dh-contact">
          {s.phone && <a className="pill" href={`tel:${s.phone}`}>📞 {s.phone}</a>}
          {s.website && <a className="pill" href={s.website} target="_blank" rel="noopener noreferrer">🌐 Website</a>}
        </div>
        <div className="dh-actions">
          {isClaimed
            ? <a className="btn btn-primary" href="#quote">Request a Free Quote →</a>
            : <a className="btn btn-primary" href="#contact">{s.phone ? "📞 Call Now" : "📍 View Contact Info"}</a>
          }
          {isClaimed && s.phone && <a className="btn btn-ghost" href={`tel:${s.phone}`}>Call Now</a>}
          {!isClaimed && s.website && <a className="btn btn-ghost" href={s.website} target="_blank" rel="noopener noreferrer">Visit Website</a>}
        </div>
      </div></div></section>

      <div className="wrap"><div className="layout">
        <div className="main">
          <div className="panel"><h2>📋 About</h2><p style={{ color: "var(--muted)" }}>{s.description || `${s.title} is ${t1 ? "an Eco-Certified" : "a"} pest control company serving ${s.city}.`}</p></div>
          <div className="panel"><h2>🐜 Services</h2><div className="tags">{s.services.map((svc: string) => (<span className="tag" key={svc}>{SVC[svc] || svc.replace(/_/g," ")}</span>))}</div></div>
          <div className="panel"><h2>🌿 Eco methods</h2><div className="methods">{(t1 ? ecoMethods : ecoMethods.slice(0,2)).map(m => (<div className="method" key={m.label}><span className="mi">{m.icon}</span><div><h3>{m.label}</h3><p>{m.desc}</p></div></div>))}</div></div>
          <div className="panel"><h2>📍 Service area</h2><div className="map"><span className="pin">📍</span><span className="maplabel">{s.address ? `${s.address}, ` : ""}{loc}</span></div></div>
          <div className="panel faq"><h2>❓ FAQ</h2>
            <details open><summary>Are treatments safe for kids and pets? <span className="plus">+</span></summary><div className="ans">{t1 ? `As an Eco-Certified provider, ${s.title} leads with botanical and EPA minimum-risk products.` : `${s.title} offers eco-friendly treatment options. Ask about pet-safe service lines.`}</div></details>
            <details><summary>Do green treatments work as well as conventional? <span className="plus">+</span></summary><div className="ans">For most residential pest problems, yes. IPM addresses root causes so results often last longer.</div></details>
          </div>
        </div>

        <aside className="side">
          {isClaimed ? (
            <div className="quote" id="quote">
              <h2>Request a Free Quote</h2>
              <p>No-obligation estimate from {s.title}.</p>
              <form className="qform">
                <input type="text" placeholder="Your name" />
                <input type="tel" placeholder="Phone number" />
                <input type="text" placeholder="ZIP code" />
                <textarea placeholder="What pest problem?"></textarea>
                <button className="btn btn-primary" type="button">Get My Free Quote</button>
              </form>
              <div className="reassure">🔒 Free · No spam · Replies within 24 hrs</div>
            </div>
          ) : (
            <>
              <div className="quote" id="contact">
                <h2>📞 Contact & Location</h2>
                {s.phone && (
                  <a className="btn btn-primary" href={`tel:${s.phone}`}
                    style={{ display: "block", textAlign: "center", marginBottom: "10px" }}>
                    📞 Call {s.phone}
                  </a>
                )}
                {s.website && (
                  <a className="btn btn-ghost" href={s.website} target="_blank" rel="noopener noreferrer"
                    style={{ display: "block", textAlign: "center", marginBottom: "16px" }}>
                    🌐 Visit Website
                  </a>
                )}
                {(s.address || loc) && (
                  <div className="map" style={{ marginTop: "8px" }}>
                    <span className="pin">📍</span>
                    <span className="maplabel">{s.address ? `${s.address}, ` : ""}{loc}</span>
                  </div>
                )}
                <a href={`https://www.google.com/maps/search/${mapsQuery}`} target="_blank" rel="noopener noreferrer"
                  style={{ display: "block", textAlign: "center", marginTop: "10px", fontSize: "0.85rem", color: "var(--accent)", fontWeight: 600 }}>
                  View on Google Maps →
                </a>
              </div>

              <div className="panel" style={{
                marginTop: "16px", background: "#f0faf2",
                border: "1.5px dashed var(--accent)", textAlign: "center", padding: "24px 20px",
              }}>
                <div style={{ fontSize: "1.8rem", marginBottom: "10px" }}>🏢</div>
                <h3 style={{ color: "var(--dark)", marginBottom: "6px", fontSize: "1rem" }}>Own this business?</h3>
                <p style={{ color: "var(--muted)", fontSize: "0.83rem", marginBottom: "16px", lineHeight: "1.5" }}>
                  Claim your free listing to update your info, add eco certifications, and connect with homeowners.
                </p>
                <Link href={claimHref} className="btn btn-primary"
                  style={{ display: "block", textAlign: "center" }}>
                  Claim This Listing →
                </Link>
              </div>
            </>
          )}

          <div className="panel"><h2>🕘 Hours</h2>
            <ul className="hours">{days.map(day => {
              const h = (s.hours as any)[day] || "";
              return <li key={day}><span className="day">{day.charAt(0).toUpperCase()+day.slice(1)}</span><span className={h && h !== "Closed" ? "open" : "closed"}>{h || "Not listed"}</span></li>;
            })}</ul>
          </div>
        </aside>
      </div></div>
    </>
  );
}
