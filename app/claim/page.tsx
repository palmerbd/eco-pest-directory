"use client";

import { useState } from "react";
import Link from "next/link";

export default function ClaimPage() {
  const [step, setStep] = useState<"form" | "submitted">("form");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    // For now, just show success. Supabase integration will handle real submissions.
    setTimeout(() => {
      setStep("submitted");
      setSubmitting(false);
    }, 1000);
  }

  return (
    <>
      <section className="chero" style={{ padding: "40px 0 50px" }}>
        <div className="wrap" style={{ maxWidth: "700px" }}>
          <span className="eyebrow">For Business Owners</span>
          <h1>Claim Your <span className="hl">Free Listing</span></h1>
          <p>Already listed in the Green Pest Directory? Claim your listing to update your information, add eco certifications, and connect with homeowners.</p>
        </div>
      </section>

      <section className="block" style={{ paddingTop: 0 }}>
        <div className="wrap" style={{ maxWidth: "640px" }}>

          {step === "form" ? (
            <div className="panel" style={{ padding: "32px" }}>
              <h2 style={{ marginBottom: "6px" }}>{"🏢"} Business Information</h2>
              <p style={{ color: "var(--muted)", fontSize: "0.9rem", marginBottom: "24px" }}>Fill out the form below and we will verify your ownership. All fields marked * are required.</p>

              <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "18px" }}>

                {/* Company Name */}
                <div>
                  <label style={labelStyle}>Company Name *</label>
                  <input type="text" name="company" required placeholder="e.g. Green Shield Pest Solutions" style={inputStyle} />
                </div>

                {/* Location Row */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  <div>
                    <label style={labelStyle}>City *</label>
                    <input type="text" name="city" required placeholder="Austin" style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>State *</label>
                    <input type="text" name="state" required placeholder="TX" maxLength={2} style={inputStyle} />
                  </div>
                </div>

                <div>
                  <label style={labelStyle}>Street Address</label>
                  <input type="text" name="address" placeholder="1820 Barton Springs Rd" style={inputStyle} />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  <div>
                    <label style={labelStyle}>ZIP Code</label>
                    <input type="text" name="zip" placeholder="78704" style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>Phone Number *</label>
                    <input type="tel" name="phone" required placeholder="(512) 555-0148" style={inputStyle} />
                  </div>
                </div>

                <div>
                  <label style={labelStyle}>Company Website</label>
                  <input type="url" name="website" placeholder="https://www.yourcompany.com" style={inputStyle} />
                </div>

                <hr style={{ border: "none", borderTop: "1px dashed var(--line)", margin: "4px 0" }} />

                <h3 style={{ fontSize: "1.05rem", color: "var(--dark)", marginBottom: "-8px" }}>{"👤"} Owner / Contact Information</h3>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  <div>
                    <label style={labelStyle}>Your Name *</label>
                    <input type="text" name="ownerName" required placeholder="John Smith" style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>Your Role</label>
                    <input type="text" name="ownerRole" placeholder="Owner / Manager" style={inputStyle} />
                  </div>
                </div>

                <div>
                  <label style={labelStyle}>Email Address *</label>
                  <input type="email" name="email" required placeholder="john@yourcompany.com" style={inputStyle} />
                  <p style={{ fontSize: "0.78rem", color: "var(--muted)", marginTop: "4px" }}>We will send a verification link to this email.</p>
                </div>

                <hr style={{ border: "none", borderTop: "1px dashed var(--line)", margin: "4px 0" }} />

                <h3 style={{ fontSize: "1.05rem", color: "var(--dark)", marginBottom: "-8px" }}>{"🌿"} Eco Classification</h3>

                <div>
                  <label style={labelStyle}>How would you describe your eco approach? *</label>
                  <select name="ecoTier" required style={inputStyle}>
                    <option value="">Select one...</option>
                    <option value="tier_1">Eco-Certified — Our brand centers on green/organic pest control</option>
                    <option value="tier_2">Eco Options — We offer eco-friendly service lines alongside conventional</option>
                    <option value="conventional">Conventional — We do not currently offer eco-specific services</option>
                  </select>
                </div>

                <div>
                  <label style={labelStyle}>Which eco methods do you offer? (check all that apply)</label>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginTop: "6px" }}>
                    {[
                      ["organic", "Organic Treatments"],
                      ["ipm", "Integrated Pest Management (IPM)"],
                      ["botanical", "Botanical / Plant-Based Products"],
                      ["pet_safe", "Pet-Safe Treatments"],
                      ["child_safe", "Child-Safe Treatments"],
                      ["low_toxicity", "Low-Toxicity Solutions"],
                    ].map(([val, label]) => (
                      <label key={val} style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.88rem", color: "var(--ink)", cursor: "pointer" }}>
                        <input type="checkbox" name="ecoServices" value={val} style={{ accentColor: "var(--accent)" }} />
                        {label}
                      </label>
                    ))}
                  </div>
                </div>

                <hr style={{ border: "none", borderTop: "1px dashed var(--line)", margin: "4px 0" }} />

                <h3 style={{ fontSize: "1.05rem", color: "var(--dark)", marginBottom: "-8px" }}>{"🐜"} Services Offered</h3>

                <div>
                  <label style={labelStyle}>Select your pest control services (check all that apply)</label>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px", marginTop: "6px" }}>
                    {[
                      ["general_pest", "General Pest"],
                      ["termite", "Termite"],
                      ["rodent", "Rodent"],
                      ["bed_bug", "Bed Bug"],
                      ["mosquito", "Mosquito"],
                      ["wildlife", "Wildlife"],
                      ["cockroach", "Cockroach"],
                      ["ant", "Ant"],
                      ["fumigation", "Fumigation"],
                      ["commercial", "Commercial"],
                      ["organic", "Organic/Green"],
                      ["lawn_pest", "Lawn & Ornamental"],
                    ].map(([val, label]) => (
                      <label key={val} style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.85rem", color: "var(--ink)", cursor: "pointer" }}>
                        <input type="checkbox" name="services" value={val} style={{ accentColor: "var(--accent)" }} />
                        {label}
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label style={labelStyle}>Anything else you would like us to know?</label>
                  <textarea name="notes" rows={3} placeholder="Additional services, certifications, service area, etc." style={{ ...inputStyle, resize: "vertical" as const }} />
                </div>

                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={submitting}
                  style={{ width: "100%", padding: "1rem", fontSize: "1rem", marginTop: "8px" }}
                >
                  {submitting ? "Submitting..." : "Submit Claim Request →"}
                </button>

                <p style={{ fontSize: "0.78rem", color: "var(--muted)", textAlign: "center" }}>
                  {"🔒"} Your information is secure. We will verify your ownership via email before making any changes to your listing.
                </p>
              </form>
            </div>
          ) : (
            <div className="panel" style={{ padding: "48px 32px", textAlign: "center" }}>
              <div style={{ fontSize: "3rem", marginBottom: "16px" }}>{"✅"}</div>
              <h2 style={{ color: "var(--dark)", marginBottom: "8px" }}>Claim Request Submitted!</h2>
              <p style={{ color: "var(--muted)", maxWidth: "440px", margin: "0 auto 24px" }}>
                Thank you for claiming your listing. We will review your information and send a verification email within 24 hours.
              </p>
              <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
                <Link href="/directory" className="btn btn-primary">Browse Directory</Link>
                <Link href="/" className="btn btn-ghost">Back to Home</Link>
              </div>
            </div>
          )}

          <div className="panel" style={{ marginTop: "24px" }}>
            <h2>{"❓"} Why Claim Your Listing?</h2>
            <div className="methods" style={{ marginTop: "12px" }}>
              <div className="method"><span className="mi">{"✏️"}</span><div><h3>Update Your Information</h3><p>Correct your address, phone number, hours, and description.</p></div></div>
              <div className="method"><span className="mi">{"🌿"}</span><div><h3>Add Eco Certifications</h3><p>Showcase your green methods and get the Eco-Certified badge.</p></div></div>
              <div className="method"><span className="mi">{"⭐"}</span><div><h3>Featured Placement</h3><p>Upgrade to Featured for priority placement and lead capture.</p></div></div>
              <div className="method"><span className="mi">{"📊"}</span><div><h3>Track Leads</h3><p>See how many homeowners view your listing and request quotes.</p></div></div>
            </div>
          </div>

        </div>
      </section>
    </>
  );
}

const labelStyle: React.CSSProperties = {
  display: "block",
  fontFamily: "Montserrat, sans-serif",
  fontWeight: 700,
  fontSize: "0.82rem",
  color: "var(--dark)",
  marginBottom: "6px",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  fontFamily: "Inter, sans-serif",
  fontSize: "0.9rem",
  padding: "0.7rem 0.85rem",
  border: "1px solid var(--line)",
  borderRadius: "10px",
  background: "#fff",
  color: "var(--ink)",
  outline: "none",
};
