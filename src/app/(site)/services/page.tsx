import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { PageHero } from "@/components/PageHero";
import { SERVICES, ServicesPromo } from "@/components/ServicesPromo";
import { ReadyBanner } from "@/components/home/Sections";
import { JsonLd } from "@/components/JsonLd";
import { site } from "@/lib/config";

export const metadata: Metadata = {
  title: "Land Services – Survey, NA Conversion, Title Search, Borewell",
  description: "Complete land solutions in one place: land survey & government applications, borewell setup, contractor network, compound wall construction, title search & registration and NA conversion.",
  alternates: { canonical: "/services" },
};

const MORE: Record<string, string> = {
  "land-survey": "Licensed surveyors measure your land boundaries and prepare survey maps. We also file government applications such as 7/12 mutation, demarcation (Mojani) and record corrections on your behalf.",
  "borewell-setup": "Hydro-geological water survey, borewell drilling, casing, pump installation and electrical connection — handled end-to-end by verified vendors.",
  "contractor-network": "Access trusted contractors for land levelling, farm roads, drip irrigation, fencing, farmhouses and polyhouses with transparent quotes.",
  "compound-wall": "Protect your land with stone, brick or precast compound walls and gates. Get site visits and fixed-price estimates.",
  "title-search": "30-year title search, encumbrance checks, sale deed drafting and registration support at the sub-registrar office.",
  "na-conversion": "Complete assistance for converting agricultural land to Non-Agricultural (NA) use, including zone certificates, applications and follow-ups.",
};

export default function ServicesPage() {
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@graph": SERVICES.map((s) => ({ "@type": "Service", name: s.title, description: MORE[s.slug], provider: { "@type": "Organization", name: site.name, url: site.url }, areaServed: "Maharashtra, India", url: `${site.url}/services#${s.slug}` })),
        }}
      />
      <PageHero title="Complete Land Solutions, All in One Place" sub="From documentation to development, we simplify every step of your land journey." crumb={{ name: "Services", href: "/services" }}>
        <Link href="/contact" className="btn btn-primary h-12 px-8 text-[16px]">
          Request a Service
        </Link>
      </PageHero>
      <div className="container-x space-y-16 py-16">
        <div className="grid gap-6 md:grid-cols-2">
          {SERVICES.map((s, i) => (
            <section key={s.slug} id={s.slug} className="scroll-mt-28 rounded-2xl border border-[#dcefe3] bg-gradient-to-b from-white to-[#f1f9f4] p-7">
              <div className="flex items-center gap-4">
                <Image src={s.icon} alt="" width={72} height={72} className="rounded-full" />
                <h2 className="text-[21px] font-semibold text-ink">
                  {i + 1}. {s.title}
                </h2>
              </div>
              <p className="mt-4 text-[15px] leading-relaxed text-body">{MORE[s.slug]}</p>
              <Link href={`/contact?subject=${encodeURIComponent(s.title)}`} className="btn btn-outline mt-5 h-10 px-5 text-[14px]">
                Enquire Now
              </Link>
            </section>
          ))}
        </div>
        <ServicesPromo />
        <ReadyBanner />
      </div>
    </>
  );
}
