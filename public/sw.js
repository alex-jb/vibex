// VibeX Service Worker — minimal install-only shell.
//
// Rewritten 2026-05-08 (Q2: PWA clean rebuild). The previous SW was a
// kill-switch that unregistered itself on activate; before that, an
// HTML-intercepting SW caused ERR_FAILED on /launch.
//
// This version is intentionally minimal:
//   - install: skipWaiting (take control immediately)
//   - activate: clients.claim, plus one-time purge of any old caches
//     left over from the pre-2026-05-06 SW
//   - NO fetch handler — we never intercept HTML, JS, or API
//     requests. Users get fresh-from-network behavior every time.
//
// Why have an SW at all if it does nothing? Chrome's "Install app"
// prompt + Add-to-Home-Screen requires a valid SW registration plus
// a manifest.json. This file is the bare minimum to satisfy that
// installability check while staying out of the way of every actual
// request.
//
// Push notifications + Background Sync are deferred — they need a
// server-side subscription store (web-push + VAPID keys + a creators
// table column) which is its own commit.

const CACHE_GENERATION = "vibex-2026-05-08";

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      // One-time cleanup: purge any caches from the previous SW
      // generation. Match by name prefix so we don't accidentally
      // kill caches from sibling apps on the same origin (we don't
      // have any, but defensive).
      const keys = await caches.keys();
      await Promise.all(
        keys
          .filter((k) => k.startsWith("vibex-") && k !== CACHE_GENERATION)
          .map((k) => caches.delete(k)),
      );
      await self.clients.claim();
    })(),
  );
});

// Intentionally NO fetch listener. Every request goes straight to the
// network. If we ever want offline support we'll add it carefully and
// scope it to static assets only — never HTML or API routes.
