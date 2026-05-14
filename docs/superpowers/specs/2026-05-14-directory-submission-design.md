# Directory Submission Module — Design Spec

**Status:** DRAFT — pre-build approval. No code yet.
**Author:** Alex Ji + Claude Opus 4.7
**Date:** 2026-05-14
**Triggered by:** 小红书 post by "大吉是 builder" promoting
GrowthHunt/PicoLaunch (319 likes / 432 saves / 47 comments,
4 days old). Same thesis as VibeXForge ("vibe coding handled
first mile, distribution is last mile"), different layer: PicoLaunch
auto-submits to SEO directory sites for backlinks. VibeXForge
currently auto-generates 17 platform-specific social drafts. Two
layers are stack-complementary, not zero-sum.

## Why now

The PicoLaunch post is validation that the "auto-submit to directories"
pattern has clear demand in our exact audience (indie AI makers).
Current VibeXForge submit pipeline writes 17 social drafts but does
NOT touch SEO substrate. Adding directory submission closes the gap
between "social blast on launch day" (current) and "SEO compound that
keeps ranking 6 months later" (PicoLaunch's pitch).

This is **not a pivot**. North-star positioning ("中国独立 AI 创作者
的多渠道曝光放大器") stays. Directory submission is a new "channel"
in the multi-channel matrix — same product, more reach surfaces.

## North-star alignment check

| Question | Answer |
|---|---|
| Does this serve solo AI creators? | Yes — they get backlinks they couldn't manually get |
| Bilingual EN/ZH support? | Yes — needs both Chinese (BetaList CN / 36kr 早期项目) and EN (AlternativeTo, Toolify) directories |
| Free / low-cost for beta users? | Yes — most directories accept free listings |
| Adds tech-debt that distracts from core? | Risk — each directory has different submission flow. Mitigated by scoping to 10 high-ROI ones, not 100. |

✅ Aligned with north star.

## Target directory list (research pass)

Tiered by submit-automation feasibility × backlink ROI.

### Tier 1 — high ROI + easy automation (8 directories)

These have either a public API, a simple form, or a GitHub-PR-based
submit pipeline. ROI is high because they're indexed by Google and
referenced by indie maker communities.

| Directory | Submit method | DA score | Audience | Notes |
|---|---|---|---|---|
| **AlternativeTo** | Web form (UA + cookie) | 85 | Tool seekers | Needs login but creator account is free |
| **Toolify.ai** | Web form + email confirm | 53 | AI tool seekers | Form is sparse; auto-fillable |
| **Futurepedia** | Web form + email | 58 | AI tool seekers | Strict quality bar — Claude pre-validation needed |
| **TopAI.tools** | Web form | 47 | AI tool seekers | Form is simple |
| **There's an AI for That** (theresanaiforthat.com) | Web form (queue review) | 67 | AI tool seekers | Highest-traffic AI dir; long approval queue |
| **AI Tools Club** | Email submit | 42 | AI tool seekers | Easy but no form spec |
| **Awesome-list PRs** (GitHub) | Pull-request | varies | Developers | High ROI per PR; we already use this manually (185 done 2026-05-09) |
| **dev.to "Show / Build" tag posts** | API (already wired via marketing-agent) | 88 | Developers | Reuse existing draft pipeline |

### Tier 2 — medium ROI / harder automation (5 directories)

Manual-ish, but worth one-shot scripted submission if Tier 1 lands.

| Directory | Submit method | Why harder |
|---|---|---|
| **Product Hunt** | API (token + maker handle) | Strict rate limit (1 launch / 24h); not a "submission" model |
| **BetaList** | Web form + manual review | 2-3 day approval delay |
| **Indie Hackers** | Forum-style post | Better as draft → user posts manually |
| **Hacker News** | API (Show HN tag) | Strictly account-bound; submission requires user's own HN credentials |
| **小红书 / 即刻 / B站 / 知乎** | Already wired via marketing-agent drafts | Different layer (social, not directory) |

### Tier 3 — low ROI / nope (5 we explicitly skip)

- **Reddit /r/SideProject** — already drafted via marketing-agent; subreddit-specific tone
- **Crunchbase** — startup directory, not project; over-claim risk
- **G2 / Capterra** — review platforms, not directories; pay-to-list
- **AppSumo Briefcase** — affiliate-focused; not our audience
- **SaaSHub** — sketchy listing quality; we don't want to be next to spam

**Tier 1 = 8 directories. Estimated lift per Tier 1 cycle: 5-15 backlinks per project.**

## Architecture sketch

```
project submit (web)
  └─ existing pipelines:
       ├─ AI review (Claude)
       ├─ 17 platform social drafts (marketing-agent)
       └─ pixel-art cover (gen-cover) ← shipped 2026-05-13

  └─ NEW: directory queue
       ├─ lib/directory-submitter.ts (server module)
       ├─ Each directory = its own adapter
       │     - AlternativeToAdapter
       │     - ToolifyAdapter
       │     - FuturepediaAdapter
       │     - ...
       ├─ Adapter interface:
       │     submit(project) → { status: 'queued' | 'submitted' | 'rejected', externalId?, url? }
       └─ Queue table: `directory_submissions`
             columns: project_id, directory_key, status, submitted_at, approved_at,
                      external_url, error_message
```

The queue table is critical:

1. Each adapter can be retried independently
2. Creator dashboard shows real-time submission status
3. We don't double-submit on retry
4. Tier 1 → 2 escalation possible later

## Schema (proposed)

```sql
CREATE TABLE directory_submissions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id      TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  directory_key   TEXT NOT NULL,  -- 'alternativeto', 'toolify', etc.
  status          TEXT NOT NULL CHECK (status IN ('queued','submitted','approved','rejected','failed')),
  external_id     TEXT,           -- directory's internal id for our listing
  external_url    TEXT,           -- public URL on the directory
  submitted_at    TIMESTAMPTZ,
  approved_at     TIMESTAMPTZ,
  error_message   TEXT,
  retry_count     INT NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (project_id, directory_key)
);
CREATE INDEX directory_submissions_proj_idx
  ON directory_submissions (project_id, directory_key);
CREATE INDEX directory_submissions_status_idx
  ON directory_submissions (status, created_at)
  WHERE status IN ('queued','failed');
```

## Trigger model — async, opt-in

**Default: opt-in, not auto.** Per the launch-quality concern below.

When a creator clicks "Get me backlinks" on their /project/[id]/drafts
page (the same screen that shows social drafts today), the server
INSERTs N `directory_submissions` rows with status='queued'. A
cron job (every 5 min) picks queued rows and runs adapters.

Why opt-in not auto:
- Quality bar matters — Futurepedia and TopAI will reject low-quality
  submissions and that hurts our reputation as a submitter
- Some creators are early/private and don't want maximum exposure yet
- Token budget — running 8 adapters × every submit gets expensive in
  Vercel function time
- HITL signal: if creator opts in, that's a quality signal Claude
  can use to weight ranking

## Adapter implementation patterns

Three styles:

### Pattern A — public API (preferred)

```ts
// e.g. dev.to API
const res = await fetch('https://dev.to/api/articles', {
  method: 'POST',
  headers: { 'api-key': process.env.DEVTO_API_KEY, 'content-type': 'application/json' },
  body: JSON.stringify({ article: { title, body_markdown, tags } }),
});
```

Easy, reliable. Targets: dev.to, Product Hunt API.

### Pattern B — form POST (medium difficulty)

```ts
// e.g. Toolify
const cookies = await getOrCreateSessionCookies('toolify');
const res = await fetch('https://www.toolify.ai/submit', {
  method: 'POST',
  headers: { 'Cookie': cookies, 'User-Agent': BROWSER_UA, 'Content-Type': 'multipart/form-data' },
  body: makeFormData({ name, url, description, category, ... }),
});
```

Need session cookie management. Brittle (form changes break us). Mitigation:
fail loudly + alert via cost-audit channel.

### Pattern C — GitHub PR (no auth — totally automatable)

```ts
// e.g. awesome-mcp-servers PR
await octokit.pulls.create({
  owner: 'punkpeye',
  repo: 'awesome-mcp-servers',
  title: `Add VibeXForge: distribution amplifier for indie AI creators`,
  body: prBodyForAwesomeList(project),
  head: `vibex-bot:add-${project.id}`,
  base: 'main',
});
```

Most reliable. We already did this manually (2026-05-09 packet). Limit:
rate-limited by GitHub, and PR quality matters (no spam tone).

## Open questions for Alex

These need decisions before build kicks off:

1. **Tier 1 narrow vs broad?** Start with 3 (dev.to / GitHub awesome
   PR / Toolify) or all 8?
2. **Opt-in UI placement.** Add "Submit to 8 directories" button on
   `/project/[id]/drafts`? Or new page `/project/[id]/distribute`?
3. **Should each adapter be its own background cron job, or all-at-once
   on opt-in click?** Cron lets us spread API load + retry; immediate
   gives faster feedback.
4. **Approval-pending UX.** Some directories take 3-7 days to approve.
   Do we (a) email the creator when each goes live, (b) just show
   status in their dashboard, (c) both?
5. **Failure tolerance.** If 3/8 adapters fail (form changed, rate
   limited), do we re-queue automatically or surface to creator?
6. **Anti-spam policy.** Some directories explicitly forbid automated
   submission. We need to read each ToS before shipping. Options:
   (a) only submit where ToS allows — narrows to 4-5 directories
   (b) require creator to "click submit" themselves on a pre-filled
   form — less automation but ToS-safe
7. **i18n.** Chinese directories (BetaList CN / 36kr 早期项目) —
   include in Tier 1 or defer? Argues for "include" since
   bilingual EN+ZH is a brand moat.

## Effort estimate

- v0.1 (Tier 1 narrow — dev.to + GitHub PR + Toolify): **~6h**
  - Schema migration: 30 min
  - dev.to adapter (reuse existing draft path): 1h
  - GitHub PR adapter (octokit + branch + PR body templater): 1.5h
  - Toolify adapter (cookie + form): 1.5h
  - Queue cron: 45 min
  - /project/[id]/drafts UI button + status badges: 1h
- v0.2 (add Futurepedia + TopAI + AlternativeTo): +3h
- v0.3 (Chinese directories + email-on-approve UX): +2h

## Anti-recommendations

Things explicitly NOT in scope:

- ❌ Reddit subreddit posting (already in marketing-agent social draft layer)
- ❌ Hacker News auto-submit (requires user's HN account; spam risk)
- ❌ Product Hunt auto-submit (one launch per 24h; high-risk if we
  burn the wrong day; should stay manual)
- ❌ Paid listing platforms (G2, Capterra)
- ❌ Backlink farms / SEO directories with low DA / spam quality
- ❌ Building a separate "directory dashboard" page — fold into
  existing `/project/[id]/drafts` instead

## Success metric

We declare v0.1 a win if:
- 80%+ of opt-in creators get ≥3 successful submissions
- Median time-to-first-published-backlink is < 24h
- Creator-reported backlink count (self-reported in /dashboard) grows
  3x vs control (pre-launch creators)

## Decision needed before build

Alex picks:
- (a) Build Tier 1 narrow this week (~6h, 3 directories)
- (b) Build Tier 1 broad this week (~12h, 8 directories)
- (c) Defer — VibeX iOS / hero copy / other PH-prep takes priority
- (d) Spec re-cut after 1-week monitoring of PicoLaunch's actual
      traction (do they keep growing? does the directory bet work
      empirically?)

Default recommendation: **(a)** — narrow first to validate the
queue+adapter architecture, then expand to 8 once the pattern proves
out. Risk-adjusted ROI is highest for narrow ship.

## 🛑 2026-05-14 DECISION — locked at NARROW. Do NOT expand to broad.

Post-build, competitive-landscape research surfaced the truth: this
market (auto-submit to Western directories) is **already settled at
$29-499 / 18-500 directories**, owned by ListingBott / SubmitSaaS /
AutoSaaSLaunch / GetMoreBacklinks / SubmitPro / Submit Juice /
Startories / LinkJuice / SaaSLaunch.site. 10+ products. Pure red
ocean. PicoLaunch (the 小红书 post that triggered this spec) was
not actually verifiable as a real product — likely a re-pitch.

VibeXForge's actual moat is NOT directory count — it's:
1. **Bilingual EN+ZH multi-platform reach** (小红书/即刻/B站/知乎
   that Western tools don't touch)
2. **AI quality layer** (Claude compound score + RPG evolution
   gating exposure)
3. **iOS Companion + auto-trailer** (mobile surface + Remotion video
   that competitors don't have)

So this spec is **frozen** in its current ship state:
- ✅ v0.1 narrow: dev.to + GitHub awesome-mcp-servers PR (already
  shipped 2026-05-14 in commits f49fe16 + 20e34b6)
- 🚫 v0.2 broad (Toolify / Futurepedia / TAAFT / AlternativeTo /
  TopAI / +ZH directories) — **NOT BUILDING**. Removed from queue.
- 🚫 Email-on-approve UX — NOT BUILDING.
- 🚫 Directory dashboard page — NOT BUILDING.

What lives on instead:
- The existing `directory_submissions` queue + cron + UI button
  keeps running. dev.to + awesome-PR adapters keep doing their job
  (when DEVTO_API_KEY and GITHUB_TOKEN are set in prod env).
- All future scope-growth effort redirects to the China-bridge moat:
  doubling-down on the 17 platform-specific social draft generator
  + 小红书/即刻/B站 reach + iOS Companion polish.

Why this matters: every hour spent on adapter #4-#8 is an hour NOT
spent on the China-bridge angle that is **the only differentiation
that's not commoditized**. Spec stays as historical artifact +
narrow ship spec, but expansion is killed.

Cross-reference: this is the same conversation thread that triggered
the iOS TikTok-style Demos tab and the react-bits CountUp/DecryptedText
integration. The strategic theme is **double-down on what we
already own that no one else does**.

## Related docs

- `vibex_north_star_vision.md` — locked positioning (this spec respects it)
- `docs/superpowers/specs/2026-05-13-vibex-mcp-submit-server.md` — MCP
  submit pipeline (orthogonal but adjacent)
- `~/Desktop/Interview-Prep/Projects/alex-brain/research/2026-05-09-awesome-list-submission-packet.md` —
  the manual version of this we did 2026-05-09
