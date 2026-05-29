import type { Metadata } from "next";
import "./globals.css";
import SiteNav from "@/components/SiteNav";
import SiteFooter from "@/components/SiteFooter";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.greenpestdirectory.com"),
  title: {
    default: "Green Pest Directory — Find Eco-Friendly Pest Control Near You",
    template: "%s | Green Pest Directory",
  },
  description:
    "Browse thousands of pest control companies offering green, organic, and pet-safe treatments. Compare eco-certified providers nationwide.",
  keywords: [
    "eco friendly pest control",
    "green pest control",
    "organic pest control",
    "pet safe pest control",
    "natural pest control",
    "IPM pest control",
    "eco friendly exterminator",
    "green pest control near me",
  ],
  openGraph: {
    type: "website",
    siteName: "Green Pest Directory",
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
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Montserrat:wght@600;700;800;900&family=Inter:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <SiteNav />
        {children}
        <SiteFooter />
      </body>
    </html>
  );
}
