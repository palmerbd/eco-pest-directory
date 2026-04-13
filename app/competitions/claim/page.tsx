import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Claim Your Competition Listing | Ballroom Dance Directory",
  description:
    "Is your ballroom dance competition listed here? Claim your free listing to update dates, add your website link, and connect with dancers across the country.",
};

export default function CompetitionClaimPage() {
  return (
    <main className="min-h-screen" style={{ background: "#f9f6f0" }}>
      {/* Hero */}
      <section className="text-white py-20 px-4 sm:px-6 text-center"
        style={{ background: "linear-gradient(135deg, #0c1428 0%, #1a2d5a 100%)" }}>
        <div className="text-5xl mb-4">🏆</div>
        <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">
          Claim Your Competition Listing
        </h1>
        <p className="text-lg text-gray-300 max-w-2xl mx-auto">
          Manage your competition profile, keep dates accurate, and reach thousands of
          dancers searching for events near them.
        </p>
      </section>

      {/* Tiers */}
      <section className="py-16 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">

          {/* Free Claim */}
          <div className="bg-white rounded-2xl border border-gray-200 p-8">
            <h2 className="font-display text-2xl font-bold text-gray-900 mb-2">Free Listing</h2>
            <p className="text-3xl font-bold text-gray-900 mb-1">$0</p>
            <p className="text-sm text-gray-400 mb-6">Always free</p>
            <ul className="space-y-3 text-sm text-gray-600 mb-8">
              {[
                "Claim & verify your listing",
                "Update competition dates",
                "Add website & registration link",
                "Add description and venue details",
                "Appear in search results",
              ].map((item) => (
                <li key={item} className="flex items-center gap-2">
                  <span className="text-green-500 font-bold">✓</span>
                  {item}
                </li>
              ))}
            </ul>
            <button
              disabled
              className="w-full py-3 rounded-lg font-bold text-gray-400 bg-gray-100 cursor-not-allowed"
            >
              Claim Coming Soon
            </button>
            <p className="text-xs text-gray-400 text-center mt-3">
              Stage 2 — launching soon
            </p>
          </div>

          {/* Featured */}
          <div className="bg-white rounded-2xl border-2 border-yellow-400 p-8 relative overflow-hidden">
            <div className="absolute top-4 right-4 px-2.5 py-1 rounded-full text-xs font-bold"
              style={{ background: "linear-gradient(135deg, #b8922a, #e8c560)", color: "#fff" }}>
              ⭐ Best Value
            </div>
            <h2 className="font-display text-2xl font-bold text-gray-900 mb-2">Featured Listing</h2>
            <p className="text-3xl font-bold text-gray-900 mb-1">$199</p>
            <p className="text-sm text-gray-400 mb-6">per year</p>
            <ul className="space-y-3 text-sm text-gray-600 mb-8">
              {[
                "Everything in Free, plus:",
                "⭐ Featured badge on all listings",
                "Priority placement in search results",
                "\"Upcoming Competitions Near You\" on city pages",
                "Appear on style and region landing pages",
                "Direct registration link promotion",
              ].map((item) => (
                <li key={item} className="flex items-center gap-2">
                  <span className="font-bold" style={{ color: "#b8922a" }}>✓</span>
                  {item}
                </li>
              ))}
            </ul>
            <button
              disabled
              className="w-full py-3 rounded-lg font-bold text-gray-400 bg-gray-100 cursor-not-allowed"
            >
              Upgrade Coming Soon
            </button>
            <p className="text-xs text-gray-400 text-center mt-3">
              Stage 4 — launching soon
            </p>
          </div>
        </div>
      </section>

      {/* Back link */}
      <div className="pb-16 text-center">
        <Link href="/competitions" className="text-sm font-medium" style={{ color: "#b8922a" }}>
          ← Back to all competitions
        </Link>
      </div>
    </main>
  );
}
