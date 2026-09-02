import Link from "next/link";
import { Mail, Phone } from "lucide-react";
import { contact, navLinks } from "@/data/dashboard";
import { BrandLogo } from "@/components/ui/brand-logo";

export function SiteFooter() {
  const mainLinks = navLinks.filter((link) => link.label !== "Admin Panel");
  const adminLink = navLinks.find((link) => link.label === "Admin Panel");

  return (
    <footer className="site-footer">
      <div className="site-footer__top">
        <div className="site-container site-footer__top-inner">
          <a href={`tel:${contact.phone.replace(/\s/g, "")}`}>
            <Phone size={14} />
            {contact.phone}
          </a>
          <a href={`mailto:${contact.email}`}>
            <Mail size={14} />
            {contact.email}
          </a>
        </div>
      </div>

      <div className="site-footer__main">
        <div className="site-container site-footer__main-inner">
          <div className="site-footer__brand">
            <BrandLogo href="/dashboard" />
            <p>
              Learn English with live 1-on-1 classes, expert trainers, and flexible scheduling.
            </p>
          </div>

          <div className="site-footer__links">
            <h3>Quick Links</h3>
            <nav aria-label="Footer navigation">
              {mainLinks.map((link) => (
                <Link href={link.href} key={link.label}>
                  {link.label}
                </Link>
              ))}
              {adminLink ? (
                <Link className="site-footer__admin" href={adminLink.href}>
                  {adminLink.label}
                </Link>
              ) : null}
            </nav>
          </div>
        </div>
      </div>

      <p className="site-footer__copy">
        © {new Date().getFullYear()} Nilsan Educare. All Rights Reserved.
      </p>
    </footer>
  );
}
