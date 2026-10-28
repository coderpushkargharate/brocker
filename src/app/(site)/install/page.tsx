import type { Metadata } from "next";
import { MoreVertical, PlusSquare, Share } from "lucide-react";
import { InstallStatus } from "@/components/Pwa";
import { Crumbs } from "@/components/blog/BlogParts";

export const metadata: Metadata = {
  title: "Install the AgriLand App",
  description: "Add AgriLand to your phone's home screen for quick, app-like access to land listings and services on Android and iPhone.",
  alternates: { canonical: "/install" },
};

function Steps({ title, steps }: { title: string; steps: React.ReactNode[] }) {
  return (
    <section className="rounded-2xl border border-line bg-white p-5 shadow-card">
      <h2 className="text-[18px] font-bold text-ink">{title}</h2>
      <ol className="mt-3 list-decimal space-y-2 pl-5 text-[15px] leading-relaxed text-body">
        {steps.map((s, i) => (
          <li key={i}>{s}</li>
        ))}
      </ol>
    </section>
  );
}

const ic = "inline h-4 w-4 align-[-2px] text-brand";

export default function InstallPage() {
  return (
    <div className="container-x max-w-[880px] py-10 lg:py-14">
      <Crumbs items={[{ name: "Home", href: "/" }, { name: "Install App" }]} />
      <h1 className="mt-4 font-display text-[32px] font-bold leading-tight text-ink sm:text-[40px]">Install the AgriLand app</h1>
      <p className="mt-3 max-w-[640px] text-[16px] leading-relaxed text-body">
        AgriLand works like an app on your phone or computer: it opens from your home screen in its own window and loads faster. There&apos;s nothing to download from an app store and it uses very little storage.
      </p>
      <div className="mt-6">
        <InstallStatus />
      </div>
      <div className="mt-8 grid gap-5 md:grid-cols-2">
        <Steps
          title="Android (Chrome)"
          steps={[
            "Open this website in Chrome.",
            <>
              Tap the <MoreVertical className={ic} aria-label="menu" /> menu at the top right.
            </>,
            <>Tap <b>Install app</b> (or <b>Add to Home screen</b>) and confirm.</>,
            "Open AgriLand from your home screen.",
          ]}
        />
        <Steps
          title="iPhone & iPad (Safari)"
          steps={[
            "Open this website in Safari (other iPhone browsers may not show the option).",
            <>
              Tap the <Share className={ic} aria-label="Share" /> Share button.
            </>,
            <>
              Scroll down and tap <PlusSquare className={ic} aria-hidden /> <b>Add to Home Screen</b>, then <b>Add</b>.
            </>,
            "Open AgriLand from your home screen.",
          ]}
        />
        <Steps
          title="Computer (Chrome or Edge)"
          steps={["Open this website in Chrome or Microsoft Edge.", <>Click the install icon at the right of the address bar, or open the browser menu and choose <b>Install AgriLand</b>.</>, "AgriLand opens in its own window and appears in your apps list."]}
        />
        <section className="rounded-2xl border border-line bg-mint-50 p-5">
          <h2 className="text-[18px] font-bold text-ink">Good to know</h2>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-[15px] leading-relaxed text-body">
            <li>You stay logged in, just like in your browser.</li>
            <li>Listings and enquiries need an internet connection; without one you&apos;ll see an offline page.</li>
            <li>The app updates itself — you&apos;ll see an &quot;Update&quot; button when a new version is ready.</li>
            <li>To remove it, delete it from your home screen like any other app.</li>
          </ul>
        </section>
      </div>
    </div>
  );
}
