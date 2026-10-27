import Link from "next/link";
import { Leaf } from "lucide-react";
import { site } from "@/lib/config";

function Social({ href, label, children }: { href: string; label: string; children: React.ReactNode }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" aria-label={label} className="flex h-8 w-8 items-center justify-center rounded-full bg-[#0b4521] text-white transition hover:bg-brand">
      {children}
    </a>
  );
}

const ic = "h-[15px] w-[15px] fill-current";

export function Footer() {
  return (
    <footer className="bg-forest text-white">
      <div className="container-x flex flex-col items-center py-14 text-center">
        <Link href="/" className="flex items-center gap-3" aria-label="AgriLand home">
          <span className="flex h-9 w-9 items-center justify-center rounded-[9px] bg-brand">
            <Leaf className="h-[18px] w-[18px]" fill="currentColor" />
          </span>
          <span className="text-[20px] font-bold">
            Agri<span className="text-[#7ed957]">Land</span>
          </span>
        </Link>
        <p className="mt-6 max-w-[340px] text-[12.5px] leading-relaxed text-white/85">
          Connecting genuine landowners and investors across India through fully verified listings and direct communication.
        </p>
        <nav aria-label="Footer" className="mt-5 flex flex-wrap justify-center gap-x-5 gap-y-2 text-[12.5px] text-white/70">
          <Link href="/buy-land" className="hover:text-white">Buy Land</Link>
          <Link href="/sell-land" className="hover:text-white">Sell Land</Link>
          <Link href="/services" className="hover:text-white">Services</Link>
          <Link href="/business-services" className="hover:text-white">Business Services</Link>
          <Link href="/labour" className="hover:text-white">Labour &amp; Workforce</Link>
          <Link href="/list-business" className="hover:text-white">List Your Business</Link>
          <Link href="/faq" className="hover:text-white">FAQs</Link>
          <Link href="/about" className="hover:text-white">About Us</Link>
          <Link href="/contact" className="hover:text-white">Contact</Link>
        </nav>
        <div className="mt-5 flex gap-3">
          <Social href={site.social.instagram} label="Instagram">
            <svg viewBox="0 0 24 24" className={ic}><path d="M12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10zm0 8.2a3.2 3.2 0 1 1 0-6.4 3.2 3.2 0 0 1 0 6.4zM17.3 5.5a1.2 1.2 0 1 0 0 2.4 1.2 1.2 0 0 0 0-2.4zM21.9 7c-.1-1.6-.4-3-1.6-4.2S17.6 1.2 16 1.1C14.3 1 9.7 1 8 1.1 6.4 1.2 5 1.5 3.8 2.7S2.2 5.4 2.1 7C2 8.7 2 13.3 2.1 15c.1 1.6.4 3 1.6 4.2s2.6 1.5 4.2 1.6c1.7.1 6.3.1 8 0 1.6-.1 3-.4 4.2-1.6s1.5-2.6 1.6-4.2c.1-1.7.1-6.3.2-8zm-2.1 9.9a3.2 3.2 0 0 1-1.8 1.8c-1.3.5-4.3.4-5.7.4s-4.4.1-5.7-.4a3.2 3.2 0 0 1-1.8-1.8c-.5-1.3-.4-4.3-.4-5.7s-.1-4.4.4-5.7A3.2 3.2 0 0 1 6.6 3.7C7.9 3.2 10.9 3.3 12.3 3.3s4.4-.1 5.7.4a3.2 3.2 0 0 1 1.8 1.8c.5 1.3.4 4.3.4 5.7s.1 4.4-.4 5.7z" /></svg>
          </Social>
          <Social href={site.social.facebook} label="Facebook">
            <svg viewBox="0 0 24 24" className={ic}><path d="M14 8h3V4h-3c-2.8 0-4.5 1.8-4.5 4.6V11H7v4h2.5v9h4v-9h3l.5-4h-3.5V8.8c0-.5.3-.8.5-.8z" /></svg>
          </Social>
          <Social href={site.social.linkedin} label="LinkedIn">
            <svg viewBox="0 0 24 24" className={ic}><path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5zM3 9.5h4V21H3zM9.5 9.5h3.8v1.6h.1c.5-1 1.8-2 3.8-2 4 0 4.8 2.6 4.8 6V21h-4v-5.1c0-1.2 0-2.8-1.7-2.8s-2 1.3-2 2.7V21h-4z" /></svg>
          </Social>
          <Social href={site.social.youtube} label="YouTube">
            <svg viewBox="0 0 24 24" className={ic}><path d="M23 7.2a3 3 0 0 0-2.1-2.1C19 4.6 12 4.6 12 4.6s-7 0-8.9.5A3 3 0 0 0 1 7.2 31 31 0 0 0 .5 12a31 31 0 0 0 .5 4.8 3 3 0 0 0 2.1 2.1c1.9.5 8.9.5 8.9.5s7 0 8.9-.5a3 3 0 0 0 2.1-2.1 31 31 0 0 0 .5-4.8 31 31 0 0 0-.5-4.8zM9.8 15V9l5.8 3z" /></svg>
          </Social>
        </div>
        <p className="mt-6 text-[12.5px] text-white/85">© {new Date().getFullYear()} AgriLand. All rights reserved.</p>
      </div>
    </footer>
  );
}
