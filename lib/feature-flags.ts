/**
 * Feature flag system for VibeX.
 *
 * Shelved features are disabled by default. They remain in the codebase
 * but are inaccessible via routing. To re-enable a feature:
 *   1. Set the flag to `true` in FEATURE_FLAGS below, OR
 *   2. Add NEXT_PUBLIC_<FLAG_NAME>=true to .env.local
 *
 * See FEATURE_FLAGS.md for a full description of each flag.
 */

export const FEATURE_FLAGS = {
  // Shelved features (code preserved, routes blocked)
  FEATURE_BUDDY: false,  // Pet/gacha system (/buddy, /buddy/trade)
  FEATURE_EVENTS: false, // Hackathons, salons, demo days (/events)
} as const;

export type FeatureFlag = keyof typeof FEATURE_FLAGS;

/**
 * Check if a feature is enabled.
 *
 * Priority: env var override > hardcoded FEATURE_FLAGS value
 *
 * @example
 *   if (!isFeatureEnabled("FEATURE_BUDDY")) redirect("/");
 */
export function isFeatureEnabled(flag: FeatureFlag): boolean {
  const envVar = `NEXT_PUBLIC_${flag}`;
  const envValue = process.env[envVar];
  if (envValue === "true") return true;
  if (envValue === "false") return false;
  return FEATURE_FLAGS[flag];
}
