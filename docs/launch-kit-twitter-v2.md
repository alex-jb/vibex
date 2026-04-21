# VibeX — Twitter / X launch thread v3 (2026-04-21 refresh, post-Direction A)

Supersedes v2 (2026-04-18). Key changes:

- Tweet #2 is now the **forge-unveil Cap clip** (`docs/clips-v3/02-unveil.mp4`)
  instead of a static landing screenshot. Video in the #2 position
  maximizes retention on the thread — anyone scrolling past #1 will stop
  on a 10-second loop of the HeroCard unveil.
- All static image references point to `docs/screenshots-v3/` (captured
  after the Direction A sweep — the v2 images predate it).
- Tweet #5 swapped from "gallery" to "the commit ritual" — the forge
  plate + live preview flow is the second-strongest differentiator after
  evolution, and most of v2's gallery talk overlapped with the landing
  screenshot.
- Tweet #6 preserves the engineering-honesty hook (migration audit) but
  references the new DEV.to article URL.

Send order: HN Show post → wait 30 min → drop this thread as a reply in
your own Twitter feed. Tweet 1 is the hook; tweets 2-6 are proof;
tweet 7 is the ask.

Post via https://x.com/compose/tweet and use the schedule feature if you
want to stage these for Tuesday/Wednesday morning PT.

---

## 1 / 7  (hook — no media, just punch)

```
I spent 6 weeks rebuilding what Product Hunt should be for AI.

The insight: AI projects shouldn't launch once and die on day 2.
They should level up for months based on real usage.

So every project on VibeX is a pixel-art RPG hero you forge.

Seed → Active → Growing → Breakout → Legend → Myth.

https://vibexforge.com
```

## 2 / 7  (video: `docs/clips-v3/02-unveil.mp4` — the forge unveil)

```
The moment I'm most proud of:

You hit STRIKE THE ANVIL. 8 seconds of hammering. Then Claude's
verdict forges onto your card — frame color reveals your stage,
compound score rolls up, five attribute bars fire one by one.

3.5 seconds. Feels like you forged a hero, not filled out a form.
```

## 3 / 7  (image: `docs/screenshots-v3/03-launch-filled.png` — /launch mid-fill)

```
The commit ritual is the differentiator.

Every form field is a forge plate that heats orange as you fill it.
A live HeroCard on the right builds in real time as you type —
same component that renders the final project page. You're
forging an empty hero; Claude strikes the score onto it.

No more "Submit Project" gradient-purple buttons.
```

## 4 / 7  (image: `docs/screenshots-v3/04-project-forged.png` — post-forge AIReviewPanel)

```
The review itself:

▸ 5 dimensions, 0-100 each
   · originality · clarity · UX potential
   · virality potential · investor curiosity
▸ Named strengths, weaknesses, copy-pasteable suggestions
▸ The compound score sets your starting evolution stage

Claude Haiku 4.5, structured tool_use output. No prose guessing.
```

## 5 / 7  (image: `docs/screenshots-v3/02-home.png` — HeroCard grid on /home)

```
Once you're launched, the gallery ranks by compound score ×
evolution velocity.

Projects that improve compound in discoverability.
Projects that stall fall down.

Product Hunt rewards launch-day spike.
VibeX rewards the work you put in after.
```

## 6 / 7  (the eng-honesty tweet — RT-bait)

```
Shipping honesty.

I found 3 DB migrations last week that I'd written, committed,
and never applied to prod — including the trigger that advances
evolution stages. Every project had been stuck on "Seed" forever.

Full post-mortem + the 180-line audit script I wrote:
dev.to/alex-jb/i-found-3-unapplied-db-migrations
```

## 7 / 7  (the ask — direct, specific)

```
I want the next 10 users.

Submit your AI project, screenshot the forged review page, tell
me which Claude suggestions landed and which ones missed.

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

And the submit itself is designed as a reward — forge plates,
live preview, anvil strike, 3.5s unveil. PH is built for novelty;
VibeX is built for the loop.
```

**"That STRIKE THE ANVIL button — is the forge animation real?"**
```
Yes. framer-motion on the submit-loading state. Card shakes
x±3-4px on a 0.45s infinite loop (hammer impacts), 6 pixel
sparks radiate out with cubic-out easing (forge fire). Drop-
shadow glow intensifies as metal heats. Takes about 50 lines.

The unveil on the destination page is another 80 lines —
URL param ?forged=1 triggers a 3.5s one-shot that strips
itself so refresh doesn't replay.

Full code in app/project/[id]/page.tsx if you want it.
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
Next.js 16 (App Router, RSC streaming, Turbopack)
Supabase (Postgres + RLS + Realtime)
Claude Haiku 4.5 for reviews, Sonnet 4.6 for launch packages
Vercel Fluid Compute
Tailwind v4 + framer-motion + nes-core pixel chrome
~7k lines TypeScript, solo

Source: github.com/alex-jb/vibex
```

---

## Post-thread follow-ups (within 24h)

- Quote-tweet the thread with the Cap clip 01 (STRIKE THE ANVIL button
  press → redirect, 8s). Shorter than clip 02, better for quote-tweets
  that also carry your own commentary.
- Tag `@Shubhamsaboo` (awesome-llm-apps maintainer) in a reply asking
  him to re-review the VibeX entry. Your prior PR got closed; a second
  ask with the new Direction A framing might stick.
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
| Clip 02 (unveil) plays | X Analytics | 2k | 10k |
| Submissions | `SELECT count(*) FROM projects WHERE created_at > ...` | 5 | 30 |
| Reviews with user message back | manual | 2 | 10 |
| GitHub stars (alex-jb/vibex) | repo page | 20 | 100 |

Below the first 2 targets on day 1 means either the hook is off
or the timing was off. Above the first 2 targets means the story
resonated and the bottleneck is now the submit → first-message
conversion (which is what you want next).
