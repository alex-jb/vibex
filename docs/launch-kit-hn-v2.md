# VibeX — HN Show Post v2 (2026-04-17 refresh)

This supersedes the HN section of `launch-kit.md` written earlier in
April. Differences from v1:

- Leans into the **RPG / evolution** framing as the actual differentiator,
  not generic "AI review tool" (v1 positioning was indistinguishable from
  10+ "Claude reviews your landing page" projects).
- Grounds in today's fixes (submit pipeline actually writes reviews,
  evolution stages actually compute) rather than promising a loop that
  was secretly stubbed in prod until 2026-04-17.
- Adds an engineering-honesty postmortem angle that HN tends to reward.

---

## Primary HN Show post

**Title (68 chars — under the 80-char cutoff):**

```
Show HN: VibeX – Turn your AI project into a collectible RPG hero
```

**Body (~220 words):**

```
I spent 6 weeks building a launch platform for AI-native projects and
I'm ready for the first 10 users outside my circle.

The framing: your AI project is a 16-bit RPG hero. Paste a URL or a
GitHub repo → Claude scores it across five dimensions (originality,
clarity, UX potential, virality potential, investor curiosity) and
writes strengths / weaknesses / suggestions. The compound score sets
your starting evolution stage (Seed → Active → Growing → Breakout →
Legend → Myth). Projects evolve afterward based on real traction —
plays, upvotes, shares — so it's not a 24-hour upvote contest.

Why not Product Hunt:
- Reviews are Claude against a published rubric, not anonymous upvotes.
- Projects keep leveling up after launch day. Seed → Myth is a 3-month
  arc if the project actually works, not a single-day spike.
- The gallery is ranked by compound score × evolution velocity, so
  discoverability compounds for projects that improve.

Stack: Next.js 16, Supabase (RLS + realtime), Claude Haiku 4.5 for the
reviews. Source-available on GitHub. ~7k lines of TS, solo.

Shipping honesty: I found 3 DB migrations today that had sat
un-applied in prod for weeks — the evolution trigger was one of them,
so no project had ever actually evolved past Seed. Fixed it, wrote
an auditor so it can't happen twice. Post-mortem kind of experience.

Live: https://www.vibexforge.com
Submit your project: https://www.vibexforge.com/launch
Repo: https://github.com/alex-jb/vibex

I want the next 10 users — submit your AI project, send me the
screenshot of your Claude review. Which actions landed, which ones
missed. That's the only feedback loop I care about right now.
```

**Post timing**

- Best: Tuesday or Wednesday, 8:30–9:30am PT. HN has higher
  dev-density on weekday mornings and lower competition for the
  front page.
- Worst: Friday afternoon, Saturday, US holidays.

**First 30 minutes are decisive.** Open the post in a new tab and
keep it refreshed — reply to every comment under ~10 min. HN ranks
partly on discussion velocity; silence kills a post even if the
click-through is strong.

---

## Reply templates (pre-write these before posting)

**"How is this different from Product Hunt?"**

```
Three concrete differences. PH is a 24-hour upvote contest —
you launch once, you get a spike, it's over. VibeX projects
keep leveling up. A Seed today can be Myth in 3 months if the
product actually works. Second, PH upvotes are anonymous and
unstructured. VibeX reviews are Claude against a published
rubric (5 dimensions, 0–100 each, with named strengths /
weaknesses / suggestions). Third, the gallery ranks by
compound score × evolution velocity, so projects that improve
compound in discoverability. PH is built for novelty; VibeX
is built for iteration.
```

**"Isn't this just Claude + a UI?"**

```
The Claude part is the 10% easy. The 90% hard is the data
moat around it: which projects evolved from which stage,
which review suggestions got applied vs dismissed, which
categories are heating up. That feedback loop — not the LLM
call — is what I think makes the platform useful once it has
some data. Right now it has 14 projects and 2 real users. I'm
trying to get to 50 projects so the trend signals mean
something.
```

**"Why source-available instead of MIT?"**

