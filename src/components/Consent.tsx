"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

/**
 * Cookie consent + optional analytics / advertising tags.
 *
 * Nothing here runs unless a tag ID is configured:
 *   NEXT_PUBLIC_GA_ID               Google Analytics 4 (G-XXXX)       – "analytics" consent
 *   NEXT_PUBLIC_GOOGLE_ADS_ID       Google Ads (AW-XXXX)              – "marketing" consent
 *   NEXT_PUBLIC_GOOGLE_ADS_LEAD_LABEL  conversion label for leads (optional)
 *   NEXT_PUBLIC_META_PIXEL_ID       Meta Pixel                        – "marketing" consent
 * Scripts are only injected after the visitor opts in (no tags load before a choice is made),
 * and Google Consent Mode v2 signals are sent with every load.
 */

const GA_ID = process.env.NEXT_PUBLIC_GA_ID || "";
const ADS_ID = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID || "";
const ADS_LEAD_LABEL = process.env.NEXT_PUBLIC_GOOGLE_ADS_LEAD_LABEL || "";
const PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID || "";
export const TRACKING_CONFIGURED = Boolean(GA_ID || ADS_ID || PIXEL_ID);

const KEY = "agri_consent_v1";
type Choice = { analytics: boolean; marketing: boolean; at: string };

type W = Window & { dataLayer?: unknown[]; gtag?: (...a: unknown[]) => void; fbq?: ((...a: unknown[]) => void) & { queue?: unknown[]; loaded?: boolean; version?: string; callMethod?: (...a: unknown[]) => void; push?: unknown } };

function readChoice(): Choice | null {
  try {
    const v = localStorage.getItem(KEY);
    return v ? (JSON.parse(v) as Choice) : null;
  } catch {
    return null;
  }
}

function saveChoice(c: Choice) {
  try {
    localStorage.setItem(KEY, JSON.stringify(c));
  } catch {
    // storage blocked: the choice applies to this page view only
  }
}

function addScript(src: string) {
  if (document.querySelector(`script[src="${src}"]`)) return;
  const s = document.createElement("script");
  s.async = true;
  s.src = src;
  document.head.appendChild(s);
}

function consentState(c: Choice) {
  const m = c.marketing ? "granted" : "denied";
  return { analytics_storage: c.analytics ? "granted" : "denied", ad_storage: m, ad_user_data: m, ad_personalization: m };
}

function applyChoice(c: Choice) {
  const w = window as W;
  if ((GA_ID && c.analytics) || (ADS_ID && c.marketing)) {
    if (!w.gtag) {
      w.dataLayer = w.dataLayer || [];
      // eslint-disable-next-line prefer-rest-params
      w.gtag = function () { w.dataLayer!.push(arguments); };
      w.gtag("consent", "default", { analytics_storage: "denied", ad_storage: "denied", ad_user_data: "denied", ad_personalization: "denied" });
      w.gtag("js", new Date());
      addScript(`https://www.googletagmanager.com/gtag/js?id=${GA_ID || ADS_ID}`);
    }
    w.gtag("consent", "update", consentState(c));
    if (GA_ID && c.analytics) w.gtag("config", GA_ID, { anonymize_ip: true });
    if (ADS_ID && c.marketing) w.gtag("config", ADS_ID);
  } else if (w.gtag) {
    w.gtag("consent", "update", consentState(c));
  }
  if (PIXEL_ID && c.marketing && !w.fbq) {
    const f = function (...a: unknown[]) {
      if (f.callMethod) f.callMethod(...a);
      else f.queue!.push(a);
    } as NonNullable<W["fbq"]>;
    f.queue = [];
    f.loaded = true;
    f.version = "2.0";
    f.push = f;
    w.fbq = f;
    addScript("https://connect.facebook.net/en_US/fbevents.js");
    w.fbq("init", PIXEL_ID);
    w.fbq("track", "PageView");
  } else if (PIXEL_ID && w.fbq) {
    w.fbq("consent", c.marketing ? "grant" : "revoke");
  }
}

/**
 * Report a confirmed lead (call after the server accepted the form, never on a button click).
 * No personal data is sent: only the lead type and a random event id for de-duplication
 * if a Conversions API integration is added later.
 */
export function trackLead(kind: string) {
  if (!TRACKING_CONFIGURED) return;
  const c = readChoice();
  if (!c) return;
  const w = window as W;
  const eventId = crypto.randomUUID();
  if (w.gtag && c.analytics && GA_ID) w.gtag("event", "generate_lead", { lead_type: kind });
  if (w.gtag && c.marketing && ADS_ID && ADS_LEAD_LABEL) w.gtag("event", "conversion", { send_to: `${ADS_ID}/${ADS_LEAD_LABEL}`, transaction_id: eventId });
  if (w.fbq && c.marketing && PIXEL_ID) w.fbq("track", "Lead", { content_category: kind }, { eventID: eventId });
}

