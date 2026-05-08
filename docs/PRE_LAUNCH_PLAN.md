# Pre-launch plan — 2026-05-08

Captured during deep-research session after 8 commits aligning surfaces
to the locked "distribution amplifier" positioning. The 8 commits
fixed `/`, `/how-it-works`, `/dashboard`, drafts UX + cron, analytics
page, and `/ideas` ZH translation. This file tracks what's left.

## Active batch — Alex picked "1-7" (5 must-fix + 2 quick wins)

✅ **All 7 shipped 2026-05-08** — commits b0e85ed, ca9176e, d882029,
8374aa0, 33fac2d, 136d8c0, 4d61a30. The launch funnel now speaks the
new positioning end to end and the engagement loop is fully wired.

These 7 ship before any new launch traffic. Order matters: each unblocks
the next when a creator walks the funnel.

- [x] **#1 — `/launch` copy + 3-step alignment** (1h, ROI 10)
  - 2231-line page still pitches old RPG positioning ("DROP A URL →
    CLAUDE SCORES 0–100 → WATCH IT EVOLVE / URL in, Hero Card out").
    Replace with new story that matches `/` and `/how-it-works`.
  - Bilingual via `useLang()`.
  - Post-submit success state: "✓ 17 drafts generating →
    /project/[id]/drafts" instead of "Hero forged".
- [x] **#2 — Onboarding quest on `/dashboard`** (1.5h, ROI 9)
  - First-time creators land on empty dashboard. Add a 3-step quest
    card: ① Submit project (30s) → ② Review 17 drafts → ③ Post 5 today.
  - Progress bar 0/3 → 3/3, dismisses on completion.
- [x] **#3 — Auto-translate creator-submitted ideas/projects to ZH** (1.5h, ROI 9)
  - `idea.title_zh` / `idea.description_zh` columns exist (mock data
    has them). Real submissions are NULL → ZH users see English.
  - Use Anthropic Batch API (50% off, daily cron) to translate missing
    `_zh` fields. Rate-limit at 1 day-of-lag latency.
- [x] **#4 — `/admin/metrics` drafts + engagement section** (1h, ROI 7)
  - 306-line page has 0 mentions of drafts / posted / engagement. You
    can't monitor a launch from this page right now.
  - Add 4 tiles (drafts gen 24h, posted 24h, cross-platform
    engagement, top channel) + funnel chart.
- [x] **#5 — Re-roll single draft on `/project/[id]/drafts`** (30min, ROI 6)
  - Current "Re-generate" button re-runs all 21 drafts = 21 Claude
    calls. Per-DraftCard "Re-roll this one" is the right granularity.
- [x] **Q1 — Engagement time series via `draft_engagement_snapshots`** (1.5h, ROI 7)
  - Cron currently overwrites `project_drafts.views/likes/comments`
    on each scrape. Add an append-only snapshot table so analytics
    page can render real time-series charts.
- [x] **Q2 — PWA clean rebuild** (1h, ROI 5, was task #128 pending)
  - Add to home screen, push notifs, manifest hygiene.

## Deferred — quick wins (do post-launch when there's signal)

- [ ] Q3 — Weekly engagement digest email ("your X post got 47 likes")
- [ ] Q4 — Notification hub UI (DB tables exist from #122-124)
- [ ] Q5 — Public profile (`/profile/[id]`) bilingual
- [ ] Q6 — OSS README story (中英 hero pitch + CONTRIBUTING + SECURITY)
- [ ] Q7 — GEO scorecard 53 → 70+ (FAQ schema, article schema, speakable)

## Big decisions (require Alex)

- D1 — Stripe Connect payouts (85/15 split was promised on `/`)
- D2 — Real OAuth auto-publish (X/Reddit/Bluesky) vs current intent URLs
- D3 — Per-platform visual generation (open-design-style)
- D4 — Pricing transition: Beta-free → ¥99/mo or 15% take rate?
- D5 — Daily cap on Claude usage per creator (cost guard)
- D6 — Multi-account support (creator's personal X + brand X)

## Killed / not doing

- ❌ Backer Mode implementation — spec exists, deferred until post-launch
- ❌ Scrapers for LinkedIn / Threads / Jike / Zhihu / B站 / Xiaohongshu
  / Product Hunt — all need auth or break easily; manual input + UI
  "manual" badge already shipped
- ❌ Touching `/arcade` (RPG splash) — moved off main path, leave alone
- ❌ Real OAuth auto-publish — wait until 100 launches go through intent
  URL flow first, then decide if worth the OAuth cost
