import Link from "next/link";

export default function SiteFooter() {
  return (
    <footer>
      <div className="wrap">
        <div className="foot-top">
          <div>
            <span className="logo">
              <span className="leaf">🌿</span> Green Pest Directory
            </span>
            <p className="tag">
              America&apos;s first directory dedicated to eco-friendly and green
              pest control services.
            </p>
          </div>
          <div className="foot-links">
            <Link href="/about">About</Link>
            <Link href="/contact">Contact</Link>
            <Link href="/privacy">Privacy</Link>
            <Link href="/terms">Terms</Link>
            <Link href="/claim">For Businesses</Link>
          </div>
        </div>
        <div className="foot-bottom">
          © {new Date().getFullYear()} Green Pest Control Directory. All rights
          reserved.
        </div>
      </div>
    </footer>
  );
}
