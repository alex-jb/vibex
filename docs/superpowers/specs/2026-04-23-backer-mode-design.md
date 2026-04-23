# Backer Mode — Design Spec

**Status**: Future spec · NOT for immediate implementation    
**Drafted**: 2026-04-23 via `/superpowers:brainstorming` session    
**Prereq**: VibeXForge public launch + 2-4 weeks of traction data, so we back the right projects from the right audience

## 1 · Summary

Lets VibeXForge users support AI projects with small one-time tips ($5–$500), paid through Stripe Connect Express. Backers earn "spotter" credibility that compounds as backed projects evolve up the 6-stage ladder (Seed → Active → Growing → Breakout → Legend → Myth). The product moat is that reward for the backer is CONTINGENT on the project they picked — this is impossible on Patreon / Ko-fi / Kickstarter because they don't have an evolution mechanic.

Not equity. Not securities. Not revenue-share. Pure voluntary support with social-proof returns.

## 2 · User stories

**Creator**: Launches a project → after some traction, opts in via project settings → Stripe Connect Express 3-min hosted KYC → `▸ BACK THIS PROJECT` button appears on the public page → receives funds directly to their bank, minus 5% platform fee and Stripe's ~2.9% + $0.30.

**Backer**: Browses `/home` or `/hunt` → spots a promising early-stage project → clicks `▸ BACK` → picks a tier ($10 / $25 / $100 or custom) → pays via Apple Pay / Google Pay / card on Stripe Checkout → returns to page with `FOUNDING_BACKER` badge added to profile → weeks later, badge auto-upgrades as backed project evolves → eventually appears on `/spotters` leaderboard if projects hit Legend or Myth.

**Watcher** (non-backer, non-creator): Browses creator profiles → notices "Spotted 3 Legend · 1 Myth" on someone's page → decides that creator has good taste → follows them as a de-facto scouting signal.

## 3 · Scope

**MVP includes**:

- Stripe Connect Express onboarding and payment flow
- 3 new tables (`creator_payouts`, `backings`) + 1 column on `projects` (`backing_enabled`)
- Project settings opt-in toggle
- Project-page `▸ BACK THIS PROJECT` button + amount modal
- Profile badge wall (4 tiers: FOUNDING_BACKER / EARLY_SPOTTER / LEGENDARY_SPOTTER / MYTHIC_EYE)
- `/spotters` leaderboard route
- Evolution math update: `backer_count` enters stage thresholds as a 3rd signal (alongside plays + upvotes)
- Analytics instrumentation

**MVP excludes**:

- Creator-defined reward tiers / physical or digital perks (V2 Patreon-style)
- Recurring monthly subscriptions (one-time only for V1)
- Refund / dispute UI (delegate to Stripe's buyer protection)
- Chinese domestic payment (WeChat / Alipay / 商户号) — V2 or later
- Any "investment return" framing — Terms of Service must read "voluntary support, non-refundable except per Stripe policy, no financial return promised"

## 4 · Data model

> Note: in VibeXForge's schema, the `creators` table is the universal user table — every authenticated user has one row. "Creator" and "Backer" are not separate tables; any user can receive backings (if they own a project) and give backings (on anyone's project). `auth.uid()` equals `creators.id`.

