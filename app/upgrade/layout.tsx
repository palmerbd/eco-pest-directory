import type { Metadata } from "next";

// Upgrade and upgrade/success are checkout flow pages — should not be indexed.
export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

export default function UpgradeLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
