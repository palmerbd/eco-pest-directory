"use client";

// âââ /dashboard â Business Owner Dashboard âââââââââââââââââââââââââââââââââââââ
// Requires Supabase session (redirects to /claim if not logged in).
// Shows the owner's claimed listing, claim status, and next steps.
// Styled to match the listing detail pages (green design system).

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase, type Claim } from "@/lib/supabase";
import PhotoManager from "@/components/PhotoManager";
import StudioProfileEditor from "@/components/StudioProfileEditor";

type PageState = "loading" | "unauthenticated" | "no_claim" | "ready";

const STATUS_CONFIG: Record<string, { label: string; icon: string; color: string; bg: string; border: string; desc: string }> = {
  pending: {
    label: "Pending Review",
    icon: "â³",
    color: "#92400e", bg: "#fef3c7", border: "#fde68a",
    desc: "Your claim has been submitted. Our team will review it within 1â2 business days.",
  },
  verified: {
    label: "Under Review",
    icon: "ð",
    color: "#92400e", bg: "#fef3c7", border: "#fde68a",
    desc: "Your email is verified and your claim is in our review queue. Weâll send an approval email within 1 business day.",
  },
  approved: {
    label: "Approved",
    icon: "â",
    color: "#166534", bg: "#dcfce7", border: "#bbf7d0",
    desc: "Your listing is claimed and showing a Verified Owner badge.",
  },
  rejected: {
    label: "Not Approved",
    icon: "â",
    color: "#991b1b", bg: "#fee2e2", border: "#fecaca",
    desc: "We were unable to verify your ownership. Please contact us for details.",
  },
};

