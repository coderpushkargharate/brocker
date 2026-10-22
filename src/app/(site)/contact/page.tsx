import type { Metadata } from "next";
import { CircleHelp, MapPin, MessageCircle, Phone } from "lucide-react";
import Link from "next/link";
import { PageHero } from "@/components/PageHero";
import { ContactForm } from "@/components/ContactForm";
import { site } from "@/lib/config";

export const metadata: Metadata = {
  title: "Contact Us – Talk to Our Land Experts",
  description: "Contact AgriLand for help buying or selling agricultural land, document verification, NA conversion, land survey and more. Call 1800-123-4567 or send us a message.",
  alternates: { canonical: "/contact" },
};

export default async function ContactPage({ searchParams }: { searchParams: Promise<{ subject?: string }> }) {
  const { subject } = await searchParams;
  const rows = [
    { icon: Phone, t: "Call Support", d: site.supportPhone, href: site.supportPhoneHref },
    { icon: MessageCircle, t: "WhatsApp Support", d: "Chat with us", href: site.whatsapp },
    { icon: MapPin, t: "Office", d: "Pune, Maharashtra, India", href: "https://www.google.com/maps/search/?api=1&query=Pune" },
  ];
  return (
    <>
      <PageHero title="We're Here to Help" sub="Questions about buying, selling or verifying land? Our team usually replies within 24 hours." crumb={{ name: "Contact", href: "/contact" }} />
      <div className="container-x grid gap-8 py-16 lg:grid-cols-[1fr_400px]">
        <section className="rounded-2xl border border-line bg-white p-6 shadow-card sm:p-8">
          <h2 className="text-[22px] font-semibold text-ink">Send us a message</h2>
          <p className="mb-6 mt-1 text-[14px] text-muted">Fill in the form and a land expert will contact you.</p>
          <ContactForm subject={subject} />
        </section>
        <aside className="space-y-4">
          {rows.map((r) => (
            <a key={r.t} href={r.href} target={r.href.startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer" className="flex items-center gap-4 rounded-2xl border border-line bg-white p-5 shadow-card hover:shadow-soft">
              <span className="icon-tile h-12 w-12">
                <r.icon className="h-5 w-5" />
              </span>
              <span>
                <span className="block font-semibold text-ink">{r.t}</span>
                <span className="block text-[14px] text-muted">{r.d}</span>
              </span>
            </a>
          ))}
          <Link href="/faq" className="flex items-center gap-4 rounded-2xl border border-line bg-white p-5 shadow-card hover:shadow-soft">
            <span className="icon-tile h-12 w-12">
              <CircleHelp className="h-5 w-5" />
            </span>
            <span>
              <span className="block font-semibold text-ink">Help Center</span>
              <span className="block text-[14px] text-muted">View FAQs</span>
            </span>
          </Link>
        </aside>
      </div>
    </>
  );
}
