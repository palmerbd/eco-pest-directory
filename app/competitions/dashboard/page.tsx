"use client";

// ─── /competitions/dashboard — Competition Organizer Dashboard ────────────────
// Stage 3: Approved organizers can edit dates, venue, description, website,
// registration URL. Changes POST to /api/competition-override and revalidate
// the detail page via ISR.

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import type { CompetitionClaim } from "@/lib/supabase";
import { getBySlug } from "@/lib/competitions-data";

// ── Types ─────────────────────────────────────────────────────────────────────

type PageState = "loading" | "unauthenticated" | "no_claim" | "ready";
type SaveState = "idle" | "saving" | "saved" | "error";

interface OverrideForm {
  date_start:            string;
  date_end:              string;
  venue:                 string;
  description:           string;
  website:               string;
  registration_url:      string;
  registration_deadline: string;
}

const EMPTY_FORM: OverrideForm = {
  date_start:            "",
  date_end:              "",
  venue:                 "",
  description:           "",
  website:               "",
  registration_url:      "",
  registration_deadline: "",
};

// ── Status badge config ───────────────────────────────────────────────────────

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; desc: string }> = {
  pending: {
    label: "Pending Review",
    color: "#92400e", bg: "#fef3c7",
    desc:  "Your claim has been submitted. Our team will review it within 1-2 business days.",
  },
  verified: {
    label: "Verified",
    color: "#065f46", bg: "#d1fae5",
    desc:  "Your email has been verified. Claim review is in progress.",
  },
  approved: {
    label: "Approved",
    color: "#1e3a8a", bg: "#dbeafe",
    desc:  "Your listing is claimed and showing a Verified Organizer badge.",
  },
  rejected: {
    label: "Not Approved",
    color: "#991b1b", bg: "#fee2e2",
    desc:  "We were unable to verify your ownership. Please contact us for details.",
  },
};

// ── Input / Textarea helpers ──────────────────────────────────────────────────

const inputClass =
  "w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-900 bg-white " +
  "focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent " +
  "placeholder:text-gray-300 transition-colors";

const labelClass = "block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5";

// ── Main page ─────────────────────────────────────────────────────────────────

