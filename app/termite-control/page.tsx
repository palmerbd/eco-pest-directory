import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Eco-Friendly Termite Control — Green Treatments That Protect Your Home",
  description: "Compare eco-friendly termite control methods including bait stations, orange oil, heat treatment, and borates. Find verified green termite specialists near you.",
  alternates: { canonical: "https://www.greenpestdirectory.com/termite-control" },
};

export default function TermiteControlPage() {
  return (
    <>
      <section className="chero" style={{ padding: "40px 0 50px" }}>
        <div className="wrap" style={{ maxWidth: "800px" }}>
          <span className="eyebrow">Termite Control Guide</span>
          <h1><span className="hl">Eco-Friendly Termite Control</span>: Green Alternatives to Tent Fumigation</h1>
          <p>Modern green termite treatments eliminate colonies and prevent future damage without filling your home with toxic gases. Here is how they work and where to find specialists who use them.</p>
        </div>
      </section>


      <div className="wrap" style={{ maxWidth: "800px" }}>
        <div style={{
          marginTop: "-20px", position: "relative", zIndex: 5,
          background: "#fff", border: "1px solid var(--line)", borderRadius: "16px",
          padding: "14px", boxShadow: "var(--shadow-sm)",
          display: "flex", flexWrap: "wrap", gap: "10px", alignItems: "center",
        }}>
          <form action="/api/search" method="get" style={{
            display: "flex", flex: "1 1 300px", alignItems: "center", gap: "0.5rem",
            background: "var(--card)", border: "1px solid var(--line)", borderRadius: "10px",
            padding: "0.45rem 0.7rem",
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2.2">
              <circle cx="11" cy="11" r="7"/><path d="m20 20-3-3"/>
            </svg>
            <input
              type="text" name="q"
              placeholder="Search by city or state..."
              style={{
                border: "none", outline: "none", background: "transparent",
                fontFamily: "Inter, sans-serif", fontSize: "0.9rem",
                width: "100%", color: "var(--ink)",
              }}
            />
            <button type="submit" className="btn btn-primary" style={{
              padding: "0.4rem 0.85rem", fontSize: "0.78rem", whiteSpace: "nowrap",
            }}>Search</button>
          </form>

          <Link href="/directory?eco=tier_1" style={{
            display: "inline-flex", alignItems: "center", gap: "0.4rem",
            padding: "0.55rem 0.85rem", borderRadius: "10px", fontSize: "0.82rem",
            fontFamily: "Montserrat, sans-serif", fontWeight: 700, whiteSpace: "nowrap",
            border: "1px solid var(--line)", background: "#fff", color: "var(--muted)",
          }}>
            {"✓"} Eco-Certified
          </Link>

          <Link href="/directory?eco=tier_2" style={{
            display: "inline-flex", alignItems: "center", gap: "0.4rem",
            padding: "0.55rem 0.85rem", borderRadius: "10px", fontSize: "0.82rem",
            fontFamily: "Montserrat, sans-serif", fontWeight: 700, whiteSpace: "nowrap",
            border: "1px solid var(--line)", background: "#fff", color: "var(--muted)",
          }}>
            {"◆"} Eco Options
          </Link>
        </div>
      </div>
      <section className="block">
        <div className="wrap" style={{ maxWidth: "800px" }}>

          <div className="panel" style={{ marginBottom: "24px" }}>
            <h2>Why Go Green for Termite Control?</h2>
            <p style={{ color: "var(--muted)" }}>Termites cause more than $5 billion in property damage across the United States every year, and most homeowner insurance policies do not cover the repairs. For decades, the standard response has been tent fumigation with sulfuryl fluoride or soil drenching with organophosphate termiticides — methods that are effective but expose families, pets, and surrounding ecosystems to significant chemical loads.</p>
            <p style={{ color: "var(--muted)", marginTop: "12px" }}>Eco-friendly termite control has advanced dramatically in the past fifteen years. Bait station systems, orange oil treatments, structural heat treatment, and borate-based wood preservatives now offer equally effective results for the majority of termite situations. These methods target termites precisely, break down safely, and let you stay in or return to your home much faster than conventional fumigation.</p>
          </div>

          <div className="panel" style={{ marginBottom: "24px" }}>
            <h2>Eco-Friendly Termite Treatment Methods</h2>
            <p style={{ color: "var(--muted)" }}>Four proven green approaches cover virtually every termite scenario a homeowner will face:</p>
            <div className="methods" style={{ marginTop: "12px" }}>
              <div className="method"><span className="mi">{"🏠"}</span><div><h3>Bait Station Systems</h3><p>Systems like Sentricon and Trelona ATBS use in-ground stations around your home's perimeter. Worker termites find the bait, carry it back to the colony, and share it through normal feeding — eliminating the entire colony from the inside out. Stations also serve as ongoing monitors to detect new activity before damage occurs.</p></div></div>
              <div className="method"><span className="mi">{"🍊"}</span><div><h3>Orange Oil (d-Limonene)</h3><p>Extracted from orange rinds, d-Limonene is injected directly into infested wood to kill drywood termites on contact. It dissolves their exoskeletons and disrupts their cell membranes. Because it is applied locally, there is no need to tent the house — you can remain home during treatment with normal ventilation.</p></div></div>
              <div className="method"><span className="mi">{"🔥"}</span><div><h3>Heat Treatment</h3><p>Portable heaters raise the temperature of infested wood to 120°F or higher, killing termites at every life stage — eggs, larvae, and adults — without any chemicals at all. Treatment takes 4-8 hours for a typical home, and you can re-enter the same day with zero chemical residue left behind.</p></div></div>
              <div className="method"><span className="mi">{"🧪"}</span><div><h3>Borate Wood Treatments</h3><p>Mineral-based products like Tim-bor and Bora-Care are applied directly to wood surfaces where they penetrate and provide long-lasting preventive protection. Borates are naturally occurring minerals with extremely low mammalian toxicity, making them safe for homes with children and pets while remaining lethal to termites that feed on treated wood.</p></div></div>
            </div>
          </div>

          <div className="panel" style={{ marginBottom: "24px" }}>
            <h2>Subterranean vs. Drywood Termites</h2>
            <p style={{ color: "var(--muted)" }}>Choosing the right green treatment starts with identifying which type of termite you are dealing with. The two main categories behave differently and respond to different methods:</p>
            <p style={{ color: "var(--muted)", marginTop: "12px" }}><strong>Subterranean termites</strong> live in soil and build mud tubes to reach wood above ground. They are the most destructive species in the U.S. and are found in every state except Alaska. Eco-friendly control focuses on bait station systems that intercept foraging workers, and targeted liquid barriers using reduced-risk products like Altriset (chlorantraniliprole), which has a favorable environmental and toxicological profile compared to older termiticides.</p>
            <p style={{ color: "var(--muted)", marginTop: "12px" }}><strong>Drywood termites</strong> live entirely inside wood and do not require ground contact. They are most common in coastal and southern states. Green treatment options include orange oil injection for localized infestations, heat treatment for larger affected areas, and spot treatments with borates. These methods target the colony directly in the wood without requiring whole-structure fumigation.</p>
          </div>

          <div className="panel" style={{ marginBottom: "24px" }}>
            <h2>When Eco-Friendly Methods May Not Be Enough</h2>
            <p style={{ color: "var(--muted)" }}>Honesty matters more than ideology. In cases of severe, widespread drywood termite infestation affecting multiple areas of a structure — particularly when colonies have established themselves deep in inaccessible wall voids, roof framing, and structural members — tent fumigation with sulfuryl fluoride may be the only method that reaches every colony reliably.</p>
            <p style={{ color: "var(--muted)", marginTop: "12px" }}>A good eco-friendly provider will perform a thorough inspection, identify the scope of infestation, and tell you honestly whether green methods can fully resolve the problem. If they recommend fumigation, that is a sign of integrity, not a failure of green pest control. For localized infestations and ongoing prevention, eco-friendly methods are the right choice in the vast majority of situations.</p>
          </div>

          <div className="panel" style={{ marginBottom: "24px" }}>
            <h2>Find Green Termite Specialists</h2>
            <p style={{ color: "var(--muted)", marginBottom: "16px" }}>Browse verified providers in the Green Pest Directory who specialize in eco-friendly termite control:</p>
            <div className="citychips">
              <Link className="citychip" href="/directory/tx/houston">Houston, TX</Link>
              <Link className="citychip" href="/directory/fl/miami">Miami, FL</Link>
              <Link className="citychip" href="/directory/ca/los-angeles">Los Angeles, CA</Link>
              <Link className="citychip" href="/directory/ga/atlanta">Atlanta, GA</Link>
              <Link className="citychip" href="/directory/az/phoenix">Phoenix, AZ</Link>
              <Link className="citychip" href="/directory/fl/orlando">Orlando, FL</Link>
              <Link className="citychip" href="/directory/tx/dallas">Dallas, TX</Link>
              <Link className="citychip" href="/directory/nc/charlotte">Charlotte, NC</Link>
              <Link className="citychip" href="/directory/la/new-orleans">New Orleans, LA</Link>
              <Link className="citychip" href="/directory/fl/tampa">Tampa, FL</Link>
            </div>
            <p style={{ color: "var(--muted)", marginTop: "16px" }}><Link href="/directory" style={{ color: "var(--accent)", fontWeight: 600 }}>Browse all providers →</Link> or <Link href="/directory?eco=tier_1" style={{ color: "var(--accent)", fontWeight: 600 }}>view Eco-Certified companies →</Link></p>
          </div>

          <div className="panel faq">
            <h2>Frequently Asked Questions</h2>
            <details open><summary>How much does eco-friendly termite treatment cost? <span className="plus">+</span></summary><div className="ans">Costs range from $300 to $1,500 depending on the treatment method, size of your home, and severity of the infestation. Orange oil spot treatments for localized drywood infestations start around $300-$600. Whole-home heat treatment typically runs $800-$1,500. Bait station systems like Sentricon cost $1,200-$1,500 for initial installation plus $250-$400 per year for ongoing monitoring and bait replenishment.</div></details>
            <details><summary>Can bait stations eliminate an active termite colony? <span className="plus">+</span></summary><div className="ans">Yes. Systems like Sentricon, Trelona ATBS, and Advance have extensive EPA-reviewed data demonstrating full colony elimination. Worker termites carry the active ingredient (typically noviflumuron or novaluron) back to the colony where it is shared through trophallaxis — mutual feeding — reaching the queen and reproductive castes. Complete colony elimination typically occurs within 3 to 12 months depending on colony size and environmental conditions.</div></details>
            <details><summary>Does orange oil work on subterranean termites? <span className="plus">+</span></summary><div className="ans">No. Orange oil (d-Limonene) is effective only against drywood termites because it is injected directly into infested wood where drywood colonies live. Subterranean termites nest in the soil and travel to wood through mud tubes, so a wood-injected treatment does not reach their colony. For subterranean termites, bait station systems or soil-applied liquid barriers are the appropriate eco-friendly options.</div></details>
            <details><summary>How long does heat treatment take? <span className="plus">+</span></summary><div className="ans">A typical whole-home heat treatment takes 4 to 8 hours, depending on the size of the structure and construction type. The target temperature of 120°F or higher must be sustained in the infested wood for at least one hour to ensure all life stages are eliminated. You can re-enter your home the same day once it cools down, and there is no chemical residue — making it one of the fastest-turnaround termite treatments available.</div></details>
            <details><summary>Should I choose eco-friendly or conventional termite treatment? <span className="plus">+</span></summary><div className="ans">For localized drywood termite infestations, eco-friendly methods like orange oil and heat treatment match or exceed conventional spot treatments in effectiveness. For subterranean termites, bait station systems have proven colony-elimination records comparable to conventional liquid barriers. Where eco-friendly methods have a genuine limitation is severe whole-structure drywood infestations affecting multiple inaccessible areas — in those cases, tent fumigation with sulfuryl fluoride may be the most reliable option. A qualified inspector can assess your situation and recommend the right approach.</div></details>
          </div>

        </div>
      </section>

      <section className="seo" style={{ paddingTop: 0 }}><div className="wrap"><div className="panel">
        <h3>Related guides</h3>
        <p style={{ color: "var(--muted)", marginBottom: "12px" }}>Explore more eco-friendly pest control topics:</p>
        <div className="citychips">
          <Link className="citychip" href="/eco-friendly-pest-control">What Is Eco-Friendly Pest Control?</Link>
          <Link className="citychip" href="/organic-pest-control">Organic Pest Control</Link>
          <Link className="citychip" href="/pet-safe-pest-control">Pet-Safe Treatments</Link>
          <Link className="citychip" href="/ipm-pest-control">IPM Explained</Link>
          <Link className="citychip" href="/rodent-control">Green Rodent Control</Link>
          <Link className="citychip" href="/bed-bug-control">Bed Bug Solutions</Link>
          <Link className="citychip" href="/mosquito-control">Mosquito Control</Link>
        </div>
      </div></div></section>

      <section style={{ padding: "0 0 56px" }}>
        <div className="wrap">
          <div className="ctastrip">
            <h2>Specialize in eco-friendly termite control?</h2>
            <p>Homeowners are actively searching for green termite specialists they can trust. Claim your free listing in the Green Pest Directory.</p>
            <Link className="btn btn-light" href="/claim">List Your Company →</Link>
          </div>
        </div>
      </section>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": [
          { "@type": "Question", "name": "How much does eco-friendly termite treatment cost?", "acceptedAnswer": { "@type": "Answer", "text": "Costs range from $300 to $1,500 depending on method and home size. Orange oil starts around $300-$600, heat treatment runs $800-$1,500, and bait station systems cost $1,200-$1,500 for installation plus $250-$400 per year for monitoring." }},
          { "@type": "Question", "name": "Can bait stations eliminate an active termite colony?", "acceptedAnswer": { "@type": "Answer", "text": "Yes. Systems like Sentricon and Trelona ATBS have EPA-reviewed data showing full colony elimination within 3 to 12 months through worker termites carrying the active ingredient back to the colony." }},
          { "@type": "Question", "name": "Does orange oil work on subterranean termites?", "acceptedAnswer": { "@type": "Answer", "text": "No. Orange oil is effective only against drywood termites because it is injected into infested wood. Subterranean termites nest in soil and require bait stations or soil-applied liquid barriers." }},
          { "@type": "Question", "name": "How long does heat treatment take?", "acceptedAnswer": { "@type": "Answer", "text": "A typical home takes 4 to 8 hours. You can re-enter the same day once it cools — no chemical residue remains." }},
          { "@type": "Question", "name": "Should I choose eco-friendly or conventional termite treatment?", "acceptedAnswer": { "@type": "Answer", "text": "For localized drywood or subterranean termites, eco-friendly methods match conventional effectiveness. For severe whole-structure drywood infestations, tent fumigation may be necessary. A qualified inspector can assess your situation." }},
        ],
      })}} />
    </>
  );
}
