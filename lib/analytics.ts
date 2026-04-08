import posthog from "posthog-js";

let initialized = false;

const POSTHOG_KEY = typeof window !== "undefined"
  ? process.env.NEXT_PUBLIC_POSTHOG_KEY
  : undefined;

function ensureInit() {
  if (initialized || !POSTHOG_KEY || typeof window === "undefined") return false;
  posthog.init(POSTHOG_KEY, {
    api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com",
    capture_pageview: true,
    capture_pageleave: true,
    loaded: (ph) => {
      if (process.env.NODE_ENV === "development") ph.debug();
    },
  });
  initialized = true;
  return true;
}

export function trackEvent(name: string, properties?: Record<string, unknown>): void {
  if (!ensureInit() && !initialized) return;
  posthog.capture(name, properties);
}

export function identifyUser(userId: string, traits?: Record<string, unknown>): void {
  if (!ensureInit() && !initialized) return;
  posthog.identify(userId, traits);
}

export function resetUser(): void {
  if (!initialized) return;
  posthog.reset();
}

export { posthog };
