import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthShell } from "@/components/auth/AuthShell";
import { LoginForm } from "@/components/auth/AuthForms";
import { dashboardPath, getCurrentUser } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Log in",
  description: "Log in to your AgriLand account to manage land listings, saved lands and investor interest.",
  alternates: { canonical: "/login" },
  robots: { index: false, follow: true },
};

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams;
  const user = await getCurrentUser();
  if (user) redirect(dashboardPath(user.role));
  return (
    <AuthShell title="Welcome back 👋" sub="Log in to manage your lands, interests and enquiries.">
      <LoginForm next={next} />
    </AuthShell>
  );
}
