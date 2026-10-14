import { StudentAuthProvider } from "@/components/auth/student-auth-provider";
import { QueryProvider } from "@/components/providers/query-provider";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";

export default function SiteLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <QueryProvider>
      <StudentAuthProvider>
        <SiteHeader />
        <main>{children}</main>
        <SiteFooter />
      </StudentAuthProvider>
    </QueryProvider>
  );
}
