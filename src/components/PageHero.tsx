import Image from "next/image";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { JsonLd } from "./JsonLd";
import { site } from "@/lib/config";

export function PageHero({ title, sub, crumb, children }: { title: string; sub: string; crumb: { name: string; href: string }; children?: React.ReactNode }) {
  return (
    <section className="relative overflow-hidden">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: site.url },
            { "@type": "ListItem", position: 2, name: crumb.name, item: site.url + crumb.href },
          ],
        }}
      />
      <Image src="/images/find-hero.jpg" alt="" fill priority sizes="100vw" className="object-cover" />
      <div className="absolute inset-0 bg-gradient-to-r from-white/90 via-white/60 to-white/20" />
      <div className="container-x relative py-14 lg:py-20">
        <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-[13px] text-muted">
          <Link href="/" className="hover:text-brand">
            Home
          </Link>
          <ChevronRight className="h-3.5 w-3.5" /> <span className="text-ink">{crumb.name}</span>
        </nav>
        <h1 className="mt-3 max-w-[760px] font-display text-[32px] font-bold leading-tight tracking-[-0.01em] text-ink sm:text-[42px]">{title}</h1>
        <span className="mt-3 block h-1 w-12 rounded bg-brand" />
        <p className="mt-5 max-w-[640px] text-[16.5px] leading-relaxed text-body">{sub}</p>
        {children && <div className="mt-7 flex flex-wrap gap-4">{children}</div>}
      </div>
    </section>
  );
}
