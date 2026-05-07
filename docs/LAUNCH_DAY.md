# Launch Day Runbook — VibeXForge

**Target launch:** Wed 2026-05-13 (Show HN Tue 5/12, PH Wed 5/13)
**Single source of truth.** Open this on Mon evening; follow step-by-step.

> docs/ is in vercel.json `ignoreCommand` exclusion list — editing this file
> does NOT trigger a $0.60 build. Safe to update during launch.

---

## Pre-launch checklist (Sun evening, ~30 min)

### 1. Vercel env vars (3 still needed)

```bash
# 1. Resend — https://resend.com/api-keys → New API Key
echo "re_PASTE_HERE" | ~/.local/node/bin/vercel env add RESEND_API_KEY production --yes

# 2. Supabase service_role — https://supabase.com/dashboard/project/yjqmquesxwlsmqowoahl/settings/api
echo "eyJ_PASTE_HERE" | ~/.local/node/bin/vercel env add SUPABASE_SERVICE_ROLE_KEY production --yes

# 3. Supabase Personal Access Token — https://supabase.com/dashboard/account/tokens
echo 'export SUPABASE_PERSONAL_ACCESS_TOKEN="sbp_PASTE_HERE"' >> ~/.zshrc
source ~/.zshrc
```

Already set: CRON_SECRET, ADMIN_EMAILS, NEXT_PUBLIC_SITE_URL.

### 2. Outreach DM blast (Sunday night)

Open `~/.marketing_agent/queue/pending/20260506T230000Z-vibexforge-product_hunt.md`.
Send the "Outreach DM template" to **15 indie hackers** asking for **honest feedback,
not upvotes** (Ryan Hoover playbook). Suggested list:

- @levelsio — Pieter Levels
- @marc_louvion — Marc Lou
- @altryne — Alex Volkov
- @swyx — Shawn Wang
- @yoheinakajima — Yohei Nakajima
- @rasmic — Rasmic Andersen
- @theo — Theo Browne
- @dr_cintas — David Cintas
- @sahar_mor — Sahar Mor (AI Tidbits)
- @intercept_x — Intercept
- @realfutureproof — Future Proof
- @PeerlistHQ — Peerlist team
- @uneed_best — Quentin (Uneed)
- @MattWolfe — Matt Wolfe (FutureTools)
- @dharmesh — Dharmesh Shah

### 3. Final pre-checks (Tue midnight UTC, just before bed)

- `https://www.vibexforge.com/?ref=hn` opens. /launch works. /home loads.
- Sentry zero errors: https://o4511186400837632.sentry.io
- `/admin/metrics` loads with your alex@vibexforge.com login.
- Latest deploy is `● Ready` in `vercel ls`.
- Funnel-agent ran today (`ls -la ~/.funnel_analytics/briefs/`).

---

## Tuesday 2026-05-12 — Show HN day

### 8:00 AM PT / 15:00 UTC — Submit Show HN

URL: https://news.ycombinator.com/submit
Title (copy from `~/.marketing_agent/queue/pending/20260506T225311Z-vibexforge-hacker_news.md`):

```
Show HN: 5 users, 100% bounced. What my Claude-judged launch platform taught me
```

URL: `https://www.vibexforge.com/?ref=hn`

**Within 60 seconds of submission**: post the "First comment" from the file
as your reply to your own thread. (HN convention: maker shows up in own
thread immediately. Adds depth signal.)

### 8:30 AM PT — Begin reply rotation

Stay at the keyboard for 4-6 hours. Reply to **every comment within 30 min**.
HN ranks comment depth. Your job is to not let any reply sit cold.

### 12:00 PM PT — Mid-day check

- /admin/metrics signups ?ref=hn — first cohort visible
- HN rank — if front page, reply faster
- If buried (rank > 50 by 2pm): no second submit; let it sit.

### Evening — write learnings note

Whatever happened, write 5 sentences in `docs/LAUNCH_DAY_RETRO.md`:
peak rank, top comment, biggest surprise, signup count, what to change for PH tomorrow.

---

## Wednesday 2026-05-13 — Product Hunt day

### 12:00 AM PT (start of PH day) / 07:00 UTC

**Hard requirement: PH day starts at midnight Pacific.** Submit immediately
or you lose 12 hours of clock time.

URL: https://www.producthunt.com/posts/new

Use the kit at `~/.marketing_agent/queue/pending/20260506T230000Z-vibexforge-product_hunt.md`:
- Title: "VibeXForge — Product Hunt where Claude is the judge"
- Tagline: "AI projects, scored 0-100. Evolve through 6 RPG stages."
- Topics: AI / Developer Tools / Open Source / SaaS
- 5 gallery images (you have these in /docs/screenshots-v3 + /docs/launch-kits)
- Description: 260 chars from the kit file
- URL: `https://www.vibexforge.com/?ref=ph`

