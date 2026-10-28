import Link from "next/link";
import { Leaf, Mail, MapPin, Phone } from "lucide-react";
import { site } from "@/lib/config";
import { CookieSettingsLink } from "./Consent";
import { InstallButton } from "./Pwa";

function Social({ href, label, children }: { href: string; label: string; children: React.ReactNode }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" aria-label={label} className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-brand">
      {children}
    </a>
  );
}

const ic = "h-[16px] w-[16px] fill-current";

const ICONS: Record<string, React.ReactNode> = {
  instagram: <svg viewBox="0 0 24 24" className={ic}><path d="M12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10zm0 8.2a3.2 3.2 0 1 1 0-6.4 3.2 3.2 0 0 1 0 6.4zM17.3 5.5a1.2 1.2 0 1 0 0 2.4 1.2 1.2 0 0 0 0-2.4zM21.9 7c-.1-1.6-.4-3-1.6-4.2S17.6 1.2 16 1.1C14.3 1 9.7 1 8 1.1 6.4 1.2 5 1.5 3.8 2.7S2.2 5.4 2.1 7C2 8.7 2 13.3 2.1 15c.1 1.6.4 3 1.6 4.2s2.6 1.5 4.2 1.6c1.7.1 6.3.1 8 0 1.6-.1 3-.4 4.2-1.6s1.5-2.6 1.6-4.2c.1-1.7.1-6.3.2-8zm-2.1 9.9a3.2 3.2 0 0 1-1.8 1.8c-1.3.5-4.3.4-5.7.4s-4.4.1-5.7-.4a3.2 3.2 0 0 1-1.8-1.8c-.5-1.3-.4-4.3-.4-5.7s-.1-4.4.4-5.7A3.2 3.2 0 0 1 6.6 3.7C7.9 3.2 10.9 3.3 12.3 3.3s4.4-.1 5.7.4a3.2 3.2 0 0 1 1.8 1.8c.5 1.3.4 4.3.4 5.7s.1 4.4-.4 5.7z" /></svg>,
  facebook: <svg viewBox="0 0 24 24" className={ic}><path d="M14 8h3V4h-3c-2.8 0-4.5 1.8-4.5 4.6V11H7v4h2.5v9h4v-9h3l.5-4h-3.5V8.8c0-.5.3-.8.5-.8z" /></svg>,
  linkedin: <svg viewBox="0 0 24 24" className={ic}><path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5zM3 9.5h4V21H3zM9.5 9.5h3.8v1.6h.1c.5-1 1.8-2 3.8-2 4 0 4.8 2.6 4.8 6V21h-4v-5.1c0-1.2 0-2.8-1.7-2.8s-2 1.3-2 2.7V21h-4z" /></svg>,
  youtube: <svg viewBox="0 0 24 24" className={ic}><path d="M23 7.2a3 3 0 0 0-2.1-2.1C19 4.6 12 4.6 12 4.6s-7 0-8.9.5A3 3 0 0 0 1 7.2 31 31 0 0 0 .5 12a31 31 0 0 0 .5 4.8 3 3 0 0 0 2.1 2.1c1.9.5 8.9.5 8.9.5s7 0 8.9-.5a3 3 0 0 0 2.1-2.1 31 31 0 0 0 .5-4.8 31 31 0 0 0-.5-4.8zM9.8 15V9l5.8 3z" /></svg>,
};

const COLUMNS: { title: string; links: [string, string][] }[] = [
  {
    title: "Land",
    links: [
      ["/buy-land", "Buy Land"],
      ["/sell-land", "Sell Land"],
      ["/land-type/irrigated-land", "Irrigated Land"],
      ["/locations/pune", "Land in Pune"],
      ["/services", "Land Services"],
    ],
  },
  {
    title: "Services",
    links: [
      ["/find-services", "Find Services"],
      ["/business-services", "Business Services"],
      ["/labour", "Labour & Workforce"],
      ["/list-business", "List Your Business"],
      ["/post-requirement", "Post a Requirement"],
    ],
  },
  {
    title: "Company",
    links: [
      ["/about", "About Us"],
      ["/blog", "Blog & Guides"],
      ["/faq", "FAQs"],
      ["/contact", "Contact"],
    ],
  },
  {
    title: "Legal",
    links: [
      ["/privacy-policy", "Privacy Policy"],
      ["/terms", "Terms & Conditions"],
      ["/cookie-policy", "Cookie Policy"],
      ["/disclaimer", "Disclaimer"],
    ],
  },
];

