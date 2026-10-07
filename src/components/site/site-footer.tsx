"use client";

import Link from "next/link";
import {
  ArrowUpRight,
  BookOpen,
  Mail,
  MapPin,
  Phone,
  Sparkles
} from "lucide-react";
import { contact, navLinks } from "@/data/dashboard";
import { BrandLogo } from "@/components/ui/brand-logo";

export function SiteFooter() {
  const mainLinks = navLinks.filter((link) => link.label !== "Admin Panel");
  const adminLink = navLinks.find((link) => link.label === "Admin Panel");

  return (
    <footer className="site-footer">
      <div className="site-footer__aura" aria-hidden />
      <div className="site-footer__grid-lines" aria-hidden />

      <div className="site-container site-footer__cta-band">
        <div className="site-footer__cta-copy">
          <p className="site-footer__eyebrow">
            <Sparkles size={14} />
            Speak with confidence
          </p>
          <h2>
            Ready for live English that
            <span> actually sticks?</span>
          </h2>
          <p>
            Join 1-on-1 coaching built for students and professionals who want
            real fluency — not textbook drills.
          </p>
        </div>
        <div className="site-footer__cta-actions">
          <Link className="site-footer__cta-primary" href="/signup">
            Create free account
            <ArrowUpRight size={18} />
          </Link>
          <Link className="site-footer__cta-secondary" href="/dashboard#courses">
            <BookOpen size={16} />
            Browse courses
          </Link>
        </div>
      </div>

      <div className="site-footer__main">
        <div className="site-container site-footer__main-inner">
          <div className="site-footer__brand">
            <BrandLogo className="site-footer__logo" href="/dashboard" />
            <p>
              Nilsan Educare — live English coaching with flexible timing,
              personal feedback, and trainers who make speaking feel natural.
            </p>
            <div className="site-footer__chips">
              <span>1-on-1 live</span>
              <span>Flexible slots</span>
              <span>India-first</span>
            </div>
          </div>

          <div className="site-footer__col">
            <h3>Explore</h3>
            <nav aria-label="Footer navigation">
              {mainLinks.map((link) => (
                <Link href={link.href} key={link.label}>
                  {link.label}
                  <ArrowUpRight size={14} />
                </Link>
              ))}
              <Link href="/my-learning">
                My Learning
                <ArrowUpRight size={14} />
              </Link>
              {adminLink ? (
                <Link className="site-footer__admin" href={adminLink.href}>
                  {adminLink.label}
                  <ArrowUpRight size={14} />
                </Link>
              ) : null}
            </nav>
          </div>

          <div className="site-footer__col">
            <h3>Talk to us</h3>
            <a className="site-footer__contact" href={`tel:${contact.phone.replace(/\s/g, "")}`}>
              <span>
                <Phone size={16} />
              </span>
              <div>
                <strong>Call</strong>
                <small>{contact.phone}</small>
              </div>
            </a>
            <a className="site-footer__contact" href={`mailto:${contact.email}`}>
              <span>
                <Mail size={16} />
              </span>
              <div>
                <strong>Email</strong>
                <small>{contact.email}</small>
              </div>
            </a>
            <div className="site-footer__contact is-static">
              <span>
                <MapPin size={16} />
              </span>
              <div>
                <strong>Based in</strong>
                <small>India · Online worldwide</small>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="site-footer__bottom">
        <div className="site-container site-footer__bottom-inner">
          <p>© {new Date().getFullYear()} Nilsan Educare. All rights reserved.</p>
          <p className="site-footer__tagline">Learn English. Speak boldly.</p>
        </div>
      </div>
    </footer>
  );
}
