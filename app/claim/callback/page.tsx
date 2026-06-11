"use client";

// /claim/callback -- Magic Link Callback
// Processes the magic link verification, finalizes the claim, redirects to dashboard.
// Styled to match the green design system used across the directory.

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Status = "verifying" | "claiming" | "success" | "error";

export default function ClaimCallbackPage() {
  const router = useRouter();
  const [status,  setStatus]  = useState<Status>("verifying");
  const [message, setMessage] = useState("Verifying your identity...");

  useEffect(() => {
    async function handleCallback() {
      const { data: sessionData, error: sessionError } =
        await supabase.auth.getSession();
      if (sessionError || !sessionData.session) {
        setStatus("error");
        setMessage("Verification failed. The link may have expired. Please try claiming again.");
        return;
      }

      let claim: Record<string, string>;
      const raw = localStorage.getItem("pendingClaim");
      if (raw) {
        try { claim = JSON.parse(raw); } catch {
          setStatus("error");
          setMessage("Claim data was corrupted. Please start the claim process again.");
          return;
        }
      } else {
        const meta = sessionData.session.user.user_metadata || {};
        if (meta.studio_slug && meta.owner_name && meta.owner_email) {
          claim = {
            studio_id: String(meta.studio_id || ""),
            studio_slug: String(meta.studio_slug),
            studio_title: String(meta.studio_title || ""),
            owner_name: String(meta.owner_name),
            owner_email: String(meta.owner_email),
            owner_phone: String(meta.owner_phone || ""),
            studio_city: String(meta.studio_city || ""),
            studio_state: String(meta.studio_state || ""),
          };
        } else {
          router.push("/dashboard");
          return;
        }
      }

      setStatus("claiming");
      setMessage("Recording your claim...");
      try {
        const res = await fetch("/api/claim", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...claim, user_id: sessionData.session.user.id }),
        });
        const body = await res.json();
        if (!res.ok) {
          if (body.code === "already_claimed") {
            setStatus("error");
            setMessage("This listing has already been claimed by another verified owner.");
          } else { throw new Error(body.message || "Unknown error"); }
          return;
        }
        localStorage.removeItem("pendingClaim");
        setStatus("success");
        setMessage("Claim verified! Redirecting to your dashboard...");
        setTimeout(() => router.push("/dashboard"), 1500);
      } catch (err) {
        console.error("Claim finalization error:", err);
        setStatus("error");
        setMessage("Something went wrong while recording your claim. Please contact us.");
      }
    }
    handleCallback();
  }, []);

  return (
    <>
      <main className="cb-page">
        <div className="cb-card">
          {/* Icon */}
          <div className="cb-icon">
            {status === "verifying" && (
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            )}
            {status === "claiming" && (
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
              </svg>
            )}
            {status === "success" && (
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
            )}
            {status === "error" && (
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            )}
          </div>

          {/* Heading */}
          <h1 className="cb-heading">
            {status === "success" ? "Claim Verified!" :
             status === "error"   ? "Something went wrong" :
                                    "Processing your claim..."}
          </h1>

          {/* Message */}
          <p className="cb-message">{message}</p>

          {/* Spinner for loading states */}
          {(status === "verifying" || status === "claiming") && (
            <div className="cb-spinner-wrap">
              <div className="cb-spinner" />
            </div>
          )}

          {/* Error retry button */}
          {status === "error" && (
            <a href="/claim" className="btn btn-primary" style={{ width: "100%", justifyContent: "center", marginTop: "20px" }}>
              Try Again
            </a>
          )}

          {/* Success checkmark animation */}
          {status === "success" && (
            <p className="cb-redirect-note">Redirecting you now...</p>
          )}
        </div>
      </main>

      <style jsx>{`
        .cb-page {
          min-height: 100vh;
          background: var(--page, #f7faf8);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
        }
        .cb-card {
          background: #fff;
          border: 1px solid var(--line, #d1ddd6);
          border-radius: 22px;
          box-shadow: 0 4px 24px rgba(0,0,0,0.06);
          padding: 48px 36px;
          max-width: 440px;
          width: 100%;
          text-align: center;
        }
        .cb-icon {
          margin-bottom: 20px;
          display: flex;
          justify-content: center;
        }
        .cb-heading {
          font-family: 'Montserrat', sans-serif;
          font-size: 1.35rem;
          font-weight: 800;
          color: var(--dark, #052e16);
          margin-bottom: 10px;
        }
        .cb-message {
          color: var(--muted, #4b6354);
          font-size: 0.95rem;
          line-height: 1.6;
          margin-bottom: 8px;
        }
        .cb-spinner-wrap {
          display: flex;
          justify-content: center;
          margin-top: 24px;
        }
        .cb-spinner {
          width: 32px;
          height: 32px;
          border: 3px solid var(--line, #d1ddd6);
          border-top-color: var(--accent, #15803d);
          border-radius: 50%;
          animation: cb-spin 0.7s linear infinite;
        }
        @keyframes cb-spin { to { transform: rotate(360deg); } }
        .cb-redirect-note {
          color: var(--accent, #15803d);
          font-size: 0.85rem;
          font-weight: 600;
          margin-top: 16px;
        }
        @media (max-width: 480px) {
          .cb-card { padding: 36px 24px; }
        }
      `}</style>
    </>
  );
}
