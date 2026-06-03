"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

type Step = "form" | "email_sent" | "error";

export default function ClaimPage() {
  const [step, setStep]           = useState<Step>("form");
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg]   = useState("");

  // Pre-populate from URL params when coming from a listing detail page
  // e.g. /claim?id=123&slug=green-shield-pest&title=Green+Shield+Pest
  const [prefillId, setPrefillId]       = useState("");
  const [prefillSlug, setPrefillSlug]   = useState("");
  const [prefillTitle, setPrefillTitle] = useState("");

  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    setPrefillId(p.get("id") || "");
    setPrefillSlug(p.get("slug") || "");
    setPrefillTitle(p.get("title") || "");
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg("");

    const fd = new FormData(e.currentTarget);
    const ownerName  = (fd.get("ownerName")  as string).trim();
    const ownerEmail = (fd.get("email")       as string).trim().toLowerCase();
    const ownerPhone = (fd.get("phone")       as string).trim();
    const company    = prefillTitle || (fd.get("company") as string).trim();
    const studioId   = prefillId;
    const studioSlug = prefillSlug;

    if (!supabase) {
      setErrorMsg("Auth service is not configured. Please contact support.");
      setSubmitting(false);
      return;
    }

    // 1. Save claim data to localStorage so the callback page can read it
    const pendingClaim = { studio_id: studioId, studio_slug: studioSlug, studio_title: company, owner_name: ownerName, owner_email: ownerEmail, owner_phone: ownerPhone };
    try { localStorage.setItem("pendingClaim", JSON.stringify(pendingClaim)); } catch { /* private browsing — fallback to metadata only */ }

    // 2. Send magic link — embed claim data in user_metadata as cross-browser fallback
    const redirectTo = `${window.location.origin}/claim/callback`;
    const { error } = await supabase.auth.signInWithOtp({
      email: ownerEmail,
      options: {
        shouldCreateUser: true,
        emailRedirectTo: redirectTo,
        data: pendingClaim,
      },
    });

    if (error) {
      setErrorMsg(error.message || "Failed to send verification email. Please try again.");
      setSubmitting(false);
      return;
    }

    setStep("email_sent");
    setSubmitting(false);
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

          {step === "form" && (
            <div className="panel" style={{ padding: "32px" }}>
              <h2 style={{ marginBottom: "6px" }}>🏢 Business Information</h2>
              <p style={{ color: "var(--muted)", fontSize: "0.9rem", marginBottom: "24px" }}>Fill out the form below and we will send a verification link to your email. All fields marked * are required.</p>

              <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "18px" }}>

                {/* Company Name — pre-populated (readonly) when coming from a listing page */}
                {prefillTitle ? (
                  <div>
                    <label style={labelStyle}>Company Name</label>
                    <div style={{ ...inputStyle, background: "#f9fafb", color: "var(--muted)", cursor: "default" }}>
                      {prefillTitle}
                    </div>
                  </div>
                ) : (
                  <div>
                    <label style={labelStyle}>Company Name *</label>
                    <input type="text" name="company" required placeholder="e.g. Green Shield Pest Solutions" style={inputStyle} />
                    <p style={{ fontSize: "0.78rem", color: "var(--muted)", marginTop: "4px" }}>
                      Enter the name exactly as it appears in the directory.{" "}
                      <Link href="/directory" style={{ color: "var(--accent)" }}>Find your listing →</Link>
                    </p>
                  </div>
                )}

                <hr style={{ border: "none", borderTop: "1px dashed var(--line)", margin: "4px 0" }} />
                <h3 style={{ fontSize: "1.05rem", color: "var(--dark)", marginBottom: "-8px" }}>👤 Your Information</h3>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  <div>
                    <label style={labelStyle}>Your Name *</label>
                    <input type="text" name="ownerName" required placeholder="John Smith" style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>Phone Number</label>
                    <input type="tel" name="phone" placeholder="(512) 555-0148" style={inputStyle} />
                  </div>
                </div>

                <div>
                  <label style={labelStyle}>Email Address *</label>
                  <input type="email" name="email" required placeholder="john@yourcompany.com" style={inputStyle} />
                  <p style={{ fontSize: "0.78rem", color: "var(--muted)", marginTop: "4px" }}>
                    We will send a verification link to this email. Check your inbox after submitting.
                  </p>
                </div>

                {errorMsg && (
                  <div style={{ background: "#fef2f2", border: "1px solid #fca5a5", borderRadius: "8px", padding: "12px 16px", color: "#991b1b", fontSize: "0.88rem" }}>
                    ⚠️ {errorMsg}
                  </div>
                )}

                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={submitting}
                  style={{ width: "100%", padding: "1rem", fontSize: "1rem", marginTop: "8px" }}
                >
                  {submitting ? "Sending verification email..." : "Submit Claim Request →"}
                </button>

                <p style={{ fontSize: "0.78rem", color: "var(--muted)", textAlign: "center" }}>
                  🔒 Your information is secure. We verify ownership via email before making any changes to your listing.
                </p>
              </form>
            </div>
          )}

          {step === "email_sent" && (
            <div className="panel" style={{ padding: "48px 32px", textAlign: "center" }}>
              <div style={{ fontSize: "3rem", marginBottom: "16px" }}>📧</div>
              <h2 style={{ color: "var(--dark)", marginBottom: "8px" }}>Check Your Email</h2>
              <p style={{ color: "var(--muted)", maxWidth: "440px", margin: "0 auto 24px", lineHeight: 1.6 }}>
                We sent a verification link to your email address. Click it to confirm your identity and complete your claim.
                The link expires in 1 hour.
              </p>
              <p style={{ color: "var(--muted)", fontSize: "0.85rem", maxWidth: "400px", margin: "0 auto 28px" }}>
                Don't see it? Check your spam folder, or{" "}
                <button
                  onClick={() => { setStep("form"); setErrorMsg(""); }}
                  style={{ background: "none", border: "none", color: "var(--accent)", cursor: "pointer", fontWeight: 600, padding: 0 }}
                >
                  try again
                </button>.
              </p>
              <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
                <Link href="/directory" className="btn btn-primary">Browse Directory</Link>
                <Link href="/" className="btn btn-ghost">Back to Home</Link>
              </div>
            </div>
          )}

          <div className="panel" style={{ marginTop: "24px" }}>
            <h2>❓ Why Claim Your Listing?</h2>
            <div className="methods" style={{ marginTop: "12px" }}>
              <div className="method"><span className="mi">✏️</span><div><h3>Update Your Information</h3><p>Correct your address, phone number, hours, and description.</p></div></div>
              <div className="method"><span className="mi">🌿</span><div><h3>Add Eco Certifications</h3><p>Showcase your green methods and get the Eco-Certified badge.</p></div></div>
              <div className="method"><span className="mi">⭐</span><div><h3>Featured Placement</h3><p>Upgrade to Featured for priority placement and lead capture.</p></div></div>
              <div className="method"><span className="mi">📊</span><div><h3>Track Leads</h3><p>See how many homeowners view your listing and request quotes.</p></div></div>
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
