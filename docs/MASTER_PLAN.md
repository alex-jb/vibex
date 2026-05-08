# VibeXForge Master Plan v1

> **Locked 2026-05-08.** This is the strategic document that synthesizes
> 6 hours of pivot discussion + market research from Lovable / Cursor /
> Astrocade / Indie Hackers / Replit / 小红书 ecosystem / GitHub trending.
>
> **Do not re-pivot without strong external evidence.** If the strategy
> changes, this file gets a new version (v2), with an explicit reason.

---

## Part 1 — Where we are (2026-05-08)

### Asset inventory

| Asset | State |
|---|---|
| **vibexforge.com** | Live, 5 users (1 external), Claude review + RPG evolution + gallery + live feed + tweet share + ref tracking shipped |
| **orallexa-ui.vercel.app** | Live, public OOS Sharpe leaderboard, 990+ tests |
| **Solo Founder OS (11 agents)** | Open source, 4 months production data, ~$3.70/mo Anthropic spend |
| **marketing-agent** | 11 platforms supported (X / Reddit / LinkedIn / HN / Substack / Dev.to / Bluesky / Mastodon / Threads / 知乎 / 小红书), bandit + autopsy + HITL queue, **already production** |
| **bilingual-content-sync-agent** | EN ↔ ZH translation with brand voice |
| **customer-support-agent** | Triage + auto-draft replies |
| **funnel-analytics-agent** | Daily brief + real-time alerts, 9 sources including VibexSource |

**Bilingual founder, US-based, Chinese-American**. Unique combination
not represented in either Western or Chinese AI startup ecosystem.

### Pain Alex has lived (= product validation)

- 6 months building, 5 users, 1 external, 100% bounce rate after first post
- Built marketing-agent to solve his own distribution problem
- Built customer-support-agent because no one to staff support
- Built cost-audit because solo can't afford waste
- **The product is the toolkit Alex built for himself**

This is the strongest signal a founder can have: dogfooding for 6 months.

---

## Part 2 — The Vision (locked)

> **VibeXForge — Distribution amplifier for solo AI creators.**
>
> Submit your vibe-coded AI app once. Our agents auto-promote it across
> 10+ channels (X / 小红书 / 即刻 / 知乎 / B站 / Reddit / Dev.to /
> Hacker News / Producthunt / LinkedIn / Bluesky / Threads), each post
> tailored to that platform's tone, language, and audience. Solo
> creators get the multi-channel reach big companies pay $10K/month
> for, free during beta.

### Why this and not the 8 alternatives

| Direction | Why rejected |
|---|---|
| Reliability infra | Too abstract for Alex; B2B enterprise sales cycle too long for solo |
| 1+N 出海 Studio | Too generic; competes head-on with Lovable |
| Astrocade-for-AI mini-apps | Engineering cost too high (inline IDE); competes with Astrocade |
| Skills marketplace | Already crowded (Agensi / Agent37); GitHub-like surface |
| Patreon × PH | Unicorn ceiling too low; no defensible moat |
| 桥 (diaspora) | Too abstract about who buys |
| 笔记工厂 | Single-platform dependency on 小红书 |
| AI Hardware | Wrong founder fit (Alex is software native) |

### Why this works

1. **The product is what Alex built for himself** (marketing-agent + bilingual sync + customer support exist *because Alex needed them*)
2. **Big companies structurally can't / won't do this**:
   - Lovable / Cursor / Bolt focus on **build**, not distribute
   - Indie Hackers is **forum**, not auto-distribution
   - 小红书 / 即刻 want to lock you to single platform
   - OpenAI / Anthropic don't do GTM tooling
   - ByteDance / Alibaba conflict with their own ad business
3. **Bilingual EN/ZH is a moat** — Western tools (Lovable / Bolt / Cursor) speak English only; Chinese tools (Manus / TRAE) are domestic-only. **The bridge is empty**.
4. **Vibe coding wave just hit $4.7B market in 2026, 84% YoY growth** — once everyone can build, distribution becomes the new bottleneck. We're skating to where the puck is going.

### Founder belief (drives everything)

