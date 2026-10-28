import Link from "next/link";
import { HONEYPOT_FIELD } from "@/lib/honeypot";

/** Hidden field that only bots fill in. Server actions drop submissions where it has a value. */
export function Honeypot() {
  return (
    <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
      <label>
        Leave this field empty
        <input type="text" name={HONEYPOT_FIELD} tabIndex={-1} autoComplete="off" defaultValue="" />
      </label>
    </div>
  );
}

/** Short notice under lead forms that says where the details go. */
export function PrivacyNote({ shared = false, className = "" }: { shared?: boolean; className?: string }) {
  return (
    <p className={`text-[12px] leading-relaxed text-muted ${className}`}>
      {shared ? "Your name and mobile number will be shared with this provider and our team so they can contact you about this request. " : "Our team will use these details only to respond to your request. "}
      See our{" "}
      <Link href="/privacy-policy" className="underline hover:text-brand">
        Privacy Policy
      </Link>
      .
    </p>
  );
}
