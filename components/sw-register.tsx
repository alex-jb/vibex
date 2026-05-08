"use client";

import { useEffect } from "react";

/**
 * Service Worker registrar — rewritten 2026-05-08 (Q2: PWA clean rebuild).
 *
 * After the 2026-05-06 kill-switch incident, returning visitors had
 * their old buggy SW unregistered + caches purged. That's been live
 * for two days, enough time for the kill-SW to have run on every
 * recurring visitor.
 *
 * Now we register the new minimal /sw.js (no fetch handler, no HTML
 * cache — see public/sw.js for design notes). Goal: enable Chrome's
 * "Install app" + iOS Add-to-Home-Screen prompts so creators can
 * one-tap-launch into the dashboard from their phone.
 */
export function ServiceWorkerRegister() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    if (process.env.NODE_ENV !== "production") return;

    (async () => {
      try {
        // updateViaCache: "none" makes the browser always check
        // /sw.js for changes on each registration call. Without this
        // browsers can hold an old SW for 24h via HTTP cache, which
        // is exactly what made the 2026-05-06 kill-switch slow to
        // propagate.
        await navigator.serviceWorker.register("/sw.js", {
          scope: "/",
          updateViaCache: "none",
        });
      } catch {
        // Non-critical: site works fine without SW. Silent fail.
      }
    })();
  }, []);

  return null;
}
