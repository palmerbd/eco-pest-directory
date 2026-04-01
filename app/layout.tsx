import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Private Dance Lessons Directory — Find Elite Studios Near You",
    template: "%s | Private Dance Directory",
  },
  description:
    "Find the finest private dance instruction studios near you. Browse Fred Astaire, Arthur Murray, Dance With Me, and elite independent studios offering ballroom, Latin, tango, and wedding dance lessons.",
  keywords: ["private dance lessons", "ballroom dancing", "dance studios", "Arthur Murray", "Fred Astaire"],
  openGraph: {
    type: "website",
    siteName: "Private Dance Directory",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {/* Google Fonts loaded via link tag — works client-side even without build-time network access */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700;800&family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-body bg-white antialiased">
        {children}
        {/* Site-wide legal disclaimer — required on every page */}
        <div style={{ background: "#0a1020", borderTop: "1px solid rgba(255,255,255,0.08)" }}>
          <div className="max-w-6xl mx-auto px-6 py-5 text-center">
            <p className="text-xs leading-relaxed" style={{ color: "rgba(255,255,255,0.35)" }}>
              Ballroom Dance Directory is an independent online directory and is not affiliated with,
              endorsed by, or sponsored by any dance studio franchise or brand listed on this site.
              All trademarks are the property of their respective owners. Listing information is
              compiled from public sources and may not be current &mdash; please contact studios
              directly to confirm details.{" "}
              <a href="/about" className="underline hover:opacity-70 transition-opacity">About this directory</a>
              {" "}&middot;{" "}
              <a href="/terms" className="underline hover:opacity-70 transition-opacity">Terms</a>
              {" "}&middot;{" "}
              <a href="/privacy" className="underline hover:opacity-70 transition-opacity">Privacy</a>
            </p>
          </div>
        </div>
      </body>
    </html>
  );
}
