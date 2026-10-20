import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans, Raleway, Kalam } from "next/font/google";
import "./globals.css";
import { site } from "@/lib/config";
import { JsonLd } from "@/components/JsonLd";

const jakarta = Plus_Jakarta_Sans({ variable: "--font-jakarta", subsets: ["latin"], display: "swap" });
const raleway = Raleway({ variable: "--font-raleway", subsets: ["latin"], weight: ["500", "600", "700", "800"], display: "swap" });
const kalam = Kalam({ variable: "--font-kalam", subsets: ["latin"], weight: ["700"], display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} – Buy & Sell Verified Agricultural Land in Maharashtra`,
    template: `%s | ${site.name}`,
  },
  description: site.description,
  applicationName: site.name,
  keywords: [
    "agricultural land for sale",
    "farm land for sale in Pune",
    "buy agricultural land Maharashtra",
    "sell farm land",
    "verified land listings",
    "7/12 extract",
    "NA conversion",
    "farmhouse land",
    "land investment India",
  ],
  openGraph: {
    type: "website",
    siteName: site.name,
    locale: "en_IN",
    url: site.url,
    title: `${site.name} – Trusted Agriculture Land Marketplace`,
    description: site.description,
    images: [{ url: "/images/hero.png", width: 1600, height: 913, alt: "Farmer and investor shaking hands on verified agricultural land" }],
  },
  twitter: { card: "summary_large_image", title: `${site.name} – Trusted Agriculture Land Marketplace`, description: site.description, images: ["/images/hero.png"] },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 } },
  verification: process.env.GOOGLE_SITE_VERIFICATION ? { google: process.env.GOOGLE_SITE_VERIFICATION } : undefined,
};

export const viewport: Viewport = { themeColor: "#167208", width: "device-width", initialScale: 1 };

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
                logo: `${site.url}/icon.svg`,
                description: site.description,
                contactPoint: { "@type": "ContactPoint", telephone: "+91-1800-123-4567", contactType: "customer support", areaServed: "IN", availableLanguage: ["en", "hi", "mr"] },
                sameAs: Object.values(site.social),
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
        {children}
      </body>
    </html>
  );
}
