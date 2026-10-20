"use client";

import { useState, useTransition, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Bookmark, Check, Copy, Heart, Phone, Send, Share2 } from "lucide-react";
import { expressInterestAction, logCallAction, recordShareAction, recordViewAction, toggleSaveAction } from "@/app/actions/lands";

function useLoginRedirect() {
  const router = useRouter();
  const path = usePathname();
  return () => router.push(`/login?next=${encodeURIComponent(path)}`);
}

export function SaveButton({
  landId,
  saved,
  variant = "overlay",
  className = "",
}: {
  landId: string;
  saved: boolean;
  variant?: "overlay" | "bookmark" | "plain" | "button" | "overlay-white";
  className?: string;
}) {
  const [on, setOn] = useState(saved);
  const [pending, start] = useTransition();
  const toLogin = useLoginRedirect();
  useEffect(() => setOn(saved), [saved]);

  const click = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    start(async () => {
      setOn((v) => !v);
      const r = await toggleSaveAction(landId);
      if (r.needLogin) {
        setOn(saved);
        toLogin();
      } else if (typeof r.saved === "boolean") setOn(r.saved);
    });
  };
  const label = on ? "Remove from saved lands" : "Save this land";

  if (variant === "bookmark")
    return (
      <button onClick={click} disabled={pending} aria-label={label} aria-pressed={on} className={`text-[#9ca3af] hover:text-brand ${className}`}>
        <Bookmark className={`h-5 w-5 ${on ? "fill-brand text-brand" : ""}`} />
      </button>
    );
  if (variant === "plain")
    return (
      <button onClick={click} disabled={pending} aria-label={label} aria-pressed={on} className={className}>
        <Heart className={`h-6 w-6 ${on ? "fill-[#ef4444] text-[#ef4444]" : "text-[#9ca3af]"}`} />
      </button>
    );
  if (variant === "button")
    return (
      <button onClick={click} disabled={pending} aria-pressed={on} className={`btn btn-ghost h-11 px-5 text-[14px] ${className}`}>
        <Heart className={`h-4 w-4 ${on ? "fill-[#ef4444] text-[#ef4444]" : ""}`} /> {on ? "Saved" : "Save Land"}
      </button>
    );
  if (variant === "overlay-white")
    return (
      <button onClick={click} disabled={pending} aria-label={label} aria-pressed={on} className={`flex h-8 w-8 items-center justify-center rounded-full bg-white shadow ${className}`}>
        <Heart className={`h-4 w-4 ${on ? "fill-[#ef4444] text-[#ef4444]" : "text-ink"}`} />
      </button>
    );
  return (
    <button onClick={click} disabled={pending} aria-label={label} aria-pressed={on} className={`flex h-8 w-8 items-center justify-center rounded-full bg-black/30 backdrop-blur-sm ${className}`}>
      <Heart className={`h-[18px] w-[18px] ${on ? "fill-[#ef4444] text-[#ef4444]" : "text-white"}`} />
    </button>
  );
}

export function InterestButton({
  landId,
  interested,
  variant = "large",
  className = "",
}: {
  landId: string;
  interested: boolean;
  variant?: "large" | "list" | "small";
  className?: string;
}) {
  const [sent, setSent] = useState(interested);
  const [msg, setMsg] = useState<string>();
  const [pending, start] = useTransition();
  const toLogin = useLoginRedirect();

  const click = () =>
    start(async () => {
      const r = await expressInterestAction(landId);
      if (r.needLogin) return toLogin();
      if (r.ok) setSent(true);
      else setMsg(r.message);
    });

  if (variant === "list" && sent)
    return (
      <div className={`rounded-lg border border-[#b7e0b9] bg-[#eaf6e9] px-3 py-2 text-center ${className}`}>
        <p className="flex items-center justify-center gap-1 text-[15px] font-semibold text-leaf">
          Interest Sent <Check className="h-4 w-4" />
        </p>
        <p className="mt-0.5 text-[10.5px] leading-snug text-body">Farmer has been notified. You can connect after the farmer responds.</p>
      </div>
    );

  const sizes = variant === "large" ? "h-[50px] text-[16px]" : variant === "list" ? "h-10 text-[15px] btn-leaf" : "h-11 px-6 text-[14px]";
  return (
    <div className={className}>
      <button onClick={click} disabled={pending || sent} className={`btn ${variant === "list" ? "btn-leaf" : "btn-primary"} w-full ${sizes}`}>
        {sent ? <Check className="h-4 w-4" /> : <Send className="h-4 w-4" />}
        {sent ? "Interest Sent" : pending ? "Sending…" : "I'm Interested"}
      </button>
      {msg && <p className="mt-1 text-xs text-[#dc2626]">{msg}</p>}
    </div>
  );
}

