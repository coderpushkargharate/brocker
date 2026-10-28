import type { Metadata } from "next";
import Link from "next/link";
import { ContactLines, LegalPage, Operator } from "@/components/LegalPage";

export const metadata: Metadata = {
  title: "Terms & Conditions",
  description: "The terms that apply to using AgriLand to list, find, buy or sell agricultural land and to find local services and labour.",
  alternates: { canonical: "/terms" },
};

export default function Terms() {
  return (
    <LegalPage
      title="Terms & Conditions"
      path="/terms"
      intro={
        <p>
          These terms apply when you use this website, operated by <Operator />. By creating an account, posting a listing or sending an enquiry you agree to them. If you do not agree, please do not use the platform.
        </p>
      }
      sections={[
        {
          id: "service",
          title: "What AgriLand does",
          body: (
            <>
              <p>
                AgriLand is an online platform where landowners can list agricultural land, plots and farmhouses, buyers can find them and contact the owner, and local businesses and workers can be found for land-related services. We may also help with paid land services such as surveys or documentation, which are agreed separately.
              </p>
              <p>
                <b>We are not a party to any sale.</b> Unless we agree otherwise in writing, we do not own the land listed, act as the seller&apos;s or buyer&apos;s agent, hold payments, or guarantee any transaction. Any deal is directly between buyer and seller.
              </p>
            </>
          ),
        },
        {
          id: "accounts",
          title: "Accounts",
          body: (
            <ul>
              <li>You must be at least 18 and give accurate information, including a mobile number you control.</li>
              <li>Keep your password private. You are responsible for activity on your account.</li>
              <li>We may suspend or remove accounts that break these terms, post false information or misuse other users&apos; contact details.</li>
            </ul>
          ),
        },
        {
          id: "listings",
          title: "Listing land",
          body: (
            <ul>
              <li>Only list land you own or are legally authorised to sell, and describe it truthfully (area, price, location, water, access, legal status).</li>
              <li>Upload genuine documents. Listings are reviewed before going live and we may reject, edit for clarity or remove any listing.</li>
              <li>A &quot;Verified&quot; badge means our team has checked that the required documents were provided and appear consistent with the listing. It is <b>not</b> a legal title opinion or a guarantee of ownership — see the <Link href="/disclaimer">Disclaimer</Link>.</li>
              <li>You give us permission to display your listing text and photos on the website and in our marketing of the listing.</li>
            </ul>
          ),
        },
        {
          id: "buyers",
          title: "For buyers",
          body: (
            <ul>
              <li>Do your own due diligence before paying anything: inspect the land, check the 7/12 extract, mutation entries, encumbrances and any restrictions on agricultural land purchase that apply to you, and take independent legal advice.</li>
              <li>Never pay advance money without a written agreement and verified documents.</li>
              <li>Use contact details you receive only to discuss that listing. Spam or harassment will lead to account removal.</li>
            </ul>
          ),
        },
        {
          id: "services",
          title: "Business and labour listings",
          body: (
            <p>
              Businesses and workers are responsible for their own services, prices, licences and conduct. Reviews reflect the opinions of the people who wrote them; we moderate reviews before publishing but do not verify every claim. Paid &quot;Premium&quot; placement, where offered, is shown as such.
            </p>
          ),
        },
        {
          id: "conduct",
          title: "Acceptable use",
          body: (
            <ul>
              <li>No false, misleading or duplicate listings, fake reviews or impersonation.</li>
              <li>No scraping, automated submissions, attempts to access other users&apos; data or admin areas, or interference with the site&apos;s security.</li>
              <li>No unlawful content or content you don&apos;t have the rights to.</li>
            </ul>
          ),
        },
        {
          id: "liability",
          title: "Liability",
          body: (
            <p>
              The platform is provided &quot;as is&quot;. To the extent permitted by law, we are not liable for losses arising from transactions between users, from information provided by users, or from temporary unavailability of the site. Nothing in these terms limits liability that cannot be limited under Indian law.
            </p>
          ),
        },
        {
          id: "law",
          title: "Governing law",
          body: <p>These terms are governed by the laws of India. Courts at Pune, Maharashtra have jurisdiction, subject to any mandatory consumer protection rights you have.</p>,
        },
        {
          id: "changes",
          title: "Changes",
          body: <p>We may update these terms. The date at the top shows the latest version; continuing to use the site after a change means you accept the updated terms.</p>,
        },
        { id: "contact", title: "Contact us", body: <ContactLines /> },
      ]}
    />
  );
}
