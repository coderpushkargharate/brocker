# Google Ads & Meta Ads Readiness Checklist

Ad approval is decided by Google and Meta; this checklist covers what the site controls. **The site is not ready to advertise until the "Must fix" items are done.**

## Must fix before running ads (owner action)

| # | Item | Why |
|---|---|---|
| 1 | Set real `NEXT_PUBLIC_SUPPORT_PHONE`, `NEXT_PUBLIC_WHATSAPP_URL`, `NEXT_PUBLIC_SUPPORT_EMAIL` | The site still shows the placeholder `1800-123-4567`. Unreachable contact details are a misrepresentation risk and anonymous "Direct Call" goes to this number. |
| 2 | Set `NEXT_PUBLIC_LEGAL_NAME` and `NEXT_PUBLIC_BUSINESS_ADDRESS` (and `NEXT_PUBLIC_GRIEVANCE_OFFICER`) | Ad platforms and Indian consumer/data law expect a clear business identity. These appear in the footer and legal pages. Nothing was invented. |
| 3 | Verify or remove **"5000+ verified customers", "₹250Cr+ worth transactions", "1000+ happy customers"** | They are baked into `public/images/hero.png` (also the default social share image) and `/about`. If they can't be substantiated they are a misrepresentation risk. |
| 4 | Remove demo/sample content from the live database | Seed data contains invented lands, businesses, workers, reviews and testimonials. New production databases no longer get it, but an existing database may already contain it. |
| 5 | Confirm the "Verified" process | Badges say "Verified"; the Disclaimer now explains it is a document check, not a title guarantee. Make sure admins really check documents before approving. |
| 6 | Real-estate regulatory status | Get legal advice on whether your activity needs MahaRERA agent registration; if so set `NEXT_PUBLIC_RERA_AGENT_NO` (shown on the Disclaimer). Google may require real-estate advertiser verification in some regions. |
| 7 | Have the legal pages reviewed by a lawyer | They describe the app's actual data flows but are not legal advice (DPDP Act 2023, consumer protection, RERA). |

## Implemented and verified

| Requirement | Status |
|---|---|
| Privacy Policy, Terms, Cookie Policy, Disclaimer – linked in footer on every page, mobile and desktop | PASS |
| Legal text matches actual data use (accounts, listings, private documents, leads shared with providers, view/call logs, Google Maps embeds) | Written from code review |
| Contact page and form work; server-side validation; clear success/error messages | PASS (E2E) |
| Typed values kept after a validation error | PASS (was broken site-wide) |
| Duplicate-submit protection | Buttons disabled while sending; rate limits |
| Spam protection (honeypot + rate limits) | PASS |
| Leads stored in the database, admin-only | PASS |
| Consent text on lead forms says who receives the details | Added to contact, enquiry and requirement forms |
| Sign-up: Terms & Privacy checkbox, **not pre-checked**, enforced server-side, timestamp stored | PASS |
| No marketing opt-in exists, so no one is subscribed to marketing | N/A |
| Landing pages: 200 status, mobile-friendly, no horizontal scroll, HTTPS-ready headers | PASS (local) |
| Retired URL `/investors` → permanent redirect to `/buy-land` | PASS |
| Misleading listing claims removed (generic fertility/connectivity text, fake "site visits") | PASS |

## Tracking & consent (Google tag, Google Ads, Meta Pixel)

No analytics or ad tags existed before this audit, and **none load today**. A consent manager is built in and stays dormant until you set an ID:

| Env var | Loads | Consent needed |
|---|---|---|
| `NEXT_PUBLIC_GA_ID` | GA4 | Analytics |
| `NEXT_PUBLIC_GOOGLE_ADS_ID` (+ `NEXT_PUBLIC_GOOGLE_ADS_LEAD_LABEL`) | Google Ads conversion | Advertising |
| `NEXT_PUBLIC_META_PIXEL_ID` | Meta Pixel | Advertising |

* Banner with equal-weight **Accept all / Reject all / Customise**; no script is injected before a choice. Choice can be changed from "Cookie settings" in the footer.
* Google Consent Mode v2 signals (`ad_storage`, `analytics_storage`, `ad_user_data`, `ad_personalization`) are sent with default *denied*.
* **Conversions fire only after the server confirms success** (contact form, enquiry, requirement, "I'm Interested") – never on a button click. Events: GA4 `generate_lead`, Google Ads `conversion`, Meta `Lead`.
* **No personal data** (name, phone, message) is sent. Each event carries a random `eventID`, so a future Conversions API integration can de-duplicate.
* Status: **NOT TESTED with real tag IDs** (none available). Before launching, check with Google Tag Assistant and Meta Pixel Helper that nothing fires before consent and that one lead = one event.
* Meta Conversions API: not configured and not required; add it only server-side with hashed identifiers and the same `eventID`.

## Ad-to-landing-page consistency (owner)
Point ads at specific pages (`/sell-land`, `/buy-land?district=…`, `/locations/pune`, a land page) and only promise what the page shows (prices, locations, "free listing"). Don't use "guaranteed returns" or "verified title" wording in ads.
