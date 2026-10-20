import type { Metadata } from "next";
import { requireUser } from "@/lib/auth";
import { readDB } from "@/lib/db";
import { AdminNav } from "@/components/admin/AdminNav";

export const metadata: Metadata = { title: { default: "Admin", template: "%s | AgriLand Admin" }, robots: { index: false, follow: false } };

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser(["admin"], "/admin");
  const db = (await readDB());
  return (
    <div className="min-h-screen bg-page lg:flex">
      <AdminNav name={user.name} counts={{ pending: db.lands.filter((l) => l.status === "pending").length, enquiries: db.enquiries.filter((e) => e.status === "new").length }} />
      <main className="min-w-0 flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
    </div>
  );
}
