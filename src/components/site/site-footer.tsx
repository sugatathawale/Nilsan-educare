import Link from "next/link";
import { Mail, Phone } from "lucide-react";
import { contact, galleryNavLinks, navLinks } from "@/data/dashboard";
import { BrandLogo } from "@/components/ui/brand-logo";

export function SiteFooter() {
  const mainLinks = navLinks.filter(
    (link) => link.label !== "Admin Panel" && link.label !== "Gallery"
  );

  return (
    <footer className="site-footer">
      <div className="site-container site-footer__inner">
        <div className="site-footer__brand">
          <BrandLogo href="/dashboard" />
          <p>
            Live 1-on-1 English coaching for students and professionals who want
            clear, confident speaking.
          </p>
          <div className="site-footer__contact-lines">
            <a href={`tel:${contact.phone.replace(/\s/g, "")}`}>
              <Phone size={15} />
              {contact.phone}
            </a>
            <a href={`mailto:${contact.email}`}>
              <Mail size={15} />
              {contact.email}
            </a>
          </div>
        </div>

        <div className="site-footer__col">
          <h3>Company</h3>
          <nav aria-label="Footer company links">
            {mainLinks.map((link) => (
              <Link href={link.href} key={link.label}>
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="site-footer__col">
          <h3>Gallery</h3>
          <nav aria-label="Footer gallery links">
            <Link href="/gallery">All photos</Link>
            {galleryNavLinks.map((link) => (
              <Link href={link.href} key={link.href}>
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="site-footer__col">
          <h3>Student</h3>
          <nav aria-label="Footer student links">
            <Link href="/login">Log in</Link>
            <Link href="/signup">Sign up</Link>
            <Link href="/my-learning">My Learning</Link>
            <Link href="/admin">Admin</Link>
          </nav>
        </div>
      </div>

      <div className="site-footer__bottom">
        <div className="site-container site-footer__bottom-inner">
          <p>© {new Date().getFullYear()} Nilsan Educare. All rights reserved.</p>
          <div className="site-footer__legal">
            <Link href="/contact">Contact</Link>
            <Link href="/about">About</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
