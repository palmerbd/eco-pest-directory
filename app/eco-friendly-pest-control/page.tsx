import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Eco-Friendly Pest Control — What It Is & How to Find Green Providers",
  description: "Learn what eco-friendly pest control means, how it works, and find verified green providers near you. Compare Eco-Certified and conventional companies offering green options.",
  alternates: { canonical: "https://www.greenpestdirectory.com/eco-friendly-pest-control" },
};

export default function EcoFriendlyPestControlPage() {
  return (
    <>
      <section className="chero" style={{ padding: "40px 0 50px" }}>
        <div className="wrap" style={{ maxWidth: "800px" }}>
          <span className="eyebrow">Green Pest Control Guide</span>
          <h1>What Is <span className="hl">Eco-Friendly</span> Pest Control?</h1>
          <p>A complete guide to green, organic, and environmentally responsible pest management — and how to find verified providers in your area.</p>
        </div>
      </section>

      <section className="block">
        <div className="wrap" style={{ maxWidth: "800px" }}>

          <div className="panel" style={{ marginBottom: "24px" }}>
            <h2>Eco-Friendly Pest Control Explained</h2>
            <p style={{ color: "var(--muted)" }}>Eco-friendly pest control refers to pest management methods that minimize environmental impact while effectively controlling unwanted pests. Unlike conventional pest control that relies primarily on broad-spectrum synthetic chemicals, eco-friendly approaches prioritize targeted treatments, natural products, and prevention-first strategies.</p>
            <p style={{ color: "var(--muted)", marginTop: "12px" }}>The terms "green pest control," "eco-friendly pest control," and "environmentally responsible pest management" are often used interchangeably in the industry. The largest pest control company in the United States, Orkin, markets their green service line as "Orkin Green." The National Pest Management Association certifies companies through their "GreenPro" program — the industry's most recognized eco certification.</p>
          </div>

          <div className="panel" style={{ marginBottom: "24px" }}>
            <h2>How Green Pest Control Works</h2>
            <p style={{ color: "var(--muted)" }}>Green pest control typically combines several approaches rather than relying on a single method:</p>
            <div className="methods" style={{ marginTop: "12px" }}>
              <div className="method"><span className="mi">{"♻️"}</span><div><h3>Integrated Pest Management (IPM)</h3><p>The foundation of most eco programs. IPM starts with inspection and identification, seals entry points, removes food sources, and uses chemical treatments only as a last resort — and in targeted amounts.</p></div></div>
              <div className="method"><span className="mi">{"🌱"}</span><div><h3>Botanical & Organic Products</h3><p>Plant-derived pesticides like pyrethrin (from chrysanthemums), cedar oil, and essential oil formulations. These break down faster in the environment than synthetic alternatives.</p></div></div>
              <div className="method"><span className="mi">{"🐾"}</span><div><h3>Pet-Safe & Child-Safe Application</h3><p>Targeted application methods that minimize exposure — gel baits in enclosed stations, crack-and-crevice treatments, and EPA minimum-risk products that allow re-entry within an hour.</p></div></div>
              <div className="method"><span className="mi">{"🛡️"}</span><div><h3>Exclusion & Prevention</h3><p>Physical barriers like door sweeps, mesh screens, and caulking that prevent pest entry without any chemical use. The most "eco-friendly" treatment is one that isn't needed.</p></div></div>
            </div>
          </div>

          <div className="panel" style={{ marginBottom: "24px" }}>
            <h2>Our Two-Tier Classification System</h2>
            <p style={{ color: "var(--muted)", marginBottom: "16px" }}>The Green Pest Directory classifies every provider so you know exactly how committed they are to eco-friendly methods:</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <div style={{ background: "var(--t1-bg)", borderRadius: "12px", padding: "20px", border: "2px solid var(--t1-fg)" }}>
                <span className="badge t1" style={{ marginBottom: "8px" }}>{"✓"} Eco-Certified</span>
                <h3 style={{ fontSize: "1.05rem", marginTop: "10px", color: "var(--dark)" }}>Tier 1 — Eco-Certified</h3>
                <p style={{ color: "var(--muted)", fontSize: "0.9rem", marginTop: "6px" }}>Companies whose brand identity centers on eco, green, and organic pest control. Green methods are the default — not an upsell.</p>
              </div>
              <div style={{ background: "var(--t2-bg)", borderRadius: "12px", padding: "20px", border: "2px solid var(--t2-fg)" }}>
                <span className="badge t2" style={{ marginBottom: "8px" }}>{"◆"} Eco Options</span>
                <h3 style={{ fontSize: "1.05rem", marginTop: "10px", color: "var(--dark)" }}>Tier 2 — Eco Options Available</h3>
                <p style={{ color: "var(--muted)", fontSize: "0.9rem", marginTop: "6px" }}>Conventional companies that offer dedicated eco-friendly service lines — organic treatments, IPM, and pet-safe options on request.</p>
              </div>
            </div>
          </div>

          <div className="panel" style={{ marginBottom: "24px" }}>
            <h2>Does Eco-Friendly Pest Control Actually Work?</h2>
            <p style={{ color: "var(--muted)" }}>Yes — for the vast majority of residential pest problems. IPM-based approaches often produce longer-lasting results than spray-only conventional treatments because they address the root cause: how pests get in and what attracts them.</p>
            <p style={{ color: "var(--muted)", marginTop: "12px" }}>For severe infestations — large-scale termite damage, extensive bed bug infestations, or agricultural fumigation — conventional methods may still be necessary. Reputable eco providers will tell you honestly when a green approach isn't sufficient for your situation.</p>
          </div>

          <div className="panel" style={{ marginBottom: "24px" }}>
            <h2>How Much Does Eco-Friendly Pest Control Cost?</h2>
            <p style={{ color: "var(--muted)" }}>Eco-friendly pest control is typically priced within 10-20% of conventional services. Most providers charge $40-$85 per visit for recurring quarterly service, or $150-$400 for one-time targeted treatments. Many eco-certified companies are actually price-competitive with conventional providers because IPM reduces the volume of product applied per visit.</p>
          </div>

          <div className="panel" style={{ marginBottom: "24px" }}>
            <h2>Find Eco-Friendly Providers Near You</h2>
            <p style={{ color: "var(--muted)", marginBottom: "16px" }}>The Green Pest Directory lists over 800 eco-friendly pest control companies across 21 states. Use the links below to find providers in your area:</p>
            <div className="citychips">
              <Link className="citychip" href="/directory/tx/houston">Houston, TX</Link>
              <Link className="citychip" href="/directory/tx/dallas">Dallas, TX</Link>
              <Link className="citychip" href="/directory/tx/austin">Austin, TX</Link>
              <Link className="citychip" href="/directory/ca/los-angeles">Los Angeles, CA</Link>
              <Link className="citychip" href="/directory/ca/san-diego">San Diego, CA</Link>
              <Link className="citychip" href="/directory/ny/new-york">New York, NY</Link>
              <Link className="citychip" href="/directory/az/phoenix">Phoenix, AZ</Link>
              <Link className="citychip" href="/directory/il/chicago">Chicago, IL</Link>
              <Link className="citychip" href="/directory/co/denver">Denver, CO</Link>
              <Link className="citychip" href="/directory/wa/seattle">Seattle, WA</Link>
            </div>
            <p style={{ color: "var(--muted)", marginTop: "16px" }}><Link href="/directory" style={{ color: "var(--accent)", fontWeight: 600 }}>Browse all providers →</Link> or <Link href="/directory?eco=tier_1" style={{ color: "var(--accent)", fontWeight: 600 }}>view Eco-Certified companies only →</Link></p>
          </div>

          <div className="panel faq">
            <h2>Frequently Asked Questions</h2>
            <details open><summary>Is eco-friendly pest control safe for pets? <span className="plus">+</span></summary><div className="ans">Yes. Eco-friendly pest control typically uses botanical products, EPA minimum-risk formulations, and targeted application methods that are safe for pets. Most treatments allow pets to re-enter treated areas within 30-60 minutes. Always ask your provider about specific product safety for your pet type.</div></details>
            <details><summary>What is the difference between organic and eco-friendly pest control? <span className="plus">+</span></summary><div className="ans">The term "organic" in pest control refers specifically to treatments derived from natural sources — plant extracts, minerals, and biological agents. "Eco-friendly" is a broader term that includes organic products plus practices like IPM, exclusion techniques, and reduced-risk synthetic products. A company can be eco-friendly without being strictly organic.</div></details>
            <details><summary>How do I know if a pest control company is truly eco-friendly? <span className="plus">+</span></summary><div className="ans">Look for specific certifications like GreenPro (from the National Pest Management Association), Green Shield Certified, or EcoWise. On the Green Pest Directory, companies verified as "Eco-Certified" (Tier 1) have been confirmed through website analysis to center their business on green methods. "Eco Options" (Tier 2) companies have verified eco-friendly service lines available on request.</div></details>
            <details><summary>Does eco-friendly pest control work on termites? <span className="plus">+</span></summary><div className="ans">Yes, though treatment options differ from conventional approaches. Eco-friendly termite control often uses bait station systems (like Sentricon), botanical treatments, orange oil for localized drywood termites, and physical barriers during construction. For active, widespread infestations, consult with an eco provider about which approach is appropriate for your situation.</div></details>
            <details><summary>How often should I schedule eco-friendly pest control? <span className="plus">+</span></summary><div className="ans">Most eco providers recommend quarterly service (every 3 months) for general pest prevention. This is the same frequency as conventional pest control. The IPM approach means each visit includes inspection, monitoring, exclusion repairs, and targeted treatment only where needed — not blanket spraying.</div></details>
          </div>

        </div>
      </section>

      <section className="seo" style={{ paddingTop: 0 }}><div className="wrap"><div className="panel">
        <h3>Related guides</h3>
        <p style={{ color: "var(--muted)", marginBottom: "12px" }}>Explore specific eco-friendly pest control topics:</p>
        <div className="citychips">
          <Link className="citychip" href="/organic-pest-control">Organic Pest Control</Link>
          <Link className="citychip" href="/pet-safe-pest-control">Pet-Safe Treatments</Link>
          <Link className="citychip" href="/ipm-pest-control">IPM Explained</Link>
          <Link className="citychip" href="/termite-control">Eco Termite Control</Link>
          <Link className="citychip" href="/rodent-control">Green Rodent Control</Link>
          <Link className="citychip" href="/bed-bug-control">Bed Bug Solutions</Link>
          <Link className="citychip" href="/mosquito-control">Mosquito Control</Link>
        </div>
      </div></div></section>

      <section style={{ padding: "0 0 56px" }}>
        <div className="wrap">
          <div className="ctastrip">
            <h2>Run an eco-friendly pest control company?</h2>
            <p>Get found by homeowners searching for green providers. Claim your free listing.</p>
            <Link className="btn btn-light" href="/claim">List Your Company →</Link>
          </div>
        </div>
      </section>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": [
          { "@type": "Question", "name": "Is eco-friendly pest control safe for pets?", "acceptedAnswer": { "@type": "Answer", "text": "Yes. Eco-friendly pest control typically uses botanical products, EPA minimum-risk formulations, and targeted application methods that are safe for pets." }},
          { "@type": "Question", "name": "What is the difference between organic and eco-friendly pest control?", "acceptedAnswer": { "@type": "Answer", "text": "Organic refers to treatments derived from natural sources. Eco-friendly is broader — it includes organic products plus IPM, exclusion techniques, and reduced-risk synthetic products." }},
          { "@type": "Question", "name": "How do I know if a pest control company is truly eco-friendly?", "acceptedAnswer": { "@type": "Answer", "text": "Look for GreenPro, Green Shield Certified, or EcoWise certifications. On the Green Pest Directory, Eco-Certified (Tier 1) companies have been verified to center their business on green methods." }},
          { "@type": "Question", "name": "Does eco-friendly pest control work on termites?", "acceptedAnswer": { "@type": "Answer", "text": "Yes. Eco-friendly termite control uses bait station systems, botanical treatments, orange oil for localized drywood termites, and physical barriers." }},
          { "@type": "Question", "name": "How often should I schedule eco-friendly pest control?", "acceptedAnswer": { "@type": "Answer", "text": "Most eco providers recommend quarterly service (every 3 months) for general pest prevention." }},
        ],
      })}} />
    </>
  );
}
