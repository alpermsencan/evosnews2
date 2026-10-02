import AdminShell from "@/components/admin/AdminShell";

export const dynamic = "force-dynamic";
export const metadata = { title: "e-aracım Yönetim Paneli" };

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminShell>{children}</AdminShell>;
}
