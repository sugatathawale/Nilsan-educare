import { AdminShell } from "@/components/admin/admin-shell";
import { QueryProvider } from "@/components/providers/query-provider";

export default function AdminLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <QueryProvider>
      <AdminShell>{children}</AdminShell>
    </QueryProvider>
  );
}
