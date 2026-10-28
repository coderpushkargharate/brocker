import type { Metadata } from "next";
import Link from "next/link";
import { ContactLines, LegalPage, Operator } from "@/components/LegalPage";
import { TRACKING_CONFIGURED } from "@/components/Consent";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How AgriLand collects, uses, shares and protects personal information of landowners, buyers, service providers and visitors.",
  alternates: { canonical: "/privacy-policy" },
};

export default function PrivacyPolicy() {
  return (
    <LegalPage
      title="Privacy Policy"
      path="/privacy-policy"
      intro={
        <p>
          This policy explains what personal information <Operator /> collects when you use this website, why we collect it, who we share it with and the choices you have. It applies to visitors, registered buyers and landowners, and businesses or workers listed on the platform.
        </p>
      }
      sections={[
        {
          id: "collect",
          title: "Information we collect",
          body: (
            <>
              <h3>Information you give us</h3>
              <ul>
                <li><b>Account:</b> name, mobile number, district, account type (buyer or landowner) and a password. Passwords are stored only as a one-way hash; we cannot read them.</li>
                <li><b>Profile (optional):</b> village, taluka, city, farming experience, a short bio and a profile photo.</li>
                <li><b>Land listings:</b> land details and price, location (including map coordinates you choose to share), photos, video, and documents such as the 7/12 extract, land map and ownership proof.</li>
                <li><b>Business and worker profiles:</b> business or personal name, phone and WhatsApp number, address, photos, GST number and, for workers, an ID proof.</li>
                <li><b>Enquiries, call-back requests and requirements:</b> your name, mobile number, location and message.</li>
                <li><b>Reviews:</b> your name, rating and review text.</li>
              </ul>
              <h3>Information collected automatically</h3>
              <ul>
                <li><b>Activity on listings:</b> listing views (counted without identifying the visitor), shares, &quot;I&apos;m Interested&quot; clicks, calls started from the site and lands you save.</li>
                <li><b>Technical data:</b> our hosting provider processes your IP address and browser details to deliver the site and protect it from abuse (for example, limiting repeated login attempts).</li>
                <li><b>Cookies:</b> see our <Link href="/cookie-policy">Cookie Policy</Link>.</li>
              </ul>
            </>
          ),
        },
        {
          id: "use",
          title: "How we use your information",
          body: (
            <ul>
              <li>To create and secure your account and keep you logged in.</li>
              <li>To publish listings and profiles after review, and to check land documents before marking a listing as verified.</li>
              <li>To connect buyers with landowners and customers with service providers (see &quot;Sharing&quot; below).</li>
              <li>To send you in-app notifications about your listings, enquiries and matching lands.</li>
              <li>To respond to your enquiries and support requests.</li>
              <li>To prevent fraud, spam and misuse, and to comply with legal obligations.</li>
              {TRACKING_CONFIGURED && <li>With your consent only, to measure site usage and the performance of our advertising.</li>}
            </ul>
          ),
        },
        {
          id: "share",
          title: "Who we share it with",
          body: (
            <>
              <ul>
                <li><b>Landowners:</b> when you click &quot;I&apos;m Interested&quot;, the landowner is notified with your name. When a logged-in user starts a call, the landowner&apos;s number is shown to them and the landowner is told who called.</li>
                <li><b>Businesses and workers:</b> when you send an enquiry, call-back request or requirement, your name and mobile number are shared with that provider (if they manage their profile) and with our team.</li>
                <li><b>Public listing pages:</b> listing details, photos, village-level location and the landowner&apos;s name and village are public. Business and worker profiles show the contact details the provider chose to publish. Land documents and ID proofs are <b>never</b> public; only the owner and our admins can open them.</li>
                <li><b>Service providers who run the site for us:</b> website hosting, database and file storage providers, who process data only on our instructions.</li>
                <li><b>Maps:</b> some pages embed Google Maps, which receives your IP address when the map loads.</li>
                {TRACKING_CONFIGURED && <li><b>Analytics and advertising:</b> only if you accept them, Google and/or Meta receive information about your visit. We never send them your name, phone number, messages or documents.</li>}
                <li><b>Authorities:</b> when required by law or to protect users from fraud.</li>
              </ul>
              <p>We do not sell your personal information.</p>
            </>
          ),
        },
        {
          id: "retention",
          title: "How long we keep it",
          body: (
            <p>
              We keep account and listing information while your account is active. Listing view history is kept for about 60 days for statistics. Enquiries and leads are kept as long as needed to handle them and resolve disputes. When you ask us to delete your account, we delete your account, your listings and related interests, except where we must keep records by law.
            </p>
          ),
        },
        {
          id: "security",
          title: "How we protect it",
          body: (
            <p>
              Passwords are hashed, login sessions use secure, HTTP-only cookies, private documents are only served to their owner and our admins, and forms are protected against automated abuse. No system is completely secure, so please use a strong password that you don&apos;t use elsewhere.
            </p>
          ),
        },
        {
          id: "rights",
          title: "Your choices and rights",
          body: (
            <>
              <p>Subject to applicable law, including India&apos;s Digital Personal Data Protection Act, 2023, you can:</p>
              <ul>
                <li>access and correct your information from <b>My Profile</b>, or ask us for a copy;</li>
                <li>ask us to delete your account and data;</li>
                <li>withdraw consent you gave (for example to optional cookies) at any time;</li>
                <li>raise a grievance with us, and, if unresolved, with the Data Protection Board of India once it is operational.</li>
              </ul>
              <p>To make a request, contact us using the details below from your registered mobile number or email so we can verify it&apos;s you.</p>
            </>
          ),
        },
        {
          id: "children",
          title: "Children",
          body: <p>The platform is meant for adults who can enter into property transactions. We do not knowingly collect information from anyone under 18.</p>,
        },
        {
          id: "changes",
          title: "Changes to this policy",
          body: <p>If we change this policy we will update the date at the top of this page, and for significant changes we will notify registered users in the app.</p>,
        },
        { id: "contact", title: "Contact us", body: <ContactLines /> },
      ]}
    />
  );
}
