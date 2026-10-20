"use client";

import { useActionState, useState } from "react";
import { Camera, Loader2 } from "lucide-react";
import { updateProfileAction } from "@/app/actions/lands";
import { changePasswordAction } from "@/app/actions/admin";
import { DISTRICTS, STATES } from "@/lib/config";
import type { PublicUser } from "@/lib/types";
import { Alert } from "../auth/AuthForms";

export function ProfileForm({ user }: { user: PublicUser }) {
  const [state, action, pending] = useActionState(updateProfileAction, undefined);
  const [preview, setPreview] = useState(user.avatar);
  const farmer = user.role === "farmer";
  const field = (name: keyof PublicUser, label: string, props: React.InputHTMLAttributes<HTMLInputElement> = {}) => (
    <div>
      <label className="label" htmlFor={name}>
        {label}
      </label>
      <input id={name} name={name} defaultValue={(user[name] as string) ?? ""} className="input" {...props} />
    </div>
  );
  return (
    <form action={action} className="space-y-5">
      <Alert error={state?.error} ok={state?.ok} />
      <div className="flex items-center gap-5">
        <label className="relative block h-24 w-24 cursor-pointer overflow-hidden rounded-full bg-mint ring-4 ring-mint">
          {preview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={preview} alt="" className="h-full w-full object-cover" />
          ) : (
            <span className="flex h-full items-center justify-center text-[28px] font-semibold text-brand">{user.name[0]}</span>
          )}
          <span className="absolute inset-x-0 bottom-0 flex justify-center bg-black/50 py-1 text-white">
            <Camera className="h-4 w-4" />
          </span>
          <input
            type="file"
            name="avatar"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) setPreview(URL.createObjectURL(f));
            }}
          />
        </label>
        <div>
          <p className="text-[18px] font-semibold text-ink">{user.name}</p>
          <p className="text-[13.5px] capitalize text-muted">
            {user.role} • {user.email}
          </p>
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {field("name", "Full name", { required: true })}
        {field("phone", "Mobile number", { type: "tel" })}
        {farmer ? field("village", "Village") : field("city", "City")}
        {farmer && field("taluka", "Taluka")}
        <div>
          <label className="label" htmlFor="district">
            District
          </label>
          <select id="district" name="district" defaultValue={user.district ?? ""} className="input">
            <option value="">Select…</option>
            {DISTRICTS.map((d) => (
              <option key={d}>{d}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="label" htmlFor="state">
            State
          </label>
          <select id="state" name="state" defaultValue={user.state ?? "Maharashtra"} className="input">
            {STATES.map((d) => (
              <option key={d}>{d}</option>
            ))}
          </select>
        </div>
        {farmer && field("experience", "Farming experience", { placeholder: "15+ Years" })}
        {farmer && field("farmingType", "Farming type", { placeholder: "Crop Farming" })}
      </div>
      {farmer && (
        <div>
          <label className="label" htmlFor="bio">
            About you (shown to investors)
          </label>
          <textarea id="bio" name="bio" rows={3} maxLength={500} defaultValue={user.bio ?? ""} className="input" />
        </div>
      )}
      <button disabled={pending} className="btn btn-primary h-11 px-6">
        {pending && <Loader2 className="h-4 w-4 animate-spin" />} Save Profile
      </button>
    </form>
  );
}

export function PasswordForm() {
  const [state, action, pending] = useActionState(changePasswordAction, undefined);
  return (
    <form action={action} className="space-y-4">
      <Alert error={state?.error} ok={state?.ok} />
      <div>
        <label className="label" htmlFor="current">
          Current password
        </label>
        <input id="current" name="current" type="password" required autoComplete="current-password" className="input" />
      </div>
      <div>
        <label className="label" htmlFor="password">
          New password
        </label>
        <input id="password" name="password" type="password" required minLength={6} autoComplete="new-password" className="input" />
      </div>
      <button disabled={pending} className="btn btn-ghost h-11 px-6">
        Change Password
      </button>
    </form>
  );
}
