"use client";

import { useActionState } from "react";
import { createUserAction } from "@/app/actions/admin";
import { DISTRICTS } from "@/lib/config";
import { Alert } from "../auth/AuthForms";

export function CreateUserForm() {
  const [state, action, pending] = useActionState(createUserAction, undefined);
  return (
    <form action={action} className="space-y-3">
      <Alert error={state?.error} ok={state?.ok} />
      <input name="name" required placeholder="Full name" className="input" />
      <input name="email" type="email" required placeholder="Email" className="input" />
      <input name="phone" placeholder="Mobile number" className="input" />
      <div className="grid grid-cols-2 gap-3">
        <select name="role" className="input" defaultValue="farmer">
          <option value="farmer">Farmer</option>
          <option value="investor">Investor</option>
          <option value="admin">Admin</option>
        </select>
        <select name="district" className="input" defaultValue="Pune">
          {DISTRICTS.map((d) => (
            <option key={d}>{d}</option>
          ))}
        </select>
      </div>
      <input name="password" type="text" required minLength={6} placeholder="Temporary password" className="input" />
      <button disabled={pending} className="btn btn-primary h-11 w-full">
        Create User
      </button>
    </form>
  );
}
