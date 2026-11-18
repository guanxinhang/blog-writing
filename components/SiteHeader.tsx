"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import ThemeToggle from "./ThemeToggle";
import type { NavItem } from "@/lib/site-config";

export default function SiteHeader({
  title,
  subtitle,
  nav,
}: {
  title: string;
  subtitle: string;
  nav: NavItem[];
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="site-header">
      <div className="header-inner">
        <Link href="/" className="brand" onClick={() => setOpen(false)}>
          <span className="brand-text">
            <strong>{title}</strong>
            <em>{subtitle}</em>
          </span>
        </Link>

        <nav className={`site-nav ${open ? "open" : ""}`}>
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={pathname === item.href ? "active" : ""}
              onClick={() => setOpen(false)}
            >
              {item.label}
            </Link>
          ))}
          <ThemeToggle />
        </nav>

        <button
          type="button"
          className="nav-burger"
          onClick={() => setOpen((v) => !v)}
          aria-label="菜单"
        >
          <span />
          <span />
          <span />
        </button>
      </div>
    </header>
  );
}