export default function DashboardPage() {
  const [pageState, setPageState] = useState<PageState>("loading");
  const [claim, setClaim] = useState<Claim | null>(null);
  const [email, setEmail] = useState("");

  useEffect(() => {
    async function load() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { setPageState("unauthenticated"); return; }

      setEmail(session.user.email || "");

      const { data } = await supabase
        .from("claims")
        .select("*")
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!data) { setPageState("no_claim"); return; }
      setClaim(data as Claim);
      setPageState("ready");
    }
    load();
  }, []);

  async function handleSignOut() {
    await supabase.auth.signOut();
    window.location.href = "/";
  }

  const cfg = pageState === "ready"
    ? (STATUS_CONFIG[claim!.status] || STATUS_CONFIG.pending)
    : STATUS_CONFIG.pending;

  const listingHref = (pageState === "ready" && claim!.studio_city && claim!.studio_state)
    ? `/directory/${claim!.studio_state}/${claim!.studio_city}/${claim!.studio_slug}`
    : `/directory`;

  return (
    <>
      {/* ââ Loading spinner ââ */}
      {pageState === "loading" && (
        <main className="dash-loading">
          <div className="dash-spinner" />
        </main>
      )}

      {/* ââ Not logged in ââ */}
      {pageState === "unauthenticated" && (
        <main className="dash-loading">
          <div className="dash-gate-card">
            <div className="dash-gate-icon">ð</div>
            <h1>Sign in required</h1>
            <p>You need to claim a business listing before you can access the dashboard.</p>
            <Link href="/claim" className="btn btn-primary" style={{ width: "100%", justifyContent: "center" }}>
              Claim Your Listing
            </Link>
          </div>
        </main>
      )}

      {/* ââ No claim yet ââ */}
      {pageState === "no_claim" && (
        <main className="dash-loading">
          <div className="dash-gate-card">
            <div className="dash-gate-icon">ð</div>
            <h1>No claim on file</h1>
            <p>Logged in as <strong>{email}</strong>.</p>
            <p>You haven&apos;t claimed a listing yet, or your claim may be associated with a different email address.</p>
            <Link href="/claim" className="btn btn-primary" style={{ width: "100%", justifyContent: "center", marginBottom: "12px" }}>
              Claim a Listing
            </Link>
            <button onClick={handleSignOut} className="dash-signout-link">
              Sign out
            </button>
          </div>
        </main>
      )}

      {/* ââ Dashboard (ready) ââ */}
      {pageState === "ready" && (
        <>
          {/* ââ Hero header â matches .chero from city pages ââ */}
          <section className="dash-hero">
            <div className="wrap">
              <div className="dash-hero-nav">
                <Link href="/" className="dash-hero-back">&larr; Back to directory</Link>
                <button onClick={handleSignOut} className="dash-hero-signout">Sign out</button>
              </div>
              <div className="eyebrow" style={{ color: "#bbf7d0", marginBottom: "0.6rem" }}>Owner Dashboard</div>
              <h1 className="dash-hero-title">{claim!.studio_title}</h1>
              <p className="dash-hero-email">{email}</p>
            </div>
          </section>

          {/* ââ Body ââ */}
          <div className="wrap">
            <div className="dash-body">

              {/* ââ Status banner ââ */}
              <div className="panel dash-status-panel" style={{ borderColor: cfg.border }}>
                <div className="dash-status-row">
                  <h2>Claim Status</h2>
                  <span className="badge" style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}>
                    {cfg.icon}&nbsp; {cfg.label}
                  </span>
                </div>
                <p className="dash-status-desc">{cfg.desc}</p>
              </div>

              {/* ââ Listing card ââ */}
              <div className="panel">
                <h2>ð Your Listing</h2>
                <div className="dash-listing-card">
                  <div>
                    <div className="dash-listing-name">{claim!.studio_title}</div>
                    {(claim!.studio_city || claim!.studio_state) && (
                      <div className="dash-listing-loc">
                        ð {[claim!.studio_city, claim!.studio_state].filter(Boolean).join(", ")}
                      </div>
                    )}
                  </div>
                  <Link href={listingHref} className="btn btn-ghost" style={{ fontSize: "0.82rem", padding: "0.55em 1em" }}>
                    View listing â
                  </Link>
                </div>
              </div>

              {/* ââ Owner details ââ */}
              <div className="panel">
                <h2>ð¤ Owner Information</h2>
                <div className="dash-details-grid">
                  <div className="dash-detail">
                    <div className="dash-detail-label">Name</div>
                    <div className="dash-detail-value">{claim!.owner_name}</div>
                  </div>
                  <div className="dash-detail">
                    <div className="dash-detail-label">Email</div>
                    <div className="dash-detail-value">{claim!.owner_email}</div>
                  </div>
                  {claim!.owner_phone && (
                    <div className="dash-detail">
                      <div className="dash-detail-label">Phone</div>
                      <div className="dash-detail-value">{claim!.owner_phone}</div>
                    </div>
                  )}
                  <div className="dash-detail">
                    <div className="dash-detail-label">Submitted</div>
                    <div className="dash-detail-value">
                      {new Date(claim!.created_at).toLocaleDateString("en-US", {
                        year: "numeric", month: "long", day: "numeric",
                      })}
                    </div>
                  </div>
                </div>
              </div>

              {/* ââ Upgrade / Featured CTA ââ */}
              {(claim!.status === "verified" || claim!.status === "approved") && (
                <div className="dash-upgrade-card">
                  {claim!.tier === "paid" ? (
                    <div className="dash-upgrade-inner">
                      <div>
                        <div className="eyebrow" style={{ color: "#bbf7d0", marginBottom: "0.5rem" }}>â­ Featured Listing â Active</div>
                        <h3>You&apos;re Featured!</h3>
                        <p>Your listing has the gold Featured badge, lead capture form, and priority placement in search results. Customers can contact you directly.</p>
                      </div>
                      <span style={{ fontSize: "2.5rem" }}>â­</span>
                    </div>
                  ) : (
                    <>
                      <div className="dash-upgrade-inner">
                        <div>
                          <div className="eyebrow" style={{ color: "#bbf7d0", marginBottom: "0.5rem" }}>
                            Featured Listing â $49/mo <span style={{ color: "rgba(255,255,255,0.3)", textDecoration: "line-through", fontWeight: 400, textTransform: "none" }}>$99</span>
                          </div>
                          <h3>Upgrade to Featured</h3>
                          <p>Get a lead capture form, &ldquo;Featured&rdquo; badge, priority placement in search results, and monthly performance insights.</p>
                        </div>
                        <span style={{ fontSize: "2.5rem" }}>â­</span>
                      </div>
                      <div style={{ marginTop: "20px" }}>
                        <Link href="/upgrade" className="btn btn-primary" style={{ background: "#fff", color: "var(--dark)", boxShadow: "0 4px 14px rgba(0,0,0,0.15)" }}>
                          Upgrade to Featured â
                        </Link>
                        <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.78rem", marginTop: "10px" }}>
                          $49/mo promo rate (reg. $99) Â· Cancel anytime Â· Powered by Stripe
                        </p>
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* ââ Photo management â Featured tier only ââ */}
              {claim!.tier === "paid" && (
                <PhotoManager claimId={claim!.id} studioSlug={claim!.studio_slug} />
              )}

              {/* ââ Profile editor â Featured tier only ââ */}
              {claim!.tier === "paid" && (
                <StudioProfileEditor
                  claimId={claim!.id}
                  studioSlug={claim!.studio_slug}
                  studioTitle={claim!.studio_title}
                  studioCity={(claim as Claim & { studio_city?: string }).studio_city ?? ""}
                  studioState={(claim as Claim & { studio_state?: string }).studio_state ?? ""}
                />
              )}

              {/* ââ Help ââ */}
              <div className="panel">
                <h2>ð¬ Questions?</h2>
                <p style={{ color: "var(--muted)", fontSize: "0.92rem", marginBottom: "12px" }}>
                  Need to update your business information or have a question about your claim?
                </p>
                <Link href="/contact" className="dash-contact-link">Contact us â</Link>
              </div>

            </div>
          </div>
        </>
      )}

      {/* ââ Scoped styles â always rendered ââ */}
      <style jsx>{`
        /* Loading / gate screens */
        .dash-loading {
          min-height: 100vh;
          background: var(--page);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
        }
        .dash-spinner {
          width: 36px; height: 36px;
          border: 3px solid var(--line);
          border-top-color: var(--accent);
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        .dash-gate-card {
          background: #fff;
          border: 1px solid var(--line);
          border-radius: 22px;
          box-shadow: var(--shadow-md);
          padding: 40px 32px;
          max-width: 420px;
          width: 100%;
          text-align: center;
        }
        .dash-gate-card h1 {
          font-family: 'Montserrat', sans-serif;
          font-size: 1.3rem;
          font-weight: 800;
          color: var(--dark);
          margin-bottom: 8px;
        }
        .dash-gate-card p {
          color: var(--muted);
          font-size: 0.92rem;
          margin-bottom: 20px;
          line-height: 1.5;
        }
        .dash-gate-icon {
          font-size: 2.8rem;
          margin-bottom: 16px;
        }
        .dash-signout-link {
          background: none;
          border: 0;
          color: var(--muted);
          font-size: 0.85rem;
          cursor: pointer;
          font-family: inherit;
        }
        .dash-signout-link:hover { color: var(--accent); }

        /* Hero */
        .dash-hero {
          position: relative;
          color: #fff;
          overflow: hidden;
          background: radial-gradient(120% 130% at 85% 0%, #166534, #052e16 60%);
          padding: 28px 0 36px;
        }
        .dash-hero::before {
          content: "";
          position: absolute;
          width: 300px; height: 300px;
          right: -90px; top: -130px;
          border-radius: 50%;
          background: radial-gradient(circle, #4ade80, transparent 70%);
          opacity: 0.45;
        }
        .dash-hero .wrap { position: relative; z-index: 2; }
        .dash-hero-nav {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 18px;
        }
        .dash-hero-back {
          font-size: 0.85rem;
          color: rgba(255,255,255,0.5);
          transition: color 0.18s;
        }
        .dash-hero-back:hover { color: #fff; }
        .dash-hero-signout {
          background: none;
          border: 0;
          font-family: inherit;
          font-size: 0.85rem;
          color: rgba(255,255,255,0.5);
          cursor: pointer;
          transition: color 0.18s;
        }
        .dash-hero-signout:hover { color: rgba(255,255,255,0.8); }
        .dash-hero-title {
          font-family: 'Montserrat', sans-serif;
          font-size: clamp(1.6rem, 6vw, 2.2rem);
          font-weight: 800;
          color: #fff;
          line-height: 1.15;
        }
        .dash-hero-email {
          margin-top: 0.5rem;
          font-size: 0.88rem;
          color: #9ed6b4;
        }

        /* Body */
        .dash-body {
          display: flex;
          flex-direction: column;
          gap: 20px;
          padding: 28px 0 60px;
          max-width: 720px;
          margin: 0 auto;
        }

        /* Status panel */
        .dash-status-panel { border-width: 1.5px; }
        .dash-status-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 10px;
          margin-bottom: 12px;
        }
        .dash-status-desc {
          color: var(--muted);
          font-size: 0.92rem;
          line-height: 1.55;
        }

        /* Listing card inside panel */
        .dash-listing-card {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          background: var(--card);
          border: 1px solid var(--line);
          border-radius: 14px;
          padding: 18px;
          margin-top: 4px;
        }
        .dash-listing-name {
          font-family: 'Montserrat', sans-serif;
          font-weight: 700;
          font-size: 1.05rem;
          color: var(--dark);
        }
        .dash-listing-loc {
          font-size: 0.85rem;
          color: var(--muted);
          margin-top: 4px;
        }

        /* Owner details grid */
        .dash-details-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 18px;
          margin-top: 4px;
        }
        .dash-detail-label {
          font-family: 'Montserrat', sans-serif;
          font-weight: 700;
          font-size: 0.7rem;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--muted);
          margin-bottom: 3px;
        }
        .dash-detail-value {
          color: var(--ink);
          font-size: 0.92rem;
        }

        /* Upgrade CTA card */
        .dash-upgrade-card {
          background: radial-gradient(120% 130% at 0% 0%, #166534, #052e16);
          color: #fff;
          border-radius: 18px;
          padding: 28px;
          box-shadow: var(--shadow-md);
        }
        .dash-upgrade-inner {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 16px;
        }
        .dash-upgrade-card h3 {
          font-family: 'Montserrat', sans-serif;
          font-weight: 800;
          font-size: 1.15rem;
          color: #fff;
          margin-bottom: 8px;
        }
        .dash-upgrade-card p {
          font-size: 0.9rem;
          color: #cdeedb;
          line-height: 1.55;
        }

        /* Contact link */
        .dash-contact-link {
          font-family: 'Montserrat', sans-serif;
          font-weight: 700;
          font-size: 0.88rem;
          color: var(--accent);
        }
        .dash-contact-link:hover { text-decoration: underline; }

        @media (max-width: 520px) {
          .dash-details-grid { grid-template-columns: 1fr; gap: 14px; }
          .dash-listing-card { flex-direction: column; align-items: flex-start; }
          .dash-upgrade-inner { flex-direction: column; }
        }
      `}</style>
    </>
  );
}
