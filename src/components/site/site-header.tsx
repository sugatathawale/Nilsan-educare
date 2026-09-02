"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { navLinks } from "@/data/dashboard";
import { BrandLogo } from "@/components/ui/brand-logo";
import { cx } from "@/lib/utils";

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const mainLinks = navLinks.filter((link) => link.label !== "Admin Panel");
  const adminLink = navLinks.find((link) => link.label === "Admin Panel");

  function isActive(href: string) {
    if (href.includes("#")) return false;
    if (href === "/dashboard") {
      return pathname === "/dashboard" || pathname === "/";
    }
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  return (
    <header className="site-header">
      <div className="site-container site-header__main-inner">
        <BrandLogo href="/dashboard" />

        <nav className="site-header__nav" aria-label="Primary navigation">
          {mainLinks.map((link) => (
            <Link
              className={cx(isActive(link.href) && "is-active")}
              href={link.href}
              key={link.label}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {adminLink ? (
          <Link className="site-header__admin desktop-only" href={adminLink.href}>
            {adminLink.label}
          </Link>
        ) : null}

        <button
          aria-expanded={open}
          aria-label="Toggle navigation menu"
          className="site-header__menu"
          onClick={() => setOpen((value) => !value)}
          type="button"
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {open ? (
        <nav className="site-header__mobile" aria-label="Mobile navigation">
          {navLinks.map((link) => (
            <Link
              className={cx(
                isActive(link.href) && "is-active",
                link.label === "Admin Panel" && "is-admin"
              )}
              href={link.href}
              key={link.label}
              onClick={() => setOpen(false)}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      ) : null}
    </header>
  );
}
