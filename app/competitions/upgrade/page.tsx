"use client";

// ─── /competitions/upgrade — Competition Featured Upgrade Page ────────────────
// Only accessible to approved competition claim owners.
// Offers $199/yr Featured plan and initiates Stripe Checkout.

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import type { CompetitionClaim } from "@/lib/supabase";

type PageState = "loading" | "unauthenticated" | "no_claim" | "already_paid" | "ready" | "redirecting";

const FEATURES = [
  {
    icon: "⭐",
    title: "Featured Badge",
    desc: "A gold 'Featured' badge on your competition card and detail page separates your event from every other listing in the directory.",
  },
  {
    icon: "🔝",
    title: "Priority Placement",
    desc: "Featured competitions appear first on /competitions, region pages, and style pages — above all free listings, in front of the most motivated dancers.",
  },
  {
    icon: "📍",
    title: "City Page Widget",
    desc: "Your competition appears in the 'Upcoming Competitions Near You' widget on city studio pages — reaching dancers right when they're researching your market.",
  },
  {
    icon: "✏️",
    title: "Listing Control",
    desc: "Update your dates, venue, description, website, and registration link anytime from the organizer dashboard. Changes go live in seconds.",
  },
  {
    icon: "✓",
    title: "Verified Organizer Badge",
    desc: "The Verified Organizer badge is included with your Featured plan — no separate claim fee required.",
  },
];

