# VibeXForge Pricing v2 — Design Spec

**Date:** 2026-06-06
**Author:** Claude (Opus 4.7) for Alex
**Status:** Draft, ready for engineering implementation Monday–Tuesday next week
**Ships against:** existing Stripe + Supabase rails already used by LaunchKit / Validator (no new infrastructure)

---

## 1. Why now

Two facts forced this revisit:

1. **Competitor signal — 字流 2.0 shipped at ¥19.9/mo (~$2.75)** for the Chinese market on or before 2026-06-04. That is 7× cheaper than our current $19/mo Pro tier. If a Chinese indie creator stares at our `/launchkit` page and prices it against 字流, we lose every time on the 中文 axis.
2. **Vacated middle — Bento.me shut down**, leaving the $9–$15 mid-tier creator pricing band wide open. The current binary "free beta vs $19" is the wrong shape: too steep a step to convert hobbyists, too cheap to anchor 出海 (overseas) indie SaaS founders whose tools cost $99+/mo.

Today's deep research nailed the positioning that makes the new structure honest:

> **"字流帮你发自己,VibeXForge 帮你发项目"**
> ("字流 helps you publish yourself; VibeXForge helps you publish your project.")

Our unique value isn't the 中文 platforms (字流 has those). It's the **7 出海 platforms 字流 doesn't have**: Hacker News, Product Hunt, Reddit, Dev.to, LinkedIn, Bluesky, Threads. A Chinese indie founder who wants global reach has no other tool that does what we do.

Pricing v2 turns that asymmetry into a tier.

---

## 2. Tier matrix

The full structure is **3 subscription tiers + 1 per-project credit**:

| Feature | **Free** | **Per-project credit** | **Pro Global** | **Pro China** |
|---|---|---|---|---|
| **Price** | $0 | **$2** one-time | **$19 / mo** ($190/yr) | **¥39 / mo** (~$5.40, ¥390/yr) |
| **Projects** | 3 lifetime | 1 (the one you bought) | Unlimited | Unlimited |
| **Platforms enabled** | 5 (X, Reddit, LinkedIn, Bluesky, Threads) | **All 17** | **All 17** | **All 17** |
| **Draft re-generations / mo** | 5 total (across all projects) | 1 (the one you bought, no re-rolls) | Unlimited | Unlimited |
| **Translation languages** | EN only | EN + ZH | EN + ZH | EN + ZH |
| **Directory submissions** | No | 5 (PH, HN Show, BetaList, Indie Hackers, Dev Hunt) | 5 + future additions | 5 + future additions |
| **Trailer generation (MoneyPrinterTurbo)** | No | Add-on $5 | 1 / mo included | 1 / mo included |
| **Analytics** | Basic (view + upvote counts) | Basic + 30-day archive | **Pro** (per-platform CTR, bandit feedback, weekly trending hooks digest) | **Pro** (same) |
| **Support priority** | Community only | Email, 72h | Email, 24h | Email, 24h (中文 OK) |
| **Featured-creator slot eligibility** | No | No | Yes (rotates weekly) | Yes (separate 中文 rotation slot) |
| **Creator Score boost** | 1× | 1× | 1.5× | 1.5× |
| **Rate limit** | 1 launch / email / 24h | None (single-use) | None | None |
| **Cancel** | n/a | n/a | Anytime | Anytime |

### Notes on each tier

**Free tier** — The 5-platform restriction is the key gate. The 5 we picked (X, Reddit, LinkedIn, Bluesky, Threads) are all EN-only general-purpose platforms; they exclude the 4 商出海 channels (HN, PH, Dev.to) and the 4 中文 channels (小红书, 即刻, 知乎, B站). 3 projects lifetime + 5 re-gens / mo gives a hobbyist enough rope to evaluate quality without us subsidizing serial abusers. The Free tier is the **demo, not the product**.

**Per-project credit ($2)** — Includes **all 17 platforms including 中文**. The rationale: a $2 single-use is a try-before-you-subscribe purchase, and the conversion lever is "this was great, now subscribe so you don't have to re-buy." Locking 中文 behind subscription would just send 字流 users back to 字流. The 1 generation / no re-rolls constraint is the upsell pressure into Pro for any creator with a real flow (real creators re-roll 3-5 times).

**Pro Global ($19/mo)** — Mirrors today's tier, now with explicit 17-platform delivery and the Pro analytics. Yearly $190 = 2 months free, standard SaaS gimmick.

