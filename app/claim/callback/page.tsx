"use client";

// ─── /claim/callback — Magic Link Callback ────────────────────────────────────
// Supabase redirects here after user clicks the magic link in their email.
// Exchanges the auth code for a session, reads pending claim from localStorage,
// calls /api/claim to finalize, then redirects to /dashboard.

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Status = "verifying" | "claiming" | "success" | "error";

export default function ClaimCallbackPage() {
  const router = useRouter();
  const [status,  setStatus]  = useState<Status>("verifying");
  const [message, setMessage] = useState("Verifying your identity…");

  useEffect(() => {
    async function handleCallback() {
      const { data: sessionData, error: sessionError } =
        await supabase.auth.getSession();

      if (sessionError || !sessionData.session) {
        setStatus("error");
        setMessage("Verification failed. The link may have expired. Please try claiming again.");
        return;
      }

      const raw = localStorage.getItem("pendingClaim");
      if (!raw) { router.push("/dashboard"); return; }

      let claim: Record<string, string>;
      try { claim = JSON.parse(raw); } catch {
        setStatus("error");
        setMessage("Claim data was corrupted. Please start the claim process again.");
        return;
      }

      setStatus("claiming");
      setMessage("Recording your claim…");

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
          } else {
            throw new Error(body.message || "Unknown error");
          }
          return;
        }

        localStorage.removeItem("pendingClaim");
        setStatus("success");
        setMessage("Claim verified! Redirecting to your dashboard…");
        setTimeout(() => router.push("/dashboard"), 1500);

      } catch (err) {
        console.error("Claim finalization error:", err);
        setStatus("error");
        setMessage("Something went wrong while recording your claim. Please contact us.");
      }
    }

    handleCallback();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const iconMap: Record<Status, string> = {
    verifying: "🔐", claiming: "📝", success: "✅", error: "⚠️",
  };

  return (
    <main
      style={{ background: "linear-gradient(135deg,#0c1428 0%,#1a2d5a 100%)", minHeight: "100vh" }}
      className="flex items-center justify-center px-6"
    >
      <div className="bg-white rounded-2xl shadow-lg p-10 max-w-md w-full text-center">
        <div className="text-5xl mb-5">{iconMap[status]}</div>
        <h1 className="font-bold text-gray-900 text-xl mb-3">
          {status === "success" ? "Claim Verified!" :
           status === "error"   ? "Something went wrong" :
                                  "Processing your claim…"}
        </h1>
        <p className="text-gray-500 text-sm leading-relaxed">{message}</p>
        {status === "error" && (
          <a href="/claim"
            className="inline-block mt-6 px-6 py-2.5 rounded-xl font-bold text-sm text-gray-900 transition-all hover:brightness-110"
            style={{ background: "linear-gradient(135deg,#b8922a,#e8c560)" }}
          >Try Again</a>
        )}
        {(status === "verifying" || status === "claiming") && (
          <div className="flex justify-center mt-6">
            <div className="animate-spin w-6 h-6 border-2 border-yellow-400 border-t-transparent rounded-full" />
          </div>
        )}
      </div>
    </main>
  );
}