export default function CompetitionUpgradePage() {
  const [pageState, setPageState] = useState<PageState>("loading");
  const [claim,     setClaim]     = useState<CompetitionClaim | null>(null);
  const [error,     setError]     = useState("");

  useEffect(() => {
    async function load() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { setPageState("unauthenticated"); return; }

      const { data } = await supabase
        .from("competition_claims")
        .select("*")
        .eq("user_id", session.user.id)
        .eq("status", "approved")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!data)                  { setPageState("no_claim");     return; }
      if (data.tier === "paid")   { setPageState("already_paid"); return; }

      setClaim(data as CompetitionClaim);
      setPageState("ready");
    }
    load();
  }, []);

  async function handleUpgrade() {
    if (!claim) return;
    setPageState("redirecting");
    setError("");

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { setPageState("unauthenticated"); return; }

      const res = await fetch("/api/stripe/competition-checkout", {
        method:  "POST",
        headers: {
          "Content-Type":  "application/json",
          "Authorization": `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          claim_id:    claim.id,
          owner_email: session.user.email,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.url) {
        setError(json.error || "Something went wrong. Please try again.");
        setPageState("ready");
        return;
      }

      window.location.href = json.url;
    } catch {
      setError("Network error. Please try again.");
      setPageState("ready");
    }
  }

  // ── Loading ───────────────────────────────────────────────────────────────
  if (pageState === "loading") {
    return (
      <main style={{ background: "#f8f7f4", minHeight: "100vh" }}
        className="flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full" />
      </main>
    );
  }

  // ── Not logged in ─────────────────────────────────────────────────────────
  if (pageState === "unauthenticated") {
    return (
      <main style={{ background: "#f8f7f4", minHeight: "100vh" }}
        className="flex items-center justify-center px-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-10 max-w-md w-full text-center">
          <div className="text-5xl mb-4">🔒</div>
          <h1 className="font-bold text-gray-900 text-xl mb-2">Claim your listing first</h1>
          <p className="text-gray-500 text-sm mb-6">
            You need to claim and verify your competition listing before upgrading to Featured.
          </p>
          <Link href="/competitions/claim"
            className="inline-block w-full py-3 rounded-xl font-bold text-gray-900 text-sm text-center transition-all hover:brightness-110"
            style={{ background: "linear-gradient(135deg,#b8922a,#e8c560)" }}>
            Claim Your Listing
          </Link>
        </div>
      </main>
    );
  }

  // ── No approved claim ─────────────────────────────────────────────────────
  if (pageState === "no_claim") {
    return (
      <main style={{ background: "#f8f7f4", minHeight: "100vh" }}
        className="flex items-center justify-center px-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-10 max-w-md w-full text-center">
          <div className="text-5xl mb-4">📋</div>
          <h1 className="font-bold text-gray-900 text-xl mb-2">No approved claim found</h1>
          <p className="text-gray-500 text-sm mb-6">
            Upgrade is available once your competition claim has been approved by our team.
          </p>
          <Link href="/competitions/dashboard"
            className="text-sm font-semibold text-blue-600 hover:underline">
            Back to dashboard →
          </Link>
        </div>
      </main>
    );
  }

  // ── Already on paid plan ──────────────────────────────────────────────────
  if (pageState === "already_paid") {
    return (
      <main style={{ background: "#f8f7f4", minHeight: "100vh" }}
        className="flex items-center justify-center px-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-10 max-w-md w-full text-center">
          <div className="text-5xl mb-4">⭐</div>
          <h1 className="font-bold text-gray-900 text-xl mb-2">Already Featured!</h1>
          <p className="text-gray-500 text-sm mb-6">
            Your competition listing is on the Featured plan. Manage it from the dashboard.
          </p>
          <Link href="/competitions/dashboard"
            className="inline-block w-full py-3 rounded-xl font-bold text-gray-900 text-sm text-center transition-all hover:brightness-110"
            style={{ background: "linear-gradient(135deg,#b8922a,#e8c560)" }}>
            Go to Dashboard
          </Link>
        </div>
      </main>
    );
  }

  // ── Main upgrade page ─────────────────────────────────────────────────────
  return (
    <main style={{ background: "#f8f7f4", minHeight: "100vh" }}>

      {/* Hero */}
      <div style={{ background: "linear-gradient(135deg,#0c1428 0%,#1a2d5a 100%)" }}
        className="py-16 px-6 text-center">
        <Link href="/competitions/dashboard"
          className="text-white/40 hover:text-white text-sm transition-colors block mb-6">
          ← Back to dashboard
        </Link>

        <div className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-4"
          style={{ background: "#b8922a22", color: "#e8c560", border: "1px solid #b8922a" }}>
          Featured Competition
        </div>

        <h1 className="font-bold text-white text-4xl mb-4">
          Get your competition in front<br />of every dancer searching nearby
        </h1>
        <p className="text-white/60 text-lg max-w-xl mx-auto mb-8">
          Upgrade <strong className="text-white">{claim?.competition_name ?? "your competition"}</strong> to
          Featured and reach dancers actively planning their competitive season.
        </p>

        {/* Price */}
        <div className="inline-block bg-white/5 border border-white/10 rounded-2xl px-8 py-6 mb-8">
          <div className="text-white/50 text-sm mb-1">Annual subscription</div>
          <div className="text-white font-bold text-5xl">
            $199<span className="text-2xl text-white/50 font-normal">/yr</span>
          </div>
          <div className="text-white/40 text-xs mt-2">
            ~$16.58/month · Cancel anytime.
          </div>
        </div>

        {/* CTA */}
        <div className="flex flex-col items-center gap-3">
          <button
            onClick={handleUpgrade}
            disabled={pageState === "redirecting"}
            className="px-10 py-4 rounded-xl font-bold text-gray-900 text-base transition-all hover:brightness-110 disabled:opacity-60 disabled:cursor-not-allowed"
            style={{ background: "linear-gradient(135deg,#b8922a,#e8c560)" }}
          >
            {pageState === "redirecting" ? "Redirecting to checkout…" : "Upgrade to Featured →"}
          </button>
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <p className="text-white/30 text-xs">
            Secure checkout powered by Stripe. Cancel anytime from your dashboard.
          </p>
        </div>
      </div>

      {/* Features grid */}
      <div className="max-w-3xl mx-auto px-6 py-16">
        <h2 className="font-bold text-gray-900 text-2xl text-center mb-10">
          Everything included in Featured
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {FEATURES.map((f) => (
            <div key={f.title} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <div className="text-3xl mb-3">{f.icon}</div>
              <h3 className="font-bold text-gray-900 mb-2">{f.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>

        {/* FAQ */}
        <div className="mt-14">
          <h2 className="font-bold text-gray-900 text-xl mb-6">Common questions</h2>
          <div className="space-y-5">
            {[
              {
                q: "Can I cancel anytime?",
                a: "Yes. Cancel from your dashboard and your listing reverts to the free claimed tier at the end of your billing period. No penalties.",
              },
              {
                q: "Do I need a separate claim to upgrade?",
                a: "No. Upgrade is available directly from your organizer dashboard once your claim is approved. The Verified Organizer badge is included.",
              },
              {
                q: "When does my listing update?",
                a: "Immediately. The Featured badge appears within seconds of your Stripe checkout completing — no manual review required.",
              },
              {
                q: "What if my event is annual?",
                a: "The annual plan is designed for recurring events. Your listing stays Featured year-round and you can update dates each season from the dashboard.",
              },
            ].map(({ q, a }) => (
              <div key={q} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h3 className="font-bold text-gray-900 mb-2 text-sm">{q}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{a}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="mt-12 text-center">
          <button
            onClick={handleUpgrade}
            disabled={pageState === "redirecting"}
            className="px-10 py-4 rounded-xl font-bold text-gray-900 text-base transition-all hover:brightness-110 disabled:opacity-60"
            style={{ background: "linear-gradient(135deg,#b8922a,#e8c560)" }}
          >
            {pageState === "redirecting" ? "Redirecting…" : "Upgrade to Featured — $199/yr →"}
          </button>
          <p className="text-gray-400 text-xs mt-3">Cancel anytime · Powered by Stripe</p>
        </div>
      </div>
    </main>
  );
}
