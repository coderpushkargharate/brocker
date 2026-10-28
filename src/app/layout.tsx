import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { site } from "@/lib/config";
import { JsonLd } from "@/components/JsonLd";
import { PwaManager } from "@/components/Pwa";
import { ConsentManager } from "@/components/Consent";

// Fonts are self-hosted so builds don't depend on fetching from Google Fonts.
const jakarta = localFont({ src: "./fonts/PlusJakartaSans.woff2", weight: "200 800", variable: "--font-jakarta", display: "swap" });
const raleway = localFont({ src: "./fonts/Raleway.woff2", weight: "500 800", variable: "--font-raleway", display: "swap" });
const kalam = localFont({ src: "./fonts/Kalam-Bold.woff2", weight: "700", variable: "--font-kalam", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} – Buy & Sell Verified Agricultural Land in Maharashtra`,
    template: `%s | ${site.name}`,
  },
  description: site.description,
  applicationName: site.name,
  appleWebApp: { capable: true, title: site.name, statusBarStyle: "default" },
  formatDetection: { telephone: false },
  openGraph: {
    type: "website",
    siteName: site.name,
    locale: "en_IN",
    url: site.url,
    title: `${site.name} – Buy & Sell Agricultural Land in Maharashtra`,
    description: site.description,
    images: [{ url: "/images/hero.png", width: 1600, height: 913, alt: "Farmer and buyer shaking hands on agricultural land" }],
  },
  twitter: { card: "summary_large_image", title: `${site.name} – Buy & Sell Agricultural Land in Maharashtra`, description: site.description, images: ["/images/hero.png"] },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 } },
  verification: process.env.GOOGLE_SITE_VERIFICATION ? { google: process.env.GOOGLE_SITE_VERIFICATION } : undefined,
};

export const viewport: Viewport = { themeColor: "#167208", width: "device-width", initialScale: 1, viewportFit: "cover" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en-IN">
      <body className={`${jakarta.variable} ${raleway.variable} ${kalam.variable} antialiased`}>
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@graph": [
              {
                "@type": "Organization",
                "@id": `${site.url}/#org`,
                name: site.name,
                url: site.url,
                logo: `${site.url}/icons/icon-512.png`,
                description: site.description,
                ...(site.legal.name ? { legalName: site.legal.name } : {}),
                // only real, configured contact details and profiles are published
                ...(site.contactConfigured ? { contactPoint: { "@type": "ContactPoint", telephone: site.supportPhone, email: site.email, contactType: "customer support", areaServed: "IN", availableLanguage: ["en", "hi", "mr"] } } : {}),
                ...(Object.values(site.social).length ? { sameAs: Object.values(site.social) } : {}),
              },
              {
                "@type": "WebSite",
                "@id": `${site.url}/#website`,
                url: site.url,
                name: site.name,
                publisher: { "@id": `${site.url}/#org` },
                potentialAction: { "@type": "SearchAction", target: `${site.url}/buy-land?q={search_term_string}`, "query-input": "required name=search_term_string" },
              },
            ],
          }}
        />
        <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-[100] focus:rounded-lg focus:bg-white focus:px-4 focus:py-2 focus:text-brand focus:shadow-soft">
          Skip to content
        </a>
        {children}
        <PwaManager />
        <ConsentManager />
      </body>
    </html>
  );
}