export default function CompetitionDashboardPage() {
  const [pageState, setPageState] = useState<PageState>("loading");
  const [claim,     setClaim]     = useState<CompetitionClaim | null>(null);
  const [email,     setEmail]     = useState("");

  // Edit form state
  const [form,      setForm]      = useState<OverrideForm>(EMPTY_FORM);
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [saveError, setSaveError] = useState("");

  useEffect(() => {
    async function load() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { setPageState("unauthenticated"); return; }

      setEmail(session.user.email || "");

      const { data } = await supabase
        .from("competition_claims")
        .select("*")
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!data) { setPageState("no_claim"); return; }
      const claimData = data as CompetitionClaim;
      setClaim(claimData);
      setPageState("ready");

      // Pre-populate form with existing overrides (if any), falling back to seed data
      if (claimData.status === "approved") {
        const seedComp = getBySlug(claimData.competition_slug);
        const { data: override } = await supabase
          .from("competition_overrides")
          .select("*")
          .eq("competition_slug", claimData.competition_slug)
          .maybeSingle();

        setForm({
          date_start:            override?.date_start            ?? seedComp?.dateStart            ?? "",
          date_end:              override?.date_end              ?? seedComp?.dateEnd              ?? "",
          venue:                 override?.venue                 ?? seedComp?.venue                ?? "",
          description:           override?.description           ?? seedComp?.description          ?? "",
          website:               override?.website               ?? seedComp?.website              ?? "",
          registration_url:      override?.registration_url      ?? seedComp?.registrationUrl      ?? "",
          registration_deadline: override?.registration_deadline ?? seedComp?.registrationDeadline ?? "",
        });
      }
    }
    load();
  }, []);

  // ── Save handler ─────────────────────────────────────────────────────────────

  async function handleSave() {
    if (!claim || saveState === "saving") return;
    setSaveState("saving");
    setSaveError("");

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      const res = await fetch("/api/competition-override", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ claim_id: claim.id, ...form }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Save failed");
      }

      setSaveState("saved");
      setTimeout(() => setSaveState("idle"), 3000);
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : "Save failed");
      setSaveState("error");
    }
  }

  function handleField(key: keyof OverrideForm, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (saveState === "saved" || saveState === "error") setSaveState("idle");
  }

  // ── Sign out ──────────────────────────────────────────────────────────────────

  async function handleSignOut() {
    await supabase.auth.signOut();
    window.location.href = "/";
  }

  // ── Loading ───────────────────────────────────────────────────────────────────

  if (pageState === "loading") {
    return (
      <main style={{ background: "#f8f7f4", minHeight: "100vh" }}
        className="flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full" />
      </main>
    );
  }

  // ── Unauthenticated ───────────────────────────────────────────────────────────

  if (pageState === "unauthenticated") {
    return (
      <main style={{ background: "#f8f7f4", minHeight: "100vh" }}
        className="flex items-center justify-center px-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-10 max-w-md w-full text-center">
          <div className="text-5xl mb-4">🔒</div>
          <h1 className="font-bold text-gray-900 text-xl mb-2">Sign in required</h1>
          <p className="text-gray-500 text-sm mb-6">
            Please claim your competition listing first. You&apos;ll receive a magic link to sign in.
          </p>
          <Link href="/competitions/claim"
            className="inline-block px-6 py-3 rounded-xl font-bold text-white text-sm"
            style={{ background: "linear-gradient(135deg,#1d4ed8,#3b82f6)" }}>
            Claim Your Listing
          </Link>
        </div>
      </main>
    );
  }

  // ── No claim found ────────────────────────────────────────────────────────────

  if (pageState === "no_claim") {
    return (
      <main style={{ background: "#f8f7f4", minHeight: "100vh" }}
        className="flex items-center justify-center px-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-10 max-w-md w-full text-center">
          <div className="text-5xl mb-4">🏆</div>
          <h1 className="font-bold text-gray-900 text-xl mb-2">No claim found</h1>
          <p className="text-gray-500 text-sm mb-6">
            We don&apos;t have a claim on file for <strong>{email}</strong>.
          </p>
          <Link href="/competitions/claim"
            className="inline-block px-6 py-3 rounded-xl font-bold text-white text-sm"
            style={{ background: "linear-gradient(135deg,#1d4ed8,#3b82f6)" }}>
            Claim Your Listing
          </Link>
          <button onClick={handleSignOut}
            className="block w-full mt-4 text-xs text-gray-400 hover:text-gray-700">
            Sign out
          </button>
        </div>
      </main>
    );
  }

  // ── Ready ─────────────────────────────────────────────────────────────────────

  const statusCfg = STATUS_CONFIG[claim!.status] ?? STATUS_CONFIG.pending;
  const compUrl   = `/competitions/${claim!.competition_slug}`;
  const isApproved = claim!.status === "approved";

  return (
    <main style={{ background: "#f8f7f4", minHeight: "100vh" }}>

      {/* Header */}
      <div style={{ background: "linear-gradient(135deg,#0c1428 0%,#1a2d5a 100%)" }}
        className="py-10 px-6">
        <div className="max-w-3xl mx-auto flex items-start justify-between">
          <div>
            <p className="text-white/50 text-xs mb-1 font-medium uppercase tracking-wide">Organizer Dashboard</p>
            <h1 className="font-bold text-white text-2xl">{claim!.competition_name}</h1>
            <p className="text-white/60 text-sm mt-1">{email}</p>
          </div>
          <button onClick={handleSignOut}
            className="text-white/40 hover:text-white text-xs transition-colors mt-1">
            Sign out
          </button>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-10 space-y-6">

        {/* Status card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-gray-900 text-base">Claim Status</h2>
            <span className="px-3 py-1 rounded-full text-xs font-bold"
              style={{ background: statusCfg.bg, color: statusCfg.color }}>
              {statusCfg.label}
            </span>
          </div>
          <p className="text-gray-500 text-sm mb-4">{statusCfg.desc}</p>
          <div className="border-t border-gray-100 pt-4 grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-400 text-xs font-semibold uppercase tracking-wide mb-1">Competition</p>
              <p className="text-gray-900 font-medium">{claim!.competition_name}</p>
            </div>
            <div>
              <p className="text-gray-400 text-xs font-semibold uppercase tracking-wide mb-1">Listing Tier</p>
              <p className="text-gray-900 font-medium capitalize">{claim!.tier}</p>
            </div>
            <div>
              <p className="text-gray-400 text-xs font-semibold uppercase tracking-wide mb-1">Your Name</p>
              <p className="text-gray-900 font-medium">{claim!.organizer_name}</p>
            </div>
            <div>
              <p className="text-gray-400 text-xs font-semibold uppercase tracking-wide mb-1">Claimed</p>
              <p className="text-gray-900 font-medium">
                {new Date(claim!.created_at).toLocaleDateString("en-US", {
                  month: "short", day: "numeric", year: "numeric",
                })}
              </p>
            </div>
          </div>
          <div className="mt-4">
            <Link href={compUrl} target="_blank"
              className="text-sm font-semibold hover:underline"
              style={{ color: "#1d4ed8" }}>
              View your competition listing ↗
            </Link>
          </div>
        </div>

        {/* ── Edit Listing Form (approved only) ──────────────────────────────── */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="font-bold text-gray-900 text-base">Manage Your Listing</h2>
              <p className="text-gray-400 text-xs mt-0.5">
                Changes go live on your listing page within seconds.
              </p>
            </div>
            {isApproved && (
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700">
                ✓ Live
              </span>
            )}
          </div>

          {!isApproved ? (
            /* Pending / not yet approved */
            <div className="rounded-xl bg-gray-50 border border-gray-100 p-5 text-center">
              <p className="text-gray-400 text-sm">
                Editing will be available once your claim is approved.
              </p>
              <p className="text-gray-300 text-xs mt-1">
                Approval typically takes 1–2 business days.
              </p>
            </div>
          ) : (
            /* Full edit form */
            <div className="space-y-5">

              {/* Dates */}
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3 pb-2 border-b border-gray-100">
                  Event Dates
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className={labelClass}>Start Date</label>
                    <input type="date" value={form.date_start}
                      onChange={(e) => handleField("date_start", e.target.value)}
                      className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>End Date</label>
                    <input type="date" value={form.date_end}
                      onChange={(e) => handleField("date_end", e.target.value)}
                      className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Registration Deadline</label>
                    <input type="date" value={form.registration_deadline}
                      onChange={(e) => handleField("registration_deadline", e.target.value)}
                      className={inputClass} />
                  </div>
                </div>
              </div>

              {/* Venue */}
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3 pb-2 border-b border-gray-100">
                  Venue
                </p>
                <label className={labelClass}>Venue Name</label>
                <input type="text" value={form.venue}
                  onChange={(e) => handleField("venue", e.target.value)}
                  placeholder="e.g. Marriott Marquis, Columbus, OH"
                  className={inputClass} />
              </div>

              {/* Description */}
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3 pb-2 border-b border-gray-100">
                  Description
                </p>
                <label className={labelClass}>About This Competition</label>
                <textarea value={form.description}
                  onChange={(e) => handleField("description", e.target.value)}
                  rows={4}
                  placeholder="Describe your competition — styles offered, who it's for, what makes it special..."
                  className={inputClass + " resize-none"} />
                <p className="text-xs text-gray-400 mt-1">
                  {form.description.length}/500 characters
                </p>
              </div>

              {/* Links */}
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3 pb-2 border-b border-gray-100">
                  Links
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Official Website</label>
                    <input type="url" value={form.website}
                      onChange={(e) => handleField("website", e.target.value)}
                      placeholder="https://yourcompetition.com"
                      className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Registration Link</label>
                    <input type="url" value={form.registration_url}
                      onChange={(e) => handleField("registration_url", e.target.value)}
                      placeholder="https://yourcompetition.com/register"
                      className={inputClass} />
                  </div>
                </div>
              </div>

              {/* Save bar */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <div className="text-sm">
                  {saveState === "saved" && (
                    <span className="text-green-600 font-semibold flex items-center gap-1.5">
                      <span className="text-lg">✓</span> Changes saved — your listing is updated.
                    </span>
                  )}
                  {saveState === "error" && (
                    <span className="text-red-500 text-xs">{saveError}</span>
                  )}
                </div>
                <button
                  onClick={handleSave}
                  disabled={saveState === "saving"}
                  className="px-6 py-2.5 rounded-xl font-bold text-white text-sm
                             transition-all hover:brightness-110 disabled:opacity-60
                             disabled:cursor-not-allowed flex items-center gap-2"
                  style={{ background: "linear-gradient(135deg,#1d4ed8,#3b82f6)" }}
                >
                  {saveState === "saving" ? (
                    <>
                      <span className="animate-spin w-3.5 h-3.5 border-2 border-white
                                       border-t-transparent rounded-full inline-block" />
                      Saving…
                    </>
                  ) : "Save Changes"}
                </button>
              </div>

            </div>
          )}
        </div>

        {/* Upgrade to Featured */}
        {claim!.tier === "free" && (
          <div className="rounded-2xl p-6 relative overflow-hidden"
            style={{ background: "linear-gradient(135deg,#1e3a8a 0%,#1d4ed8 100%)" }}>
            <div className="absolute top-4 right-4 text-2xl opacity-20">⭐</div>
            <h2 className="font-bold text-white text-base mb-2">Upgrade to Featured — $199/yr</h2>
            <p className="text-blue-100 text-sm mb-4">
              Get priority placement in search results, a Featured badge, and appear in city &amp;
              style landing pages — in front of dancers actively searching for your event.
            </p>
            <ul className="space-y-1.5 text-blue-100 text-sm mb-5">
              {[
                "⭐ Featured badge on all listings",
                "Priority placement in search & browse results",
                "\"Upcoming Near You\" city page widget",
                "Style and region landing page inclusion",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <span className="text-blue-300 font-bold">✓</span>{item}
                </li>
              ))}
            </ul>
            <Link
              href="/competitions/upgrade"
              className="inline-block px-6 py-2.5 rounded-xl font-bold text-sm transition-all hover:brightness-110"
              style={{ background: "linear-gradient(135deg,#b8922a,#e8c560)", color: "#111" }}
            >
              Upgrade to Featured — $199/yr →
            </Link>
          </div>
        )}

        {/* Featured confirmation */}
        {claim!.tier === "featured" && (
          <div className="rounded-2xl p-6 text-center"
            style={{ background: "linear-gradient(135deg,#78350f 0%,#92400e 100%)" }}>
            <div className="text-3xl mb-2">⭐</div>
            <h2 className="font-bold text-yellow-200 text-base mb-1">Your listing is Featured</h2>
            <p className="text-yellow-300/70 text-sm">
              Priority placement is active. Your event appears in city widgets and topped search results.
            </p>
          </div>
        )}

        {/* Help */}
        <div className="text-center pt-2 pb-6">
          <p className="text-gray-400 text-sm">
            Questions?{" "}
            <Link href="/contact" className="text-blue-600 hover:underline">Contact us</Link>
            {" "}or{" "}
            <Link href="/competitions" className="text-blue-600 hover:underline">browse all competitions</Link>.
          </p>
        </div>

      </div>
    </main>
  );
}
