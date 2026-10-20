"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { Eye, EyeOff, Loader2, Sprout, TrendingUp } from "lucide-react";
import { loginAction, signupAction } from "@/app/actions/auth";
import { DISTRICTS } from "@/lib/config";

function Password({ name = "password", label = "Password", autoComplete }: { name?: string; label?: string; autoComplete: string }) {
  const [show, setShow] = useState(false);
  return (
    <div>
      <label className="label" htmlFor={name}>
        {label}
      </label>
      <div className="relative">
        <input id={name} name={name} type={show ? "text" : "password"} required minLength={autoComplete === "new-password" ? 6 : undefined} autoComplete={autoComplete} className="input pr-11" />
        <button type="button" onClick={() => setShow((s) => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted" aria-label={show ? "Hide password" : "Show password"}>
          {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
    </div>
  );
}

export function Alert({ error, ok }: { error?: string; ok?: string }) {
  if (error) return <p role="alert" className="rounded-lg border border-[#fecaca] bg-[#fef2f2] px-4 py-2.5 text-[13.5px] text-[#b91c1c]">{error}</p>;
  if (ok) return <p role="status" className="rounded-lg border border-[#bbf7d0] bg-[#f0fdf4] px-4 py-2.5 text-[13.5px] text-[#166534]">{ok}</p>;
  return null;
}

export function LoginForm({ next }: { next?: string }) {
  const [state, action, pending] = useActionState(loginAction, undefined);
  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="next" value={next ?? ""} />
      <Alert error={state?.error} />
      <div>
        <label className="label" htmlFor="email">
          Email address
        </label>
        <input id="email" name="email" type="email" required autoComplete="email" className="input" placeholder="you@example.com" />
      </div>
      <Password autoComplete="current-password" />
      <button type="submit" disabled={pending} className="btn btn-primary h-12 w-full text-[15px]">
        {pending && <Loader2 className="h-4 w-4 animate-spin" />} Log in
      </button>
      <p className="text-center text-[14px] text-body">
        New to AgriLand?{" "}
        <Link href={`/signup${next ? `?next=${encodeURIComponent(next)}` : ""}`} className="link">
          Create a free account
        </Link>
      </p>
    </form>
  );
}

export function SignupForm({ next, defaultRole }: { next?: string; defaultRole?: string }) {
  const [state, action, pending] = useActionState(signupAction, undefined);
  const [role, setRole] = useState(defaultRole === "farmer" ? "farmer" : "investor");
  const roles = [
    { v: "farmer", t: "I'm a Farmer", d: "I want to sell / list my land", icon: Sprout },
    { v: "investor", t: "I'm an Investor", d: "I want to buy agricultural land", icon: TrendingUp },
  ];
  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="next" value={next ?? ""} />
      <input type="hidden" name="role" value={role} />
      <Alert error={state?.error} />
      <div className="grid grid-cols-2 gap-3" role="radiogroup" aria-label="Account type">
        {roles.map((r) => (
          <button
            key={r.v}
            type="button"
            role="radio"
            aria-checked={role === r.v}
            onClick={() => setRole(r.v)}
            className={`rounded-xl border p-3 text-left transition ${role === r.v ? "border-brand bg-mint-50 ring-2 ring-brand/20" : "border-line bg-white hover:border-[#cbd5e1]"}`}
          >
            <r.icon className="h-5 w-5 text-brand" />
            <span className="mt-2 block text-[14px] font-semibold text-ink">{r.t}</span>
            <span className="block text-[12px] text-muted">{r.d}</span>
          </button>
        ))}
      </div>
      <div>
        <label className="label" htmlFor="name">
          Full name
        </label>
        <input id="name" name="name" required autoComplete="name" className="input" placeholder="Rajesh Kumar" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="email">
            Email address
          </label>
          <input id="email" name="email" type="email" required autoComplete="email" className="input" />
        </div>
        <div>
          <label className="label" htmlFor="phone">
            Mobile number
          </label>
          <input id="phone" name="phone" type="tel" required autoComplete="tel" className="input" placeholder="+91 98765 43210" />
        </div>
      </div>
      <div>
        <label className="label" htmlFor="district">
          District
        </label>
        <select id="district" name="district" className="input" defaultValue="Pune">
          {DISTRICTS.map((d) => (
            <option key={d}>{d}</option>
          ))}
        </select>
      </div>
      <Password autoComplete="new-password" />
      <button type="submit" disabled={pending} className="btn btn-primary h-12 w-full text-[15px]">
        {pending && <Loader2 className="h-4 w-4 animate-spin" />} Create Account
      </button>
      <p className="text-center text-[14px] text-body">
        Already have an account?{" "}
        <Link href={`/login${next ? `?next=${encodeURIComponent(next)}` : ""}`} className="link">
          Log in
        </Link>
      </p>
    </form>
  );
}
