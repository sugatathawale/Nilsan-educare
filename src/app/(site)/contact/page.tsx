import { Mail, MapPin, Phone } from "lucide-react";
import { contact } from "@/data/dashboard";

export default function ContactPage() {
  return (
    <div className="contact-page">
      <div className="site-container">
        <div className="contact-page__header">
          <p className="section-eyebrow">Get In Touch</p>
          <h1>Contact Us</h1>
          <p>
            Have questions about our English courses? Reach out and our team will help you get
            started.
          </p>
        </div>

        <div className="contact-page__grid">
          <article className="contact-card">
            <span>
              <Phone size={22} />
            </span>
            <h2>Phone</h2>
            <a href={`tel:${contact.phone.replace(/\s/g, "")}`}>{contact.phone}</a>
          </article>

          <article className="contact-card">
            <span>
              <Mail size={22} />
            </span>
            <h2>Email</h2>
            <a href={`mailto:${contact.email}`}>{contact.email}</a>
          </article>

          <article className="contact-card">
            <span>
              <MapPin size={22} />
            </span>
            <h2>Location</h2>
            <p>Online classes available across India with flexible scheduling.</p>
          </article>
        </div>
      </div>
    </div>
  );
}
