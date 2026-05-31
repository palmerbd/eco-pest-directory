import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { CHAIN_CONFIG } from "@/types/studio";

export const dynamic = "force-dynamic";

function decodeEntities(s: string) {
  return s.replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/&#x([0-9a-fA-F]+);/g, (_, n) => String.fromCharCode(parseInt(n, 16)))
    .replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&apos;/g, "'")
    .replace(/&rsquo;/g, "'").replace(/&lsquo;/g, "'");
}

export async function generateMetadata({ params }: { params: Promise<{ state: string; city: string; slug: string }> }): Promise<Metadata> {
  const { state, city, slug } = await params;
  const studio = await getStudio(slug);
  if (!studio) return { title: "Company Not Found" };
  const loc = [studio.city, studio.state].filter(Boolean).join(", ");
  const t1 = (studio as any).ecoTier === "tier_1";
  return {
    title: `${decodeEntities(studio.title)} — ${t1 ? "Eco-Certified" : "Eco Options"} in ${loc}`,
    description: studio.description || `${decodeEntities(studio.title)} is a pest control company in ${loc}.`,
    alternates: { canonical: `https://www.greenpestdirectory.com/directory/${state}/${city}/${slug}` },
  };
}

export default async function CompanyPage({ params }: { params: Promise<{ state: string; city: string; slug: string }> }) {
  const { state: stateSlug, city: citySlug, slug } = await params;
  const wpUrl = process.env.WP_API_URL || process.env.NEXT_PUBLIC_WP_API_URL || "";
  let s: any = null;
  try {
    const res = await fetch(\`\${wpUrl}/wp/v2/pest_company?slug=\${slug}&status=publish&_fields=id,slug,title,excerpt,acf\`, { cache: "no-store" });
    const posts = await res.json();
    if (!posts.length) notFound();
    const post = posts[0];
    const acf = post.acf || {};
    const specs = typeof acf.service_specialties === "string" ? acf.service_specialties.split(",").filter(Boolean) : (acf.service_specialties || []);
    s = {
      title: (post.title?.rendered || "").replace(/&#(\d+);/g, (_:any,n:any) => String.fromCharCode(Number(n))).replace(/&amp;/g,"&"),
      city: acf.studio_city || "", state: acf.studio_state || "", zip: acf.studio_zip || "",
      address: acf.studio_address || "", phone: acf.studio_phone || "", website: acf.studio_website || "",
      rating: Number(acf.studio_rating) || 0, reviewCount: Number(acf.studio_review_count) || 0,
      ecoTier: acf.eco_tier || "unclassified", studioChain: acf.studio_chain || "independent",
      description: (post.excerpt?.rendered || "").replace(/<[^>]+>/g,"").trim(),
      serviceSpecialties: specs, danceStyles: specs,
      hours: { monday: acf.hours_monday, tuesday: acf.hours_tuesday, wednesday: acf.hours_wednesday,
               thursday: acf.hours_thursday, friday: acf.hours_friday, saturday: acf.hours_saturday, sunday: acf.hours_sunday },
    };
  } catch { notFound(); }
  const loc = [s.city, s.state].filter(Boolean).join(", ");
  const t1 = s.ecoTier === "tier_1";
  const chain = s.studioChain ? CHAIN_CONFIG[s.studioChain as keyof typeof CHAIN_CONFIG] : null;
  const title = decodeEntities(s.title);
  const stars = "★".repeat(Math.round(s.rating || 0)) + "☆".repeat(5 - Math.round(s.rating || 0));
  const days = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];
  const ecoMethods = [
    { icon: "🌱", label: "Organic Treatments", desc: "Plant-derived, EPA minimum-risk formulations." },
    { icon: "♻️", label: "Integrated Pest Management", desc: "Prevention-first approach." },
    { icon: "🐾", label: "Pet-Safe Application", desc: "Safe for dogs, cats, and pets." },
    { icon: "🌼", label: "Botanical Products", desc: "Essential-oil based barriers." },
  ];

  return (
    <>
      <div className="wrap"><div className="crumb">
        <Link href="/">Home</Link><span>/</span>
        <Link href={`/directory/${stateSlug}`}>{s.state}</Link><span>/</span>
        <Link href={`/directory/${stateSlug}/${citySlug}`}>{s.city}</Link><span>/</span>
        {title}
      </div></div>
      <section className="dhero"><div className="wrap"><div className="dhero-card">
        <div className="dh-top"><div className="dh-title">
          <span className={`badge ${t1 ? "t1" : "t2"}`}>{t1 ? "✓ Eco-Certified" : "◆ Eco Options Available"}</span>
          <h1>{title}</h1>
          <div className="dh-loc">📍 {s.address ? `${s.address}, ` : ""}{loc}
            <span className="badge t2" style={{ marginLeft: "0.3rem" }}>{chain?.label || "Independent"}</span>
          </div>
          <div className="dh-rating"><span className="s">{stars}</span><b>{(s.rating || 0).toFixed(1)}</b><span>· {s.reviewCount || 0} reviews</span></div>
        </div></div>
        <div className="dh-contact">
          {s.phone && <a className="pill" href={`tel:${s.phone}`}>📞 {s.phone}</a>}
          {s.website && <a className="pill" href={s.website} target="_blank" rel="noopener noreferrer">🌐 Website</a>}
        </div>
        <div className="dh-actions">
          <a className="btn btn-primary" href="#quote">Request a Free Quote →</a>
          {s.phone && <a className="btn btn-ghost" href={`tel:${s.phone}`}>Call Now</a>}
        </div>
      </div></div></section>
      <div className="wrap"><div className="layout">
        <div className="main">
          <div className="panel"><h2><span className="em">📋</span>About</h2><p style={{ color: "var(--muted)" }}>{s.description || `${title} is ${t1 ? "an Eco-Certified" : "a"} pest control company serving ${s.city || ""}.`}</p></div>
          <div className="panel"><h2><span className="em">🌿</span>Eco methods</h2>
            <div className="methods">{(t1 ? ecoMethods : ecoMethods.slice(0, 2)).map((m) => (
              <div className="method" key={m.label}><span className="mi">{m.icon}</span><div><h3>{m.label}</h3><p>{m.desc}</p></div></div>
            ))}</div>
          </div>
          <div className="panel"><h2><span className="em">📍</span>Service area</h2><div className="map"><span className="pin">📍</span><span className="maplabel">{s.address ? `${s.address}, ` : ""}{loc}</span></div></div>
          <div className="panel faq"><h2><span className="em">❓</span>FAQ</h2>
            <details open><summary>Are treatments safe for kids and pets? <span className="plus">+</span></summary><div className="ans">{t1 ? `As an Eco-Certified provider, ${title} leads with botanical and EPA minimum-risk products.` : `${title} offers eco-friendly treatment options. Ask about pet-safe service lines.`}</div></details>
            <details><summary>Do green treatments work as well as conventional? <span className="plus">+</span></summary><div className="ans">For most residential pest problems, yes. IPM addresses root causes so results often last longer.</div></details>
          </div>
        </div>
        <aside className="side">
          <div className="quote" id="quote"><h2>Request a Free Quote</h2><p>No-obligation estimate from {title}.</p>
            <form className="qform"><input type="text" placeholder="Your name" /><input type="tel" placeholder="Phone number" /><input type="text" placeholder="ZIP code" /><textarea placeholder="What pest problem?"></textarea><button className="btn btn-primary" type="button">Get My Free Quote</button></form>
            <div className="reassure">🔒 Free · No spam · Replies within 24 hrs</div>
          </div>
          <div className="panel"><h2><span className="em">🕘</span>Hours</h2>
            <ul className="hours">{days.map((day) => {
              const h = s.hours?.[day.toLowerCase()] || (s as any)[`hours_${day.toLowerCase()}`];
              return <li key={day}><span className="day">{day}</span><span className={h && h !== "Closed" ? "open" : "closed"}>{h || "Not listed"}</span></li>;
            })}</ul>
          </div>
        </aside>
      </div></div>
    </>
  );
}