**Pro China (¥39/mo)** — The thesis: **2× 字流's price is sustainable as long as the value is the 7 出海 platforms 字流 cannot deliver**. ¥39 ≈ $5.40 — sits squarely in the Bento.me vacated middle band ($9–15) when adjusted for Chinese PPP, well above 字流's race-to-bottom. ¥390/yr.

---

## 3. Stripe implementation

### 3.1 Products to create in Stripe dashboard

Create **4 products** (one logical product per tier; multiple prices per product for billing intervals):

| Product name (Stripe) | Internal key | Description |
|---|---|---|
| `VibeXForge Pro Global` | `vibex_pro_global` | Unlimited projects · all 17 platforms · EN+ZH |
| `VibeXForge Pro China` | `vibex_pro_china` | 中国创作者无限发布 · 17 平台 · EN+ZH |
| `VibeXForge Per-Project Credit` | `vibex_credit_single` | One launch, all 17 platforms, no subscription |
| `VibeXForge Trailer Add-on` | `vibex_trailer_addon` | 30s mp4 trailer via MoneyPrinterTurbo |

### 3.2 Price IDs (one per billing cadence per product)

These are placeholder IDs — Alex creates them in Stripe dashboard, then pastes the real IDs into `.env.local` and Vercel env.

```
# Pro Global
STRIPE_PRICE_PRO_GLOBAL_MONTHLY=price_xxx        # $19.00 USD / month
STRIPE_PRICE_PRO_GLOBAL_YEARLY=price_xxx         # $190.00 USD / year

# Pro China (USD-denominated for Stripe; we display ¥ in UI)
STRIPE_PRICE_PRO_CHINA_MONTHLY=price_xxx         # $5.40 USD / month  (≈ ¥39)
STRIPE_PRICE_PRO_CHINA_YEARLY=price_xxx          # $54.00 USD / year  (≈ ¥390)

# Per-project credit
STRIPE_PRICE_CREDIT_SINGLE=price_xxx             # $2.00 USD one-time

# Add-on
STRIPE_PRICE_TRAILER_ADDON=price_xxx             # $5.00 USD one-time
```

**Why USD-denominated for Pro China:** Stripe Atlas + standard account can collect CNY only via Alipay/WeChat Pay, which means a separate Stripe account and KYC. For v2 we keep it dollar-denominated and just display the ¥ equivalent in the China-targeted UI. Phase-2 enhancement: integrate Alipay via Stripe's `payment_method_types[]=alipay` (already supported, no new account needed).

### 3.3 Webhook events to handle

Extend the existing `/api/webhooks/stripe/route.ts` (currently handles LaunchKit + Validator) with **3 new event types**:

```ts
const HANDLERS: Record<string, (e: StripeEvent) => Promise<void>> = {
  "checkout.session.completed": handleCheckoutCompleted,    // EXISTING
  "customer.subscription.updated": handleSubscriptionUpdated, // NEW
  "customer.subscription.deleted": handleSubscriptionCanceled, // NEW
  "invoice.payment_failed": handlePaymentFailed,            // NEW
};
```

- `checkout.session.completed` — same flow, now routes by `metadata.product = "vibex_pro_global" | "vibex_pro_china" | "vibex_credit_single" | "vibex_trailer_addon"`.
- `customer.subscription.updated` — keeps `current_period_end` and `cancel_at_period_end` in sync. Critical for Pro China users who cancel mid-cycle: they retain access until period end.
- `customer.subscription.deleted` — flips `active = false` on the subscription row.
- `invoice.payment_failed` — sends a Resend email asking them to update their card; grace period of 7 days before flipping `active = false`.

Webhook secret stays in `STRIPE_WEBHOOK_SECRET` env. Already wired.

### 3.4 DB schema changes

Migration `076_vibex_pricing_v2.sql` — fully idempotent, follows house style (RLS-on by default, anon read-by-id, service-role full access).

