"use client";

import { useState, useTransition } from "react";
import { KeyRound } from "lucide-react";
import { resetUserPasswordAction } from "@/app/actions/admin";

/** Issues a temporary password and shows it once so the admin can read it out to the verified account owner. */
export function ResetPasswordButton({ id, name }: { id: string; name: string }) {
  const [pending, start] = useTransition();
  const [result, setResult] = useState<string | null>(null);
  if (result)
    return (
      <span role="status" className="rounded-md bg-[#fef3c7] px-2 py-1 text-[12px] text-[#92400e]">
        {result}
      </span>
    );
  return (
    <button
      type="button"
      disabled={pending}
      title="Reset password"
      onClick={() => {
        if (!confirm(`Reset the password for ${name}? Only do this after confirming the request came from the registered mobile number.`)) return;
        start(async () => {
          const r = await resetUserPasswordAction(id);
          setResult(r.password ? `Temporary password: ${r.password}` : r.error || "Failed");
        });
      }}
      className="flex items-center gap-1 rounded-md border border-line px-2 py-1 text-[12px] hover:bg-mint-50"
    >
      <KeyRound className="h-3.5 w-3.5" /> Reset
    </button>
  );
}