```
Honest answer: I'm a solo founder and I'd like the optionality
to not be cloned and hosted cheaper by someone else on day 30.
The license lets you read every line, fork for personal use,
and contribute back. It just blocks commercial hosting. I'll
revisit if the model stops making sense. The core value is the
data moat, not the code — the code is mostly a careful
Next.js 16 + Supabase + Claude integration that any engineer
could replicate in a week.
```

**"Does it support GitHub repos as input?"**

```
Yes. If you paste a github.com URL, the submit pipeline pulls
your README via the GitHub API and passes it to Claude along
with your tagline. The review quality is pretty closely tied
to README quality — tested this today on a user's bare-bones
repo and Claude correctly scored it Seed (31/100) with
suggestions about clarifying value prop and shipping an MVP
feature before resubmitting. If your README is just the
GitHub "Contribute to X/Y development..." placeholder, you
should expect a low score; the fix is to write a real README
first.
```

**"How much does this cost you to run?"**

```
Today, ~$0.002 per submission (Claude Haiku 4.5, ~1.5k tokens
prompt + 500 tokens output). At 1,000 submissions/month that's
$2/mo on Claude, plus Supabase free tier plus Vercel free tier
— so under $20/mo for infra until I hit scale. If this ever
works, I'll eat compute. It's the data moat that pays.
```

---

## Launch-day moderation checklist

Post → first 5 min:
- [ ] Share link in your own dev Discord / group chat (get 2-3
      organic upvotes in the first 5 min — don't ask for upvotes,
      just share and let them vote if they feel like it)
- [ ] Start drafting responses to the predictable first questions

Post → first 30 min:
- [ ] Reply to every comment. No exceptions. Short replies OK.
- [ ] Add a top-level comment yourself with "A few things I should
      have said upfront" — answers the 3 most-asked questions in
      advance. Gets bumped by replies.

Post → first 2 hours:
- [ ] Don't edit the post body after it's voted past 15 points.
      Edits reset some of the ranking signals.
- [ ] Watch the logs (Vercel → Functions → `/api/projects/submit`
      + `/api/ai/review`). If a burst of traffic hits, rate limits
      are set to 20/min/IP on /api/ai/review — that's ~1200/hr
      capacity, should be fine.
- [ ] **Submit `alex-jb/vibex` to trendshift.io** (right column,
      "Submit repository" button — it's a modal, not a direct URL).
      Trendshift ranks by *same-day* star velocity, so the HN spike
      is exactly when it'll catch. Timing matters: submit within
      the first 2 hours of the HN post going live. If it trends,
      grab the badge URL (`trendshift.io/api/badge/repositories/
      <id>`) and add to README + vibexforge.com homepage.

Post → day 1:
- [ ] Screenshot the post's final rank, save to `docs/launches/`
- [ ] DM the first 5 people who posted their own project URL in
      comments — ask what worked and what didn't from the review
- [ ] Log any Claude reviews that landed badly (wrong category,
      hallucinated feature) to `docs/launches/review-failures.md`

---

## Distribution multiplier (post-HN)

Within 6 hours of the HN post:

1. Tweet the HN link with a ~40-second screen recording of a
   submission going Seed → review → "Active" stage change.
2. Post to r/SideProject with the same video (Reddit cross-posting
   is OK for Show HN; just don't spam).
3. Share in whichever Slack / Discord dev groups you're in — but
   actually link, not just "I launched something check it out".
4. Email your last 30 issues/PRs commenters with a 2-sentence note
   and the link. That's 30 people who already engage with your
   code; they'll click.

Don't do:
- Tweet-storm with more than 1 launch mention per 4 hours
- Buy traffic of any kind
- Ask specific friends to upvote on HN (you will get sandbagged)

---

## What to measure in the first 48 hours

| Metric | Where | Target |
|---|---|---|
| HN post final position | news.ycombinator.com | top 30 of day |
| Unique visitors | Vercel Analytics | 2k+ |
| Projects submitted | `SELECT count(*) FROM projects WHERE created_at > ...` | 10+ |
| `/api/ai/review` calls | same | 100+ |
| Sentry errors | Sentry dashboard | <5/day |
| Reviews where user messaged you | manual | 3+ |

Below the first 3 targets is a signal to iterate, not to push
harder. Above the first 3 targets is a signal that the core
product works and you should focus on the gap between "visitor"
and "submitted".
