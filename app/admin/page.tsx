"use client";

/**
 * /admin — BDD Studio Claims Command Center
 * ─────────────────────────────────────────
 * Password-gated admin dashboard showing:
 *   - Claimed studios (free tier, not yet upgraded)
 *   - Featured studios (paid, upgraded)
 *
 * Per studio: push to GHL pipeline with one click.
 *
 * Auth: simple password stored in sessionStorage.
 * Password is validated server-side against ADMIN_SECRET env var.
 */

import { useState, useEffect, useCallback } from "react";

// ── Types ─────────────────────────────────────────────────────────────────────

interface Claim {
  id:            string;
  studio_id:     number;
  studio_slug:   string;
  studio_title:  string;
  owner_name:    string;
  owner_email:   string;
  owner_phone:   string;
  status:        string;
  tier:          "claimed" | "paid";
  stripe_subscription_id: string | null;
  created_at:    string;
  updated_at:    string;
  studio_profiles: {
    custom_description: string | null;
    facebook_url:       string | null;
    instagram_url:      string | null;
    promo_text:         string | null;
    show_google_reviews: boolean;
  } | null;
  // UI state
  ghlStatus?: "idle" | "loading" | "success" | "error";
  ghlMessage?: string;
}

interface ClaimsData {
  claimed:  Claim[];
  featured: Claim[];
  total:    number;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
  });
}

function daysSince(iso: string) {
  return Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000);
}

const WP_ADMIN = "http://5.78.144.42/wp-admin/post.php";

// ── Sub-components ────────────────────────────────────────────────────────────

function TierBadge({ tier }: { tier: "claimed" | "paid" }) {
  return tier === "paid" ? (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">
      ⭐ Featured
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
      🔵 Claimed
    </span>
  );
}

function ProfileCompleteness({ claim }: { claim: Claim }) {
  const p = claim.studio_profiles;
  const items = [
    { label: "Description", done: !!p?.custom_description },
    { label: "Instagram",   done: !!p?.instagram_url },
    { label: "Facebook",    done: !!p?.facebook_url },
    { label: "Promotion",   done: !!p?.promo_text },
  ];
  const done = items.filter(i => i.done).length;
  return (
    <div className="text-xs text-gray-500">
      <span className={done === items.length ? "text-green-600 font-medium" : "text-orange-500"}>
        {done}/{items.length} profile fields
      </span>
      <span className="ml-1 text-gray-400">
        ({items.filter(i => !i.done).map(i => i.label).join(", ") || "complete ✓"})
      </span>
    </div>
  );
}

