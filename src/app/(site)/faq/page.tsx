import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/PageHero";
import { FaqList, ReadyBanner } from "@/components/home/Sections";
import { JsonLd } from "@/components/JsonLd";
import { FAQS } from "@/lib/faqs";

export const metadata: Metadata = {
  title: "Frequently Asked Questions",
  description: "Answers to common questions about buying and selling agricultural land on AgriLand: listing, verification, documents, contacting farmers and land services.",
  alternates: { canonical: "/faq" },
};

export default function FaqPage() {
  return (
    <>
      <JsonLd data={{ "@context": "https://schema.org", "@type": "FAQPage", mainEntity: FAQS.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })) }} />
      <PageHero title="Frequently Asked Questions" sub="Everything you need to know about buying and selling agricultural land on AgriLand." crumb={{ name: "FAQs", href: "/faq" }} />
      <div className="container-x max-w-[900px] space-y-16 py-16">
        <FaqList items={FAQS} />
        <p className="text-center text-[15px] text-body">
          Still have questions?{" "}
          <Link href="/contact" className="link">
            Contact our team
          </Link>
        </p>
      </div>
      <div className="container-x pb-16">
        <ReadyBanner />
      </div>
    </>
  );
}
