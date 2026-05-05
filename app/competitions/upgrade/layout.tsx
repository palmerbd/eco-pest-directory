import type { Metadata } from "next";

// /competitions/upgrade and /competitions/upgrade/success are checkout flow
// pages — should not be indexed.
export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

export default function CompetitionsUpgradeLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
