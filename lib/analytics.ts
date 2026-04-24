/**
 * Analytics interface — thin wrapper so call sites don't import the SDK
 * directly. Backend: OpenPanel (cookieless, GDPR-safe, free tier through
 * PH launch). Prior implementation was PostHog; swap was 2026-04-24 in
 * prep for PH launch 2026-05-01 because we never set NEXT_PUBLIC_POSTHOG_KEY
 * and PostHog's free tier cuts off at 1M events — not enough for launch-day.
 *
 * Mount point: `<OpenPanelComponent>` in app/layout.tsx loads the CDN
 * script; this file just drives `window.op('track', ...)` once that
 * script has resolved. No-ops silently when the script or client id is
 * missing, so dev + preview don't pollute production metrics.
 *
 * Env var: NEXT_PUBLIC_OPENPANEL_CLIENT_ID (client-side).
 */

// `window.op` is declared by @openpanel/web (imported via the mounted
// OpenPanelComponent). We call it via a loose cast so this file doesn't
// need to pull the whole SDK just for a type.
function call(method: string, ...args: unknown[]): void {
  if (typeof window === "undefined") return;
  const op = (window as unknown as { op?: (m: string, ...a: unknown[]) => void }).op;
  if (!op) return;
  op(method, ...args);
}

export function trackEvent(name: string, properties?: Record<string, unknown>): void {
  call("track", name, properties);
}

export function identifyUser(userId: string, traits?: Record<string, unknown>): void {
  call("identify", { profileId: userId, ...traits });
}

export function resetUser(): void {
  call("clear");
}