```sql
-- Migration: 045_backer_mode.sql (or next available number)

-- Creator's Stripe Connect account (1 per creator)
CREATE TABLE creator_payouts (
  creator_id        uuid PRIMARY KEY REFERENCES creators(id) ON DELETE CASCADE,
  stripe_account_id text UNIQUE NOT NULL,
  onboarding_done   boolean NOT NULL DEFAULT false,
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now()
);

-- Project-level opt-in flag
ALTER TABLE projects ADD COLUMN backing_enabled boolean NOT NULL DEFAULT false;
ALTER TABLE projects ADD COLUMN unique_backers_count integer NOT NULL DEFAULT 0;

-- Every backing transaction
CREATE TABLE backings (
  id                         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id                 uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  backer_id                  uuid NOT NULL REFERENCES creators(id),
  amount_cents               integer NOT NULL CHECK (amount_cents >= 500),  -- $5 minimum
  platform_fee_cents         integer NOT NULL,
  stripe_tx_id               text UNIQUE NOT NULL,
  project_stage_at_backing   evolution_stage NOT NULL,
  created_at                 timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_backings_backer_id  ON backings(backer_id, created_at DESC);
CREATE INDEX idx_backings_project_id ON backings(project_id);
CREATE INDEX idx_backings_stage      ON backings(project_stage_at_backing);

-- RLS
ALTER TABLE creator_payouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE backings        ENABLE ROW LEVEL SECURITY;

-- creator_payouts: owner-only
CREATE POLICY "Own payouts" ON creator_payouts
  FOR ALL USING (creator_id = auth.uid());

-- backings: public read (transparent ledger), write only via SECURITY DEFINER RPC
CREATE POLICY "Public read backings" ON backings
  FOR SELECT USING (true);
-- No INSERT policy — writes go through record_backing() RPC only

-- SECURITY DEFINER RPC called from the Stripe webhook handler
CREATE OR REPLACE FUNCTION record_backing(
  _project_id    uuid,
  _backer_id     uuid,
  _amount_cents  integer,
  _fee_cents     integer,
  _stripe_tx_id  text
) RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  _current_stage evolution_stage;
  _new_id        uuid;
  _is_new_backer boolean;
BEGIN
  -- Idempotency: Stripe retries — UNIQUE(stripe_tx_id) guards duplicate inserts
  IF EXISTS (SELECT 1 FROM backings WHERE stripe_tx_id = _stripe_tx_id) THEN
    RETURN (SELECT id FROM backings WHERE stripe_tx_id = _stripe_tx_id);
  END IF;

  SELECT evolution_stage INTO _current_stage FROM projects WHERE id = _project_id;

  -- Insert the backing row
  INSERT INTO backings (project_id, backer_id, amount_cents, platform_fee_cents, stripe_tx_id, project_stage_at_backing)
  VALUES (_project_id, _backer_id, _amount_cents, _fee_cents, _stripe_tx_id, _current_stage)
  RETURNING id INTO _new_id;

  -- Update denormalized count if backer is new for this project
  SELECT NOT EXISTS (
    SELECT 1 FROM backings
    WHERE project_id = _project_id AND backer_id = _backer_id AND id != _new_id
  ) INTO _is_new_backer;

  IF _is_new_backer THEN
    UPDATE projects SET unique_backers_count = unique_backers_count + 1
    WHERE id = _project_id;

    -- Stage recomputation: VibeXForge already has `compute_evolution_stage(project_row)`
    -- (migration 033_evolution_stages.sql). If there is not already a trigger
    -- that recomputes stage on projects-column update, we add one here. Detailed
    -- wiring decided at Phase 0 of rollout.
  END IF;

  RETURN _new_id;
END;
$$;
```

### Evolution math extension

Modify `compute_evolution_stage(project)` to treat `backer_count` as a 3rd signal, equivalent to 10x upvotes:

```
Active:    plays>=50    AND score>=40   AND (upvotes>=2    OR backers>=1)
Growing:   plays>=500   AND score>=60   AND (upvotes>=50   OR backers>=5)
Breakout:  plays>=5000  AND score>=70   AND (upvotes>=300  OR backers>=25)
Legend:    plays>=25000 AND score>=80   AND (upvotes>=1500 OR backers>=150)
Myth:      plays>=100000 AND score>=90  AND (upvotes>=7500 OR backers>=800)
```

`OR` (not `AND`) — backer signal is alternative, not additive. Money-less projects still evolve normally; backed projects progress faster.

### Badge computation

Runtime, not stored. Query derives badges from user's backing history vs. current stage of each backed project:

```
FOUNDING_BACKER:    ≥1 backing where project_stage_at_backing == 'Seed'
EARLY_SPOTTER:      ≥1 backed project with current evolution_stage >= 'Breakout'
LEGENDARY_SPOTTER:  ≥1 backed project with current evolution_stage >= 'Legend'
MYTHIC_EYE:         ≥1 backed project with current evolution_stage == 'Myth'

Profile shows "Spotted N Legend · N Myth" counts.
```

