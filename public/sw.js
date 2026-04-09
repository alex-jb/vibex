// VibeX Service Worker — v1
const CACHE_NAME = "vibex-v1";
const OFFLINE_URL = "/offline";

// Static assets to pre-cache (app shell)
const PRECACHE_ASSETS = [
  "/",
  "/manifest.json",
  "/rpgui/rpgui.css",
  "/rpgui/img/border-image.png",
  "/rpgui/img/border-image-dark.png",
  "/fonts/zpix.ttf",
];

// Install: pre-cache the app shell
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS).catch(() => {
        // Some assets may not exist yet — skip failures
      });
    })
  );
  self.skipWaiting();
});

// Activate: clean up old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

// Fetch strategy
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== "GET") return;

  // Skip API routes — always network
  if (url.pathname.startsWith("/api/")) return;

  // Skip Supabase, Sentry, PostHog requests
  if (
    url.hostname.includes("supabase") ||
    url.hostname.includes("sentry") ||
    url.hostname.includes("posthog")
  ) {
    return;
  }

  // Static assets (fonts, images, CSS, JS) — cache-first
  if (
    url.pathname.startsWith("/rpgui/") ||
    url.pathname.startsWith("/fonts/") ||
    url.pathname.startsWith("/_next/static/") ||
    url.pathname.match(/\.(png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|css|js)$/)
  ) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request)
          .then((response) => {
            if (response.ok) {
              const clone = response.clone();
              caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
            }
            return response;
          })
          .catch(() => caches.match(OFFLINE_URL));
      })
    );
    return;
  }

  // HTML pages — network-first with cache fallback
  if (request.headers.get("accept")?.includes("text/html")) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return response;
        })
        .catch(() => {
          return caches.match(request).then((cached) => {
            return cached || caches.match(OFFLINE_URL) || new Response(
              offlineHTML(),
              { headers: { "Content-Type": "text/html; charset=utf-8" } }
            );
          });
        })
    );
    return;
  }
});

// Push notification handler
self.addEventListener("push", (event) => {
  const data = event.data ? event.data.json() : {};
  const title = data.title || "VibeX";
  const options = {
    body: data.body || "",
    icon: "/icon.svg",
    badge: "/icon.svg",
    data: { url: data.url || "/" },
    tag: data.tag || `vibex-push-${Date.now()}`,
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

// Notification click handler — navigate to the URL
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification.data?.url || "/";
  event.waitUntil(
    self.clients.matchAll({ type: "window" }).then((clients) => {
      // Focus existing window if available
      for (const client of clients) {
        if (client.url.includes(url) && "focus" in client) {
          return client.focus();
        }
      }
      // Otherwise open new window
      return self.clients.openWindow(url);
    })
  );
});

function offlineHTML() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>VibeX — Offline</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Press Start 2P', monospace;
      background: #0a0a0c;
      color: #fff;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      padding: 2rem;
    }
    .border-box {
      border: 6px solid #4a2080;
      padding: 3rem 2rem;
      max-width: 480px;
      position: relative;
    }
    .border-box::after {
      content: '';
      position: absolute;
      inset: 6px;
      border: 3px solid #8b5cf6;
      pointer-events: none;
    }
    h1 { font-size: 1.5rem; color: #FACC15; margin-bottom: 1.5rem; line-height: 1.6; }
    p { font-size: 0.6rem; color: #71717a; line-height: 2; margin-bottom: 1rem; }
    .pixel-art {
      font-size: 3rem;
      margin-bottom: 1.5rem;
      animation: bounce 1s infinite alternate;
    }
    @keyframes bounce {
      from { transform: translateY(0); }
      to { transform: translateY(-8px); }
    }
    button {
      font-family: 'Press Start 2P', monospace;
      font-size: 0.5rem;
      background: linear-gradient(135deg, #8b5cf6, #d946ef);
      color: white;
      border: none;
      padding: 12px 24px;
      cursor: pointer;
      margin-top: 1rem;
    }
    button:hover { opacity: 0.9; }
    .scanlines {
      position: fixed;
      inset: 0;
      background: repeating-linear-gradient(
        transparent 0px, transparent 2px,
        rgba(0,0,0,0.05) 2px, rgba(0,0,0,0.05) 4px
      );
      pointer-events: none;
      z-index: 999;
    }
  </style>
</head>
<body>
  <div class="scanlines"></div>
  <div class="border-box">
    <div class="pixel-art">📡</div>
    <h1>CONNECTION LOST</h1>
    <p>Your quest has been interrupted!<br>Check your internet connection and try again.</p>
    <button onclick="location.reload()">RETRY CONNECTION</button>
  </div>
</body>
</html>`;
}