> **"AI 不是只有大公司 VC 才能有好作品。我证明 solo 也能。"**

Every product decision flows from this. When in doubt: which choice
better serves a solo creator who feels invisible? That choice wins.

---

## Part 3 — The product (concrete)

### MVP user flow

```
┌─────────────────────────────────────────────────────────────────┐
│  1. Creator visits vibexforge.com                               │
│     - sees existing AI creator gallery (live)                   │
│     - sees CTA: "Submit your AI app, get auto-promoted to       │
│       10+ channels — free beta"                                 │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  2. Creator clicks /launch, fills form (existing flow):         │
│     - title, tagline, description, demo URL, GitHub             │
│     - optional: which platforms to target                       │
│     - language preference (EN / ZH / both)                      │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  3. VibeX runs (existing, already shipped):                     │
│     - Claude 5-dimension review                                 │
│     - Quality score → initial RPG stage                         │
│     - Indexes for SEO                                           │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  4. NEW: marketing-agent generates platform drafts in parallel  │
│     - 10+ platform-specific posts                               │
│     - EN + ZH versions where applicable                         │
│     - Bandit picks 3 variants per platform                      │
│     - Drops to creator's HITL queue                             │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  5. NEW: Creator sees /project/[id]/drafts page                 │
│     - List of 10+ drafts                                        │
│     - Each: edit inline, schedule, mark "posted manually"       │
│     - For platforms with API (X / Reddit / Dev.to / Bluesky):   │
│       one-click auto-post                                       │
│     - For others (LinkedIn / HN / 小红书 / 即刻 / 知乎): one-   │
│       click copy + open platform                                │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  6. NEW: Creator sees /project/[id]/analytics with cross-       │
│     platform reach                                              │
│     - Pulls from each platform's API (or manual entry)          │
│     - Aggregates: "Your project got 1,243 views across 8        │
│       channels this week"                                       │
│     - Stage evolution triggered by REAL aggregate data, not     │
│       just plays/upvotes (existing trigger refactored)          │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  7. Creator monetizes (creator's choice — Stripe / Lemon Squeezy│
│     / etc — VibeX doesn't host the product, just amplifies):    │
│     - User finds creator via VibeX-amplified channel            │
│     - VibeX tracks conversion via ?ref= attribution             │
│     - VibeX takes 15% on first 12 months of creator's revenue   │
│       from VibeX-attributed users                               │
└─────────────────────────────────────────────────────────────────┘
```

### Pricing (locked)

| Tier | Price | What |
|---|---|---|
| **Free Beta** | $0 | First 100 creators, 30-day generous quota, all 10+ platforms |
| **Starter** | ¥99 / $19 / mo | 1 project, 10+ platforms, monthly drafts |
| **Pro** | ¥299 / $49 / mo | 5 projects, priority queue, AB-tested copy variants |
| **Studio** | ¥999 / $199 / mo | Unlimited projects, white-label option, dedicated agent tuning |
| **Take rate** | 15% of creator's first-12-month revenue from VibeX-attributed users | Stripe Connect, attribution via ?ref= |

### What we are NOT

- **Not a build tool** (Lovable / Cursor / Bolt do that). We help AFTER you build.
- **Not a forum / community** (Indie Hackers does that). We do active distribution.
- **Not a single-platform agency** (BeFrame / 小红书代运营 do that). We're cross-platform.
- **Not a generic Mailchimp clone** (Monolit does that). We're vertical to AI creators.
- **Not a marketplace where users buy products** (Lovable Gallery / Astrocade do that). We're the layer that GETS USERS to creator's standalone product.

---

## Part 4 — Distribution (the meta-question)

### How creators find us

**Year 1 ranked priority**:

