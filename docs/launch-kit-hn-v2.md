# VibeX — HN Show Post v3 (2026-04-21 refresh, post-Direction A)

Supersedes v2 (2026-04-17) after the two-day Direction A visual system
rollout: 29 commits unifying a forge / pixel / RPG character sheet
vocabulary across every user-facing surface.

Key differences from v2:

- Adds **"The forge experience"** as the second differentiator alongside
  the RPG-evolution framing. The forge sequence (STRIKE THE ANVIL button
  → 3.5s forge-unveil animation on the destination page) is the post-
  submit reward loop HN readers will remember 24 hours later. v2 didn't
  have it because it wasn't built yet.
- Post body references the anvil explicitly — that's the specific visual
  phrase that makes the screenshots legible without explanation.
- Shipping honesty section now has two hooks to choose from: the
  migration-audit story (v2) + the Direction A shipping marathon
  (29 commits, 2 days) — pick the one that matches the DEV.to article
  you lead with.

---

## Primary HN Show post

**Title (68 chars — under the 80-char cutoff):**

```
Show HN: VibeX – Turn your AI project into a collectible RPG hero
```

**Body (~240 words):**

```
I spent 6 weeks building a launch platform for AI-native projects.
Shipping the first 10 users outside my circle this week.

The framing: your AI project is a 16-bit RPG hero. Paste a URL or a
GitHub repo → Claude Haiku 4.5 scores it across five dimensions
(originality, clarity, UX, virality, investor curiosity) and returns
named strengths / weaknesses / suggestions. The compound score sets
your starting evolution stage (Seed → Active → Growing → Breakout →
Legend → Myth). Projects evolve afterward on real traction — plays,
upvotes, shares — not a 24-hour upvote contest.

The submit flow is the part I'm proudest of. Every form field is a
forge plate that heats orange as you fill it. A live hero card on
the right builds in real time as you type. When you hit "STRIKE THE
ANVIL," the card shakes, pixel sparks fly, you land on the project
page, and a 3.5-second unveil plays: the frame color reveals your
Claude-assigned stage, the compound score rolls up from 0, the five
attribute bars fire in sequence. The whole thing feels like forging
a character in a JRPG. Which is the point.

Stack: Next.js 16, Supabase (RLS + Realtime), Claude Sonnet 4.6 for
launch packages, Haiku 4.5 for reviews. Source-available on GitHub.

Shipping honesty: the visual system above was 29 commits across two
days. Before that, the review panel was generic shadcn; now it shares
vocabulary with the HeroCard, the OG share image, and the /launch
forge. Single design token canon across 30+ surfaces.

Live: https://www.vibexforge.com
Submit your project: https://www.vibexforge.com/launch
Repo: https://github.com/alex-jb/vibex

I want the next 10 users. Submit your AI project, screenshot the
forged review page, tell me which Claude suggestions landed and
which ones missed. That's the only feedback loop I care about.
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

## The forge experience — new section vs v2

This is the paragraph to drop into replies when someone asks "why
not just add another Claude review app". It's the non-LLM product
memory that differentiates.

```
The Claude review is table stakes — anyone can wrap Claude + a
form. The thing I care about is the ritual around the commit.

Most submit buttons are gradient-purple "Submit Project" buttons
that feel identical to "Subscribe to Newsletter." That button is
where most AI tools kill their emotional payoff.

VibeX's submit button is called STRIKE THE ANVIL. It's orange,
cream-framed, 3D-shadowed, Press Start 2P font. While you're
waiting for Claude (8 seconds), the live preview card shakes on
a 0.45s loop like it's being hammered, and six pixel sparks radiate
out with forge-fire colors. When the review comes back, you get
redirected to /project/:id?forged=1 and a 3.5-second unveil plays:

- 0.6s: frame color animates from Seed grey to your Claude-assigned
  stage color (magenta = Breakout, red = Legend, pink = Myth).
- 1.4s: compound score counts up from 0 to your actual score.
- 1.8s onward: five attribute bars fire in sequence, 0.25s apart.

The whole thing takes 3.5 seconds. It makes submitting feel like
forging a hero card in a JRPG, not filling out a form. Which is
the point.
```

---

## Reply templates (pre-write these before posting)

**"How is this different from Product Hunt?"**

```
Three concrete differences.

PH is a 24-hour upvote contest — you launch once, you spike, it's
over. VibeX projects keep leveling up. A Seed today can be Myth in
3 months if the product actually works.

PH upvotes are anonymous and unstructured. VibeX reviews are Claude
against a published rubric (5 dimensions, 0–100 each, with named
strengths / weaknesses / suggestions).

The submit flow itself is designed as a reward, not a chore. Forge
plates heat up as you type. The submit button is called STRIKE THE
ANVIL. Post-submit is a 3.5s unveil where Claude's verdict
materializes piece by piece. PH is built for novelty; VibeX is
built for the loop.
```

**"Isn't this just Claude + a UI?"**

```
The Claude part is the 10% easy. The 90% hard splits into two:

(1) The data moat: which projects evolved from which stage, which
Claude suggestions got applied vs dismissed, which categories are
heating up. That loop is what the LLM call alone can't give you.

(2) The commit ritual: forge plates, live preview, anvil strike,
3.5s unveil. None of that is LLM. That's where most AI tools kill
their emotional payoff with a generic "Submit" button, and where
I've spent disproportionate time.

Right now there are 14 projects and 2 real users. Ask me again at
50 and the data moat will actually mean something.
```

**"Why source-available instead of MIT?"**

```
Honest answer: I'm a solo founder and I'd like the optionality
to not be cloned and hosted cheaper by someone else on day 30.
The license lets you read every line, fork for personal use,
and contribute back. It just blocks commercial hosting. I'll
revisit if the model stops making sense. The core value is the
data moat + the commit ritual, not the code.
```

**"How do you make the submit feel rewarding?"**

```
Every form field is a rectangular "forge plate" with a 2px frame
that's grey when empty and orange when filled. The bottom of each
plate has a heat-gradient strip that animates purple-grey → bright
orange as you type. The field label is Press Start 2P pixel font
in uppercase ("▸ PROJECT TITLE") and lights up orange once the
field has content.

On the right column there's a live HeroCard preview built from the
same component that renders on /home. It reflects the title,
creator name, category in real time, but stays Seed-locked (grey
frame, pending-Claude attribute bars, compound "??" placeholder)
because the Claude verdict hasn't landed yet. That's the promise
— you're forging an empty hero; Claude strikes the score onto it.

When you hit STRIKE THE ANVIL, the card shakes and emits pixel
sparks for the 8 seconds Claude is thinking. Then the unveil plays
on the destination page. Whole thing took about 6 commits spread
across a weekend. Happy to share the framer-motion scene if anyone
wants it.
```

**"Does it support GitHub repos as input?"**

```
Yes. If you paste a github.com URL, the submit pipeline pulls your
README via the GitHub API and passes it to Claude along with your
tagline. If your README is just the GitHub "Contribute to X/Y
development..." placeholder, you should expect a low score; the
fix is to write a real README first.
```

**"How much does this cost you to run?"**

```
Today, ~$0.002 per submission (Claude Haiku 4.5, ~1.5k tokens
prompt + 500 tokens output). At 1,000 submissions/month that's
$2/mo on Claude, plus Supabase free tier plus Vercel free tier
— so under $20/mo for infra until I hit scale. If this ever
works, I'll eat compute. It's the data moat that pays.
```

**"Can I see the forge unveil animation?"**

```
Three clips on the README:
- STRIKE THE ANVIL button + redirect (docs/clips-v3/01-strike.mp4)
- /project/:id?forged=1 unveil (docs/clips-v3/02-unveil.mp4)
- HeroCard grid on /home (docs/clips-v3/03-grid.mp4)

Or just submit your URL at vibexforge.com/launch — it'll play
naturally.
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
- [ ] Add a top-level comment yourself: "A few things I should have
      said upfront" — answer the 3 most-asked questions in advance.
      Include the "forge experience" paragraph verbatim; it's the
      one non-obvious differentiator HN readers won't surface on
      their own from the post body.

Post → first 2 hours:
- [ ] Don't edit the post body after it's voted past 15 points.
      Edits reset some of the ranking signals.
- [ ] Watch the logs (Vercel → Functions → `/api/projects/submit`
      + `/api/ai/review`). Rate limits are set to 20/min/IP on
      `/api/ai/review` — that's ~1200/hr capacity, should be fine.
- [ ] **Submit `alex-jb/vibex` to trendshift.io** (right column,
      "Submit repository" button). If <20 stars, use the manual
      review path with the reason template. Trendshift ranks by
      *same-day* star velocity, so the HN spike is exactly when
      it'll catch.

Post → day 1:
- [ ] Screenshot the post's final rank, save to `docs/launches/`
- [ ] DM the first 5 people who posted their own project URL in
      comments — ask what worked and what didn't from the review
- [ ] Log any Claude reviews that landed badly to
      `docs/launches/review-failures.md`

---

## Distribution multiplier (post-HN)

Within 6 hours of the HN post:

1. Tweet the HN link with the forge-unveil Cap clip (clips-v3/02-
   unveil.mp4) as the attached media. This clip is the highest-
   retweet-rate asset you have — the whole tweet is "here's the
   moment of impact, 10 seconds."
2. Post to r/SideProject with the same clip (Reddit cross-posting
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
| Cap-clip-02 plays on Twitter | X Analytics | 5k+ |

Below the first 3 targets is a signal to iterate, not to push
harder. Above the first 3 targets is a signal that the core
product works and you should focus on the gap between "visitor"
and "submitted".
