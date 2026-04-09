# Shelved Features

Features intentionally hidden behind feature flags for V1 launch focus. All code
remains in the repo and can be re-enabled by flipping the corresponding flag.

See `FEATURE_FLAGS.md` for flag management.

---

## FEATURE_FEED — Social Feed

**Route:** `/feed`
**Files:**
- `app/feed/page.tsx`, `app/feed/layout.tsx`
- `components/feed/*` (15+ files: post-card, post-composer, reactions, etc.)
- `app/api/feed/*` (7 API routes)

**Why shelved:** Competes directly with Twitter/X. A social feed inside a product
dilutes focus. V1 should drive users to launch projects, not scroll posts.

**Re-enable when:** You have >10k active users who need a dedicated discovery surface.

---

## FEATURE_EVENTS — Events & Hackathons

**Route:** `/events`
**Files:**
- `app/events/page.tsx`, `app/events/layout.tsx`
- Event-related mock data in `lib/mock-data/events.ts`

**Why shelved:** All event data is currently fake (VibeX Global Hackathon 2026
with fake $50K prizes). Fake events erode trust. Real hackathons require real
partners, sponsors, logistics.

**Re-enable when:** You have a real event to promote with real prizes and dates.

---

## FEATURE_IDEAS — Idea Incubator

**Route:** `/ideas`
**Files:**
- `app/ideas/page.tsx`, `app/ideas/layout.tsx`
- `components/ideas/*` (ai-evaluation, idea-card, idea-submit-form, etc.)

**Why shelved:** An idea incubator is essentially a separate product. VibeX is
"launch your built AI project," not "evaluate your idea before building." These
are different funnels.

**Re-enable when:** You want to support pre-launch creators who need validation.

---

## FEATURE_AGENTS — AI Agent Marketplace

**Routes:** `/agents`, `/agents/builder`, `/agents/[id]`
**Files:**
- `app/agents/*/page.tsx`, `app/agents/*/layout.tsx`
- `components/agents/agent-reviews.tsx`
- `components/discover/agents-tab.tsx`
- `lib/agent-engine.ts`, `lib/agent-tools.ts`, `lib/agent-types.ts`

**Why shelved:** Building an agent marketplace is a separate product (think
Zapier, Make, LangChain Hub). It competes with established players and distracts
from the core "hero card + share" loop.

**Re-enable when:** You have a clear agent-marketplace strategy and differentiation.

---

## FEATURE_WORKFLOWS — Workflow Orchestration

**Routes:** `/workflows`, `/workflows/[id]`
**Files:**
- `app/workflows/*/page.tsx`, `app/workflows/*/layout.tsx`
- `components/discover/workflows-tab.tsx`
- `lib/workflow-engine.ts`

**Why shelved:** Multi-agent workflows are essentially n8n / Zapier. Same scope
creep as Agents marketplace.

**Re-enable when:** You want to support creators who want to chain AI steps.

---

## FEATURE_INSIGHTS — Trend Analysis

**Routes:** `/insights`, `/insights/growth`
**Files:**
- `app/insights/*/page.tsx`, `app/insights/*/layout.tsx`
- `app/api/ai/trend-analysis/route.ts`

**Why shelved:** Trend insights require real user activity data to be meaningful.
Currently shows mock data. V1 has no real signals to analyze.

**Re-enable when:** You have 30+ days of real user activity data.

---

## FEATURE_CREATOR_GRAPH — Creator Network Visualization

**Route:** `/creators/graph`
**Files:**
- `app/creators/graph/page.tsx`, `app/creators/graph/layout.tsx`

**Why shelved:** A D3 force-directed graph of creators is visually cool but
doesn't drive acquisition or retention. It's a "look at our cool tech" feature,
not a "solve user problem" feature.

**Re-enable when:** You have >100 creators who care about who's connected to whom.

---

## FEATURE_VC — VC Dashboard

**Route:** `/vc/dashboard`
**Files:**
- `app/vc/dashboard/page.tsx`, `app/vc/layout.tsx`
- `components/vc/deal-flow-table.tsx`, `radar-chart.tsx`, `talent-graph.tsx`
- `app/api/vc/dashboard/route.ts`

**Why shelved:** VCs are the wrong audience for V1. VibeX is a creator platform.
Catering to VCs before having creators is premature.

**Re-enable when:** You have >500 projects and want to build an investor pipeline.

---

## FEATURE_DEVELOPERS — Developer Portal

**Route:** `/developers`
**Files:**
- `app/developers/page.tsx`, `app/developers/layout.tsx`
- `components/dev/api-key-panel.tsx`, `code-examples.tsx`, `endpoint-docs.tsx`,
  `rate-limits.tsx`, `webhook-panel.tsx`

**Why shelved:** No public API exists yet. The portal shows placeholder docs
for APIs that aren't real. Promising an API you don't have is a trust killer.

**Re-enable when:** You have a real public API with rate limits, auth, and docs.

---

## FEATURE_USER_ANALYTICS — Personal Analytics

**Route:** `/analytics`
**Files:**
- `app/analytics/page.tsx`, `app/analytics/layout.tsx`

**Why shelved:** User analytics require real data. V1 users will have near-empty
dashboards, which feels broken. Better to not show it until there's signal.

**Re-enable when:** You have multi-day user engagement data worth displaying.

---

## FEATURE_MESSAGES — Direct Messages

**Route:** `/messages`
**Files:**
- `app/messages/page.tsx`, `app/messages/layout.tsx`
- `components/realtime-chat.tsx`
- `app/api/messages/*` (conversation + messages routes)

**Why shelved:** DMs are a community feature. V1 has no community yet. Empty DM
inbox looks broken. Better to launch DMs after you have >100 active users.

**Re-enable when:** Users ask for a way to talk to each other.

---

## FEATURE_CREATOR_DASHBOARD — Creator Analytics Dashboard

**Route:** `/profile/dashboard`
**Files:**
- `app/profile/dashboard/page.tsx`, `app/profile/dashboard/layout.tsx`

**Why shelved:** Same as `FEATURE_USER_ANALYTICS` — needs real data.

**Re-enable when:** Creators have projects with real view/upvote data.

---

## What's KEPT (V1 Core + RPG Gamification)

These features are **always visible** and form V1:

**Core loop (acquisition):**
- `/` — landing
- `/launch` — the magical moment (paste URL → hero card)
- `/project/[id]` — the shareable asset
- `/discover` — browse other cards (social proof)
- `/creators` — creator rankings (social proof)

**RPG gamification (retention, logged-in users):**
- `/dojo` — RPG hub
- `/buddy`, `/buddy/trade` — pet system
- `/arena` — battle system
- `/hunt` — RPG-style discovery

**Infrastructure:**
- Auth: `/login`, `/register`
- Profile: `/profile`, `/profile/[id]`, `/settings`
- Legal: `/about`, `/privacy`, `/terms`
- Admin: `/admin`, `/admin/analytics` (role-gated, not flag-gated)

---

## Re-enabling a Feature — Checklist

1. Flip the flag in `lib/feature-flags.ts` OR add `NEXT_PUBLIC_FEATURE_X=true` to env
2. Run `npm run build` — ensure it compiles
3. Run `npm test` — ensure tests still pass
4. Manually visit the route — check the page still renders correctly (mock data may have drifted)
5. Test the full user flow for that feature
6. If everything works, commit the flag change and deploy
