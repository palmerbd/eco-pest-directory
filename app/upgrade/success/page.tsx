"use client";

// ─── /upgrade/success — Post-Checkout Confirmation ────────────────────────────────────────
// Stripe redirects here after a successful checkout session.
// Shows confirmation and links back to dashboard.

import Link from "next/link";
import { useEffect, useState } from "react";

export default function UpgradeSuccessPage() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Small delay so the page feels intentional rather than instant
    const t = setTimeout(() => setReady(true), 600);
    return () => clearTimeout(t);
  }, []);

  if (!ready) {
    return (
      <main style={{ background: "#f8f7f4", minHeight: "100vh" }}
        className="flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-yellow-400 border-t-transparent rounded-full" />
      </main>
    );
  }

  return (
    <main style={{ background: "#f8f7f4", minHeight: "100vh" }}
      className="flex items-center justify-center px-6">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-10 max-w-lg w-full text-center">

        <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6"
          style={{ background: "linear-gradient(135deg,#b8922a,#e8c560)" }}>
          <span className="text-3xl">&#11088;</span>
        </div>

        <h1 className="font-bold text-gray-900 text-2xl mb-3">
          Welcome to Featured!
        </h1>
        <p className="text-gray-500 text-sm leading-relaxed mb-8">
          Your listing is now upgraded. The Featured badge, priority placement, and lead capture form
          are active. Your first inquiry could arrive today.
        </p>

        {/* What happens next */}
        <div className="text-left bg-gray-50 rounded-xl p-5 mb-8 space-y-3">
          <div className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">What happens next</div>
          {[
            "Your listing now shows the gold Featured badge",
            "Lead capture form is live on your listing page",
            "You appear above free listings in search results",
            "A welcome email with your receipt is on its way",
          ].map((item) => (
            <div key={item} className="flex items-start gap-3 text-sm text-gray-700">
              <span className="text-green-500 font-bold flex-shrink-0">&#10003;</span>
              {item}
            </div>
          ))}
        </div>

        <Link
          href="/dashboard"
          className="inline-block w-full py-3 rounded-xl font-bold text-gray-900 text-sm text-center transition-all hover:brightness-110"
          style={{ background: "linear-gradient(135deg,#b8922a,#e8c560)" }}
        >
          Go to your dashboard &rarr;
        </Link>

        <p className="text-gray-400 text-xs mt-4">
          Questions? <Link href="/contact" className="text-yellow-700 hover:underline">Contact us</Link>
        </p>
      </div>
    </main>
  );
}
