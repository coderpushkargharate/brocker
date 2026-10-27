"use client";

import { useEffect, useState, useTransition } from "react";
import { usePathname } from "next/navigation";
import { Check, Heart, Phone, Share2 } from "lucide-react";
import { toggleSaveServiceAction, trackServiceAction } from "@/app/actions/services";
import { telLink, waLink } from "@/lib/services-config";

export function WhatsAppIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <path d="M17.5 14.4c-.3-.1-1.8-.9-2-1-.3-.1-.5-.1-.7.1-.2.3-.8 1-.9 1.2-.2.2-.3.2-.6.1-.3-.1-1.3-.5-2.4-1.5-.9-.8-1.5-1.8-1.7-2.1-.2-.3 0-.5.1-.6l.4-.5c.2-.2.2-.3.3-.5.1-.2 0-.4 0-.5l-.9-2.2c-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.5s1.1 2.9 1.2 3.1c.1.2 2.1 3.2 5.1 4.5.7.3 1.3.5 1.7.6.7.2 1.4.2 1.9.1.6-.1 1.8-.7 2-1.4.2-.7.2-1.3.2-1.4-.1-.2-.3-.3-.6-.4zM12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18.2c-1.5 0-3-.4-4.3-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2z" />
    </svg>
  );
}

export type ContactTarget = { type: "business" | "worker"; id: string; phone: string; whatsapp?: string; name: string };

export function CallButton({ t, className = "", label = "Call" }: { t: ContactTarget; className?: string; label?: string }) {
  return (
    <a href={telLink(t.phone)} onClick={() => trackServiceAction(t.type, t.id, "call")} className={`btn btn-outline ${className}`}>
      <Phone className="h-4 w-4" /> {label}
    </a>
  );
}

export function WhatsAppButton({ t, className = "", label = "WhatsApp", text }: { t: ContactTarget; className?: string; label?: string; text?: string }) {
  return (
    <a
      href={waLink(t.whatsapp || t.phone, text ?? `Hello ${t.name}, I found your profile on AgriLand and would like to know more.`)}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => trackServiceAction(t.type, t.id, "whatsapp")}
      className={`btn bg-[#15803d] text-white hover:bg-[#166534] ${className}`}
    >
      <WhatsAppIcon /> {label}
    </a>
  );
}

export function SaveButton({ id, saved: initial, className = "", withLabel = false }: { id: string; saved: boolean; className?: string; withLabel?: boolean }) {
  const [saved, setSaved] = useState(initial);
  const [pending, start] = useTransition();
  const path = usePathname();
  return (
    <button
      type="button"
      aria-label={saved ? "Remove from saved" : "Save"}
      aria-pressed={saved}
      disabled={pending}
      onClick={() =>
        start(async () => {
          const r = await toggleSaveServiceAction(id, path);
          if (typeof r === "boolean") setSaved(r);
        })
      }
      className={withLabel ? `btn btn-ghost ${className}` : `flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-line bg-white hover:bg-mint-50 ${className}`}
    >
      <Heart className={`h-[18px] w-[18px] ${saved ? "fill-[#ef4444] text-[#ef4444]" : "text-ink"}`} />
      {withLabel && (saved ? "Saved" : "Save")}
    </button>
  );
}

export function ShareButton({ title, className = "" }: { title: string; className?: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        const url = window.location.href;
        try {
          if (navigator.share) await navigator.share({ title, url });
          else {
            await navigator.clipboard.writeText(url);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
          }
        } catch {
          // share sheet closed
        }
      }}
      className={`btn btn-ghost ${className}`}
    >
      {copied ? <Check className="h-4 w-4 text-brand" /> : <Share2 className="h-4 w-4" />} {copied ? "Link copied" : "Share"}
    </button>
  );
}

/** Counts one view per profile per browser session. */
export function TrackView({ type, id }: { type: "business" | "worker"; id: string }) {
  useEffect(() => {
    const k = `sv-${id}`;
    try {
      if (sessionStorage.getItem(k)) return;
      sessionStorage.setItem(k, "1");
    } catch {
      // storage blocked – still count
    }
    trackServiceAction(type, id, "view");
  }, [type, id]);
  return null;
}
