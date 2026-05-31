"use client";
import { useState } from "react";
import Link from "next/link";

export default function SiteNav() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="nav">
      <div className="wrap nav-inner">
        <Link href="/" className="logo">
          <span className="leaf">🌿</span> Green Pest Directory
        </Link>
        <nav className="nav-links">
          <Link href="/directory">Find Companies</Link>
          <Link href="/eco-certified">Eco-Certified</Link>
          <Link href="/about">How It Works</Link>
          <Link href="/claim">For Businesses</Link>
        </nav>
        <div className="nav-cta">
          <Link href="/claim" className="btn btn-primary">
            List Your Company
          </Link>
          <button
            className="hamburger"
            aria-label="Menu"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </div>
      <div className="wrap">
        <div className={`mobile-menu${mobileOpen ? " open" : ""}`}>
          <Link href="/directory" onClick={() => setMobileOpen(false)}>Find Companies</Link>
          <Link href="/eco-certified" onClick={() => setMobileOpen(false)}>Eco-Certified</Link>
          <Link href="/about" onClick={() => setMobileOpen(false)}>How It Works</Link>
          <Link href="/claim" onClick={() => setMobileOpen(false)}>For Businesses</Link>
        </div>
      </div>
    </header>
  );
}
