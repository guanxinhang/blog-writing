"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import ThemeToggle from "./ThemeToggle";
import type { NavItem } from "@/lib/site-config";
import { createClient } from "@/lib/supabase/client";

export default function SiteHeader({
  title,
  subtitle,
  nav,
  userEmail,
}: {
  title: string;
  subtitle: string;
  nav: NavItem[];
  userEmail: string | null;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const signOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

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
          {userEmail && (
            <>
              <span className="user-chip" title={userEmail}>
                {userEmail.split("@")[0]}
              </span>
              <button type="button" className="btn btn-ghost" onClick={signOut}>
                退出
              </button>
            </>
          )}
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
