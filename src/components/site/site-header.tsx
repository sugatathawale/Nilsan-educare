"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ChevronDown, Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useStudentAuth } from "@/components/auth/student-auth-provider";
import { galleryNavLinks, navLinks } from "@/data/dashboard";
import { BrandLogo } from "@/components/ui/brand-logo";
import { cx } from "@/lib/utils";

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading, logout } = useStudentAuth();
  const mainLinks = navLinks.filter((link) => link.label !== "Admin Panel");
  const adminLink = navLinks.find((link) => link.label === "Admin Panel");
  const isAuthPage = pathname === "/login" || pathname === "/signup";
  const galleryActive = pathname.startsWith("/gallery");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
    setGalleryOpen(false);
  }, [pathname]);

  function isActive(href: string) {
    if (href.includes("#")) return false;
    if (href === "/dashboard") {
      return pathname === "/dashboard" || pathname === "/";
    }
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  async function handleLogout() {
    await logout();
    setOpen(false);
    router.push("/login");
  }

  return (
    <header className={cx("site-header", scrolled && "is-scrolled", open && "is-open")}>
      <div className="site-container site-header__shell">
        <div className="site-header__main-inner">
          <div className="site-header__brand">
            <BrandLogo compact href="/dashboard" />
          </div>

          <nav className="site-header__nav" aria-label="Primary navigation">
            {mainLinks.map((link) => {
              if (link.label === "Gallery") {
                return (
                  <div
                    className={cx(
                      "site-header__dropdown",
                      galleryActive && "is-active"
                    )}
                    key={link.label}
                    onMouseEnter={() => setGalleryOpen(true)}
                    onMouseLeave={() => setGalleryOpen(false)}
                  >
                    <Link
                      className={cx(
                        "site-header__link",
                        galleryActive && "is-active"
                      )}
                      href="/gallery"
                    >
                      Gallery
                      <ChevronDown size={14} />
                    </Link>
                    <div
                      className={cx(
                        "site-header__dropdown-menu",
                        galleryOpen && "is-open"
                      )}
                    >
                      <Link
                        className={cx(pathname === "/gallery" && "is-current")}
                        href="/gallery"
                      >
                        All photos
                      </Link>
                      {galleryNavLinks.map((item) => (
                        <Link
                          className={cx(isActive(item.href) && "is-current")}
                          href={item.href}
                          key={item.href}
                        >
                          {item.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                );
              }

              return (
                <Link
                  className={cx(
                    "site-header__link",
                    isActive(link.href) && "is-active"
                  )}
                  href={link.href}
                  key={link.label}
                >
                  {link.label}
                </Link>
              );
            })}

            {user ? (
              <Link
                className={cx(
                  "site-header__link",
                  isActive("/my-learning") && "is-active"
                )}
                href="/my-learning"
              >
                My Learning
              </Link>
            ) : null}
          </nav>

          <div className="site-header__actions desktop-only">
            {!loading && user ? (
              <div className="site-header__session">
                <span className="site-header__avatar">
                  {user.fullName.charAt(0).toUpperCase()}
                </span>
                <span className="site-header__session-name">
                  {user.fullName.split(" ")[0]}
                </span>
                <button
                  className="site-header__ghost"
                  onClick={handleLogout}
                  type="button"
                >
                  Log out
                </button>
              </div>
            ) : null}

            {!loading && !user && !isAuthPage ? (
              <>
                <Link className="site-header__ghost" href="/login">
                  Log in
                </Link>
                <Link className="site-header__cta" href="/signup">
                  Get started
                </Link>
              </>
            ) : null}

            {adminLink ? (
              <Link className="site-header__admin" href={adminLink.href}>
                Admin
              </Link>
            ) : null}
          </div>

          <button
            aria-expanded={open}
            aria-label="Toggle navigation menu"
            className="site-header__menu"
            onClick={() => setOpen((value) => !value)}
            type="button"
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        <nav
          className={cx("site-header__mobile", open && "is-open")}
          aria-label="Mobile navigation"
        >
          <div className="site-header__mobile-panel">
            {mainLinks.map((link) => (
              <Link
                className={cx(
                  (link.label === "Gallery"
                    ? galleryActive
                    : isActive(link.href)) && "is-active"
                )}
                href={link.href}
                key={link.label}
                onClick={() => setOpen(false)}
              >
                {link.label}
              </Link>
            ))}

            <p className="site-header__mobile-label">Gallery</p>
            {galleryNavLinks.map((link) => (
              <Link
                className={cx(isActive(link.href) && "is-active")}
                href={link.href}
                key={link.href}
                onClick={() => setOpen(false)}
              >
                {link.label}
              </Link>
            ))}

            {user ? (
              <Link
                className={cx(isActive("/my-learning") && "is-active")}
                href="/my-learning"
                onClick={() => setOpen(false)}
              >
                My Learning
              </Link>
            ) : null}

            <div className="site-header__mobile-actions">
              {!user ? (
                <>
                  <Link href="/login" onClick={() => setOpen(false)}>
                    Log in
                  </Link>
                  <Link
                    className="is-cta"
                    href="/signup"
                    onClick={() => setOpen(false)}
                  >
                    Get started
                  </Link>
                </>
              ) : (
                <button
                  className="site-header__mobile-logout"
                  onClick={handleLogout}
                  type="button"
                >
                  Log out
                </button>
              )}

              {adminLink ? (
                <Link href={adminLink.href} onClick={() => setOpen(false)}>
                  Admin
                </Link>
              ) : null}
            </div>
          </div>
        </nav>
      </div>
    </header>
  );
}
