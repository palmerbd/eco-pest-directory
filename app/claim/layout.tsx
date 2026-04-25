import type { Metadata } from "next";

// /claim and /claim/callback are utility pages for studio owners.
// They should not appear in search results — noindex them so Google
// stops treating each ?slug= variant as a duplicate page.
export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

export default function ClaimLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