```sql
-- Migration 076 — VibeXForge Pricing v2 (2026-06-06)
--
-- Adds:
--   1. vibex_subscriptions   — Pro Global + Pro China subscribers
--   2. vibex_credits         — $2 per-project credits
--   3. Adds subscription_tier + credits_remaining columns to creators
--      (read by /api/launchkit/generate and /api/projects/submit)
--
-- Spec: docs/superpowers/specs/2026-06-06-pricing-v2-design.md

-- ─────────────────────────────────────────────────────────────────────
-- vibex_subscriptions
-- ─────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS vibex_subscriptions (
    email                    TEXT         PRIMARY KEY,
    tier                     TEXT         NOT NULL
                              CHECK (tier IN ('pro_global', 'pro_china')),
    billing_interval         TEXT         NOT NULL DEFAULT 'monthly'
                              CHECK (billing_interval IN ('monthly', 'yearly')),
    stripe_subscription_id   TEXT         NOT NULL,
    stripe_customer_id       TEXT,
    active                   BOOLEAN      NOT NULL DEFAULT TRUE,
    cancel_at_period_end     BOOLEAN      NOT NULL DEFAULT FALSE,
    current_period_end       TIMESTAMPTZ,
    grandfathered_legacy_19  BOOLEAN      NOT NULL DEFAULT FALSE,
    created_at               TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at               TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_vibex_subs_active
    ON vibex_subscriptions (active, tier)
    WHERE active = TRUE;

ALTER TABLE vibex_subscriptions ENABLE ROW LEVEL SECURITY;
-- Service-role only; anon never reads. App routes use service-role client.

-- ─────────────────────────────────────────────────────────────────────
-- vibex_credits ($2 per-project credit)
-- ─────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS vibex_credits (
    id                 UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    email              TEXT         NOT NULL,
    stripe_session_id  TEXT         NOT NULL UNIQUE,
    amount_cents       INTEGER      NOT NULL DEFAULT 200,
    used               BOOLEAN      NOT NULL DEFAULT FALSE,
    used_for_project_id TEXT,
    used_at            TIMESTAMPTZ,
    created_at         TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_vibex_credits_email_unused
    ON vibex_credits (email)
    WHERE used = FALSE;

ALTER TABLE vibex_credits ENABLE ROW LEVEL SECURITY;
-- Service-role only.

-- ─────────────────────────────────────────────────────────────────────
-- creators table extension
-- ─────────────────────────────────────────────────────────────────────
ALTER TABLE creators
    ADD COLUMN IF NOT EXISTS subscription_tier TEXT
        CHECK (subscription_tier IN ('free', 'pro_global', 'pro_china'))
        DEFAULT 'free';

ALTER TABLE creators
    ADD COLUMN IF NOT EXISTS credits_remaining INTEGER NOT NULL DEFAULT 0;

ALTER TABLE creators
    ADD COLUMN IF NOT EXISTS detected_country TEXT;
-- 2-letter ISO country code from Vercel geo header at signup time;
-- used for default-tier selection on /pricing.

-- ─────────────────────────────────────────────────────────────────────
-- Atomic credit-consume RPC (race-safe)
-- ─────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION consume_vibex_credit(
    p_email      TEXT,
    p_project_id TEXT
) RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_credit_id UUID;
BEGIN
    SELECT id INTO v_credit_id
    FROM vibex_credits
    WHERE email = p_email AND used = FALSE
    ORDER BY created_at ASC
    LIMIT 1
    FOR UPDATE SKIP LOCKED;

    IF v_credit_id IS NULL THEN
        RETURN FALSE;
    END IF;

    UPDATE vibex_credits
    SET used = TRUE,
        used_for_project_id = p_project_id,
        used_at = NOW()
    WHERE id = v_credit_id;

    RETURN TRUE;
END;
$$;

REVOKE ALL ON FUNCTION consume_vibex_credit(TEXT, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION consume_vibex_credit(TEXT, TEXT) TO service_role;

-- ─────────────────────────────────────────────────────────────────────
-- Comments
-- ─────────────────────────────────────────────────────────────────────
COMMENT ON TABLE vibex_subscriptions IS
    'Pro Global ($19/mo) and Pro China (¥39/mo ≈ $5.40) subscribers. '
    'Updated by /api/webhooks/stripe. Spec: 2026-06-06-pricing-v2-design.md';

COMMENT ON TABLE vibex_credits IS
    '$2 per-project credits (single-use, all 17 platforms). Consumed '
    'atomically via consume_vibex_credit(). Spec: 2026-06-06-pricing-v2-design.md';

COMMENT ON COLUMN creators.subscription_tier IS
    'Cached subscription tier. Authoritative source is vibex_subscriptions; '
    'this column is a denormalized fast-path read for UI/feed/RLS checks.';
```

**Grandfather flag:** `grandfathered_legacy_19 BOOLEAN` is the critical column for migration. Any existing $19 subscriber row gets `grandfathered_legacy_19 = TRUE` set during migration; subsequent UI surfaces (account page, upgrade prompts) skip the upsell for these users.

---

## 4. UX / page changes

### 4.1 New route: `/pricing`