## 5 · Payment flow

### Creator onboarding (one-time)

1. Creator toggles "Enable backing" in project settings.
2. If `creator_payouts` row missing or `onboarding_done=false`: `POST /api/backer/creator-onboard` creates a Stripe Connect Express account, inserts `creator_payouts` row, returns Stripe's hosted onboarding URL.
3. Creator redirected to Stripe hosted KYC (DOB + bank + ID, 3-5 min on mobile).
4. Stripe `account.updated` webhook fires → server flips `onboarding_done=true`.
5. Project's `backing_enabled=true` persists; `▸ BACK` button appears on public page.

### Backer checkout (per backing)

1. Backer clicks `▸ BACK THIS PROJECT` on `/project/[id]`.
2. Modal opens: 3 tier buttons ($10, $25, $100) + custom amount field.
3. Tier click → `POST /api/backer/checkout` creates a Stripe Checkout Session with:
   - `amount: tier_cents`
   - `application_fee_amount: tier_cents * 0.05` (platform fee)
   - `transfer_data.destination: creator_payouts.stripe_account_id`
   - `metadata: { project_id, backer_id }`
4. Redirect backer to Stripe Checkout (hosted).
5. Backer pays via card / Apple Pay / Google Pay.
6. Stripe `checkout.session.completed` webhook fires → `/api/webhook/stripe`:
   - Verify signature (`stripe.webhooks.constructEvent`).
   - Call `record_backing` RPC.
7. Backer redirected to `/project/[id]?backed=1` → toast confirms, badge appears on profile.

### API endpoints

| Endpoint | Method | Purpose |
|---|---|---|
| `/api/backer/creator-onboard` | POST | Create Stripe Connect Express account and return onboarding URL |
| `/api/backer/checkout` | POST | Create Stripe Checkout Session for a given project + amount |
| `/api/webhook/stripe` | POST | Handle `checkout.session.completed` and `account.updated` |
| `/api/backer/creator-dashboard-link` | GET | Return Stripe hosted dashboard URL for creator payout review |

### Failure modes

- Card declined / insufficient funds → Stripe Checkout handles retry in-browser.
- Webhook signature fails → 400 + log alert.
- Stripe retries webhook (5 retries over 3 days) → idempotent via `UNIQUE(stripe_tx_id)`.
- Creator has not completed KYC when payment arrives → Stripe holds funds 30 days, emails creator.
- Missing env vars (`STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`) → API returns 503 on startup.

### Compliance posture

- VibeXForge is a platform, not issuer / broker. Funds flow backer → creator bank directly via Stripe Connect; platform only claims `application_fee_amount`.
- No investment return. Badges and social proof only.
- ToS clause: "Backings are voluntary support. Non-refundable except per Stripe's buyer protection. No financial return expected or promised."

## 6 · UI surfaces

### New components

| Component | File | Purpose |
|---|---|---|
| `<BackButton />` | `components/backer/back-button.tsx` | Shown on project page when `backing_enabled=true`; unauth → login |
| `<BackModal />` | `components/backer/back-modal.tsx` | Tier picker + transparent fee breakdown |
| `<SpotterBadgeWall />` | `components/backer/spotter-badge-wall.tsx` | Profile badges + "Spotted N Legend · N Myth" |
| `<BackersStrip />` | `components/backer/backers-strip.tsx` | Project-page footer: "Spotted by N backers" + avatar row |
| `<CreatorPayoutStatus />` | `components/backer/creator-payout-status.tsx` | Project settings: Stripe Connect status + onboarding CTA |

### Modified pages

- `app/project/[id]/page.tsx` — embed `<BackButton />` near existing play/upvote controls + `<BackersStrip />` at footer
- `app/profile/[id]/page.tsx` — embed `<SpotterBadgeWall />` near the creator's attribute radar

### New routes