### 12:01 AM PT / 07:01 UTC — Maker first comment

Immediately post the "Maker's first comment" from the kit. Don't wait.
This is the comment that converts.

### 12:05 AM PT / 07:05 UTC — Twitter thread

Open `~/.marketing_agent/queue/pending/20260506T225311Z-vibexforge-x.md`.
Post the 6-tweet thread. Tweet 6 has the PH link.

### 6:00 AM PT / 13:00 UTC — LinkedIn

Open `~/.marketing_agent/queue/pending/20260506T225311Z-vibexforge-linkedin.md`.
Paste to LinkedIn (you'll have to do it manually — LinkedIn no auto-post).

### 8:00 AM PT / 15:00 UTC — Wake-up reset

- Check /admin/metrics → which ref is winning?
- Check HN thread → still on front page or fully cold?
- Reply to every PH comment that came in overnight (set 30 min timer).

### 9:00 AM PT / 16:00 UTC — Bluesky

Open `~/.marketing_agent/queue/pending/20260506T225311Z-vibexforge-bluesky.md`.
Post to bluesky.app. 246 chars, single skeet.

### 10:00 AM PT / 17:00 UTC — Reddit r/SideProject

Open `~/.marketing_agent/queue/pending/20260506T225311Z-vibexforge-reddit.md`.
Post to r/SideProject. Saturday is megathread day but Wed launch is fine
because PH-day energy. Title leads with the failure number.

### 10:30 AM - 6:00 PM — Reply rotation

Same as HN day but multi-platform. Use the funnel-agent's daily brief
(arrives at 9am via ntfy on your phone) to know where to focus.

### 9:00 PM PT — Day-1 retro

Write `docs/launch-2026-05-13-retro.md` — what worked, what didn't.

---

## Thursday 2026-05-14 — Long-tail day

### 8:00 AM PT — Dev.to

Open `~/.marketing_agent/queue/pending/20260506T225311Z-vibexforge-dev_to.md`.
Post to dev.to (technical long-form). Tags: showdev, ai, postgres, nextjs, supabase.

### 10:00 AM PT — Threads

Open `~/.marketing_agent/queue/pending/20260506T225311Z-vibexforge-threads.md`.
Post to Threads.

### Anytime — submit to AI directories

3-hour batch (do them all in one sitting):

- TheresAnAIForThat https://theresanaiforthat.com/submit (Brett's, free, 24-48h review)
- FutureTools https://futuretools.io/submit (Matt Wolfe)
- Futurepedia https://www.futurepedia.io/submit-tool
- Tiny Launch https://tinylaunch.com (Marc Lou, free)
- Peerlist https://peerlist.io/projects (Project Spotlight is curated weekly)
- Uneed https://uneed.best/submit (Quentin's Tuesday newsletter)
- BetaList https://betalist.com/submit (free, 6-week queue)
- Insidr https://insidr.ai/submit
- AI Scout https://aiscout.net/submit
- There's An AI https://theresanai.com/submit
- Easy With AI https://easywithai.com/submit
- AI Tools Guide https://aitoolsguide.com/submit

URL for all: `https://www.vibexforge.com/` (no ref needed — they'll add their own utm).

---

## Decision gate — Day 7 (2026-05-20)

`/admin/metrics` query — what to check:

| Signal | Good | Bad |
|---|---|---|
| Total signups (7d) | > 100 | < 50 |
| Top channel | clear winner with > 30% share | flat distribution = no PMF wedge |
| Day-7 active users | > 20% of signups | < 10% = no return |
| Stage-evolution count | > 5 events | 0 = no engagement at all |

**If good** → next 30 days: double-down on top channel, ship Backer Mode tipping
**If bad** → office-hours skill: we audit what happened and pivot

---

## Emergency rollback

- Site totally broken: `vercel rollback` to previous deploy
- Email going wrong: `vercel env rm RESEND_API_KEY production` (emails fall back to dry-run, won't send)
- Spam attack: temporarily disable signup in `app/register/page.tsx` (return early)
- DB issue: Supabase Dashboard → backup restore

---

## Useful URLs (bookmark these)

- /admin/metrics — `https://www.vibexforge.com/admin/metrics`
- Supabase: https://supabase.com/dashboard/project/yjqmquesxwlsmqowoahl
- Vercel: https://vercel.com/alex-jbs-projects/vibecode-hunt
- Sentry: https://o4511186400837632.sentry.io
- Resend dashboard: https://resend.com/emails
- Funnel briefs: `~/.funnel_analytics/briefs/`

---

_Generated 2026-05-07 during pre-launch sprint. Update this in place as
you learn — add timing tweaks, channels that surprised you, etc._
