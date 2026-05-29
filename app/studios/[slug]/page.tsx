import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getStudio, getAllStudioSlugs } from "@/lib/wordpress";
import { Studio, CHAIN_CONFIG, AMENITY_LABELS } from "@/types/studio";
import LeadCaptureForm from "@/components/LeadCaptureForm";

export const revalidate = 86400;

export async function generateStaticParams() {
  return [];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const studio = await getStudio(slug);
  if (!studio) return { title: "Company Not Found" };

  const location = [studio.city, studio.state].filter(Boolean).join(", ");
  const isTier1 = (studio as any).ecoTier === "tier_1";
  const tierLabel = isTier1 ? "Eco-Certified" : "Eco Options Available";

  const isThinContent =
    !studio.phone && !studio.website &&
    (!studio.rating || studio.rating < 0.1) &&
    (!studio.reviewCount || studio.reviewCount === 0);

  if (isThinContent) {
    return {
      title: `${studio.title}${location ? " — " + location : ""} | Green Pest Directory`,
      robots: { index: false, follow: true },
      alternates: { canonical: `https://www.greenpestdirectory.com/studios/${slug}` },
    };
  }

  return {
    title: `${studio.title} — ${tierLabel} Pest Control in ${location} | Green Pest Directory`,
    description: studio.description ||
      `${studio.title} is ${isTier1 ? "an Eco-Certified" : "a"} pest control company in ${location}. Read reviews, hours, and request a free quote.`,
    alternates: { canonical: `https://www.greenpestdirectory.com/studios/${slug}` },
  };
}

