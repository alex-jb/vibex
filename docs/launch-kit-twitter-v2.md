# VibeX — Twitter / X launch thread v2 (2026-04-18 refresh)

Supersedes the Twitter block in `launch-kit.md`. v1 leaned on the
generic "Claude reviews your landing page" angle; v2 leans into the
RPG-evolution framing (the real differentiator) and closes with an
engineering-honesty hook that compounds on the DEV.to migration-
audit article landing the same week.

Send order: HN Show post → wait 30 min → drop this thread as a
reply in your own Twitter feed. Tweet 1 is the hook; tweets 2-6
are proof; tweet 7 is the ask.

Post via https://x.com/compose/tweet and use the schedule feature
if you want to stage these for Tuesday/Wednesday morning PT.

---

## 1 / 7  (hook — no image, just punch)

```
I spent 6 weeks rebuilding what Product Hunt should be for AI.

The insight: AI projects shouldn't launch once and die on day 2.
They should level up for months based on real usage.

So every project on VibeX is a pixel-art RPG hero.

Seed → Active → Growing → Breakout → Legend → Myth.

https://vibexforge.com
```

## 2 / 7  (image: `docs/screenshots-v2/01-landing.png` — arcade splash)

```
The loop:

1. Paste your AI project URL or GitHub repo
2. Claude Haiku scores it across 5 dimensions:
   · originality
   · clarity
   · UX potential
   · virality potential
   · investor curiosity
3. Get a 0-100 compound score + named strengths /
   weaknesses / suggestions

No upvote contest. Just the feedback.
```

## 3 / 7  (image: `docs/screenshots-v2/04-project.png` — the AI Analysis panel)

```
The score sets your project's starting evolution stage.

Then it levels up on real traction:
- Seed → Active:   plays ≥ 50 OR score ≥ 40
- Active → Growing: plays ≥ 500 AND score ≥ 60
- … all the way to Myth (plays ≥ 10k + Claude
  investor-curiosity ≥ 80 + compound ≥ 90)

Advancement is a Postgres trigger. No cron. No drift.
```

## 4 / 7  (image: `docs/screenshots-v2/06-heroes.png` — gallery)

```
The gallery ranks by compound score × evolution velocity.

Projects that improve compound in discoverability.
Projects that stall fall down.

Product Hunt rewards launch-day spike.
VibeX rewards the work you put in after.
```

## 5 / 7  (image: a screenshot from the Chenxi / Orallexa project detail with real Claude review)

```
What a real review looks like (this is an actual user submission).

Claude didn't just slap a number on it — named 2-3 concrete
weaknesses and 2-3 suggested rewrites the creator can copy-paste.

That's the loop. That's what I couldn't find anywhere else for
AI-native projects. So I built it.
```

## 6 / 7  (the eng-honesty tweet — this is the one that gets retweeted by devs)

```
Shipping honesty.

I found 3 DB migrations on Monday that I had written, committed,
and never applied to prod — including the trigger that advances
evolution stages. Every project had been stuck on "Seed" forever.

Full postmortem + the 180-line audit script I wrote to catch
future misses:

dev.to/alex-jb/…   (link once published)
```

## 7 / 7  (the ask — direct, specific)

```
I want the next 10 users.

Submit your AI project, send me a screenshot of your Claude
review. Which suggestions landed, which ones missed.

That's the only feedback loop I care about right now. More
features come after 50 submissions — not before.

vibexforge.com/launch
```

---

## Reply templates (drop these below replies that show up)

**"How is this different from Product Hunt?"**
```
PH is a 24-hour upvote contest. You launch, you spike, it's over.

VibeX is continuous. A Seed today can hit Myth in 3 months of
sustained traction — or regress if engagement dies.

Also reviews are Claude against a published rubric, not anonymous
upvotes. Structured. You can see exactly what the 5 scores mean.
```

**"Where's the catch?"**
```
Source-available not MIT. Can read every line, fork for personal
use, contribute back. Blocks commercial hosting. Solo founder
insurance against being cloned on day 30.

I'll revisit the license model when that stops making sense.
```

**"Can I submit a GitHub repo?"**
```
Yes. If the URL is a github.com repo, the submit pipeline auto-
pulls your README via the GitHub API and feeds it to Claude.

If your README is just the "Contribute to X/Y development…"
GitHub default placeholder, expect a low score. Write a real
README first; the fix is cheap and earns you stages.
```

**"Tech stack?"**
```
Next.js 16 (App Router, RSC streaming)
Supabase (Postgres + RLS + Realtime)
Claude Haiku 4.5 for the reviews
Vercel Fluid Compute
~7k lines TypeScript, solo

Source: github.com/alex-jb/vibex
```

---

## Post-thread follow-ups (within 24h)

- Quote-tweet the thread with a ≤20s screen recording of a real
  submission going Seed → Claude review → Active stage. Most
  retweets on launch day come from video not screenshots.
- Tag `@Shubhamsaboo` (awesome-llm-apps maintainer) in a reply
  asking him to re-review the VibeX entry. Your prior PR got
  closed; a second ask with the new framing might stick.
- Cross-post the #6 eng-honesty tweet to LinkedIn in longer form
  (~200 words, same story). LinkedIn over-indexes on postmortem
  content from solo founders.
- Reply to **one** relevant AI-agent Twitter thread that day with
  a "this is what we built after seeing X miss" comment — no URL
  unless someone asks. Builds rep, not spam.

## What NOT to do

- Mass-tag 10+ people per tweet — instant shadowban
- Reply to unrelated trending threads to bootstrap — cheap
- Post a "thanks for the love" tweet if you're under 50 RTs —
  reads thirsty
- Engagement-bait prompts like "What AI project would you submit?"
  — low-signal replies clog your mentions

## Metrics to watch

| Metric | Where | Day-1 target | Week-1 target |
|---|---|---|---|
| Thread impressions | X Analytics | 5k | 25k |
| Unique visitors | Vercel | 500 | 3k |
| Submissions | `SELECT count(*) FROM projects WHERE created_at > ...` | 5 | 30 |
| Reviews with user message back | manual | 2 | 10 |
| GitHub stars (alex-jb/vibex) | repo page | 20 | 100 |

Below the first 2 targets on day 1 means either the hook is off
or the timing was off. Above the first 2 targets means the story
resonated and the bottleneck is now the submit → first-message
conversion (which is what you want next).
