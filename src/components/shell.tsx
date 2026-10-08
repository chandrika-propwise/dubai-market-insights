"use client";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  ArrowUpRight,
  BarChart3,
  Building2,
  ChevronRight,
  Database,
  LayoutDashboard,
  Menu,
  ShieldCheck,
  Sparkles,
  X,
} from "lucide-react";
export function Shell({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const nav = [
    { label: "Market overview", href: "/", icon: LayoutDashboard },
    { label: "Area performance", href: "/#areas", icon: Building2 },
    { label: "Developer insights", href: "/#developers", icon: BarChart3 },
    { label: "Market Decode", href: "/#decode", icon: Sparkles },
  ];
  return (
    <div className="app-shell">
      <button
        className="mobile-menu"
        aria-label={open ? "Close navigation" : "Open navigation"}
        onClick={() => setOpen(!open)}
      >
        {open ? <X /> : <Menu />}
      </button>
      {open && (
        <button
          className="nav-scrim"
          aria-label="Close navigation"
          onClick={() => setOpen(false)}
        />
      )}
      <aside className={`sidebar ${open ? "open" : ""}`}>
        <Link href="/" className="brand" onClick={() => setOpen(false)}>
          <Image src="/propwise-mark.svg" width={35} height={35} alt="" />
          <span>
            propwise<span className="brand-dot">.</span>
            <small>MARKET INTELLIGENCE</small>
          </span>
        </Link>
        <div className="workspace-label">
          <span className="status-dot" /> Dubai real estate{" "}
          <span className="text-slate-500">⌄</span>
        </div>
        <p className="nav-label">EXPLORE THE MARKET</p>
        <nav aria-label="Public dashboard">
          {nav.map(({ label, href, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              className={`nav-item ${href === "/" && path === "/" ? "active" : ""}`}
            >
              <Icon size={18} />
              {label}
              {href === "/" && path === "/" && (
                <ChevronRight size={15} className="ml-auto" />
              )}
            </Link>
          ))}
        </nav>
        <div className="nav-divider" />
        <p className="nav-label">PROPWISE WORKSPACE</p>
        <nav aria-label="Internal dashboard">
          <Link
            href="/internal"
            onClick={() => setOpen(false)}
            className={`nav-item ${path === "/internal" ? "active" : ""}`}
          >
            <ShieldCheck size={18} /> Intelligence workspace{" "}
            <span className="nav-soon">Soon</span>
          </Link>
          <Link
            href="/internal/market-data"
            onClick={() => setOpen(false)}
            className={`nav-item ${path.includes("market-data") ? "active" : ""}`}
          >
            <Database size={18} /> Market Data Manager
          </Link>
        </nav>
        <div className="sidebar-bottom">
          <div className="sidebar-note">
            <span className="eyebrow">A CLEARER VIEW OF DUBAI</span>
            <h3>
              Data. Perspective.
              <br />
              Better decisions.
            </h3>
            <p>Your monthly lens on a market that never stands still.</p>
            <Link href="/#decode">
              Discover Market Decode <ArrowUpRight size={15} />
            </Link>
          </div>
          <div className="sidebar-footer">
            <div className="avatar">P</div>
            <span>
              Propwise Marketing<small>Dubai, United Arab Emirates</small>
            </span>
          </div>
        </div>
      </aside>
      <div className="main-column">
        <header className="topbar">
          <div className="breadcrumb">
            Intelligence <ChevronRight size={13} />{" "}
            <span>
              {path.includes("market-data")
                ? "Market Data Manager"
                : path === "/internal"
                  ? "Internal workspace"
                  : "Market overview"}
            </span>
          </div>
          <div className="topbar-right">
            <span className="demo-chip">
              <span />
              Demo environment
            </span>
            <span className="topbar-line" />
            <span className="edition">PUBLIC EDITION</span>
            <div className="header-avatar">PW</div>
          </div>
        </header>
        {children}
        <footer className="page-footer">
          <span>© 2026 Propwise Marketing</span>
          <span>Phase 1 prototype · All market figures are fictional</span>
        </footer>
      </div>
    </div>
  );
}
