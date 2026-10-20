import Link from "next/link";
import Image from "next/image";

export const SERVICES = [
  { slug: "land-survey", short: "Land Survey & Govt Apps", title: "Land Survey & Government Applications", text: "Private land surveys and government form filing.", icon: "/images/svc-1.png" },
  { slug: "borewell-setup", short: "Borewell Setup", title: "Borewell Setup", text: "Borewell installation and setup services.", icon: "/images/svc-2.png" },
  { slug: "contractor-network", short: "Contractor Network", title: "Contractor Network", text: "Connect with trusted contractors for your land needs.", icon: "/images/svc-3.png" },
  { slug: "compound-wall", short: "Compound Wall", title: "Compound Wall Construction", text: "Secure your land with compound wall solutions.", icon: "/images/svc-4.png" },
  { slug: "title-search", short: "Title Search & Registration", title: "Title Search & Land Registration", text: "Title verification, document registration and land records assistance.", icon: "/images/svc-5.png" },
  { slug: "na-conversion", short: "NA Conversion", title: "NA Conversion", text: "Assistance with Non-Agricultural (NA) land conversion.", icon: "/images/svc-6.png" },
];

const PILLS = [
  { icon: "/images/pill-1.png", label: "100% Verified" },
  { icon: "/images/pill-2.png", label: "Fast Approval" },
  { icon: "/images/pill-3.png", label: "End-to-End Support" },
];

function Title({ center, size = "md" }: { center?: boolean; size?: "md" | "lg" }) {
  const big = size === "lg";
  return (
    <div className={center ? "text-center" : "inline-block text-center"}>
      <h2 className={`font-bold tracking-[-0.03em] text-brand ${big ? "text-[34px] sm:text-[44px]" : "text-[26px] sm:text-[30px]"} leading-[1.05]`}>Complete Land Solutions</h2>
      <div className="relative mt-1 inline-block">
        <svg className="pointer-events-none absolute -inset-x-[14%] -inset-y-[30%] h-[160%] w-[128%]" viewBox="0 0 300 70" preserveAspectRatio="none" aria-hidden>
          <ellipse cx="150" cy="33" rx="146" ry="26" fill="none" stroke="#e7b62f" strokeWidth="2" />
          <path d="M80 64 Q150 70 210 63" fill="none" stroke="#e7b62f" strokeWidth="2" />
        </svg>
        <span className={`relative block px-2 font-bold tracking-[-0.03em] text-gold ${big ? "text-[34px] sm:text-[44px]" : "text-[26px] sm:text-[30px]"} leading-[1.1]`}>All in One Place</span>
      </div>
    </div>
  );
}

function Pills({ center }: { center?: boolean }) {
  return (
    <ul className={`flex flex-wrap gap-2 ${center ? "justify-center" : ""}`}>
      {PILLS.map((p) => (
        <li key={p.label} className="flex items-center gap-2 rounded-full border border-[#e7dfcc] bg-gradient-to-b from-[#f7f2e7] to-[#ebe4d3] whitespace-nowrap py-1 pl-1.5 pr-3 text-[12.5px] font-semibold text-[#2b2b2b] shadow-[inset_0_1px_0_#fff,0_1px_2px_rgba(0,0,0,0.06)]">
          <Image src={p.icon} alt="" width={20} height={20} className="rounded-full" />
          {p.label}
        </li>
      ))}
    </ul>
  );
}

function ServiceGrid({ small }: { small?: boolean }) {
  return (
    <ul className="grid grid-cols-3 gap-x-3 gap-y-4">
      {SERVICES.map((s, i) => (
        <li key={s.slug}>
          <Link href={`/services#${s.slug}`} className="flex flex-col items-center text-center hover:opacity-80">
            <Image src={s.icon} alt="" width={small ? 52 : 64} height={small ? 52 : 64} />
            <span className={`mt-1.5 font-semibold leading-tight text-ink ${small ? "text-[10.5px]" : "text-[11.5px]"}`}>
              {i + 1}. {s.short}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

export function ServicesPromo({ variant = "wide" }: { variant?: "wide" | "tall" }) {
  if (variant === "tall")
    return (
      <section aria-label="Complete land solutions" className="rounded-2xl bg-cream px-5 py-8">
        <Title center />
        <p className="mx-auto mt-4 max-w-[300px] text-center text-[13px] leading-relaxed text-body">From documentation to development, we simplify every step of your land journey.</p>
        <div className="mt-3">
          <Pills center />
        </div>
        <Image src="/images/services-farm.jpg" alt="Isometric illustration of a verified farm with borewell, farmhouse and documents" width={780} height={520} className="mx-auto mt-4 w-full max-w-[280px]" />
        <div className="mt-3">
          <ServiceGrid small />
        </div>
        <Link href="/contact" className="btn btn-primary mt-6 h-12 w-full text-[17px] font-medium">
          Contact Us
        </Link>
      </section>
    );

  return (
    <section aria-label="Complete land solutions" className="overflow-hidden rounded-2xl bg-cream px-6 py-8 sm:px-10 lg:px-[72px]">
      <div className="grid items-center gap-8 lg:grid-cols-[1.3fr_1fr_1fr]">
        <div>
          <Title />
          <p className="mt-4 max-w-[340px] text-[15px] leading-relaxed text-body">From documentation to development, we simplify every step of your land journey.</p>
          <div className="mt-4">
            <Pills />
          </div>
          <Link href="/contact" className="btn btn-primary mt-6 h-12 w-full max-w-[324px] text-[15px] font-medium">
            Contact Us
          </Link>
        </div>
        <Image src="/images/services-farm.jpg" alt="Isometric illustration of a verified farm with borewell, farmhouse and documents" width={780} height={520} className="mx-auto w-full max-w-[380px]" />
        <ServiceGrid />
      </div>
    </section>
  );
}