/** Fire trackLead once when a form's server response reports success. */
export function useLeadTracked(ok: string | undefined, kind: string) {
  useEffect(() => {
    if (ok) trackLead(kind);
  }, [ok, kind]);
}

export function ConsentManager() {
  const [open, setOpen] = useState(false);
  const [custom, setCustom] = useState(false);
  const [analytics, setAnalytics] = useState(false);
  const [marketing, setMarketing] = useState(false);

  useEffect(() => {
    if (!TRACKING_CONFIGURED) return;
    const c = readChoice();
    if (c) {
      setAnalytics(c.analytics);
      setMarketing(c.marketing);
      applyChoice(c);
    } else setOpen(true);
    const reopen = () => {
      setCustom(true);
      setOpen(true);
    };
    window.addEventListener("agri:consent-open", reopen);
    return () => window.removeEventListener("agri:consent-open", reopen);
  }, []);

  if (!TRACKING_CONFIGURED || !open) return null;

  const decide = (a: boolean, m: boolean) => {
    const c = { analytics: a, marketing: m, at: new Date().toISOString() };
    saveChoice(c);
    applyChoice(c);
    setAnalytics(a);
    setMarketing(m);
    setOpen(false);
    setCustom(false);
  };

  return (
    <div role="dialog" aria-modal="false" aria-labelledby="consent-title" className="fixed inset-x-0 bottom-0 z-[60] p-3 pb-[max(12px,env(safe-area-inset-bottom))] sm:p-5">
      <div className="mx-auto max-w-[760px] rounded-2xl border border-line bg-white p-5 shadow-[0_12px_40px_rgba(16,24,40,0.18)]">
        <h2 id="consent-title" className="text-[16px] font-bold text-ink">
          Your privacy choices
        </h2>
        <p className="mt-1.5 text-[13.5px] leading-relaxed text-body">
          We use essential cookies to keep you logged in. With your permission we&apos;d also use analytics and advertising cookies to understand visits and measure our ads. You can change this at any time from &quot;Cookie settings&quot; in the footer.{" "}
          <Link href="/cookie-policy" className="link">
            Cookie Policy
          </Link>
        </p>
        {custom && (
          <fieldset className="mt-4 space-y-3 rounded-xl bg-mint-50 p-4">
            <legend className="sr-only">Cookie categories</legend>
            <label className="flex items-start gap-3 text-[13.5px]">
              <input type="checkbox" className="check mt-0.5" checked disabled />
              <span>
                <b className="text-ink">Essential</b> – login session and security. Always on.
              </span>
            </label>
            {GA_ID && (
              <label className="flex items-start gap-3 text-[13.5px]">
                <input type="checkbox" className="check mt-0.5" checked={analytics} onChange={(e) => setAnalytics(e.target.checked)} />
                <span>
                  <b className="text-ink">Analytics</b> – Google Analytics, to see which pages are useful.
                </span>
              </label>
            )}
            {(ADS_ID || PIXEL_ID) && (
              <label className="flex items-start gap-3 text-[13.5px]">
                <input type="checkbox" className="check mt-0.5" checked={marketing} onChange={(e) => setMarketing(e.target.checked)} />
                <span>
                  <b className="text-ink">Advertising</b> – {[ADS_ID && "Google Ads", PIXEL_ID && "Meta Pixel"].filter(Boolean).join(" and ")}, to measure enquiries from our ads.
                </span>
              </label>
            )}
          </fieldset>
        )}
        <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:justify-end">
          {custom ? (
            <button type="button" onClick={() => decide(analytics, marketing)} className="btn btn-ghost h-11 px-5 text-[14px]">
              Save choices
            </button>
          ) : (
            <button type="button" onClick={() => setCustom(true)} className="btn btn-ghost h-11 px-5 text-[14px]">
              Customise
            </button>
          )}
          <button type="button" onClick={() => decide(false, false)} className="btn btn-ghost h-11 px-5 text-[14px]">
            Reject all
          </button>
          <button type="button" onClick={() => decide(true, true)} className="btn btn-primary h-11 px-5 text-[14px]">
            Accept all
          </button>
        </div>
      </div>
    </div>
  );
}

/** Footer link that reopens the consent dialog. Hidden when no optional tags are configured. */
export function CookieSettingsLink({ className = "" }: { className?: string }) {
  if (!TRACKING_CONFIGURED) return null;
  return (
    <button type="button" onClick={() => window.dispatchEvent(new Event("agri:consent-open"))} className={className}>
      Cookie settings
    </button>
  );
}
