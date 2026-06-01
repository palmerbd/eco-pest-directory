import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Pet-Safe Pest Control — Treatments Safe for Dogs, Cats & Pets",
  description: "Find pet-safe pest control methods that protect your dogs, cats, birds, and fish. Learn about re-entry times, low-toxicity products, and how to prepare your home.",
  alternates: { canonical: "https://www.greenpestdirectory.com/pet-safe-pest-control" },
};

export default function PetSafePestControlPage() {
  return (
    <>
      <section className="chero" style={{ padding: "40px 0 50px" }}>
        <div className="wrap" style={{ maxWidth: "800px" }}>
          <span className="eyebrow">Pet Safety Guide</span>
          <h1><span className="hl">Pet-Safe</span> Pest Control: Protecting Your Animals</h1>
          <p>What every pet owner needs to know about pest treatments — which methods are safe, which chemicals to avoid, and how to keep dogs, cats, birds, and fish protected during and after service.</p>
        </div>
      </section>

      <section className="block">
        <div className="wrap" style={{ maxWidth: "800px" }}>

          <div className="panel" style={{ marginBottom: "24px" }}>
            <h2>What Makes Pest Control Pet-Safe?</h2>
            <p style={{ color: "var(--muted)" }}>Pet-safe pest control is not a single product — it is an approach that combines low-toxicity formulations, targeted application methods, and careful timing to minimize animal exposure. The goal is eliminating pests while keeping every member of your household safe, including the four-legged, feathered, and finned ones.</p>
            <p style={{ color: "var(--muted)", marginTop: "12px" }}>Responsible providers achieve pet safety through three strategies: choosing products with low mammalian toxicity, applying treatments in enclosed bait stations or crack-and-crevice locations pets cannot access, and scheduling service with appropriate re-entry windows so residues dry or dissipate before pets return to treated areas.</p>
          </div>

          <div className="panel" style={{ marginBottom: "24px" }}>
            <h2>Risks by Pet Type</h2>
            <p style={{ color: "var(--muted)" }}>Different animals face different risks from pest control products. Understanding your pet's specific vulnerabilities helps you ask the right questions before service:</p>
            <div className="methods" style={{ marginTop: "12px" }}>
              <div className="method"><span className="mi">{"🐕"}</span><div><h3>Dogs</h3><p>Dogs face exposure primarily through floor contact and licking treated surfaces. Their size provides some buffer — a 70-pound dog tolerates more than a 10-pound dog. Keep dogs off treated floors until products dry completely, typically 30-60 minutes. Gel bait stations are ideal because dogs cannot reach the product inside.</p></div></div>
              <div className="method"><span className="mi">{"🐈"}</span><div><h3>Cats</h3><p>Cats are significantly more sensitive to pesticides than dogs because they lack certain liver enzymes that break down chemical compounds. Permethrin, commonly used in conventional pest control, is particularly toxic to cats even in small amounts. Always confirm your provider avoids permethrin-based products if you have cats in the home.</p></div></div>
              <div className="method"><span className="mi">{"🐦"}</span><div><h3>Birds</h3><p>Birds have extremely efficient respiratory systems that absorb airborne chemicals far more readily than mammals. Aerosol sprays, foggers, and any volatilized pesticide pose serious risk. Cover cages and move birds to an untreated, well-ventilated room during service. Wait at least 2-3 hours before returning birds to treated areas.</p></div></div>
              <div className="method"><span className="mi">{"🐠"}</span><div><h3>Fish & Aquatic Pets</h3><p>Aquarium fish are vulnerable because airborne pesticide particles settle on water surfaces and enter the tank. Cover aquariums with plastic wrap and turn off air pumps during treatment to prevent drawing contaminated air into the water. Pyrethrin and permethrin are highly toxic to fish at extremely low concentrations.</p></div></div>
            </div>
          </div>

          <div className="panel" style={{ marginBottom: "24px" }}>
            <h2>Re-Entry Times and Preparation</h2>
            <p style={{ color: "var(--muted)" }}>Before your pest control appointment, pick up pet food bowls, water dishes, toys, and bedding from areas being treated. Cover fish tanks. Plan to keep pets out of treated rooms for the re-entry window your provider specifies — this is typically 30 minutes to 2 hours depending on the products used and application method.</p>
            <p style={{ color: "var(--muted)", marginTop: "12px" }}>EPA minimum-risk products (FIFRA 25(b) exempt) generally allow the shortest re-entry times, often under 30 minutes once surfaces are dry. Gel baits in tamper-resistant stations require no re-entry time at all since pets cannot contact the product. Ask your provider for the specific re-entry time for every product they plan to use.</p>
          </div>

          <div className="panel" style={{ marginBottom: "24px" }}>
            <h2>Products and Methods to Discuss with Your Provider</h2>
            <p style={{ color: "var(--muted)" }}>When booking pet-safe service, ask about these specific approaches: gel bait stations for ants and roaches (enclosed and inaccessible to pets), essential oil-based perimeter sprays, diatomaceous earth applied in wall voids and under appliances, and granular outdoor treatments that bind to soil rather than remaining on surfaces. A provider experienced with pet households will have a standard protocol and should be able to name every product they plan to use.</p>
          </div>

          <div className="panel" style={{ marginBottom: "24px" }}>
            <h2>Find Pet-Safe Providers Near You</h2>
            <p style={{ color: "var(--muted)", marginBottom: "16px" }}>Green Pest Directory providers prioritize low-toxicity, targeted treatments that protect your pets:</p>
            <div className="citychips">
              <Link className="citychip" href="/directory/tx/houston">Houston, TX</Link>
              <Link className="citychip" href="/directory/ca/los-angeles">Los Angeles, CA</Link>
              <Link className="citychip" href="/directory/fl/miami">Miami, FL</Link>
              <Link className="citychip" href="/directory/az/phoenix">Phoenix, AZ</Link>
              <Link className="citychip" href="/directory/il/chicago">Chicago, IL</Link>
              <Link className="citychip" href="/directory/ny/new-york">New York, NY</Link>
              <Link className="citychip" href="/directory/co/denver">Denver, CO</Link>
              <Link className="citychip" href="/directory/wa/seattle">Seattle, WA</Link>
              <Link className="citychip" href="/directory/ga/atlanta">Atlanta, GA</Link>
              <Link className="citychip" href="/directory/nc/charlotte">Charlotte, NC</Link>
            </div>
            <p style={{ color: "var(--muted)", marginTop: "16px" }}><Link href="/directory" style={{ color: "var(--accent)", fontWeight: 600 }}>Browse all providers →</Link> or <Link href="/directory?eco=tier_1" style={{ color: "var(--accent)", fontWeight: 600 }}>view Eco-Certified companies →</Link></p>
          </div>

          <div className="panel faq">
            <h2>Frequently Asked Questions</h2>
            <details open><summary>How long should I keep my pets away after pest control treatment? <span className="plus">+</span></summary><div className="ans">It depends on the products used. EPA minimum-risk (25(b) exempt) products typically require 30 minutes or less once surfaces dry. Conventional liquid treatments may require 1-2 hours. Gel bait stations require no re-entry time since the product is enclosed. Always ask your technician for the specific re-entry time before they begin.</div></details>
            <details><summary>Is pest control safe for cats specifically? <span className="plus">+</span></summary><div className="ans">It can be, but cats require extra caution. Cats lack certain liver enzymes (glucuronyl transferase) needed to metabolize many pesticide compounds, making them more sensitive than dogs. Permethrin is especially dangerous to cats. Tell your provider you have cats so they can avoid permethrin-based products and choose formulations with low feline toxicity.</div></details>
            <details><summary>What should I do if my pet is exposed to pest control chemicals? <span className="plus">+</span></summary><div className="ans">If your pet shows symptoms like drooling, vomiting, trembling, or difficulty breathing after a pest treatment, contact your veterinarian or the ASPCA Animal Poison Control Center (888-426-4435) immediately. Have the product name and active ingredient ready — your pest control provider should have given you a service ticket listing everything applied.</div></details>
            <details><summary>Are natural or organic pest control products automatically safe for pets? <span className="plus">+</span></summary><div className="ans">Not automatically. "Natural" does not always mean "non-toxic to animals." Pyrethrin, while plant-derived, is toxic to cats and extremely toxic to fish. Essential oils like tea tree and pennyroyal can harm pets at concentrated levels. The key is targeted application and appropriate product selection for your specific pet situation, not just choosing anything labeled natural.</div></details>
            <details><summary>Can I stay home with my pets during pest control service? <span className="plus">+</span></summary><div className="ans">In most cases, you can stay in untreated rooms of the house. Keep pets confined to a room that is not being treated, and ensure that room has good ventilation. For whole-house treatments or any service using aerosol application, plan to leave the home entirely with your pets for the re-entry window specified by your provider.</div></details>
          </div>

        </div>
      </section>

      <section style={{ padding: "0 0 56px" }}>
        <div className="wrap">
          <div className="ctastrip">
            <h2>Specialize in pet-safe pest control?</h2>
            <p>Pet owners are actively searching for providers they can trust. Get listed in the Green Pest Directory.</p>
            <Link className="btn btn-light" href="/claim">List Your Company →</Link>
          </div>
        </div>
      </section>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": [
          { "@type": "Question", "name": "How long should I keep my pets away after pest control treatment?", "acceptedAnswer": { "@type": "Answer", "text": "EPA minimum-risk products require 30 minutes or less once dry. Conventional treatments may need 1-2 hours. Gel bait stations require no re-entry time. Always ask your technician for the specific window." }},
          { "@type": "Question", "name": "Is pest control safe for cats specifically?", "acceptedAnswer": { "@type": "Answer", "text": "Cats require extra caution because they lack certain liver enzymes to metabolize pesticides. Permethrin is especially dangerous to cats. Always inform your provider you have cats." }},
          { "@type": "Question", "name": "What should I do if my pet is exposed to pest control chemicals?", "acceptedAnswer": { "@type": "Answer", "text": "Contact your veterinarian or the ASPCA Animal Poison Control Center (888-426-4435) immediately. Have the product name and active ingredient ready." }},
          { "@type": "Question", "name": "Are natural or organic pest control products automatically safe for pets?", "acceptedAnswer": { "@type": "Answer", "text": "Not automatically. Pyrethrin is toxic to cats and fish. Essential oils like tea tree can harm pets at high concentrations. Targeted application matters more than the natural label." }},
          { "@type": "Question", "name": "Can I stay home with my pets during pest control service?", "acceptedAnswer": { "@type": "Answer", "text": "Usually yes — keep pets in an untreated room with good ventilation. For whole-house or aerosol treatments, leave entirely for the re-entry window." }},
        ],
      })}} />
    </>
  );
}
