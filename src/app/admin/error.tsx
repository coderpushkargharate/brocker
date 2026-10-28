"use client";

import { RefreshCw } from "lucide-react";

export default function AdminError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="rounded-2xl border border-[#fecaca] bg-[#fef2f2] p-6">
      <h1 className="text-[20px] font-bold text-[#991b1b]">This admin page failed to load</h1>
      <p className="mt-1 text-[14px] text-[#7f1d1d]">Your changes were not lost if they were saved before this message. {error.digest && `Reference: ${error.digest}`}</p>
      <button type="button" onClick={reset} className="btn btn-primary mt-4 h-10 px-5">
        <RefreshCw className="h-4 w-4" /> Try again
      </button>
    </div>
  );
}