export function Footer() {
  const socials = Object.entries(site.social).filter(([, v]) => v) as [string, string][];
  return (
    <footer className="bg-forest pb-[env(safe-area-inset-bottom)] text-white">
      <div className="container-x grid gap-10 py-14 md:grid-cols-[1.3fr_repeat(4,1fr)] md:gap-8">
        <div>
          <Link href="/" className="inline-flex items-center gap-3" aria-label="AgriLand home">
            <span className="flex h-10 w-10 items-center justify-center rounded-[10px] bg-brand">
              <Leaf className="h-5 w-5" fill="currentColor" />
            </span>
            <span className="text-[21px] font-bold">
              Agri<span className="text-[#7ed957]">Land</span>
            </span>
          </Link>
          <p className="mt-4 max-w-[320px] text-[13.5px] leading-relaxed text-white/75">
            A marketplace connecting agricultural landowners and buyers in Maharashtra through checked listings and direct communication.
          </p>
          <ul className="mt-5 space-y-2.5 text-[13.5px] text-white/85">
            <li>
              <a href={site.supportPhoneHref} className="inline-flex min-h-6 items-center gap-2 hover:text-white">
                <Phone className="h-4 w-4 text-[#7ed957]" /> {site.supportPhone}
              </a>
            </li>
            <li>
              <a href={`mailto:${site.email}`} className="inline-flex min-h-6 items-center gap-2 hover:text-white">
                <Mail className="h-4 w-4 text-[#7ed957]" /> {site.email}
              </a>
            </li>
            <li className="flex items-start gap-2">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#7ed957]" /> {site.legal.address || site.legal.city}
            </li>
          </ul>
          <InstallButton className="mt-5 inline-flex h-10 items-center gap-2 rounded-lg border border-white/25 px-4 text-[13.5px] font-semibold text-white hover:bg-white/10" />
          {socials.length > 0 && (
            <div className="mt-5 flex gap-2.5">
              {socials.map(([k, href]) => (
                <Social key={k} href={href} label={k[0].toUpperCase() + k.slice(1)}>
                  {ICONS[k]}
                </Social>
              ))}
            </div>
          )}
        </div>
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-4 md:col-span-4">
          {COLUMNS.map((c) => (
            <nav key={c.title} aria-label={c.title}>
              <h2 className="text-[13px] font-semibold uppercase tracking-[0.08em] text-[#7ed957]">{c.title}</h2>
              <ul className="mt-4 space-y-1">
                {c.links.map(([href, label]) => (
                  <li key={href}>
                    <Link href={href} className="inline-flex min-h-9 items-center text-[14px] text-white/80 transition hover:text-white">
                      {label}
                    </Link>
                  </li>
                ))}
                {c.title === "Legal" && (
                  <li>
                    <CookieSettingsLink className="inline-flex min-h-9 items-center text-[14px] text-white/80 transition hover:text-white" />
                  </li>
                )}
              </ul>
            </nav>
          ))}
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="container-x flex flex-col gap-2 py-5 text-[12.5px] text-white/60 md:flex-row md:items-center md:justify-between">
          <p>
            © {new Date().getFullYear()} {site.legal.name || site.name}. All rights reserved.
          </p>
          <p className="max-w-[640px]">
            AgriLand is a listing platform, not a party to any sale. Always verify title documents and get independent legal advice before buying land.{" "}
            <Link href="/disclaimer" className="underline hover:text-white">
              Read disclaimer
            </Link>
          </p>
        </div>
      </div>
    </footer>
  );
}