export default async function CompanyDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const studio = await getStudio(slug);
  if (!studio) notFound();

  const s = studio as any;
  const location = [s.city, s.state].filter(Boolean).join(", ");
  const isTier1 = s.ecoTier === "tier_1";
  const chain = s.studioChain ? CHAIN_CONFIG[s.studioChain as keyof typeof CHAIN_CONFIG] : null;
  const citySlug = s.city?.toLowerCase().replace(/\s+/g, "-") || "";

  const stars = "★".repeat(Math.round(s.rating || 0)) + "☆".repeat(5 - Math.round(s.rating || 0));

  // Hours
  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  const today = new Date().getDay(); // 0=Sun, 1=Mon...
  const todayIdx = today === 0 ? 6 : today - 1;

  // Eco methods (from eco_services or amenities)
  const ecoMethods = [
    { key: "organic_treatments", icon: "🌱", label: "Organic Treatments", desc: "Plant-derived, EPA minimum-risk formulations." },
    { key: "ipm", icon: "♻️", label: "Integrated Pest Management", desc: "Prevention-first approach that reduces chemical use." },
    { key: "pet_safe", icon: "🐾", label: "Pet-Safe Application", desc: "Treatments safe for dogs, cats, and backyard pets." },
    { key: "botanical_products", icon: "🌼", label: "Botanical Products", desc: "Essential-oil based barriers that protect pollinators." },
    { key: "child_safe", icon: "👶", label: "Child-Safe Treatments", desc: "Low-toxicity solutions safe for children." },
    { key: "low_toxicity", icon: "🛡️", label: "Low-Toxicity Solutions", desc: "EPA reduced-risk products with minimal environmental impact." },
  ];

  const activeEcoMethods = ecoMethods.filter((m) =>
    (s.ecoServices || []).includes(m.key) ||
    (s.amenities || []).includes(m.key)
  );

  // If no eco data yet, show defaults for Tier 1
  const displayMethods = activeEcoMethods.length > 0
    ? activeEcoMethods
    : isTier1
    ? ecoMethods.slice(0, 4)
    : ecoMethods.slice(0, 2);

  return (
    <>
      {/* Breadcrumb */}
      <div className="wrap">
        <div className="crumb">
          <Link href="/">Home</Link><span>/</span>
          {s.state && <><Link href={`/studios/city/${citySlug}`}>{s.state}</Link><span>/</span></>}
          {s.city && <><Link href={`/studios/city/${citySlug}`}>{s.city}</Link><span>/</span></>}
          {s.title}
        </div>
      </div>

      {/* ===================== DETAIL HERO ===================== */}
      <section className="dhero">
        <div className="wrap">
          <div className="dhero-card">
            <div className="dh-top">
              <div className="dh-title">
                <span className={`badge ${isTier1 ? "t1" : "t2"}`}>
                  {isTier1 ? "✓ Eco-Certified" : "◆ Eco Options Available"}
                </span>
                <h1>{s.title}</h1>
                <div className="dh-loc">
                  📍 {s.address ? `${s.address}, ` : ""}{location}
                  {chain && (
                    <span className="badge t2" style={{ marginLeft: "0.3rem" }}>
                      {chain.label}
                    </span>
                  )}
                  {!chain && (
                    <span className="badge t2" style={{ marginLeft: "0.3rem" }}>
                      Independent
                    </span>
                  )}
                </div>
                <div className="dh-rating">
                  <span className="s">{stars}</span>
                  <b>{(s.rating || 0).toFixed(1)}</b>
                  <span>· {s.reviewCount || 0} reviews · Verified listing</span>
                </div>
              </div>
            </div>

            <div className="dh-contact">
              {s.phone && (
                <a className="pill" href={`tel:${s.phone}`}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#15803d" strokeWidth="2">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.97.36 1.92.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.89.34 1.84.57 2.81.7A2 2 0 0 1 22 16.92Z"/>
                  </svg>
                  {s.phone}
                </a>
              )}
              {s.website && (
                <a className="pill" href={s.website} target="_blank" rel="noopener noreferrer">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#15803d" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15 15 0 0 1 0 20 15 15 0 0 1 0-20Z"/>
                  </svg>
                  Website
                </a>
              )}
            </div>

            <div className="dh-actions">
              <a className="btn btn-primary" href="#quote">Request a Free Quote →</a>
              {s.phone && <a className="btn btn-ghost" href={`tel:${s.phone}`}>Call Now</a>}
            </div>
          </div>
        </div>
      </section>

      {/* ===================== MAIN LAYOUT ===================== */}
      <div className="wrap">
        <div className="layout">

          {/* MAIN COLUMN */}
          <div className="main">
            {/* About */}
            <div className="panel">
              <h2><span className="em">📋</span>About this company</h2>
              <p style={{ color: "var(--muted)" }}>
                {s.description || `${s.title} is ${isTier1 ? "an Eco-Certified" : "a"} pest control company serving the ${s.city || ""} area.`}
              </p>
            </div>

            {/* Service specialties */}
            <div className="panel">
              <h2><span className="em">🐜</span>Service specialties</h2>
              <div className="tags">
                {(s.serviceSpecialties || s.danceStyles || []).map((svc: string) => (
                  <span className="tag" key={svc}>{svc}</span>
                ))}
              </div>
            </div>

            {/* Eco methods */}
            <div className="panel">
              <h2><span className="em">🌿</span>Eco methods they use</h2>
              <div className="methods">
                {displayMethods.map((m) => (
                  <div className="method" key={m.key}>
                    <span className="mi">{m.icon}</span>
                    <div>
                      <h3>{m.label}</h3>
                      <p>{m.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Map */}
            <div className="panel">
              <h2><span className="em">📍</span>Service area</h2>
              <div className="map">
                <span className="pin">📍</span>
                <span className="maplabel">
                  {s.address ? `${s.address}, ` : ""}{location}
                </span>
              </div>
            </div>

            {/* FAQ */}
            <div className="panel faq">
              <h2><span className="em">❓</span>Eco practices — FAQ</h2>
              <details open>
                <summary>
                  Are {s.title}&apos;s treatments safe for kids and pets?
                  <span className="plus">+</span>
                </summary>
                <div className="ans">
                  {isTier1
                    ? `As an Eco-Certified provider, ${s.title} leads with botanical and EPA minimum-risk products. In most cases your family and pets can re-enter treated areas within an hour of application.`
                    : `${s.title} offers eco-friendly treatment options that use lower-toxicity products. Ask about their pet-safe and child-safe service lines when requesting a quote.`
                  }
                </div>
              </details>
              <details>
                <summary>
                  What makes {s.title} &quot;{isTier1 ? "Eco-Certified" : "Eco Options"}&quot;?
                  <span className="plus">+</span>
                </summary>
                <div className="ans">
                  {isTier1
                    ? `${s.title}'s entire business is built around green pest control — IPM and low-toxicity products are their default standard, not a paid add-on. They're classified Tier 1 in the Green Pest Directory.`
                    : `${s.title} offers dedicated eco-friendly service lines alongside their conventional treatments. They're classified as "Eco Options Available" (Tier 2) in the Green Pest Directory.`
                  }
                </div>
              </details>
              <details>
                <summary>
                  Do green treatments work as well as conventional ones?
                  <span className="plus">+</span>
                </summary>
                <div className="ans">
                  For the vast majority of residential pest problems, yes. IPM addresses the root cause — entry points and food sources — so results often last longer than spray-only approaches.
                </div>
              </details>
            </div>
          </div>

          {/* SIDEBAR */}
          <aside className="side">
            <div className="quote" id="quote">
              <h2>Request a Free Quote</h2>
              <p>No-obligation estimate from {s.title}.</p>
              <form className="qform" action={`/api/contact/${slug}`} method="post">
                <input type="text" name="name" placeholder="Your name" required />
                <input type="tel" name="phone" placeholder="Phone number" required />
                <input type="text" name="zip" placeholder="ZIP code" />
                <textarea name="message" placeholder="What pest problem are you dealing with?"></textarea>
                <button className="btn btn-primary" type="submit">Get My Free Quote</button>
              </form>
              <div className="reassure">🔒 Free · No spam · Replies within 24 hrs</div>
            </div>

            <div className="panel">
              <h2><span className="em">🕘</span>Hours of operation</h2>
              <ul className="hours">
                {days.map((day, i) => {
                  const hourKey = `hours${day.toLowerCase()}` as keyof Studio;
                  const hours = (s as any)[hourKey] || (s as any)[`hours_${day.toLowerCase()}`];
                  const isToday = i === todayIdx;
                  return (
                    <li key={day} className={isToday ? "today" : ""}>
                      <span className="day">{day}{isToday ? " (today)" : ""}</span>
                      <span className={hours && hours !== "Closed" ? "open" : "closed"}>
                        {hours || "Hours not listed"}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
          </aside>

        </div>
      </div>

      {/* Schema.org */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ProfessionalService",
            name: s.title,
            "@id": `https://greenpestdirectory.com/studios/${slug}`,
            url: s.website || `https://greenpestdirectory.com/studios/${slug}`,
            telephone: s.phone || undefined,
            address: {
              "@type": "PostalAddress",
              streetAddress: s.address || undefined,
              addressLocality: s.city || undefined,
              addressRegion: s.state || undefined,
              postalCode: s.zip || undefined,
              addressCountry: "US",
            },
            ...(s.rating && {
              aggregateRating: {
                "@type": "AggregateRating",
                ratingValue: String(s.rating),
                reviewCount: String(s.reviewCount || 0),
              },
            }),
            areaServed: s.city ? { "@type": "City", name: s.city } : undefined,
          }),
        }}
      />
    </>
  );
}
