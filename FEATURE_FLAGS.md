# Feature Flags

VibeX uses feature flags to shelve non-core features for V1 launch. Shelved
features remain in the codebase but are inaccessible via routing.

## How It Works

Flags are defined in `lib/feature-flags.ts`. The `isFeatureEnabled(flag)` function
checks the hardcoded value, but environment variables can override at runtime.

Route guards live in `app/<feature>/layout.tsx` files. If the flag is off, the
layout redirects to `/`.

## Current Flags

All flags are **disabled by default** for V1 focus.

| Flag | Route(s) | Description |
|------|----------|-------------|
| `FEATURE_FEED` | `/feed` | Twitter-style social feed |
| `FEATURE_EVENTS` | `/events` | Hackathons, salons, demo days |
| `FEATURE_IDEAS` | `/ideas` | AI-evaluated idea incubator |
| `FEATURE_AGENTS` | `/agents/*` | AI agent marketplace + builder |
| `FEATURE_WORKFLOWS` | `/workflows/*` | Multi-agent workflow orchestration |
| `FEATURE_INSIGHTS` | `/insights/*` | Trend analysis and growth intel |
| `FEATURE_CREATOR_GRAPH` | `/creators/graph` | Creator network visualization |
| `FEATURE_VC` | `/vc/dashboard` | VC deal flow dashboard |
| `FEATURE_DEVELOPERS` | `/developers` | API documentation portal |
| `FEATURE_USER_ANALYTICS` | `/analytics` | Personal analytics dashboard |
| `FEATURE_MESSAGES` | `/messages` | Direct messaging |
| `FEATURE_CREATOR_DASHBOARD` | `/profile/dashboard` | Creator analytics dashboard |

## How to Enable a Feature

### Option A: Environment variable (temporary, for testing)

Add to `.env.local`:
```bash
NEXT_PUBLIC_FEATURE_FEED=true
```

Restart the dev server. The flag is now enabled.

### Option B: Hardcoded (permanent)

Edit `lib/feature-flags.ts`:
```typescript
export const FEATURE_FLAGS = {
  FEATURE_FEED: true,  // <-- flip to true
  ...
};
```

Commit and deploy.

## What's KEPT in V1 (core + RPG gamification)

Always visible:
- `/` (home)
- `/launch` (core magical moment)
- `/project/[id]` (hero card)
- `/discover`, `/creators`
- `/profile`, `/profile/[id]`
- `/login`, `/register`, `/settings`
- `/about`, `/privacy`, `/terms`

RPG gamification (visible to logged-in users):
- `/dojo` (RPG hub)
- `/buddy`, `/buddy/trade` (pet system)
- `/arena` (battle system)
- `/hunt` (RPG-style discovery)

## Why Feature Flags Instead of Deleting?

The shelved features took real engineering work. Deleting them throws away value.
Feature flags preserve the code, let CI verify it still compiles, and make it
trivial to re-enable any feature by flipping a single flag.

## Review Process

- **Monthly:** Review this file. Ensure shelved features still compile.
- **Before major refactors:** Run `npm run build` to verify no flag page is broken.
- **Re-enabling a flag:** Test the page manually before shipping, in case mock data
  has drifted.

## See Also

- `docs/SHELVED_FEATURES.md` — detailed description of each shelved feature
- `lib/feature-flags.ts` — flag definitions and the `isFeatureEnabled` helper