function ClaimRow({
  claim,
  adminToken,
  onGhlUpdate,
}: {
  claim: Claim;
  adminToken: string;
  onGhlUpdate: (id: string, status: Claim["ghlStatus"], msg: string) => void;
}) {
  const days = daysSince(claim.created_at);

  async function pushToGHL() {
    onGhlUpdate(claim.id, "loading", "");
    try {
      const res = await fetch("/api/admin/push-ghl", {
        method: "POST",
        headers: {
          "Content-Type":  "application/json",
          "Authorization": `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          claim_id:     claim.id,
          owner_name:   claim.owner_name,
          owner_email:  claim.owner_email,
          owner_phone:  claim.owner_phone,
          studio_title: claim.studio_title,
          studio_slug:  claim.studio_slug,
          tier:         claim.tier,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Unknown error");
      onGhlUpdate(
        claim.id,
        "success",
        `✓ ${data.pipeline} → ${data.stage}`
      );
    } catch (err: any) {
      onGhlUpdate(claim.id, "error", err.message);
    }
  }

  return (
    <tr className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
      {/* Studio */}
      <td className="py-3 px-4">
        <div className="font-medium text-gray-900 text-sm">{claim.studio_title}</div>
        <div className="text-xs text-gray-500 mt-0.5 flex gap-2">
          <a
            href={`https://www.ballroomdancedirectory.com/studios/${claim.studio_slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 hover:underline"
          >
            View listing ↗
          </a>
          <a
            href={`${WP_ADMIN}?post=${claim.studio_id}&action=edit`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-purple-500 hover:underline"
          >
            WP editor ↗
          </a>
        </div>
      </td>

      {/* Tier */}
      <td className="py-3 px-4">
        <TierBadge tier={claim.tier} />
        {claim.tier === "paid" && claim.stripe_subscription_id && (
          <div className="text-xs text-gray-400 mt-1">
            <a
              href={`https://dashboard.stripe.com/subscriptions/${claim.stripe_subscription_id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline"
            >
              Stripe ↗
            </a>
          </div>
        )}
      </td>

      {/* Owner */}
      <td className="py-3 px-4">
        <div className="text-sm font-medium text-gray-800">{claim.owner_name}</div>
        <div className="text-xs text-gray-500">
          <a href={`mailto:${claim.owner_email}`} className="hover:underline">{claim.owner_email}</a>
        </div>
        {claim.owner_phone && (
          <div className="text-xs text-gray-500">
            <a href={`tel:${claim.owner_phone}`} className="hover:underline">{claim.owner_phone}</a>
          </div>
        )}
      </td>

      {/* Profile */}
      <td className="py-3 px-4">
        <ProfileCompleteness claim={claim} />
      </td>

      {/* Date */}
      <td className="py-3 px-4 whitespace-nowrap">
        <div className="text-sm text-gray-700">{fmtDate(claim.created_at)}</div>
        <div className={`text-xs ${days > 14 ? "text-red-500 font-medium" : "text-gray-400"}`}>
          {days}d ago
        </div>
      </td>

      {/* GHL */}
      <td className="py-3 px-4">
        {claim.ghlStatus === "success" ? (
          <div className="text-xs text-green-600 font-medium">{claim.ghlMessage}</div>
        ) : claim.ghlStatus === "error" ? (
          <div className="space-y-1">
            <div className="text-xs text-red-500">{claim.ghlMessage}</div>
            <button
              onClick={pushToGHL}
              className="text-xs text-blue-500 hover:underline"
            >
              Retry
            </button>
          </div>
        ) : (
          <button
            onClick={pushToGHL}
            disabled={claim.ghlStatus === "loading"}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#0f2d6b] hover:bg-[#1a3d8a] text-white transition-colors disabled:opacity-50"
          >
            {claim.ghlStatus === "loading" ? (
              <>
                <span className="animate-spin">⟳</span> Pushing…
              </>
            ) : (
              <>⚡ Push to GHL</>
            )}
          </button>
        )}
      </td>
    </tr>
  );
}

function ClaimsTable({
  claims,
  adminToken,
  onGhlUpdate,
  emptyMsg,
}: {
  claims: Claim[];
  adminToken: string;
  onGhlUpdate: (id: string, status: Claim["ghlStatus"], msg: string) => void;
  emptyMsg: string;
}) {
  if (claims.length === 0) {
    return (
      <div className="text-center py-12 text-gray-400 text-sm">{emptyMsg}</div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left">
        <thead>
          <tr className="border-b-2 border-gray-200 text-xs text-gray-500 uppercase tracking-wide">
            <th className="py-2 px-4">Studio</th>
            <th className="py-2 px-4">Tier</th>
            <th className="py-2 px-4">Owner</th>
            <th className="py-2 px-4">Profile</th>
            <th className="py-2 px-4">Claimed</th>
            <th className="py-2 px-4">GHL</th>
          </tr>
        </thead>
        <tbody>
          {claims.map(claim => (
            <ClaimRow
              key={claim.id}
              claim={claim}
              adminToken={adminToken}
              onGhlUpdate={onGhlUpdate}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── Login screen ──────────────────────────────────────────────────────────────

function LoginScreen({ onLogin }: { onLogin: (token: string) => void }) {
  const [password, setPassword] = useState("");
  const [error,    setError]    = useState("");
  const [loading,  setLoading]  = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Validate by hitting the claims endpoint — if it returns 401 the password is wrong
    try {
      const res = await fetch("/api/admin/claims", {
        headers: { Authorization: `Bearer ${password}` },
      });
      if (res.status === 401) {
        setError("Incorrect password.");
      } else {
        sessionStorage.setItem("bdd_admin_token", password);
        onLogin(password);
      }
    } catch {
      setError("Network error — try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#0c1428] flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-sm">
        <div className="text-center mb-6">
          <div className="text-3xl mb-2">🎯</div>
          <h1 className="text-xl font-bold text-gray-900">BDD Command Center</h1>
          <p className="text-sm text-gray-500 mt-1">Admin access only</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="password"
            placeholder="Admin password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0c1428]"
            autoFocus
          />
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button
            type="submit"
            disabled={loading || !password}
            className="w-full bg-[#0c1428] hover:bg-[#1a2d5a] text-white font-semibold py-2.5 rounded-lg text-sm transition-colors disabled:opacity-50"
          >
            {loading ? "Checking…" : "Enter Dashboard"}
          </button>
        </form>
      </div>
    </div>
  );
}

// ── Main dashboard ────────────────────────────────────────────────────────────

function Dashboard({ adminToken }: { adminToken: string }) {
  const [data,       setData]       = useState<ClaimsData | null>(null);
  const [activeTab,  setActiveTab]  = useState<"claimed" | "featured">("claimed");
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState("");

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/claims", {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      if (!res.ok) throw new Error("Failed to load claims");
      const json: ClaimsData = await res.json();
      // Attach UI state
      const addState = (c: Claim): Claim => ({ ...c, ghlStatus: "idle" });
      setData({
        claimed:  json.claimed.map(addState),
        featured: json.featured.map(addState),
        total:    json.total,
      });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [adminToken]);

  useEffect(() => { fetchData(); }, [fetchData]);

  function updateGhl(id: string, status: Claim["ghlStatus"], msg: string) {
    setData(prev => {
      if (!prev) return prev;
      const update = (list: Claim[]) =>
        list.map(c => c.id === id ? { ...c, ghlStatus: status, ghlMessage: msg } : c);
      return { ...prev, claimed: update(prev.claimed), featured: update(prev.featured) };
    });
  }

  const tabs = [
    { key: "claimed",  label: "Claimed — Free",  count: data?.claimed.length  ?? 0, color: "text-blue-600"  },
    { key: "featured", label: "Featured",         count: data?.featured.length ?? 0, color: "text-amber-600" },
  ] as const;

  const visibleClaims = activeTab === "claimed"
    ? (data?.claimed  ?? [])
    : (data?.featured ?? []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-[#0c1428] text-white px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-xl">🎯</span>
          <div>
            <h1 className="font-bold text-lg leading-tight">BDD Command Center</h1>
            <p className="text-xs text-blue-300">Ballroom Dance Directory — Studio Claims</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {data && (
            <span className="text-sm text-gray-400">
              {data.total} total studio{data.total !== 1 ? "s" : ""}
            </span>
          )}
          <button
            onClick={fetchData}
            className="text-xs text-blue-300 hover:text-white transition-colors flex items-center gap-1"
          >
            ↺ Refresh
          </button>
          <button
            onClick={() => { sessionStorage.removeItem("bdd_admin_token"); window.location.reload(); }}
            className="text-xs text-gray-400 hover:text-white transition-colors"
          >
            Sign out
          </button>
        </div>
      </div>

      {/* Stats bar */}
      {data && (
        <div className="bg-white border-b border-gray-200 px-6 py-3 flex gap-8">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{data.claimed.length}</div>
            <div className="text-xs text-gray-500">Claimed (Free)</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-amber-500">{data.featured.length}</div>
            <div className="text-xs text-gray-500">Featured ($49/mo)</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              ${data.featured.length * 49}<span className="text-sm font-normal">/mo</span>
            </div>
            <div className="text-xs text-gray-500">MRR from Featured</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-700">
              {data.claimed.length > 0
                ? `${Math.round(data.featured.length / (data.featured.length + data.claimed.length) * 100)}%`
                : "—"}
            </div>
            <div className="text-xs text-gray-500">Conversion Rate</div>
          </div>
        </div>
      )}

      {/* Tab bar */}
      <div className="bg-white border-b border-gray-200 px-6">
        <div className="flex gap-1">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.key
                  ? `border-[#0c1428] text-[#0c1428]`
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab.label}
              <span className={`ml-2 text-xs font-bold ${activeTab === tab.key ? tab.color : "text-gray-400"}`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {loading && (
          <div className="text-center py-16 text-gray-400 text-sm">Loading claims…</div>
        )}
        {error && (
          <div className="bg-red-50 text-red-700 rounded-lg p-4 text-sm">{error}</div>
        )}
        {!loading && !error && data && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            {/* Tab header */}
            <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-gray-700">
                {activeTab === "claimed"
                  ? "Studios that claimed their listing but haven't upgraded yet"
                  : "Studios on the Featured plan ($49/mo)"}
              </h2>
              {activeTab === "claimed" && data.claimed.length > 0 && (
                <span className="text-xs text-gray-400">
                  Tip: Push to GHL to start the upgrade sequence
                </span>
              )}
            </div>
            <ClaimsTable
              claims={visibleClaims}
              adminToken={adminToken}
              onGhlUpdate={updateGhl}
              emptyMsg={
                activeTab === "claimed"
                  ? "No claimed studios yet. Check back after your first outreach."
                  : "No featured studios yet. Push claimed studios to GHL to start the upgrade pipeline."
              }
            />
          </div>
        )}
      </div>
    </div>
  );
}

// ── Page export ───────────────────────────────────────────────────────────────

export default function AdminPage() {
  const [adminToken, setAdminToken] = useState<string | null>(null);
  const [checked,    setChecked]    = useState(false);

  useEffect(() => {
    const stored = sessionStorage.getItem("bdd_admin_token");
    if (stored) setAdminToken(stored);
    setChecked(true);
  }, []);

  if (!checked) return null; // Avoid flash

  if (!adminToken) {
    return <LoginScreen onLogin={token => setAdminToken(token)} />;
  }

  return <Dashboard adminToken={adminToken} />;
}