1. **Build-in-public on X / 小红书 / 即刻 / Reddit / HN** (Alex doing this NOW, Day 1 done) — credibility through public commit
2. **Direct outbound to Lovable / Bolt / v0 / Cursor users** — they JUST shipped, distribution pain is fresh
3. **Show on existing solo founder communities**:
   - Indie Hackers (need to earn posting privilege via comments)
   - 即刻 (Chinese build-in-public, immediate)
   - Latent Space Discord (swyx's, ~15k AI engineers)
   - Buildspace alumni community
   - Marc Lou's Discord
4. **Cross-promote with adjacent tools**:
   - Lovable: "after you ship on Lovable, distribute via VibeX"
   - Cursor: same
   - Replit: same
   - Could be paid partnerships or free swaps
5. **SEO long-tail**: "how to promote AI app", "vibe coding distribution", "indie AI launch"
6. **Producthunt launch**: timed for Q3 once we have 50 design partners + traction story

### How creators monetize through us (the network effect)

VibeX's value to creator scales with VibeX's reach. So our job:

1. Get VibeX itself ranking on each platform we promote on
2. When a creator's project does well via VibeX (e.g. one HN trending hit), publish a case study on every channel
3. Case studies become future distribution gold (creators see real $→success stories)

### Why this isn't a chicken-egg problem

VibeX **doesn't need a marketplace of buyers**. We don't host the product —
we just amplify creators' OWN distribution. So the value to creator on Day 1
is the same as Day 1000: 10+ platform drafts written for you.

This is the key difference from Product Hunt clones (which need lots of
visitors to be valuable).

---

## Part 5 — The 90-day roadmap

### Week 1 (2026-05-07 to 05-13)

**Day 1 ✓ DONE**
- Vision committed to memory
- Landing copy updated
- Build-in-public posted: 即刻 + 小红书

**Day 2 (TODAY 2026-05-08) — IN PROGRESS**
- ALEX: Post X + Reddit r/SideProject (templates in `docs/BUILD_IN_PUBLIC.md`)
- AI: Integrate marketing-agent into VibeX submit flow
- AI: Build `/project/[id]/drafts` route showing 10+ platform drafts
- AI: Add Claude Agent SDK call to spawn marketing-agent in async background

**Day 3-4**
- AI: Multi-tenant queue (per-creator drafts in `vibex_storage/{creator_id}/queue/`)
- AI: Auto-post integration for X (API), Reddit (API), Dev.to (API), Bluesky (AT proto)
- AI: One-click copy + open-platform for LinkedIn / HN / 小红书 / 即刻 / 知乎
- ALEX: Post HN Show HN (Tue/Wed 8am PT)

**Day 5-6**
- AI: Creator analytics dashboard (cross-platform reach aggregation)
- AI: Stage evolution refactor — based on aggregate platform reach, not just plays
- ALEX: Reach out to 10 known indie AI creators (via DM templates, see below)

**Day 7 (Sunday)**
- Retro write-up
- Adjust if X / Reddit / 即刻 / 小红书 reactions surprise us

### Week 2-3 (Beta launch)

- Recruit 10 design partner creators (free beta, weekly call)
- Ship pricing pages (placeholder, charge starts Day 30)
- Build cross-platform analytics integration (X API, Reddit API, etc.)
- First case study: a design partner's AI project amplified on 8 channels — concrete numbers

### Week 4-6 (Iteration on feedback)

- Stripe Connect integration for creator payouts (post-MVP)
- Multi-platform autopost where APIs allow
- Browser automation (Playwright) for platforms without APIs (LinkedIn / 小红书 — careful re: ToS)
- Improve Claude review prompts based on creator feedback

### Week 7-9 (Public launch)

- Producthunt launch
- Show HN second round (with traction story)
- Hire/contract first BD person if 30+ paying creators (China focus, must be bilingual)
- Open paying tier to all (close beta)

### Week 10-12 (Push to 100-200 creators)

- $10K creator incentive program (Astrocade-style — first 100 with $50 launch credit each)
- Newsletter swaps (Sahar Mor / Bot Eat Brain / Ben's Bites)
- Discord community for creators
- Decision gate: if 50+ paying, start fundraising conversations

---

## Part 6 — Competitive landscape (honest map)

### Direct competitors (closest)

| Player | What they do | Why we're different |
|---|---|---|
| **Monolit** | AI marketing for any SaaS, English | Generic; we're vertical to AI creators + bilingual |
| **Indie Hackers** | Forum + revenue dashboards | Passive forum, not active distribution |
| **VIBE_** | Marketplace for vibe-coded apps | Just a directory, no auto-promote, no take rate |

### Adjacent (not direct competition)

| Player | What | Relationship |
|---|---|---|
| **Lovable, Cursor, Bolt, v0, Replit** | Vibe coding tools | **Upstream partners**. Their users are our customers |
| **Astrocade** | AI game creation | Different vertical (games vs general AI apps) |
| **Patreon** | Creator monetization | Different stage (we're discovery, they're recurring revenue) |
| **GitHub** | Code hosting | Different layer (code vs distribution) |
| **AngelList** | Startup investment | Different motion (we're micro-creator, they're institutional) |
| **TheresAnAIForThat** | AI tool directory | Different shape (passive directory, we're active promotion) |

### Why we win against direct competitors

**vs Monolit**: vertical to AI creators with bilingual moat. Monolit is Mailchimp; we're ConvertKit (vertical wins).

**vs Indie Hackers**: IH is forum. We auto-promote. Different product category. IH is a place we should LIST our product to find creators, not a competitor.

**vs VIBE_**: They're a static directory. We're an active distribution engine. We could partner with them.

---

## Part 7 — Funding path

### Default: bootstrap to $10K MRR (90 days)

If we hit 100 paying creators × ¥99 = ~$1.4K MRR by Day 90, we're on track.
At 1000 paying = $14K MRR.

This puts us in **lifestyle business** territory by Year 1 — Alex pays himself, no boss, no investors. Pieter Levels / Marc Lou path.

### If traction is great → Seed round

**Trigger**: 200+ paying creators by Day 60 OR 1 viral case study (creator hits $50K month with our distribution).

**Target funds** (these have invested in adjacent thesis):

| Fund | Recent investment |
|---|---|
| **Sequoia** | Astrocade $56M Series A+B (creation-as-consumer-activity thesis) |
| **Cambium Capital** | NeoCognition $40M (continual learning) |
| **Atlantic.vc** | Laminar $3M (agent observability, adjacent) |
| **YC W26 / S26** | Multiple AI tooling companies |
| **Long Journey** | Solo founder focus |
| **Lerer Hippeau** | Chinese-American founder advantage in NYC |

**Ask**: $1.5-3M seed, 18-month runway. Use of funds: 1 BD hire (Chinese cross-border focus), 1 ML eng, $300K Anthropic credits, $50K creator incentive pool.

**Story to investors**: "Lovable made $400M ARR by solving build. Cursor $2B ARR by solving IDE. The remaining bottleneck is distribution. We're vertical to AI creators with the bilingual moat for the Chinese AI creator wave."

### If traction is bad → re-evaluate at Day 60

NOT pivot. Re-evaluate **execution**:
- Are we reaching the right ICPs?
- Is the platform-specific copy actually good?
- Is the value proposition landing?

Pivot only with strong external evidence.

---

## Part 8 — Success metrics (what we measure weekly)

### North-star metric

**Weekly Active Creators (WAC)** = creators who logged in AND used a feature
(submitted, edited, posted, viewed analytics) in the last 7 days.

### Supporting metrics

| Metric | Week 4 target | Week 12 target |
|---|---|---|
| Total signups | 50 | 1000 |
| Submitted projects | 20 | 500 |
| WAC | 10 | 200 |
| Drafts auto-generated | 200 | 5000 |
| Drafts approved & posted | 100 | 3000 |
| Cross-platform views generated | 1000 | 100,000 |
| Paying creators | 0 | 50 |
| MRR | $0 | $1500-3000 |

### Decision gates

- **Day 30**: If < 100 signups → fix top-of-funnel (landing copy / outreach)
- **Day 60**: If < 10 WAC → fix product activation
- **Day 90**: If < 30 paying → consider focused bootstrap path; If > 50 → fundraise

---

## Part 9 — Risks + mitigations

| Risk | Severity | Mitigation |
|---|---|---|
| Platform ToS violations (auto-post on LinkedIn / 小红书 / 即刻) | High | Use one-click-copy + open-platform for those; NOT auto-post |
| Cold start: no creators → no case studies → no creators | High | Build-in-public + Alex own products as lighthouse + paid creator incentives ($50/each first 100) |
| Solo founder execution capacity | High | Don't expand scope. Say no to features. 90-day roadmap is locked |
| Competition from Monolit (vertical attack) | Medium | Bilingual moat + AI creator vertical focus + Alex already 6 months ahead on toolkit |
| Anthropic API cost spike | Low | Already auditing via cost-audit-agent; current ~$3.70/mo at small scale |
| Alex burnout / loneliness | High | Memory note already saved. **Alex MUST find 5 real solo founder buddies by Day 7** (Day 1 done: 即刻 + 小红书 posted) |
| China-US geopolitical risk | Medium | Both audiences are addressable independently; not single-jurisdiction dependent |

---

## Part 10 — First-week action plan (Day 2-7)

### Alex (founder, day-by-day)

- **Day 2 (today)**: X post + Reddit post (templates in `docs/BUILD_IN_PUBLIC.md`). Reply to ALL 即刻 + 小红书 comments within 30 min.
- **Day 3**: HN Show HN (Tue/Wed 8am PT). 4-6h reply rotation.
- **Day 4**: 10 cold DMs to known indie AI creators (templates available). LinkedIn post.
- **Day 5**: Bluesky + Threads. Comment thoughtfully on 5 IH posts (build posting privilege).
- **Day 6**: Dev.to long-form post.
- **Day 7**: Retro. Update `docs/MASTER_PLAN.md` with what we learned.

### AI / Claude Code (codebase, day-by-day)

- **Day 2 (today)**: Wire marketing-agent into VibeX submit flow. Build `/project/[id]/drafts` route.
- **Day 3**: Multi-tenant queue. Auto-post for X / Reddit / Dev.to / Bluesky APIs.
- **Day 4**: Analytics aggregation (cross-platform reach). Refactor stage evolution trigger.
- **Day 5**: Creator dashboard improvements based on Day 1-4 feedback.
- **Day 6**: Stripe Connect scaffolding (foundation for take-rate).
- **Day 7**: Polish + retro support.

### Beta recruitment (target 10 design partners by Day 7)

Ideal Customer Profile for design partners:
- Indie AI builder, shipped 1+ AI app in last 90 days
- Currently using Lovable / Cursor / Bolt / Claude Code
- Has < 1000 followers (i.e. needs distribution help)
- Active on at least 1 of: X, 小红书, 即刻, Reddit, Discord
- Bilingual or willing to use auto-translation

DM script (English):
> "Hey [name], saw your [product]. Massive respect — [specific thing].
> I'm building VibeXForge — distribution amplifier for solo AI creators.
> You submit your project, our agents auto-write 10+ platform-specific
> posts and you approve in 5 min. Looking for 10 design partner creators
> for free beta. Interested? 30 sec to say yes."

DM script (Chinese):
> "你好 [name],看到你做的 [product],真不错。我在做 VibeXForge —
> 给独立 AI 创作者的多渠道曝光放大器。提交一次,系统自动写 10+ 平台
> 推广文案,你 5 分钟审核。Beta 招 10 名免费,有兴趣?"

---

## Part 11 — What this document doesn't cover

- Specific marketing-agent prompt engineering details (in marketing-agent's own README)
- VibeXForge legacy code structure (in CLAUDE.md / AGENTS.md)
- Orallexa launch details (in `docs/ORALLEXA_LAUNCH_DAY.md`)
- Funnel-analytics monitoring setup (in launchd plists)

---

## Part 12 — When to update this document

- After Day 30: Update with actual metrics + adjust if course-correct needed
- After Day 60: Decision gate (continue / re-evaluate execution)
- After Day 90: v2 — based on real traction, decide bootstrap vs raise

**This is v1. Locked. No re-pivots without strong external evidence.**

---

_Document maintained by Alex Ji. Auto-loaded by Claude Code memory.
Next review: 2026-06-07._
