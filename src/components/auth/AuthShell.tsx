import Image from "next/image";
import { CheckCircle2 } from "lucide-react";

export function AuthShell({ title, sub, children }: { title: string; sub: string; children: React.ReactNode }) {
  return (
    <div className="bg-page">
      <div className="container-x grid items-stretch gap-8 py-12 lg:grid-cols-2 lg:py-16">
        <div className="relative hidden overflow-hidden rounded-3xl bg-pine lg:block">
          <Image src="/images/land-valley-wide.jpg" alt="" fill sizes="640px" className="object-cover opacity-60" />
          <div className="absolute inset-0 bg-gradient-to-t from-pine via-pine/60 to-transparent" />
          <div className="relative flex h-full flex-col justify-end p-10 text-white">
            <h2 className="text-[30px] font-bold leading-tight">Where Farmers Find the Right Value, Investors Build the Right Future.</h2>
            <ul className="mt-6 space-y-3 text-[15px]">
              {["100% verified land documents", "Connect directly – no middlemen", "Free listing for farmers", "End-to-end land services"].map((x) => (
                <li key={x} className="flex items-center gap-2.5">
                  <CheckCircle2 className="h-5 w-5 fill-[#4ade80] text-pine" /> {x}
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="flex items-center justify-center">
          <div className="w-full max-w-[480px] rounded-3xl border border-line bg-white p-7 shadow-soft sm:p-9">
            <h1 className="text-[28px] font-bold tracking-[-0.01em] text-ink">{title}</h1>
            <p className="mb-6 mt-1 text-[14.5px] text-body">{sub}</p>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
