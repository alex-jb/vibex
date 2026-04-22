/**
 * Vercel Blob asset URLs — single source of truth.
 *
 * All MP4s for /investors and the Remotion DemoVertical composition
 * live in the `vibex-marketing` Blob store. Rotating the store or
 * forking to a staging store should only require touching this file
 * (and the matching env var).
 *
 * Override at deploy time with NEXT_PUBLIC_DEMO_BLOB_BASE so staging
 * can point at a separate store without a code change.
 */

const DEFAULT_DEMO_BLOB_BASE =
  "https://cgavxkhdjifwxoaw.public.blob.vercel-storage.com/demo";

/**
 * Base URL for demo MP4 assets. NEXT_PUBLIC_ prefix makes it available
 * in both server and client code, and Remotion picks it up at bundle
 * time too.
 */
export const DEMO_BLOB_BASE: string =
  (typeof process !== "undefined" && process.env?.NEXT_PUBLIC_DEMO_BLOB_BASE) ||
  DEFAULT_DEMO_BLOB_BASE;

/** Helper: full URL for a demo asset filename. */
export function demoBlobUrl(filename: string): string {
  return `${DEMO_BLOB_BASE}/${filename}`;
}
