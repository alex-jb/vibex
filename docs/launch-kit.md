# VibeXForge Launch Kit — 2026-04-17

Ready-to-post copy for the first 10 real users.

Goal: validate that the Launch Feedback Loop's Claude reviews are actually useful
(not just technically functional). Ship to YC friends, Twitter followers,
Discord, HN. Let the data decide what to build next.

---

## 1. Show HN post

**Title:**

> Show HN: VibeXForge — Paste your AI project's URL, get 7 concrete improvements from Claude

**Body (~180 words):**

```
I kept shipping AI side projects and hearing silence. The code was fine.
The landing page was killing the click-through — weak headline, too many
buzzwords, no clear "what does this do" in the first 5 seconds.

I wanted a senior product designer to glance at my page and tell me the
3 things to fix. I couldn't find one who works at the speed I ship.

VibeXForge is that reviewer, powered by Claude Sonnet 4.6.

Paste a URL → we scrape the page + README → Claude reads it like a
stranger who just clicked in from Twitter → you get 5-7 structured
actions. Each one has a 1-line rationale, an exact copy-pasteable
suggestion, and an Apply/Skip/Reject button.

Built on Next.js 16, Supabase (RLS + realtime), Anthropic tool_use for
structured output. Source-available on GitHub. Runs in mock mode with
zero config.

Live: https://www.vibexforge.com/launch
Repo: https://github.com/alex-jb/vibex

I'm looking for the next 9 users who'd give me back the actions Claude
returned for their URL — which ones landed, which ones missed. That's
what I need to tune next.
```

**After posting:** reply to the first 5 comments within 15 min. HN rewards fast engagement.

---

## 2. Twitter / X launch thread (7 tweets)

**1/7**
```
I kept shipping AI projects.
Nobody clicked.
My code was fine. My landing page was killing me.

Spent the last 6 weeks building the tool I wished existed:
a senior product reviewer powered by Claude that reads your page
like a stranger and tells you exactly what to fix.

vibexforge.com 🔗
```

**2/7** (image: landing hero — `docs/screenshots-v2/01-landing.png`)
```
The loop is 3 steps:

▸ Paste any AI project URL
▸ Claude Sonnet 4.6 reviews it like a first-time visitor
▸ Get 5-7 specific, clickable improvements

That's it. No course. No coaching call. Just the feedback.
```

**3/7** (image: project detail showing the loop — `docs/screenshots-v2/04-project.png`)
```
Each review action has:
- A 1-line rationale (why it matters)
- A copy-pasteable suggestion (what to write)
- Apply / Skip / Reject (your state persists)

Come back next week, rerun. Score climbs or doesn't. No mystery.
```

**4/7**
```
Tech:
- Next.js 16 App Router
- Supabase (Postgres + RLS + realtime leaderboard)
- Claude Sonnet 4.6 with tool_use (structured JSON, not prose)
- Tailwind v4 + custom pixel-art chrome for fun
- Source-available @ github.com/alex-jb/vibex
```

**5/7** (image: hunt page — `docs/screenshots-v2/03-hunt.png`)
```
Everyone's project lands on /hunt.
Realtime leaderboard, daily + weekly.
You can see which AI side projects are getting the most traction and
why — the top ones always have cleaner landing pages.

Wild what a good headline does.
```

**6/7**
```
What's next:
I want the next 10 users to run their own URL through it and DM me
the actions Claude returned.

Which ones landed?
Which ones missed?
That's what I tune.

No signup friction. GitHub OAuth, click, paste, go.
```

**7/7**
```
Live: vibexforge.com/launch
Source: github.com/alex-jb/vibex

If you're shipping an AI product this week, I'd love to see what
Claude says about yours.

Reply with your URL if you want me to do it for you.
```

---

## 3. Friend DM template (Discord / Twitter DM / text)

```
hey — I shipped a side project today. it's an AI that reviews your AI
project's landing page and tells you the 3 things to fix. paste any URL,
get 7 concrete suggestions in 30 seconds.

doing a tiny beta with like 10 people. would love if you ran it on one of
your URLs and told me if the suggestions were useful or garbage.

no account unless you want to save it. github oauth if you do.
https://www.vibexforge.com/launch

(truth: I built this because my own projects kept flopping and I wanted a
senior PM in my pocket. if you've felt the same thing lmk)
```

Send to:
- [ ] 3 YC friends building AI
- [ ] 3 builders from your Discord
- [ ] 2 followers who reply to your tweets
- [ ] 2 people you met at a meetup last month

---

## 4. Product Hunt (optional, later)

Hold off. Product Hunt is one-shot distribution. Do it in 2-3 weeks after:
- [x] 10 real users have gone through the loop
- [ ] You've tuned the Claude prompt based on their feedback
- [ ] At least 3 reviews on Product Hunt are stacked and ready to drop

The PH launch is your *second* push, not your first.

---

## Metrics to watch for the first 48 hours

| Metric | Target | Where |
|--------|--------|-------|
| Signups | 10+ | Supabase `auth.users` |
| Submissions | 5+ | Supabase `projects` |
| Reviews generated | 5+ | Supabase `launch_feedback_reviews` |
| Actions applied | 15+ | Supabase `launch_feedback_actions` WHERE status='applied' |
| Apply rate per review | >40% | applied / total_actions |
| Weekly return | 2+ users | auth log + submission timestamp |

**If apply rate < 20%:** Claude's actions aren't useful. Tune the prompt.
**If signup → submission conversion < 50%:** Forge friction is too high. Cut steps.
**If weekly return < 1:** Loop isn't sticky. Build the reminder email next.

---

## What NOT to do in the first 48 hours

- Don't add features based on feedback from ≤3 users
- Don't redesign anything. Ship the data gathering first.
- Don't refactor. Let the ugly code prove the idea first.
- Don't check metrics every 10 min. Once a day is fine.
