"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  BarChart3,
  BookOpen,
  ClipboardList,
  LayoutDashboard,
  LogOut,
  Users
} from "lucide-react";
import { useEffect, useState } from "react";
import { BrandLogo } from "@/components/ui/brand-logo";
import { isAdminLoggedIn, logoutAdmin } from "@/lib/admin-auth";
import { cx } from "@/lib/utils";

const adminLinks = [
  { label: "Overview", href: "/admin", icon: LayoutDashboard },
  { label: "Students", href: "/admin/students", icon: Users },
  { label: "Courses", href: "/admin/courses", icon: BookOpen },
  { label: "Quizzes", href: "/admin/quizzes", icon: ClipboardList },
  { label: "Analytics", href: "/admin/analytics", icon: BarChart3 }
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const isLoginPage = pathname === "/admin/login";
  const [ready, setReady] = useState(false);
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    const loggedIn = isAdminLoggedIn();
    setAuthed(loggedIn);
    setReady(true);

    if (!loggedIn && !isLoginPage) {
      router.replace("/admin/login");
    }

    if (loggedIn && isLoginPage) {
      router.replace("/admin");
    }
  }, [isLoginPage, pathname, router]);

  function handleLogout() {
    logoutAdmin();
    setAuthed(false);
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

  if (!authed) {
    return (
      <div className="admin-loading">
        <p>Redirecting to login...</p>
      </div>
    );
  }

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
            <Link href="/dashboard">Student Dashboard</Link>
            <span className="admin-avatar">A</span>
          </div>
        </header>
        {children}
      </div>
    </div>
  );
}
