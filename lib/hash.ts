/**
 * Deterministic 32-bit string hash (djb2-ish).
 *
 * Use for seeding stable shuffles that would otherwise use Math.random,
 * which is impure during render and causes SSR hydration mismatches.
 *
 * Properties:
 *   - Same input → same output across calls, processes, platforms
 *   - Empty string → 0
 *   - 32-bit signed integer range
 *   - Not cryptographic — collisions expected, don't use for anything secret
 */
export function hashString(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = ((h << 5) - h + s.charCodeAt(i)) | 0;
  }
  return h;
}