- `/spotters` — Legendary Spotters leaderboard. Ranks users by count of backed projects at Legend or Myth stage. Direction A visual: pixel crown icon + rank + avatar + counts. Honors existing evolution palette.

## 7 · Analytics (PostHog events)

Via existing `lib/analytics.ts` `trackEvent`:

```
backer_modal_opened          { project_id, project_stage }
backer_tier_selected         { project_id, amount_cents, tier_preset }
backer_checkout_created      { project_id, amount_cents }
backer_completed             { project_id, amount_cents, is_first_time_backer }
backer_badge_earned          { badge_level, triggering_project_stage }
creator_onboard_started      { project_id }
creator_onboard_completed    { creator_id }
```

Funnel for post-launch analysis: `backer_modal_opened → backer_tier_selected → backer_checkout_created → backer_completed`. Conversion % per step measures friction.

## 8 · Testing

### Unit

- `lib/backer/compute-evolution-stage.ts` — all 5 stage thresholds, each tested for only-upvotes path, only-backers path, both, neither.
- `lib/backer/compute-badge-level.ts` — given a backing history fixture, assert correct 4-tier badge derivation.
- `lib/backer/format-fee.ts` — cents → dollars conversion for amount / fee / creator-takes math.

### Integration

- `/api/backer/checkout` — mock Stripe SDK, verify checkout session parameters (fee amount, destination, metadata).
- `/api/webhook/stripe` — send fixture webhook payload, assert `record_backing` RPC called, assert idempotency (second identical webhook no-ops).

### E2E (Playwright)

- Creator opt-in flow: enable backing → onboarding redirect → webhook simulated → button appears on public page.
- Backer flow: click `▸ BACK` → modal → checkout → webhook simulated → badge on profile.

### Stripe test mode

Use card `4242 4242 4242 4242` (Stripe standard test). All QA against test mode until Phase 5.

## 9 · Phased rollout

Phase | Scope | Duration
---|---|---
**0** | Schema + RPC + evolution math (no UI, DB only) | 1–2 day
**1** | 4 API endpoints + Stripe webhook | 2–3 day
**2** | Creator UI + onboarding flow (dog-food on 1 project) | 1 day
**3** | Backer UI + public surface, feature-flagged to alex-jb only | 2 day
**4** | Small beta — invite 5–10 creators, still Stripe test mode | 1 week
**5** | Production — switch to Stripe live, launch blog, cross-link on `/investors` | 1 day

Total calendar time if fully focused: **~2 weeks** after public launch has happened.

## 10 · Open questions (address when unpausing)

- Platform fee % — **5% locked for V1**. Revisit at V1.5 with actual data on creator retention vs. fee sensitivity.
- Minimum backing amount — **$5 locked** (Stripe's effective floor given 2.9% + $0.30 fee economics).
- Refund policy — delegate to Stripe's buyer protection for V1. If complaints hit >1% of backings, build custom dispute UI in V2.
- Creator verification — Stripe Connect Express handles KYC. If we see attempts to back projects by scammer creators, add a platform-side "verified creator" manual review layer in V2.
- V2 perks / subscriptions / Chinese payment rails — documented but not scoped here. Separate design sprint when V1 is validated.

## 11 · Decision log (from brainstorm)

- **Scope class**: tipping + perks (A+B), not equity crowdfunding (C/D rejected for regulatory cost).
- **Geography**: international first via Stripe Connect, Chinese domestic deferred (C rejected to avoid scope creep; D — solo creators with US accounts — implicit in A).
- **Backer motivation**: Early-Spotter (badges compound with evolution ladder), not commodity Patron or perks-driven.
- **Evolution integration**: backer count joins upvote as equivalent-OR 3rd signal (not AND, avoids pay-to-win).
- **Project-level opt-in**: creators enable per project, with non-blocking KYC (KYC triggered only when first $ arrives, not at enable-time).
- **Platform fee**: 5%, creator-friendly mid-market.
- **MVP surface**: modal from project page, not dedicated `/back/[id]` route (minimize page proliferation).
