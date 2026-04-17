/**
 * Detect whether a URL can be iframed.
 * GitHub, X/Twitter, and others send X-Frame-Options: DENY or
 * Content-Security-Policy: frame-ancestors 'none', which cause
 * silent blank frames in users' browsers. Detect those hosts
 * upfront and render a "visit site" fallback instead.
 */
const NON_EMBEDDABLE_HOSTS = new Set([
  "github.com",
  "www.github.com",
  "gist.github.com",
  "twitter.com",
  "www.twitter.com",
  "x.com",
  "www.x.com",
  "instagram.com",
  "www.instagram.com",
  "facebook.com",
  "www.facebook.com",
  "linkedin.com",
  "www.linkedin.com",
]);

export function canEmbedInIframe(url?: string): boolean {
  if (!url) return false;
  try {
    const u = new URL(url);
    return !NON_EMBEDDABLE_HOSTS.has(u.hostname.toLowerCase());
  } catch {
    return false;
  }
}

export function getHostname(url?: string): string {
  if (!url) return "";
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}
