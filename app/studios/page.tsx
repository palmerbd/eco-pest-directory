import { Metadata } from "next";
import Link from "next/link";
import { getStudiosPage } from "@/lib/wordpress";
import { CHAIN_CONFIG } from "@/types/studio";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Find Eco-Friendly Pest Control Companies",
  description:
    "Browse all eco-friendly pest control companies nationwide. Filter by Eco-Certified providers, services, and ratings.",
};

export default async function CompaniesPage() {
  const { studios, total } = await getStudiosPage(1, 48);

  return (
    <>
      <section className="chero" style={{ padding: "24px 0 36px" }}>
        <div className="wrap">
          <h1>
            Eco-Friendly Pest Control{" "}
            <span className="hl">Companies</span>
          </h1>
          <p>
            Browse {total} pest control companies offering green, organic, and
            pet-safe treatments nationwide.
          </p>
        </div>
      </section>

      <div className="wrap">
        <div className="filterbar" style={{ marginTop: "-20px", position: "relative", zIndex: 5 }}>
          <div className="seg">
            <button className="active">All ({total})</button>
            <button>Eco-Certified</button>
            <button>Eco Options</button>
          </div>
          <div className="selects">
            <select aria-label="Service">
              <option>All Services</option>
              <option>Termite</option>
              <option>Bed Bug</option>
              <option>Mosquito</option>
              <option>Rodent</option>
              <option>General Pest</option>
            </select>
            <select aria-label="Sort">
              <option>Eco-Friendly First</option>
              <option>Rating</option>
              <option>Name (A–Z)</option>
            </select>
          </div>
        </div>
      </div>

      <section className="block" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <div className="results-meta">
            <h2>{total} eco-friendly providers</h2>
            <span>Showing 1–{Math.min(studios.length, 48)}</span>
          </div>

          <div className="grid">
            {studios.map((s: any) => {
              const isTier1 = s.ecoTier === "tier_1";
              const chain = s.studioChain
                ? CHAIN_CONFIG[s.studioChain as keyof typeof CHAIN_CONFIG]
                : null;
              return (
                <article className="lcard" key={s.slug}>
                  <div className="rowtop">
                    <div>
                      <h3>
                        <Link href={`/studios/${s.slug}`}>{s.title}</Link>
                      </h3>
                      <div className="loc">
                        📍 {s.city}
                        {s.state ? `, ${s.state}` : ""}
                      </div>
                    </div>
                    <span className={`badge ${isTier1 ? "t1" : "t2"}`}>
                      {isTier1 ? "✓ Eco-Certified" : "◆ Eco Options"}
                    </span>
                  </div>
                  <div className="stars">
                    <span className="s">
                      {"★".repeat(Math.round(s.rating || 0))}
                      {"☆".repeat(5 - Math.round(s.rating || 0))}
                    </span>
                    <b>{(s.rating || 0).toFixed(1)}</b>
                    <span>({s.reviewCount || 0})</span>
                  </div>
                  <div className="chips">
                    {(s.serviceSpecialties || s.danceStyles || [])
                      .slice(0, 3)
                      .map((svc: string) => (
                        <span className="chip" key={svc}>
                          {svc}
                        </span>
                      ))}
                  </div>
                  <div className="meta">
                    <span className="chainbadge">
                      {chain?.label || "Independent"}
                    </span>
                    <Link
                      className="btn btn-primary"
                      href={`/studios/${s.slug}`}
                    >
                      View Details
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section style={{ padding: "0 0 56px" }}>
        <div className="wrap">
          <div className="ctastrip">
            <h2>Run a green pest control company?</h2>
            <p>
              Get found by homeowners searching for eco-friendly providers.
              Claim your free listing in minutes.
            </p>
            <Link className="btn btn-light" href="/claim">
              List Your Company →
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
