"use client";

// ─── /competitions/upgrade/success — Post-checkout success page ───────────────
// Shown after Stripe redirects back. Confirms the upgrade and links to dashboard.

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function SuccessContent() {
  const params   = useSearchParams();
  const sessionId = params.get("session_id");
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Small delay so the animation feels intentional
    const t = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(t);
  }, []);

  return (
    <main
      style={{ background: "linear-gradient(135deg,#0c1428 0%,#1a2d5a 100%)", minHeight: "100vh" }}
      className="flex items-center justify-center px-6"
    >
      <div
        className={`bg-white rounded-3xl shadow-xl p-10 max-w-md w-full text-center transition-all duration-500 ${
          visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        }`}
        style={{ transform: visible ? "translateY(0)" : "translateY(16px)" }}
      >
        {/* Animated star */}
        <div className="text-6xl mb-5 animate-bounce">⭐</div>

        <h1 className="font-bold text-gray-900 text-2xl mb-3">
          You&apos;re now Featured!
        </h1>
        <p className="text-gray-500 text-sm leading-relaxed mb-6">
          Your competition listing has been upgraded. The Featured badge is live on your listing right now.
          Dancers searching in your area will see your event first.
        </p>

        {sessionId && (
          <p className="text-xs text-gray-300 font-mono mb-6">
            Confirmation: {sessionId.slice(-12)}
          </p>
        )}

        {/* Action buttons */}
        <div className="flex flex-col gap-3">
          <Link
            href="/competitions/dashboard"
            className="block w-full py-3 rounded-xl font-bold text-gray-900 text-sm transition-all hover:brightness-110"
            style={{ background: "linear-gradient(135deg,#b8922a,#e8c560)" }}
          >
            Go to Dashboard →
          </Link>
          <Link
            href="/competitions"
            className="block w-full py-3 rounded-xl font-semibold text-gray-600 text-sm border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            Browse All Competitions
          </Link>
        </div>

        <p className="text-xs text-gray-300 mt-6">
          A receipt has been sent to your email by Stripe.
        </p>
      </div>
    </main>
  );
}

export default function CompetitionUpgradeSuccessPage() {
  return (
    <Suspense>
      <SuccessContent />
    </Suspense>
  );
}
