import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Contact Us",
  description: "Get in touch with the Green Pest Directory team. Report incorrect listings, request removal, or ask about business listings.",
  alternates: { canonical: "https://www.greenpestdirectory.com/contact" },
};

export default function ContactPage() {
  return (
    <>
      <section className="chero" style={{ padding: "40px 0 50px" }}>
        <div className="wrap" style={{ maxWidth: "700px" }}>
          <h1>Contact <span className="hl">Green Pest Directory</span></h1>
          <p>Questions, corrections, or business inquiries — we are here to help.</p>
        </div>
      </section>
      <section className="block">
        <div className="wrap" style={{ maxWidth: "700px" }}>

          <div className="panel" style={{ marginBottom: "24px" }}>
            <h2>{"📧"} General Inquiries</h2>
            <p style={{ color: "var(--muted)" }}>For questions about the directory, partnerships, or press inquiries:</p>
            <p style={{ marginTop: "8px" }}><a href="mailto:info@greenpestdirectory.com" style={{ color: "var(--accent)", fontWeight: 600 }}>info@greenpestdirectory.com</a></p>
          </div>

          <div className="panel" style={{ marginBottom: "24px" }}>
            <h2>{"🏢"} Business Owners</h2>
            <p style={{ color: "var(--muted)" }}>If you own or manage a pest control company listed in our directory:</p>
            <ul style={{ color: "var(--muted)", marginTop: "8px", paddingLeft: "20px", lineHeight: "2" }}>
              <li><Link href="/claim" style={{ color: "var(--accent)", fontWeight: 600 }}>Claim your free listing</Link> to update your company information</li>
              <li>Update your eco certifications and service details</li>
              <li>Upgrade to a Featured listing for priority placement</li>
            </ul>
          </div>

          <div className="panel" style={{ marginBottom: "24px" }}>
            <h2>{"✏️"} Corrections & Updates</h2>
            <p style={{ color: "var(--muted)" }}>If you notice incorrect information on a listing — wrong phone number, closed business, wrong address — please email us at <a href="mailto:corrections@greenpestdirectory.com" style={{ color: "var(--accent)", fontWeight: 600 }}>corrections@greenpestdirectory.com</a> with the company name and what needs to be updated. We typically process corrections within 48 hours.</p>
          </div>

          <div className="panel" style={{ marginBottom: "24px" }}>
            <h2>{"🗑️"} Removal Requests</h2>
            <p style={{ color: "var(--muted)" }}>If you want your business removed from the directory, email <a href="mailto:removal@greenpestdirectory.com" style={{ color: "var(--accent)", fontWeight: 600 }}>removal@greenpestdirectory.com</a> with your business name and listing URL. We honor all removal requests within 5 business days.</p>
          </div>

          <div className="panel">
            <h2>{"⚖️"} Legal & DMCA</h2>
            <p style={{ color: "var(--muted)" }}>For copyright or trademark concerns, please contact our designated DMCA agent at <a href="mailto:legal@greenpestdirectory.com" style={{ color: "var(--accent)", fontWeight: 600 }}>legal@greenpestdirectory.com</a>. We take intellectual property rights seriously and will respond within 48 hours.</p>
          </div>

        </div>
      </section>
    </>
  );
}
