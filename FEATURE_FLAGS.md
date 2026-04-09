# Feature Flags

VibeX uses feature flags to shelve individual features. Shelved features remain
in the codebase but are inaccessible via routing. This allows quick re-enabling
without re-writing code.

## Current Flags

| Flag | Route(s) | Description | Status |
|------|----------|-------------|--------|
| `FEATURE_BUDDY` | `/buddy`, `/buddy/trade` | Pet summoning and evolution system | **Shelved** |
| `FEATURE_EVENTS` | `/events` | Hackathons, salons, demo days | **Shelved** |

## How It Works

Flags are defined in `lib/feature-flags.ts`. The `isFeatureEnabled(flag)` function
checks the hardcoded value, with environment variable override support.

Route guards live in `app/<feature>/layout.tsx`. If the flag is off, the layout
redirects to `/`.

## How to Enable a Feature

### Option A: Environment variable (temporary)

Add to `.env.local`:
```bash
NEXT_PUBLIC_FEATURE_BUDDY=true
```

Restart the dev server.

### Option B: Hardcoded (permanent)

Edit `lib/feature-flags.ts`:
```typescript
export const FEATURE_FLAGS = {
  FEATURE_BUDDY: true,  // flip to true
  FEATURE_EVENTS: false,
};
```

Commit and deploy.

## Why Feature Flags Instead of Deleting?

The shelved features took real engineering work. Deleting them throws away value.
Feature flags preserve the code, let CI verify it still compiles, and make it
trivial to re-enable any feature by flipping a single flag.