A dedicated pricing page (was previously embedded in `/launchkit`). Layout:

```
┌─────────────────────────────────────────────────────────┐
│  "字流 helps you publish yourself.                      │
│   VibeXForge helps you publish your project."           │
│                                                         │
│  Comparison row: VibeXForge vs 字流                     │
│  ┌──────────────────┬──────────────────┐                │
│  │ 字流             │ VibeXForge       │                │
│  │ 8 中文 platforms │ 8 中文 + 9 出海  │                │
│  │ ¥19.9/mo         │ ¥39/mo China,    │                │
│  │                  │ $19/mo Global,   │                │
│  │                  │ $2 per-project   │                │
│  └──────────────────┴──────────────────┘                │
└─────────────────────────────────────────────────────────┘
                          ↓
┌──────────┬──────────┬──────────┬──────────┐
│  Free    │ $2/launch│ Pro      │ Pro China│
│          │          │ Global   │          │
│  [Start] │ [Buy 1]  │[Subscribe│[订阅]   │
└──────────┴──────────┴──────────┴──────────┘
```

Geo-detection (see 4.5) picks which tier is highlighted by default. Both Pro tiers are always visible — never hide pricing from a user just because of geography.

### 4.2 Per-project credit flow on `/project/[id]/drafts`

When a Free-tier user hits the 5-platform cap, the locked platforms show:

```
[HackerNews]  🔒 Pro or $2 credit
[Dev.to]      🔒 Pro or $2 credit
[小红书]      🔒 Pro or $2 credit
```

Click on a locked platform → modal:

```
┌────────────────────────────────────────┐
│ Unlock all 17 platforms for this       │
│ project                                │
│                                        │
│ ○ Pay $2 once — just this project      │
│ ○ Subscribe Pro $19/mo — unlimited     │
│                                        │
│ [Continue to checkout →]               │
└────────────────────────────────────────┘
```

The $2 credit, once consumed, immediately re-generates the draft set for **all 17 platforms** for that one project ID, and persists. No re-rolls.

### 4.3 Pro tier upgrade prompt on free-limit hit

When a Free user tries to create a 4th project OR exhaust their 5 monthly re-gens, the UX shows:

```
You've used your 3 free projects.

Most VibeXForge creators upgrade to Pro at this point —
you'll never hit a project cap again, plus all 17 platforms
unlock and you get per-platform CTR analytics.

[Upgrade Pro Global — $19/mo]
[Upgrade Pro China — ¥39/mo]    (shown if zh locale)
[Or just buy $2 for this one project]

We're keeping your 3 existing projects either way.
```

### 4.4 Email collection on Free tier

Free tier requires **GitHub OAuth** (not just email). This is the abuse mitigation referenced in Section 8 — multiple-account abuse becomes much harder when GitHub history (created_at, public repos count) is the gate.

GitHub OAuth flow already exists in `lib/auth.tsx`; the change is making it required at the point of first draft generation (today it's only required for some flows).

### 4.5 Pro China vs Pro Global geo-detection

Use Vercel's automatically-injected geo headers (no Cloudflare layer needed since we're already on Vercel):

```ts
// app/pricing/page.tsx (server component)
import { headers } from "next/headers";

const country = (await headers()).get("x-vercel-ip-country") || "";
const defaultTier =
  country === "CN" || country === "HK" || country === "TW" || country === "MO"
    ? "pro_china"
    : "pro_global";
```

Also check `Accept-Language` header as a secondary signal (a Chinese expat in NYC with `zh-CN` browser locale should see Pro China highlighted). Combine both:

```ts
const acceptLang = (await headers()).get("accept-language") || "";
const isChineseLocale = /^zh/.test(acceptLang);
const defaultTier =
  isChineseLocale || ["CN", "HK", "TW", "MO"].includes(country)
    ? "pro_china"
    : "pro_global";
```

Default-highlight only. Both tiers stay visible and selectable — we **do not gate by geo**. (See Section 8 risk.)

---

## 5. Migration plan for existing $19 subscribers

