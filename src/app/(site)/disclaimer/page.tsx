import type { Metadata } from "next";
import Link from "next/link";
import { site } from "@/lib/config";
import { ContactLines, LegalPage } from "@/components/LegalPage";

export const metadata: Metadata = {
  title: "Disclaimer",
  description: "Important information about listings, verification, prices and land transactions on AgriLand.",
  alternates: { canonical: "/disclaimer" },
};

export default function Disclaimer() {
  return (
    <LegalPage
      title="Disclaimer"
      path="/disclaimer"
      intro={<p>Please read this before relying on any information on {site.name}.</p>}
      sections={[
        {
          id: "listings",
          title: "Listings come from landowners",
          body: (
            <p>
              Land details, prices, photos and descriptions are provided by the landowner or their representative. We review listings, but we cannot guarantee that every detail is complete, current or accurate. Prices shown are asking prices and may be negotiable.
            </p>
          ),
        },
        {
          id: "verified",
          title: "What “Verified” means",
          body: (
            <p>
              A &quot;Verified&quot; or &quot;Documents Verified&quot; label means our team checked that the required documents (such as the 7/12 extract, land map and ownership proof) were uploaded and appear to match the listing at the time of review. It is not a legal title search, survey or valuation, and it does not guarantee that the land is free of disputes, encumbrances or restrictions.
            </p>
          ),
        },
        {
          id: "advice",
          title: "Not legal, financial or investment advice",
          body: (
            <p>
              Articles, guides and figures on this site are general information. Agricultural land purchases in Maharashtra and other states can be subject to eligibility rules, ceilings and conversion requirements. Always get independent legal advice, verify records at the relevant government offices and inspect the land before paying any money. Past price trends do not guarantee future returns.
            </p>
          ),
        },
        {
          id: "regulatory",
          title: "Regulatory status",
          body: site.legal.reraAgentNo ? (
            <p>
              Where real estate projects registered under RERA are offered, our MahaRERA agent registration number is <b>{site.legal.reraAgentNo}</b>. Project RERA numbers, where applicable, are shown on the project listing.
            </p>
          ) : (
            <p>
              {site.name} is a listing platform for agricultural land, plots and farmhouses offered by individual owners. Where a listing is part of a real estate project that must be registered under the Real Estate (Regulation and Development) Act, 2016, it should only be bought after confirming its registration on the MahaRERA website.
            </p>
          ),
        },
        {
          id: "third",
          title: "Third-party services",
          body: <p>Businesses and workers listed on the platform are independent. We do not employ them and are not responsible for their work, pricing or conduct. Reviews are the opinions of their authors.</p>,
        },
        {
          id: "contact",
          title: "Report a problem",
          body: (
            <>
              <p>
                If you believe a listing is false or misleading, please <Link href="/contact?subject=Report%20a%20listing">report it</Link> and we will review it.
              </p>
              <ContactLines />
            </>
          ),
        },
      ]}
    />
  );
}
