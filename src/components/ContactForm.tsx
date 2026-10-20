"use client";

import { useActionState } from "react";
import { Loader2, Send } from "lucide-react";
import { contactAction } from "@/app/actions/lands";
import { Alert } from "./auth/AuthForms";
import { SERVICES } from "./ServicesPromo";

export function ContactForm({ subject }: { subject?: string }) {
  const [state, action, pending] = useActionState(contactAction, undefined);
  if (state?.ok) return <Alert ok={state.ok} />;
  const subjects = ["General enquiry", "Help selling my land", "Help buying land", ...SERVICES.map((s) => s.title)];
  if (subject && !subjects.includes(subject)) subjects.unshift(subject);
  return (
    <form action={action} className="space-y-4">
      <Alert error={state?.error} />
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="c-name">
            Full name
          </label>
          <input id="c-name" name="name" required className="input" autoComplete="name" />
        </div>
        <div>
          <label className="label" htmlFor="c-phone">
            Mobile number
          </label>
          <input id="c-phone" name="phone" type="tel" className="input" autoComplete="tel" />
        </div>
      </div>
      <div>
        <label className="label" htmlFor="c-email">
          Email
        </label>
        <input id="c-email" name="email" type="email" className="input" autoComplete="email" />
      </div>
      <div>
        <label className="label" htmlFor="c-subject">
          Subject
        </label>
        <select id="c-subject" name="subject" defaultValue={subject ?? subjects[0]} className="input">
          {subjects.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="label" htmlFor="c-msg">
          Message
        </label>
        <textarea id="c-msg" name="message" rows={5} required className="input" placeholder="Tell us about your land or requirement…" />
      </div>
      <button disabled={pending} className="btn btn-primary h-12 w-full text-[15px]">
        {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />} Send Message
      </button>
    </form>
  );
}