There are an estimated **<50 existing $19/mo subscribers** at the time of writing (we don't have an exact figure pre-implementation; `select count(*) from launchkit_subscriptions where active = true` will give the precise number on migration day).

**Decision: grandfather them at $19 indefinitely.** No auto-downgrade, no forced re-acceptance of new terms.

### Why grandfather

- Trust signal — any change that *reduces* what an existing paying customer gets is a relationship killer. We have **<50 of these people**; losing even 5 of them to spite-churn is 10% of the cohort.
- Optics — "I paid $19 then they cut everyone else to $5" is a screenshottable grievance on r/SaaS. Grandfathering kills that headline before it can be written.
- The math doesn't hurt — we estimate $19/mo customers cost us ~$0.075/mo in Claude API (Section 6); 99.6% margin means we don't need to re-price for unit economics.

### How

In migration 076, set `grandfathered_legacy_19 = TRUE` on every row in `vibex_subscriptions` that gets migrated from `launchkit_subscriptions` (or that has `created_at < '2026-06-06'`). These users:

- Continue paying their existing $19 Stripe subscription (no Stripe price change).
- Get all Pro Global features automatically (no action needed).
- Are exempted from any "upgrade to new tier" UI prompts.
- See a one-time banner on their dashboard: *"You're grandfathered at $19/mo forever — thanks for being early."*

### Communication email (Resend)

Send via Resend on launch day. Template (final copy to be tightened by Alex):

```
Subject: A small VibeXForge update — your $19/mo is locked in forever

Hi {first_name},

Quick note. Today we're announcing new pricing tiers at VibeXForge:

  • Pro Global — $19/mo (same as today)
  • Pro China — ¥39/mo for the Chinese creator market
  • $2 per-project credit for single launches
  • Free tier (limited to 5 platforms)

You don't need to do anything. Your $19/mo subscription is
grandfathered indefinitely — even if we raise prices later,
you stay at $19. You also keep every Pro Global feature.

Why we're doing this: a competitor in China just shipped at
¥19.9/mo. We can't ignore that market, but we don't want to
race to the bottom either. The new tiers let us serve both
sides without changing what you signed up for.

Questions → just reply to this email.

— Alex
```

### Grace period

For any edge cases (subscription state ambiguity, Stripe-side issues), allow a **60-day grace period** where the old `launchkit_subscriptions` table is read alongside `vibex_subscriptions`. After day 60, drop the legacy read path. This is purely a safety net; we don't expect to need it.

---

## 6. Revenue model & unit economics

### 6.1 Cost per generation

From actual production traces (logged via `lib/draft-generator.ts` after 2026-05-08 prompt-caching rollout):

- Cold draft generation (no cache): 12 platforms × 2 languages × ~3K input + 800 output tokens ≈ **$0.045/run**
- Cached generation (re-roll, common case): 12 × 2 × ~300 input (cache hit) + 800 output ≈ **$0.015/run**
- Trailer (MoneyPrinterTurbo via Replicate): ~**$0.02/clip**

Round number for planning: **$0.015/generation, $0.05/cold first-of-month**.

### 6.2 Margin by tier

| Tier | Price | Est. usage/mo | Cost/mo | Margin $ | Margin % |
|---|---|---|---|---|---|
| Per-project credit | $2.00 | 1 generation | $0.015 | $1.985 | **99.25%** |
| Pro Global | $19.00 | 5 generations | $0.075 | $18.925 | **99.6%** |
| Pro China | $5.40 | 5 generations | $0.075 | $5.325 | **98.6%** |
| Free tier | $0.00 | 0.7 generations avg (across all free users — most never come back after 1st draft) | $0.011 | -$0.011 | n/a (CAC) |

Even the most-abused Free tier user (3 projects × 5 re-gens = 15 generations) costs us $0.225 over their lifetime, against an expected Pro upgrade value of $19+. **CAC math: as long as 1.5% of free users convert to Pro, the Free tier pays for itself.** Current LaunchKit beta conversion is ~4–6%, so we're comfortably above the break-even line.

### 6.3 Trailer add-on margin

- Price: $5.00
- Cost: ~$0.02 (Replicate MoneyPrinterTurbo invocation) + ~$0.001 (Vercel Blob storage for 30s mp4)
- **Margin: $4.98 (99.6%)**

Trailer add-on is a pure-money lever. Worth promoting hard once Phase 1 ships.

### 6.4 Breakeven revenue at each tier

Assuming Vercel + Supabase + Resend overhead of ~$80/mo (current fixed cost):

- **27 Pro China subscribers** OR
- **5 Pro Global subscribers** OR
- **40 per-project credit purchases**

...covers full fixed infra. Anything above is profit-margin runway.

### 6.5 Annual discount logic

Both Pro tiers offer ~2 months free on annual:
- Pro Global: $190/yr (= $15.83/mo equivalent, 17% discount)
- Pro China: ¥390/yr (= ¥32.5/mo equivalent, 17% discount)

Annual pre-pay improves cash-flow runway and reduces involuntary churn (failed-card events on monthly). Industry-standard SaaS lever, no controversy.

---

## 7. Launch sequence (2 weeks)

### Week 1 — Build (Mon-Sun)

**Day 1 (Mon)**
- Migration 076: write + apply to staging Supabase branch
- Stripe dashboard: create 4 products + 6 price IDs
- Wire price IDs into Vercel env (`vercel env add --no-sensitive`)
- Extend `lib/stripe-min.ts` with subscription update/cancel webhook helpers

**Day 2 (Tue)**
- Build `/pricing` page (server component with geo-detection)
- Refactor `/api/launchkit/checkout` → `/api/vibex/checkout` (now takes `tier` parameter)
- Extend `/api/webhooks/stripe/route.ts` for 3 new event types
- Build credit modal UI on `/project/[id]/drafts`

**Day 3 (Wed)**
- Build Pro upgrade prompt UI on free-tier limit hit
- Wire `consume_vibex_credit` RPC into `/api/launchkit/generate` (replaces the LaunchKit beta rate-limit on paid path)
- Make GitHub OAuth required at first-draft-gen for Free tier
- Local Stripe test mode end-to-end: free → credit → Pro Global → Pro China → grandfathered $19

**Day 4 (Thu)**
- Apply migration to production Supabase (after staging verification)
- Apply grandfather flag to existing subscribers
- Production smoke test: 1 of each tier, real card, real Stripe webhook delivery
- `npm run build` locally; only push if green

**Day 5 (Fri)**
- Email existing $19 subscribers via Resend (Section 5 template)
- Add Pricing v2 entry to changelog + README
- `docs/devlogs/2026-06-10.md` capturing what shipped

**Day 6-7 (Sat-Sun)**
- Soak test in production; watch HyperDX for webhook failures
- Buffer for any bug discovered during the 48h soak

### Week 2 — Announce (Mon-Sun)

**Day 8 (Mon)**
- Public announce: 1 tweet thread, 1 LinkedIn post, 1 dev.to article
- Update landing tagline to: *"Publish your project to 17 platforms · $19/mo Global, ¥39/mo China, or $2 just once."*
- Update `/about` to reference new pricing
- Bilingual announce (EN + ZH)

**Day 9-10 (Tue-Wed)**
- Targeted Reddit posts (r/SideProject, r/SaaS, r/IndieHackers + Chinese 即刻 + 小红书)
- DM Chinese indie creators who follow VibeXForge handle on Twitter/即刻 with the ¥39 offer

**Day 11-14 (Thu-Sun)**
- Watch metrics (Section 9 KPIs)
- Reply to public feedback / objections — especially from grandfathered users to make sure they actually feel grandfathered, not "demoted"

---

## 8. Risks & mitigations

### Risk 1: Pro China users VPN to look like Global, pay ¥39 instead of $19
**Likelihood:** High (any Chinese user who knows about VPNs already has one)
**Impact:** Revenue per converted user drops from $19 → $5.40 = $13.60 lost per VPN-detect-failure
**Mitigation:** **Don't fight it.** A Chinese creator who pays ¥39 instead of $19 is still 98.6% margin and is converted *to a paid tier*. The alternative — geo-locking — costs us **honest** Chinese users who would have paid ¥39 in the first place. Both VPN-arbitrage and honest-China-pay are wins relative to "abandoned signup". Decision: tier is available globally based on selection, not enforced.

### Risk 2: Free tier multi-account abuse
**Likelihood:** Medium (every free SaaS has this)
**Impact:** Cost is low ($0.075 / abuser / 3 projects); reputational cost is higher (abuse posts on r/SideProject saying "VibeXForge is a free tool")
**Mitigation:**
- GitHub OAuth required at first draft generation (account must exist > 30 days, have at least 1 public repo)
- Device fingerprint via `lib/fingerprint.ts` (already exists for vote-fraud detection) writes to `creators.detected_device_hash`; duplicate hash → rate-limit harder
- IP-based throttle at Vercel edge for the `/api/launchkit/generate` endpoint (3 unique-email requests / hour / IP)

### Risk 3: $2 per-project too cheap, cannibalizes $19 conversion
**Likelihood:** Medium
**Impact:** Pro Global ARPU collapses; LTV → $2 instead of $19+
**Mitigation:**
- Per-project credit hard-limits to **1 generation, no re-rolls**. The friction of "buy another $2 credit to re-roll" is the upsell pressure.
- Pro Global unlimited re-rolls + bandit feedback + weekly trending hooks digest is the value gap.
- Track *credit-to-Pro conversion rate* explicitly (Section 9 KPI). If it's <10% after 30 days, raise per-project credit to $3 or limit to 1 use / email / 7 days.

### Risk 4: Existing $19 subscribers feel insulted that "other markets pay less"
**Likelihood:** Low–Medium
**Impact:** Spite churn from existing cohort
**Mitigation:**
- The grandfather email (Section 5) frames this proactively: "your $19/mo is locked in forever".
- Position Pro China publicly as **market-entry pricing for the Chinese indie SaaS market specifically**, not a price cut. Tagline: "We're not lowering the price — we're entering a new market at its native price point."
- One-time grandfather banner on dashboard reinforces the "you got the founder rate" framing.

### Risk 5: Stripe webhook race condition — credit consumed twice
**Likelihood:** Low (Stripe has at-least-once delivery, our webhook idempotency relies on `stripe_session_id` UNIQUE)
**Impact:** Free generation for one user — minor cost, no reputational issue
**Mitigation:**
- `vibex_credits.stripe_session_id` is `UNIQUE` — second insert fails
- `consume_vibex_credit` RPC uses `FOR UPDATE SKIP LOCKED` — race-safe
- Webhook handler logs every event to HyperDX for forensic replay if needed

### Risk 6: 字流 drops to ¥9.9/mo in response
**Likelihood:** Medium-Low (they'd be cutting margin to <50%)
**Impact:** Our ¥39 starts looking obscene next to ¥9.9
**Mitigation:** **Don't compete on price for Pro China.** Compete on value (the 7 出海 platforms 字流 doesn't have). If we're forced to react, the move is **not** to lower ¥39 — it's to **launch Pro China Lite at ¥19/mo for 中文-only output** (drop the 出海 platforms). This preserves our anchoring ("real Pro China is ¥39 because that's where the value lives") while giving the price-sensitive segment a downsell that still pays us margin.

---

## 9. KPIs to track post-launch (30 / 60 / 90 day)

Logged to `vibex_pricing_v2_metrics` materialized view (refresh nightly via existing markets cron).

### 30-day KPIs

| Metric | Target | Source |
|---|---|---|
| Free → paid conversion % | ≥ 4% | `creators.subscription_tier` transition |
| Per-project credit volume | ≥ 50 | `count(vibex_credits.id)` |
| Per-project credit → Pro Global conversion % | ≥ 15% | `vibex_credits` joined to `vibex_subscriptions` by email |
| Pro Global net-new subscribers | ≥ 20 | `vibex_subscriptions` where `tier='pro_global' AND grandfathered_legacy_19=false` |
| Pro China net-new subscribers | ≥ 10 | `vibex_subscriptions` where `tier='pro_china'` |
| Pro China : Pro Global ratio | 0.3–0.7 | Validates geo-segmentation thesis |
| Grandfathered $19 churn % | ≤ 5% | Existing cohort net-active count |
| Webhook delivery success % | ≥ 99.5% | HyperDX webhook logs |
| `consume_vibex_credit` failure rate | 0 | DB function return-false count |

### 60-day KPIs

| Metric | Target |
|---|---|
| MRR from new pricing | $1,200+ |
| Annual pre-pay rate | ≥ 18% of new subscriptions |
| Trailer add-on attach rate | ≥ 8% of credit purchases |
| Pro China → annual conversion | ≥ 25% (Chinese market historically more annual-friendly) |
| Refund rate | ≤ 2% |

### 90-day KPIs (success / pivot gate)

| Metric | Success | Pivot trigger |
|---|---|---|
| Total MRR | $3,000+ | < $1,500 → re-evaluate Pro Global pricing |
| Pro China share of paid users | ≥ 25% | < 10% → fold Pro China back into Pro Global with i18n only |
| Net Promoter Score (Pro tier) | ≥ 40 | < 20 → Pro tier value is unclear; rework features list |
| Grandfathered $19 retention | ≥ 90% | < 75% → grandfather messaging was bad; reach out personally |

If 90-day Pro China share is **below 10%**, the geo-tier experiment failed — fold ¥39 into a single "Pro Global ¥ price" of $19 equivalent and treat the i18n layer as the only China-specific work.

---

## 10. Implementation order ranked by ROI

Two-week sprint, ranked by **dollar-value per engineering-hour**. Ship in this order:

### **#1 — Migration 076 + Stripe products** (Day 1, ~3h)
**ROI: Highest.** Nothing else can ship without this. All downstream UI and webhooks read from `vibex_subscriptions` / `vibex_credits` / `creators.subscription_tier`. Stripe products + price IDs take ~30 min in the dashboard, then env vars. **This is the unblocker for everything.**

### **#2 — Webhook handler extensions** (Day 1-2, ~3h)
**ROI: High.** Without `customer.subscription.deleted` and `invoice.payment_failed` handlers, churned users keep getting Pro access indefinitely (revenue leak) and failed-card users feel abandoned (CX disaster). Both are correctness bugs the moment we accept the first paid signup. Build before launching any payment UI.

### **#3 — Per-project credit flow on `/project/[id]/drafts`** (Day 2-3, ~5h)
**ROI: High.** This is the **frictionless upsell** — Free user already invested in their project, hits a locked platform, $2 is the lowest-commitment payment psychology can engineer. Expected to drive 60-70% of net-new paid conversions in the first 30 days. Includes: modal UI, `/api/vibex/checkout` for `mode='credit'`, RPC consumption on webhook ack.

### **#4 — `/pricing` page with geo-detection** (Day 2, ~3h)
**ROI: High.** The first place outbound marketing links to (Twitter, dev.to article, Chinese 即刻 posts all need a URL). The geo-detection is what makes Pro China feel native to a Chinese creator without alienating Pro Global users.

### **#5 — Pro upgrade prompt + GitHub OAuth gate on Free** (Day 3, ~4h)
**ROI: Medium-High.** Captures Free users at the moment they're proving they care about quality (re-gen #6, or project #4). GitHub OAuth gate is the abuse mitigation — required before launch so abusers don't get a head-start during the 14-day announce window.

### **#6 — Grandfather flag + existing-subscriber migration** (Day 4, ~2h)
**ROI: Medium.** Strictly defensive (prevents spite churn from existing $19 cohort). Low engineering cost, high reputational floor. **Must ship before the announcement email goes out.**

### **#7 — Grandfather email send via Resend** (Day 5, ~1h)
**ROI: Medium.** Reuses existing Resend pipeline. Once #6 is in DB, this is just a SELECT + send loop. Defensive but high-empathy customer move.

### **#8 — Trailer add-on as upsell on credit purchase** (Day 5, ~3h)
**ROI: Medium.** 99.6% margin, but discoverability is low until people use the product. Defer to Phase 2 polish if Days 1-7 run hot. Can ship as Day 8+ work without affecting the launch.

### **#9 — Public announcement materials** (Day 8, ~4h)
**ROI: Medium-High.** This is what converts the build into revenue. Bilingual EN+ZH posts on Twitter, LinkedIn, dev.to, 即刻, 小红书. Use marketing-agent. **Cost of skipping this: pricing v2 ships but nobody knows.**

### **#10 — Analytics view + 30-day KPI dashboard** (Day 9-10, ~3h)
**ROI: Long-tail.** Materialized view for Section 9 KPIs. Without this, we're flying blind on whether v2 is working. Ship as a SQL view feeding into the existing admin dashboard pattern (see `app/admin/score-leaderboard/page.tsx`). Can be slipped to Day 12 if needed; the data still accumulates in raw tables.

---

## Appendix A — Reference files

- `lib/stripe-min.ts` — existing Stripe wrapper, extends naturally
- `app/api/webhooks/stripe/route.ts` — existing webhook, add 3 event types
- `lib/draft-generator.ts` — 12 base platforms + plan + planDrafts (no changes needed; pricing is a tier check upstream)
- `.private/migrations/062_launchkit_jobs.sql` — sibling migration shape, follow this style
- `.private/migrations/063_launchkit_stripe_and_trailer.sql` — existing subscription pattern to mirror
- `lib/auth.tsx` — GitHub OAuth flow to gate Free tier on
- `app/launchkit/page.tsx` — existing pricing card pattern to refactor for `/pricing`

## Appendix B — The 17 platforms

For marketing copy honesty: "17 platforms" =
- **12 draft platforms** (lib/draft-generator.ts): X, Reddit, LinkedIn, Hacker News, Dev.to, Bluesky, Threads, Product Hunt, 小红书, 即刻, 知乎, B站
- **5 directory submissions** (migration 061): Product Hunt directory, Hacker News Show, BetaList, Indie Hackers, Dev Hunt

Free tier exposes 5 of the 12 draft platforms only and 0 directory submissions. Per-project credit + both Pro tiers expose all 17.
