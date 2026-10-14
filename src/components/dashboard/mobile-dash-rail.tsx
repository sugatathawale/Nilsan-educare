"use client";

import Link from "next/link";
import { BookOpen, Headphones, PlayCircle, Sparkles } from "lucide-react";
import { useStudentAuth } from "@/components/auth/student-auth-provider";

const links = [
  { href: "/dashboard#courses", label: "Courses", icon: BookOpen },
  { href: "/playlists", label: "Playlists", icon: PlayCircle },
  { href: "/library/audiobooks", label: "Library", icon: Headphones },
  { href: "/my-learning", label: "Learning", icon: Sparkles, auth: true }
];

export function MobileDashRail() {
  const { user } = useStudentAuth();

  return (
    <nav className="dash-mobile-rail" aria-label="Quick links">
      {links.map((item) => {
        const href = item.auth && !user ? "/login" : item.href;
        const Icon = item.icon;
        return (
          <Link className="dash-mobile-rail__item" href={href} key={item.label}>
            <span className="dash-mobile-rail__icon">
              <Icon size={18} />
            </span>
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
