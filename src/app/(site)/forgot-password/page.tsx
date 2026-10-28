import type { Metadata } from "next";
import Link from "next/link";
import { KeyRound, MessageCircle, Phone } from "lucide-react";
import { site } from "@/lib/config";

export const metadata: Metadata = { title: "Forgot Password", robots: { index: false, follow: true }, alternates: { canonical: "/forgot-password" } };

export default function ForgotPassword() {
  const wa = `${site.whatsapp}${site.whatsapp.includes("?") ? "&" : "?"}text=${encodeURIComponent("Hello, I forgot my AgriLand password. Please help me reset it.")}`;
  return (
    <section className="bg-mint-50 py-14">
      <div className="container-x max-w-[560px]">
        <div className="rounded-2xl border border-line bg-white p-6 shadow-card sm:p-8">
          <span className="icon-tile h-12 w-12">
            <KeyRound className="h-6 w-6" />
          </span>
          <h1 className="mt-4 text-[26px] font-bold text-ink">Forgot your password?</h1>
          <p className="mt-2 text-[15px] leading-relaxed text-body">
            For your security, passwords are reset by our support team. Contact us <b>from your registered mobile number</b>. After confirming it&apos;s you, we&apos;ll give you a temporary password — please change it from <b>My Profile</b> after logging in.
          </p>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <a href={site.supportPhoneHref} className="btn btn-primary h-12">
              <Phone className="h-4 w-4" /> Call {site.supportPhone}
            </a>
            <a href={wa} target="_blank" rel="noopener noreferrer" className="btn btn-ghost h-12">
              <MessageCircle className="h-4 w-4" /> WhatsApp us
            </a>
          </div>
          <p className="mt-6 text-center text-[14px] text-body">
            Remembered it?{" "}
            <Link href="/login" className="link">
              Back to log in
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}
