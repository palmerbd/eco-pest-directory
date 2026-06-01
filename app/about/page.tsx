import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About",
  description: "Green Pest Directory is America's first directory dedicated to eco-friendly and green pest control services. Learn how we classify and verify providers.",
  alternates: { canonical: "https://www.greenpestdirectory.com/about" },
};

export default function AboutPage() {
  return (
    <>
      <section className="chero" style={{ padding: "40px 0 50px" }}>
        <div className="wrap" style={{ maxWidth: "700px" }}>
          <h1>About <span className="hl">Green Pest Directory</span></h1>
          <p>America's first directory dedicated to eco-friendly and green pest control services.</p>
        </div>
      </section>
      <section className="block">
        <div className="wrap" style={{ maxWidth: "700px" }}>
          <div className="panel" style={{ marginBottom: "24px" }}>
            <h2>Our Mission</h2>
            <p style={{ color: "var(--muted)" }}>Green Pest Directory helps homeowners find pest control companies that prioritize eco-friendly, organic, and pet-safe methods. We classify every provider so you know exactly how committed they are to green practices before you pick up the phone.</p>
          </div>
          <div className="panel" style={{ marginBottom: "24px" }}>
            <h2>How We Classify Providers</h2>
            <p style={{ color: "var(--muted)", marginBottom: "12px" }}><strong>Eco-Certified (Tier 1)</strong> — Companies whose brand identity centers on eco, green, and organic pest control. Green methods are their default, not an upsell.</p>
            <p style={{ color: "var(--muted)" }}><strong>Eco Options Available (Tier 2)</strong> — Established conventional companies that offer dedicated eco-friendly service lines — organic treatments, IPM, and pet-safe options on request.</p>
          </div>
          <div className="panel" style={{ marginBottom: "24px" }}>
            <h2>Independent Directory</h2>
            <p style={{ color: "var(--muted)" }}>Green Pest Directory is an independent consumer resource. We are not affiliated with, endorsed by, or sponsored by any pest control company or brand listed on this site. All trademarks are the property of their respective owners.</p>
          </div>
          <div className="panel">
            <h2>For Business Owners</h2>
            <p style={{ color: "var(--muted)" }}>If you run a pest control company, you can <Link href="/claim" style={{ color: "var(--accent)", fontWeight: 600 }}>claim your free listing</Link> to update your information, add your eco certifications, and connect with homeowners searching for green providers.</p>
          </div>
        </div>
      </section>
    </>
  );
}
