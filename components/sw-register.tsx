"use client";

import { useEffect } from "react";

/**
 * Component name preserved for layout.tsx import compat, but the
 * behavior was inverted on 2026-05-06: instead of registering the
 * service worker, this now actively unregisters any prior install
 * and purges its caches.
 *
 * Why: the SW's HTML fetch handler was suspected of producing
 * `ERR_FAILED` on /launch by either (a) intercepting with a stale
 * cached response or (b) throwing inside the handler. For an indie
 * product with a tiny user base the offline-fallback value didn't
 * justify the failure modes. /public/sw.js is also rewritten to
 * unregister itself on activate, so this client-side hook is the
 * belt to that suspenders — guarantees cleanup even for users who
 * never re-fetch /sw.js because their cached one services the page.
 */
export function ServiceWorkerRegister() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    (async () => {
      try {
        const regs = await navigator.serviceWorker.getRegistrations();
        await Promise.all(regs.map((r) => r.unregister()));
        if ("caches" in self) {
          const keys = await caches.keys();
          await Promise.all(keys.map((k) => caches.delete(k)));
        }
      } catch {
        // Non-critical: the next page load will try again.
      }
    })();
  }, []);

  return null;
}
