import type { Metadata } from "next";

// /competitions/claim and /competitions/claim/callback are utility pages for
// competition organizers. They should not appear in search results.
export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

export default function CompetitionsClaimLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
