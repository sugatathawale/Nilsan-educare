"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  BadgeCheck,
  BookOpen,
  CreditCard,
  Headphones,
  Images,
  LayoutDashboard,
  LogOut,
  PlayCircle,
  Users
} from "lucide-react";
import { useEffect, useState } from "react";
import { BrandLogo } from "@/components/ui/brand-logo";
import { fetchAdminSession, logoutAdmin } from "@/lib/admin-auth";
import type { AdminUser } from "@/lib/admin-types";
import { cx } from "@/lib/utils";

const adminLinks = [
  { label: "Overview", href: "/admin", icon: LayoutDashboard },
  { label: "Students", href: "/admin/students", icon: Users },
  { label: "Courses", href: "/admin/courses", icon: BookOpen },
  { label: "Lessons", href: "/admin/lessons", icon: PlayCircle },
  { label: "Library", href: "/admin/library", icon: Headphones },
  { label: "Gallery", href: "/admin/gallery", icon: Images },
  { label: "Payments", href: "/admin/payments", icon: CreditCard },
  { label: "Enrollments", href: "/admin/enrollments", icon: BadgeCheck }
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const isLoginPage = pathname === "/admin/login";
  const [ready, setReady] = useState(false);
  const [user, setUser] = useState<AdminUser | null>(null);

  useEffect(() => {
    let active = true;

    async function boot() {
      const session = await fetchAdminSession();
      if (!active) return;

      setUser(session);
      setReady(true);

      if (!session && !isLoginPage) {
        router.replace("/admin/login");
      }

      if (session && isLoginPage) {
        router.replace("/admin");
      }
    }

    void boot();

    return () => {
      active = false;
    };
  }, [isLoginPage, pathname, router]);

  async function handleLogout() {
    await logoutAdmin();
    setUser(null);
    router.replace("/admin/login");
  }

  if (!ready) {
    return (
      <div className="admin-loading">
        <p>Loading admin panel...</p>
      </div>
    );
  }

  if (isLoginPage) {
    return <>{children}</>;
  }

  if (!user) {
    return (
      <div className="admin-loading">
        <p>Redirecting to login...</p>
      </div>
    );
  }

  const initials = user.fullName
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <BrandLogo href="/dashboard" />
        <nav aria-label="Admin navigation">
          {adminLinks.map((link) => {
            const Icon = link.icon;
            const active =
              link.href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(link.href);

            return (
              <Link
                className={cx(active && "is-active")}
                href={link.href}
                key={link.label}
              >
                <Icon size={18} />
                {link.label}
              </Link>
            );
          })}
        </nav>
        <button className="admin-logout" onClick={handleLogout} type="button">
          <LogOut size={18} />
          Logout
        </button>
      </aside>

      <div className="admin-shell__main">
        <header className="admin-topbar">
          <div>
            <p className="admin-eyebrow">Nilsan Educare</p>
            <strong>Admin Panel</strong>
          </div>
          <div className="admin-topbar__actions">
            <Link href="/">View site</Link>
            <div className="admin-user-chip">
              <span className="admin-avatar">{initials}</span>
              <div>
                <strong>{user.fullName}</strong>
                <small>{user.email}</small>
              </div>
            </div>
          </div>
        </header>
        {children}
      </div>
    </div>
  );
}
