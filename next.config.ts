import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

const nextConfig: NextConfig = {
  // Optimize package imports — tree-shakes unused exports from heavy libs
  experimental: {
    optimizePackageImports: [
      "lucide-react",
      "framer-motion",
      "@base-ui/react",
    ],
  },
  // Enable gzip/brotli compression
  compress: true,
  // Remove X-Powered-By header (minor security + size win)
  poweredByHeader: false,
  // Production source maps disabled by Sentry, but react prod mode is enforced
  reactStrictMode: true,
  // Image optimization
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**.supabase.co" },
      { protocol: "https", hostname: "avatars.githubusercontent.com" },
    ],
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days
  },
  // HTTP headers for static asset caching + site-wide security
  async headers() {
    // Site-wide security headers. CSP is in report-only mode for now:
    // Next.js hydration requires 'unsafe-inline' for inline scripts, and
    // tightening that to nonces/hashes needs middleware-level work. Switch
    // `Content-Security-Policy-Report-Only` → `Content-Security-Policy`
    // once the app is observed clean under monitoring.
    // `upgrade-insecure-requests` is intentionally omitted: Chrome logs
    // a console error ("ignored when delivered in a report-only policy")
    // that shows up in Lighthouse's Best Practices audit. The directive
    // will be re-added once CSP moves out of report-only (see 2026-04-17
    // Lighthouse baseline in docs/lighthouse/BASELINE.md).
    const csp = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.vercel-insights.com https://*.sentry.io https://openpanel.dev",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob: https:",
      "font-src 'self' data:",
      // `blob.vercel-storage.com` added 2026-04-24 to allow direct uploads
      // from the /launch demo-video picker (@vercel/blob/client). Scoped to
      // our tenant subdomain rather than wildcarding *.blob.vercel-storage.com
      // for the same reason media-src is scoped below.
      // `api.openpanel.dev` + `*.hyperdx.io` added 2026-04-24 for analytics
      // + session-replay ingestion. CSP is still report-only; these keep the
      // console clean of violation noise that would otherwise clutter
      // HyperDX's session capture.
      "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://*.sentry.io https://*.ingest.sentry.io https://api.anthropic.com https://*.vercel-insights.com https://cgavxkhdjifwxoaw.public.blob.vercel-storage.com https://blob.vercel-storage.com https://api.openpanel.dev https://*.hyperdx.io",
      // <video> / <audio> sources — only our vibex-marketing Blob store, not
      // wildcard *.blob.vercel-storage.com (that would allow any Vercel tenant's
      // store). Security review 2026-04-22: tighten wildcard.
      "media-src 'self' https://cgavxkhdjifwxoaw.public.blob.vercel-storage.com",
      "frame-src 'self'",
      "frame-ancestors 'self'",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join("; ");

    const securityHeaders = [
      { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "X-Frame-Options", value: "SAMEORIGIN" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), interest-cohort=()" },
      { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
      { key: "Content-Security-Policy-Report-Only", value: csp },
    ];

    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
      {
        source: "/fonts/:path*",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
      {
        source: "/rpgui/:path*",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
      {
        source: "/icon.svg",
        headers: [
          { key: "Cache-Control", value: "public, max-age=86400" },
        ],
      },
    ];
  },
  async redirects() {
    return [
      // /discover was merged into /home (HQ) on 2026-04-14. Legacy aliases
      // and the old discover route all land at /home now.
      { source: "/discover", destination: "/home", permanent: true },
      { source: "/discover/:path*", destination: "/home", permanent: true },
      { source: "/explore", destination: "/home", permanent: true },
      { source: "/agents", destination: "/home", permanent: true },
      { source: "/workflows", destination: "/home", permanent: true },
    ];
  },
};

export default withSentryConfig(nextConfig, {
  silent: true,
  sourcemaps: {
    deleteSourcemapsAfterUpload: true,
  },
  disableLogger: true,
});
