import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { FarmerDashboard } from "@/components/dashboard/FarmerDashboard";
import { InvestorDashboard } from "@/components/dashboard/InvestorDashboard";

export const metadata: Metadata = { title: "Dashboard", robots: { index: false, follow: false } };

export default async function DashboardPage() {
  const user = await requireUser();
  if (user.role === "admin") redirect("/admin");
  return user.role === "farmer" ? <FarmerDashboard user={user} /> : <InvestorDashboard user={user} />;
}
