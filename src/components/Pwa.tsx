"use client";

import Link from "next/link";
import { useEffect, useState, useSyncExternalStore } from "react";
import { Download, RefreshCw, Smartphone } from "lucide-react";

type InstallEvent = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: "accepted" | "dismissed" }> };

// ---- tiny store for the browser's install prompt (Chromium: Android, Windows, ChromeOS, macOS) ----
let deferred: InstallEvent | null = null;
let waitingWorker: ServiceWorker | null = null;
let updateRequested = false;
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());
const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => listeners.delete(l);
};

export function isStandalone() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(display-mode: standalone)").matches || (navigator as Navigator & { standalone?: boolean }).standalone === true;
}

export function isIos() {
  if (typeof navigator === "undefined") return false;
  return /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
}

/** Registers the service worker and shows an "update available" bar when a new version is waiting. */
export function PwaManager() {
  const update = useSyncExternalStore(subscribe, () => waitingWorker, () => null);

  useEffect(() => {
    const onPrompt = (e: Event) => {
      e.preventDefault();
      deferred = e as InstallEvent;
      emit();
    };
    const onInstalled = () => {
      deferred = null;
      emit();
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);

    if ("serviceWorker" in navigator && process.env.NODE_ENV === "production") {
      // Reload only after the visitor pressed "Update". The first install also fires controllerchange
      // (clients.claim), and reloading then would wipe whatever they were typing.
      navigator.serviceWorker.addEventListener("controllerchange", () => {
        if (!updateRequested) return;
        updateRequested = false;
        window.location.reload();
      });
      navigator.serviceWorker
        .register("/sw.js", { scope: "/" })
        .then((reg) => {
          const track = (w: ServiceWorker | null) => {
            if (!w) return;
            w.addEventListener("statechange", () => {
              // only an *update* when a page is already controlled; first install needs no prompt
              if (w.state === "installed" && navigator.serviceWorker.controller) {
                waitingWorker = w;
                emit();
              }
            });
          };
          if (reg.waiting && navigator.serviceWorker.controller) {
            waitingWorker = reg.waiting;
            emit();
          }
          reg.addEventListener("updatefound", () => track(reg.installing));
          // look for a new version when the app comes back to the foreground
          document.addEventListener("visibilitychange", () => document.visibilityState === "visible" && reg.update().catch(() => {}));
        })
        .catch(() => {
          // registration failure only disables offline support
        });
    }
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  if (!update) return null;
  return (
    <div role="status" className="fixed inset-x-0 bottom-0 z-[70] flex justify-center p-3 pb-[max(12px,env(safe-area-inset-bottom))]">
      <div className="flex items-center gap-3 rounded-xl bg-ink px-4 py-3 text-[14px] text-white shadow-soft">
        A new version of AgriLand is available.
        <button
          type="button"
          onClick={() => {
            updateRequested = true;
            update.postMessage("SKIP_WAITING");
          }}
          className="btn h-9 rounded-lg bg-white px-3 text-[13px] text-ink"
        >
          <RefreshCw className="h-4 w-4" /> Update
        </button>
      </div>
    </div>
  );
}

/**
 * "Install app" control. Uses the real browser prompt where one exists; on iPhone/iPad Safari (no install API)
 * it links to the Add-to-Home-Screen instructions. Renders nothing when the app is already installed.
 */
export function InstallButton({ className = "", label = "Install App" }: { className?: string; label?: string }) {
  const prompt = useSyncExternalStore(subscribe, () => deferred, () => null);
  const [env, setEnv] = useState<{ standalone: boolean; ios: boolean } | null>(null);
  useEffect(() => setEnv({ standalone: isStandalone(), ios: isIos() }), []);
  if (!env || env.standalone) return null;
  if (prompt)
    return (
      <button
        type="button"
        className={className}
        onClick={async () => {
          await prompt.prompt();
          await prompt.userChoice.catch(() => undefined);
          deferred = null;
          emit();
        }}
      >
        <Download className="h-4 w-4" /> {label}
      </button>
    );
  return (
    <Link href="/install" className={className}>
      <Smartphone className="h-4 w-4" /> {label}
    </Link>
  );
}

/** Live status for the install page. */
export function InstallStatus() {
  const prompt = useSyncExternalStore(subscribe, () => deferred, () => null);
  const [env, setEnv] = useState<{ standalone: boolean; ios: boolean } | null>(null);
  useEffect(() => setEnv({ standalone: isStandalone(), ios: isIos() }), []);
  if (!env) return null;
  if (env.standalone) return <p className="rounded-xl bg-mint-50 p-4 text-[14.5px] text-brand">You are already using the installed AgriLand app.</p>;
  if (prompt)
    return (
      <div className="rounded-xl border border-line bg-white p-4">
        <p className="text-[14.5px] text-body">Your browser can install AgriLand directly.</p>
        <InstallButton className="btn btn-primary mt-3 h-11 px-5" label="Install AgriLand" />
      </div>
    );
  if (env.ios) return <p className="rounded-xl bg-mint-50 p-4 text-[14.5px] text-ink">On iPhone and iPad, follow the Safari steps below.</p>;
  return <p className="rounded-xl bg-mint-50 p-4 text-[14.5px] text-ink">Your browser hasn&apos;t offered a one-tap install. Use the steps for your browser below.</p>;
}
