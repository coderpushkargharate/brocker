import type { Metadata } from "next";
import Link from "next/link";
import { ContactLines, LegalPage } from "@/components/LegalPage";
import { CookieSettingsLink, TRACKING_CONFIGURED } from "@/components/Consent";

export const metadata: Metadata = {
  title: "Cookie Policy",
  description: "The cookies and similar technologies AgriLand uses, why, and how to control them.",
  alternates: { canonical: "/cookie-policy" },
};

const GA = Boolean(process.env.NEXT_PUBLIC_GA_ID);
const ADS = Boolean(process.env.NEXT_PUBLIC_GOOGLE_ADS_ID);
const PIXEL = Boolean(process.env.NEXT_PUBLIC_META_PIXEL_ID);

export default function CookiePolicy() {
  const rows: [string, string, string, string][] = [
    ["agri_session", "Essential", "Keeps you logged in and protects your account.", "7 days, or until you log out"],
    ["Offline cache (service worker)", "Essential", "Stores site images and code on your device so pages load faster and an offline page can be shown.", "Until cleared or updated"],
  ];
  if (TRACKING_CONFIGURED) rows.push(["agri_consent_v1 (local storage)", "Essential", "Remembers your cookie choices.", "Until you clear it"]);
  if (GA) rows.push(["_ga, _ga_*", "Analytics (optional)", "Google Analytics: counts visits and which pages are used.", "Up to 2 years"]);
  if (ADS) rows.push(["_gcl_*", "Advertising (optional)", "Google Ads: measures enquiries that come from our ads.", "Up to 90 days"]);
  if (PIXEL) rows.push(["_fbp", "Advertising (optional)", "Meta Pixel: measures enquiries that come from our Facebook/Instagram ads.", "Up to 90 days"]);

  return (
    <LegalPage
      title="Cookie Policy"
      path="/cookie-policy"
      intro={<p>Cookies are small files a website stores in your browser. This page lists the cookies and similar technologies used on this website.</p>}
      sections={[
        {
          id: "list",
          title: "Cookies we use",
          body: (
            <div className="mt-3 overflow-x-auto">
              <table className="w-full min-w-[560px] border-collapse text-left text-[14px]">
                <thead>
                  <tr className="border-b border-line text-[12.5px] uppercase text-muted">
                    <th className="py-2 pr-3">Name</th>
                    <th className="py-2 pr-3">Type</th>
                    <th className="py-2 pr-3">Purpose</th>
                    <th className="py-2">Duration</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {rows.map((r) => (
                    <tr key={r[0]}>
                      {r.map((c, i) => (
                        <td key={i} className="py-2.5 pr-3 align-top text-[#374151]">
                          {c}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ),
        },
        {
          id: "optional",
          title: "Optional cookies and your consent",
          body: TRACKING_CONFIGURED ? (
            <>
              <p>Analytics and advertising cookies are only set after you choose &quot;Accept&quot; in the cookie banner. If you reject them, no analytics or advertising scripts are loaded.</p>
              <p>
                You can change your choice at any time: <CookieSettingsLink className="link underline" />.
              </p>
            </>
          ) : (
            <p>This website currently does not use analytics or advertising cookies. If that changes, we will ask for your consent before setting them and update this page.</p>
          ),
        },
        {
          id: "third",
          title: "Third-party content",
          body: (
            <p>
              Some business and labour pages show an embedded Google Maps map. When it loads, Google receives your IP address and may set its own cookies under the{" "}
              <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">
                Google Privacy Policy
              </a>
              . Share buttons (WhatsApp, Facebook) only contact those services when you tap them.
            </p>
          ),
        },
        {
          id: "control",
          title: "Controlling cookies in your browser",
          body: <p>You can delete or block cookies in your browser settings. Blocking the essential session cookie will stop you from logging in. See also our <Link href="/privacy-policy">Privacy Policy</Link>.</p>,
        },
        { id: "contact", title: "Contact us", body: <ContactLines /> },
      ]}
    />
  );
}
