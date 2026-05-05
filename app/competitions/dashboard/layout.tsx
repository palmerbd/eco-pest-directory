import type { Metadata } from "next";

// /competitions/dashboard is a private organizer area — should not be indexed.
export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

export default function CompetitionsDashboardLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
