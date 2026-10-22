import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthShell } from "@/components/auth/AuthShell";
import { SignupForm } from "@/components/auth/AuthForms";
import { dashboardPath, getCurrentUser } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Create a Free Account",
  description: "Join AgriLand free to sell your agricultural land, or to buy verified farm land across Maharashtra.",
  alternates: { canonical: "/signup" },
};

export default async function SignupPage({ searchParams }: { searchParams: Promise<{ next?: string; role?: string }> }) {
  const { next, role } = await searchParams;
  const user = await getCurrentUser();
  if (user) redirect(dashboardPath(user.role));
  return (
    <AuthShell title="Create your free account" sub="List your land or find verified agricultural land in minutes.">
      <SignupForm next={next} defaultRole={role ?? (next?.includes("listings/new") ? "farmer" : undefined)} />
    </AuthShell>
  );
}
