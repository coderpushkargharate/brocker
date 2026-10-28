import Link from "next/link";
import { site } from "@/lib/config";
import { JsonLd } from "./JsonLd";
import { Crumbs } from "./blog/BlogParts";

export function LegalPage({ title, path, intro, sections }: { title: string; path: string; intro: React.ReactNode; sections: { id: string; title: string; body: React.ReactNode }[] }) {
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: site.url },
            { "@type": "ListItem", position: 2, name: title, item: site.url + path },
          ],
        }}
      />
      <section className="bg-gradient-to-b from-mint-50 to-white">
        <div className="container-x max-w-[960px] pb-6 pt-8 lg:pt-12">
          <Crumbs items={[{ name: "Home", href: "/" }, { name: title }]} />
          <h1 className="mt-4 font-display text-[32px] font-bold leading-tight text-ink sm:text-[40px]">{title}</h1>
          <p className="mt-2 text-[14px] text-muted">Last updated: {site.legal.lastUpdated}</p>
        </div>
      </section>
      <div className="container-x grid max-w-[960px] gap-10 pb-20 lg:grid-cols-[1fr_220px]">
        <div className="legal min-w-0">
          <div className="text-[16px] leading-relaxed text-body">{intro}</div>
          {sections.map((s) => (
            <section key={s.id} aria-labelledby={s.id}>
              <h2 id={s.id}>{s.title}</h2>
              {s.body}
            </section>
          ))}
        </div>
        <aside className="order-first lg:order-none">
          <nav aria-label="Contents" className="rounded-xl border border-line bg-mint-50 p-4 lg:sticky lg:top-28">
            <p className="text-[12px] font-semibold uppercase tracking-wider text-brand">Contents</p>
            <ol className="mt-2 space-y-1.5 text-[14px]">
              {sections.map((s) => (
                <li key={s.id}>
                  <a href={`#${s.id}`} className="text-body hover:text-brand">
                    {s.title}
                  </a>
                </li>
              ))}
            </ol>
            <p className="mt-4 border-t border-line pt-3 text-[12.5px] text-muted">
              Related:{" "}
              {[
                ["/privacy-policy", "Privacy"],
                ["/terms", "Terms"],
                ["/cookie-policy", "Cookies"],
                ["/disclaimer", "Disclaimer"],
              ]
                .filter(([h]) => h !== path)
                .map(([h, l], i) => (
                  <span key={h}>
                    {i > 0 && " · "}
                    <Link href={h} className="text-brand hover:underline">
                      {l}
                    </Link>
                  </span>
                ))}
            </p>
          </nav>
        </aside>
      </div>
    </>
  );
}

/** "AgriLand" or "<Legal Name> ("AgriLand")" when the legal entity is configured. */
export function Operator() {
  return site.legal.name ? (
    <>
      {site.legal.name} (&quot;{site.name}&quot;, &quot;we&quot;, &quot;us&quot;)
    </>
  ) : (
    <>
      {site.name} (&quot;we&quot;, &quot;us&quot;)
    </>
  );
}

export function ContactLines() {
  return (
    <ul>
      <li>
        Email: <a href={`mailto:${site.email}`}>{site.email}</a>
      </li>
      <li>
        Phone: <a href={site.supportPhoneHref}>{site.supportPhone}</a>
      </li>
      {site.legal.address && <li>Address: {site.legal.address}</li>}
      {site.legal.grievanceOfficer && <li>Grievance Officer: {site.legal.grievanceOfficer}</li>}
      <li>
        Or use our <Link href="/contact">contact form</Link>.
      </li>
    </ul>
  );
}
