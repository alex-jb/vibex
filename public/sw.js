// VibeX Service Worker — RETIRED 2026-05-06.
//
// The previous SW intercepted all HTML requests via fetch handler and
// returned cache fallback / offline HTML on network errors. For a
// 5-user indie product this was net-negative: a stale cache or a
// thrown handler exception surfaces in Chrome as ERR_FAILED on the
// route the SW touched, which is exactly what was happening on /launch.
//
// This file now exists only to actively unregister any prior SW that
// browsers still have installed. Once the user lands on any page,
// their browser fetches /sw.js fresh, runs this script, and the SW
// removes itself from `navigator.serviceWorker`. Caches it created
// are also purged so no stale HTML survives.
//
// Keep this file in place for at least 30 days so returning users
// get cleaned. After that it can be deleted along with
// components/sw-register.tsx.
self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const cacheKeys = await caches.keys();
      await Promise.all(cacheKeys.map((k) => caches.delete(k)));
      await self.registration.unregister();
      const clients = await self.clients.matchAll({ type: "window" });
      for (const c of clients) {
        // Force a reload so the page no longer thinks an SW is in control.
        c.navigate(c.url).catch(() => {});
      }
    })()
  );
});
