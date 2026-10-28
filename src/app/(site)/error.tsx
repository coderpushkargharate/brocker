"use client";

import Link from "next/link";
import { useEffect } from "react";
import { RefreshCw } from "lucide-react";

// Shown inside the site header/footer when a page fails to load (e.g. the database is briefly unreachable).
export default function SiteError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);
  return (
    <div className="container-x flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
      <p className="text-[15px] font-semibold uppercase tracking-wider text-brand">Something went wrong</p>
      <h1 className="mt-2 text-[28px] font-bold text-ink">We couldn&apos;t load this page</h1>
      <p className="mt-2 max-w-md text-[15px] text-body">This is usually temporary. Please try again in a moment.{error.digest && ` (Ref: ${error.digest})`}</p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <button type="button" onClick={reset} className="btn btn-primary h-11 px-6">
          <RefreshCw className="h-4 w-4" /> Try again
        </button>
        <Link href="/" className="btn btn-ghost h-11 px-6">
          Go Home
        </Link>
      </div>
    </div>
  );
}