export function CallButton({ landId, label = "Direct Call", className = "btn btn-ghost h-[50px] w-full text-[16px]" }: { landId: string; label?: string; className?: string }) {
  const [pending, start] = useTransition();
  return (
    <button
      className={className}
      disabled={pending}
      onClick={() =>
        start(async () => {
          const { phone } = await logCallAction(landId);
          window.location.href = `tel:${phone}`;
        })
      }
    >
      <Phone className="h-4 w-4" fill="currentColor" /> {label}
    </button>
  );
}

export function ShareButtons({ landId, url, title }: { landId: string; url: string; title: string }) {
  const [copied, setCopied] = useState(false);
  const text = encodeURIComponent(`${title} – ${url}`);
  const track = () => recordShareAction(landId);
  const base = "flex h-8 w-8 items-center justify-center rounded-full border border-line text-ink hover:bg-mint-50";
  return (
    <div className="flex items-center gap-2">
      <a className={base} href={`https://wa.me/?text=${text}`} target="_blank" rel="noopener noreferrer" aria-label="Share on WhatsApp" onClick={track}>
        <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current"><path d="M17.5 14.4c-.3-.1-1.8-.9-2-1-.3-.1-.5-.1-.7.1-.2.3-.8 1-.9 1.2-.2.2-.3.2-.6.1-.3-.1-1.3-.5-2.4-1.5-.9-.8-1.5-1.8-1.7-2.1-.2-.3 0-.5.1-.6l.4-.5.3-.5c.1-.2 0-.4 0-.5l-.9-2.2c-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.5s1.1 2.9 1.2 3.1c.1.2 2.1 3.3 5.2 4.6.7.3 1.3.5 1.7.6.7.2 1.4.2 1.9.1.6-.1 1.8-.7 2-1.4.2-.7.2-1.3.2-1.4-.1-.2-.3-.3-.6-.4zM12 21.8c-1.8 0-3.5-.5-5-1.4l-.4-.2-3.7 1 1-3.6-.2-.4A9.8 9.8 0 1 1 12 21.8zm0-21.6A11.8 11.8 0 0 0 1.9 18l-1.7 6 6.2-1.6A11.8 11.8 0 1 0 12 .2z" /></svg>
      </a>
      <button
        className={base}
        aria-label="Copy link"
        onClick={async () => {
          await navigator.clipboard.writeText(url);
          setCopied(true);
          track();
          setTimeout(() => setCopied(false), 1800);
        }}
      >
        {copied ? <Check className="h-4 w-4 text-brand" /> : <Copy className="h-4 w-4" />}
      </button>
      <a className={base} href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`} target="_blank" rel="noopener noreferrer" aria-label="Share on Facebook" onClick={track}>
        <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current"><path d="M14 8h3V4h-3c-2.8 0-4.5 1.8-4.5 4.6V11H7v4h2.5v9h4v-9h3l.5-4h-3.5V8.8c0-.5.3-.8.5-.8z" /></svg>
      </a>
      <button
        className={base}
        aria-label="More share options"
        onClick={async () => {
          track();
          if (navigator.share) await navigator.share({ title, url }).catch(() => {});
          else {
            await navigator.clipboard.writeText(url);
            setCopied(true);
            setTimeout(() => setCopied(false), 1800);
          }
        }}
      >
        <Share2 className="h-4 w-4" />
      </button>
    </div>
  );
}

export function ShareListingButton({ landId, url, title }: { landId: string; url: string; title: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      className="btn btn-primary h-10 px-5 text-[14px]"
      onClick={async () => {
        recordShareAction(landId);
        if (navigator.share) await navigator.share({ title, url }).catch(() => {});
        else {
          await navigator.clipboard.writeText(url);
          setCopied(true);
          setTimeout(() => setCopied(false), 1800);
        }
      }}
    >
      <Share2 className="h-4 w-4" /> {copied ? "Link Copied!" : "Share Listing"}
    </button>
  );
}

/** Counts a page view once per browser session. */
export function ViewTracker({ landId }: { landId: string }) {
  useEffect(() => {
    const key = `viewed:${landId}`;
    try {
      if (sessionStorage.getItem(key)) return;
      sessionStorage.setItem(key, "1");
    } catch {}
    recordViewAction(landId);
  }, [landId]);
  return null;
}
