import Link from "next/link";
import { getAllStudios } from "@/lib/wordpress";

export default async function HomePage() {
  const studios = await getAllStudios();
  const featured = studios.slice(0, 8);

  return (
    <>
      {/* ===================== HERO ===================== */}
      <section className="hero">
        <div className="wrap">
          <div className="hero-grid">
            <div className="hero-copy">
              <span className="hero-pill">
                🛡️ America&apos;s first eco-only pest control directory
              </span>
              <h1>
                Find <span className="hl">Eco-Friendly</span> Pest Control Near
                You
              </h1>
              <p className="sub">
                Browse thousands of pest control companies offering green,
                organic, and pet-safe treatments. Compare eco-certified
                providers nationwide.
              </p>
              <form className="search" action="/directory" method="get">
                <div className="field">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#15803d"
                    strokeWidth="2.2"
                  >
                    <circle cx="11" cy="11" r="7" />
                    <path d="m20 20-3-3" />
                  </svg>
                  <input
                    type="text"
                    name="q"
                    placeholder="Enter city or ZIP code"
                    aria-label="City or ZIP"
                  />
                </div>
                <button className="btn btn-primary" type="submit">
                  Search
                </button>
              </form>
              <div className="trust">
                <span className="item">
                  <span className="dot"></span>
                  <b>14,000+</b> Companies
                </span>
                <span className="item">
                  <span className="dot"></span>
                  <b>Eco-Verified</b> Listings
                </span>
                <span className="item">
                  <span className="dot"></span>
                  <b>Free</b> to Search
                </span>
              </div>
            </div>

            <div className="hero-art">
              <svg
                viewBox="0 0 480 460"
                xmlns="http://www.w3.org/2000/svg"
                role="img"
                aria-label="Illustration of an eco-protected home with a green leaf shield"
              >
                <circle cx="250" cy="210" r="195" fill="#4ade80" opacity="0.12"/>
                <circle cx="250" cy="210" r="150" fill="#4ade80" opacity="0.10"/>
                <circle cx="92" cy="96" r="40" fill="#bef264"/>
                <path d="M20 372 Q240 312 460 372 L460 460 L20 460 Z" fill="#15803d"/>
                <path d="M20 392 Q240 344 460 392 L460 460 L20 460 Z" fill="#166534"/>
                <g transform="rotate(18 360 200)">
                  <path d="M360 70 C 452 92 470 250 360 312 C 300 250 296 150 360 70 Z" fill="#4ade80"/>
                  <path d="M360 84 C 430 110 446 232 360 296" fill="none" stroke="#15803d" strokeWidth="3" opacity="0.55"/>
                  <path d="M360 96 L390 132 M360 150 L398 178 M360 206 L392 226" stroke="#15803d" strokeWidth="3" strokeLinecap="round" opacity="0.5"/>
                </g>
                <g>
                  <rect x="118" y="330" width="7" height="48" rx="3" fill="#166534"/>
                  <circle cx="121" cy="322" r="26" fill="#4ade80"/>
                  <circle cx="103" cy="338" r="18" fill="#22c55e"/>
                  <circle cx="140" cy="338" r="18" fill="#22c55e"/>
                </g>
                <g>
                  <rect x="158" y="232" width="168" height="148" rx="12" fill="#ffffff"/>
                  <rect x="158" y="232" width="168" height="148" rx="12" fill="#f0fdf4" opacity="0.5"/>
                  <path d="M146 240 L242 158 L338 240 Z" fill="#052e16"/>
                  <path d="M242 158 L338 240 L320 240 L242 176 Z" fill="#0a3d1f"/>
                  <rect x="296" y="176" width="22" height="46" rx="4" fill="#0a3d1f"/>
                  <rect x="184" y="312" width="46" height="68" rx="8" fill="#15803d"/>
                  <circle cx="221" cy="348" r="4" fill="#bef264"/>
                  <rect x="256" y="300" width="52" height="52" rx="8" fill="#dcfce7" stroke="#15803d" strokeWidth="3"/>
                  <path d="M282 300 L282 352 M256 326 L308 326" stroke="#15803d" strokeWidth="3"/>
                </g>
                <g transform="translate(300 120)">
                  <path d="M40 4 L74 16 V44 C74 70 58 84 40 92 C22 84 6 70 6 44 V16 Z" fill="#ffffff"/>
                  <path d="M40 12 L67 22 V44 C67 65 53 77 40 84 C27 77 13 65 13 44 V22 Z" fill="#16a34a"/>
                  <path d="M28 46 L37 56 L54 34" fill="none" stroke="#ffffff" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round"/>
                </g>
                <g transform="translate(150 150)">
                  <ellipse cx="0" cy="0" rx="16" ry="11" fill="#facc15"/>
                  <path d="M-6 -10 A16 11 0 0 1 -6 10 Z" fill="#052e16" opacity="0.85"/>
                  <path d="M6 -10 A16 11 0 0 1 6 10 Z" fill="#052e16" opacity="0.85"/>
                  <ellipse cx="-4" cy="-12" rx="11" ry="7" fill="#ffffff" opacity="0.85" transform="rotate(-25 -4 -12)"/>
                  <ellipse cx="6" cy="-12" rx="11" ry="7" fill="#ffffff" opacity="0.85" transform="rotate(25 6 -12)"/>
                </g>
                <path d="M408 300 q14 -10 26 2 q-14 10 -26 -2 Z" fill="#bef264" opacity="0.9"/>
                <path d="M70 250 q12 -9 22 2 q-12 9 -22 -2 Z" fill="#4ade80" opacity="0.8"/>
              </svg>
            </div>
          </div>
        </div>
      </section>

      {/* ===================== TWO-TIER EXPLAINER ===================== */}
      <section className="block" id="tiers">
        <div className="wrap">
          <div className="head">
            <span className="eyebrow">Our Classification System</span>
            <h2>Two ways we verify green pest control</h2>
            <p>
              Every company is classified so you know exactly how committed they
              are to eco-friendly methods — before you ever pick up the phone.
            </p>
          </div>
          <div className="tiers">
            <div className="tier t1">
              <div className="topbar"></div>
              <span className="badge t1">✓ Eco-Certified</span>
              <h3>Tier 1 — Eco-Certified</h3>
              <p>
                Companies whose entire brand and business model centers on eco,
                green, and organic pest control. Green methods are the default,
                not an upsell.
              </p>
            </div>
            <div className="tier t2">
              <div className="topbar"></div>
              <span className="badge t2">◆ Eco Options Available</span>
              <h3>Tier 2 — Eco Options Available</h3>
              <p>
                Established conventional companies that offer dedicated
                eco-friendly service lines — organic treatments, IPM, and
                pet-safe options on request.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ===================== LISTING GRID ===================== */}
      <section
        className="block"
        id="companies"
        style={{ background: "linear-gradient(180deg,#fff,#f7faf8)" }}
      >
        <div className="wrap">
          <div className="head">
            <span className="eyebrow">Featured Listings</span>
            <h2>Eco-friendly providers near you</h2>
            <p>
              Filter by certification level and service type. Eco-Certified
              companies always surface first.
            </p>
          </div>

          <div className="filterbar">
            <div className="seg">
              <button className="active">All</button>
              <button>Eco-Certified Only</button>
              <button>Eco Options</button>
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

          <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))" }}>
            {featured.length > 0
              ? featured.map((s: any) => (
                  <article className="lcard" key={s.slug}>
                    <div className="rowtop">
                      <div>
                        <h3>{s.title}</h3>
                        <div className="loc">
                          📍 {s.city}, {s.state}
                        </div>
                      </div>
                      <span className={`badge ${s.ecoTier === "tier_1" ? "t1" : "t2"}`}>
                        {s.ecoTier === "tier_1" ? "✓ Eco-Certified" : "◆ Eco Options"}
                      </span>
                    </div>
                    <div className="stars">
                      <span className="s">{"★".repeat(Math.round(s.rating))}{"☆".repeat(5 - Math.round(s.rating))}</span>
                      <b>{s.rating}</b>
                      <span>({s.reviewCount})</span>
                    </div>
                    <div className="chips">
                      {(s.serviceSpecialties || []).slice(0, 3).map((svc: string) => (
                        <span className="chip" key={svc}>{svc}</span>
                      ))}
                    </div>
                    <div className="meta">
                      <span className="chainbadge">{s.chain || "Independent"}</span>
                      <Link className="btn btn-primary" href={`/directory/${s.slug}`}>
                        View Details
                      </Link>
                    </div>
                  </article>
                ))
              : /* Static placeholder cards when no data yet */
                [
                  { name: "Green Shield Pest Solutions", loc: "Austin, TX", tier: "t1", rating: "4.9", reviews: "213", services: ["General Pest", "Termite"], eco: ["🌱 Organic", "Pet-Safe", "IPM"], chain: "Independent" },
                  { name: "EcoGuard Pest Management", loc: "Portland, OR", tier: "t1", rating: "4.8", reviews: "341", services: ["Mosquito", "Rodent"], eco: ["🌱 Botanical", "Organic Treatments", "Pet-Safe"], chain: "Independent" },
                  { name: "Natural Defense Pest Co.", loc: "Denver, CO", tier: "t1", rating: "4.7", reviews: "128", services: ["Bed Bug", "Ant"], eco: ["🌱 IPM", "Botanical Products"], chain: "Independent" },
                  { name: "EcoShield (Phoenix)", loc: "Phoenix, AZ", tier: "t1", rating: "4.6", reviews: "902", services: ["General Pest", "Scorpion"], eco: ["🌱 Pet-Safe", "IPM"], chain: "EcoShield" },
                  { name: "Nature's Way Exterminators", loc: "Asheville, NC", tier: "t1", rating: "4.9", reviews: "176", services: ["Termite", "Wildlife"], eco: ["🌱 Organic", "Botanical Products", "Pet-Safe"], chain: "Independent" },
                  { name: "Aptive Environmental", loc: "Sacramento, CA", tier: "t2", rating: "4.4", reviews: "1.2k", services: ["General Pest", "Mosquito"], eco: ["🌱 IPM", "Eco Service Line"], chain: "Aptive" },
                  { name: "Orkin (Denver)", loc: "Denver, CO", tier: "t2", rating: "4.3", reviews: "2.1k", services: ["Termite", "Rodent"], eco: ["🌱 Pet-Safe", "Organic Treatments"], chain: "Orkin" },
                  { name: "ABC Home & Commercial", loc: "San Antonio, TX", tier: "t2", rating: "4.2", reviews: "688", services: ["General Pest", "Bed Bug"], eco: ["🌱 IPM", "Pet-Safe"], chain: "Independent" },
                ].map((c, i) => (
                  <article className="lcard" key={i}>
                    <div className="rowtop">
                      <div>
                        <h3>{c.name}</h3>
                        <div className="loc">📍 {c.loc}</div>
                      </div>
                      <span className={`badge ${c.tier}`}>
                        {c.tier === "t1" ? "✓ Eco-Certified" : "◆ Eco Options"}
                      </span>
                    </div>
                    <div className="stars">
                      <span className="s">{"★".repeat(Math.round(Number(c.rating)))}{"☆".repeat(5 - Math.round(Number(c.rating)))}</span>
                      <b>{c.rating}</b>
                      <span>({c.reviews})</span>
                    </div>
                    <div className="chips">
                      {c.services.map((s) => (
                        <span className="chip" key={s}>{s}</span>
                      ))}
                      {c.eco.slice(0, 1).map((e) => (
                        <span className="chip eco" key={e}>{e}</span>
                      ))}
                    </div>
                    <div className="chips">
                      {c.eco.slice(1).map((e) => (
                        <span className="chip eco" key={e}>{e}</span>
                      ))}
                    </div>
                    <div className="meta">
                      <span className="chainbadge">{c.chain}</span>
                      <Link className="btn btn-primary" href="/directory">
                        View Details
                      </Link>
                    </div>
                  </article>
                ))}
          </div>
        </div>
      </section>

      {/* ===================== HUB TEASER ===================== */}
      <section className="block">
        <div className="wrap">
          <div className="head">
            <span className="eyebrow">Browse By Specialty</span>
            <h2>Explore green pest control hubs</h2>
            <p>
              Curated collections of providers grouped by the eco methods
              homeowners search for most.
            </p>
          </div>
          <div className="hubs">
            <Link className="hub" href="/organic-pest-control">
              <span className="ic">🌱</span>
              <h3>Organic Pest Control</h3>
              <span className="go">Explore →</span>
            </Link>
            <Link className="hub" href="/pet-safe-pest-control">
              <span className="ic">🐾</span>
              <h3>Pet-Safe Pest Control</h3>
              <span className="go">Explore →</span>
            </Link>
            <Link className="hub" href="/ipm-pest-control">
              <span className="ic">♻️</span>
              <h3>IPM Companies</h3>
              <span className="go">Explore →</span>
            </Link>
            <Link className="hub" href="/termite-control">
              <span className="ic">🪵</span>
              <h3>Eco Termite Control</h3>
              <span className="go">Explore →</span>
            </Link>
            <Link className="hub" href="/mosquito-control">
              <span className="ic">🦟</span>
              <h3>Natural Mosquito Control</h3>
              <span className="go">Explore →</span>
            </Link>
          </div>
        </div>
      </section>

      {/* ===================== CTA STRIP ===================== */}
      <section className="block" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <div className="ctastrip">
            <h2>Run a green pest control company?</h2>
            <p>
              Get found by homeowners actively searching for eco-friendly
              providers. Claim your free listing in minutes.
            </p>
            <Link className="btn btn-light" href="/claim">
              List Your Company →
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
