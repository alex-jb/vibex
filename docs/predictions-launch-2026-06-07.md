# `/predictions` — launch checklist & sync runbook

**Date drafted:** 2026-06-07
**Owner:** Alex
**Route:** `https://www.vibexforge.com/predictions`
**Status at handoff:** code shipped, fixture data wired, `predictions-feed`
GitHub sync **not yet live** — page renders preview data until that's set up.

---

## 1. What got built

| Path | Purpose |
| --- | --- |
| `app/predictions/page.tsx` | Server Component, 6 sections, ISR `revalidate = 1800` |
| `app/predictions/layout.tsx` | `Article` + `BreadcrumbList` + `WebPage` (with `SpeakableSpecification`) + `Dataset` JSON-LD |
| `app/predictions/opengraph-image.tsx` | Satori-rendered 1200×630 PNG matching `/investors` template |
| `components/predictions/PredictionCard.tsx` | Unified card — three variants: `prediction` (sport), `polymarket`, `stock` |
| `components/predictions/BrierAuditTable.tsx` | Per-category Brier table with coin-flip baseline + edge column |
| `components/predictions/ContrarianBadge.tsx` | Score 0-1 badge, color-coded (green / yellow / orange / red) |
| `components/predictions/SeriesTracker.tsx` | NBA Finals / Stanley Cup state + today's game inline |
| `lib/predictions/sources.ts` | Server-only fetchers, ISR-cached, fixture-fallback |

Everything is Server Components only. The only client component imported
is `<Bilingual />` — the existing one-liner in
`components/i18n/bilingual.tsx`. No client-side data fetching, no Supabase
writes, no realtime, no auth.

## 2. Preview locally

```bash
# from /Users/alexji/Desktop/vibex
npm install     # only if you haven't recently
npm run dev
# open http://localhost:3000/predictions
```

Three env vars are honored (all optional):

| Var | Default | Effect |
| --- | --- | --- |
| `PREDICTIONS_USE_FIXTURE=1` | unset | Force fixture mode regardless of repo state. Useful for screenshot QA. |
| `PREDICTIONS_FEED_REPO_URL` | `https://raw.githubusercontent.com/alex-jb/predictions-feed/main` | Switch to a fork/branch while you bootstrap. |
| `OG_DEBUG=1` | unset | (n/a here, but keep in mind — `opengraph-image.tsx` fetches Google fonts at edge time.) |

On first dev load expect a one-time ~2s SSR delay while edge fetches Google
fonts for the OG cache. After that the page should hydrate in well under
100ms because there is no client JS bundle to ship.

## 3. Wire up live data — `github.com/alex-jb/predictions-feed`

The page reads from **two** public repos via `raw.githubusercontent.com`:

1. `alex-jb/spacex-ipo-tracker` — **already exists**. Used as-is for the
   SpaceX 8 section. We parse the per-day Markdown brief at
   `briefs/YYYY-MM-DD.md`. No work needed.
2. `alex-jb/predictions-feed` — **TODO Alex, create empty repo.** The page
   walks back 5 days looking for these files at the repo root:

   ```
   sports_history.jsonl       # the live JSONL, today's open picks
   sports_settled.jsonl       # T+1 settled rows for the Brier table
   polymarket_history.jsonl   # latest snapshot per event slug
   series_state.json          # nba/nhl Finals series score
   contrarian/YYYY-MM-DD.json # daily contrarian regime
   ```

### 3a. One-time repo setup

```bash
gh repo create alex-jb/predictions-feed --public --description "Public daily feed for vibexforge.com/predictions"
git clone git@github.com:alex-jb/predictions-feed.git ~/Desktop/predictions-feed
cd ~/Desktop/predictions-feed
mkdir -p contrarian
echo "# predictions-feed\n\nDaily JSONL sync from \`~/.orallexa/markets\`. MIT." > README.md
git add . && git commit -m "init" && git push
```

### 3b. Nightly sync script

Drop this at `~/.orallexa/markets/scripts/sync_predictions_feed.sh` and chmod
+x. Run it from a launchd plist at 12:30 ET (right after the 12:00 ET
sports/polymarket cron has written its files):

```bash
#!/usr/bin/env bash
# Sync the predictions-feed public repo from local Orallexa output.
# Runs after the daily 12:00 ET sports + polymarket cron.

set -euo pipefail

SRC="$HOME/.orallexa/markets"
DST="$HOME/Desktop/predictions-feed"

# Files to copy verbatim (idempotent)
cp "$SRC/sports_history.jsonl"     "$DST/sports_history.jsonl"
cp "$SRC/sports_settled.jsonl"     "$DST/sports_settled.jsonl"
cp "$SRC/polymarket_history.jsonl" "$DST/polymarket_history.jsonl"
cp "$SRC/series_state.json"        "$DST/series_state.json"

# Contrarian — copy the last 7 days of daily JSONs
mkdir -p "$DST/contrarian"
find "$SRC/contrarian" -name '*.json' -mtime -7 -exec cp {} "$DST/contrarian/" \;

cd "$DST"

# Bail if nothing changed (avoids noisy empty commits)
if git diff --quiet; then
  echo "No changes — skipping commit"
  exit 0
fi

git add -A
git -c user.email='alex@vibexforge.com' \
    -c user.name='predictions-feed-sync' \
    commit -m "sync $(date -u +%Y-%m-%dT%H:%MZ)"
git push origin main
```

launchd plist sample (12:30 + 21:00 ET so the Brier table catches end-of-day
settlements):

```xml
<?xml version="1.0" encoding="UTF-8"?>
<plist version="1.0">
  <dict>
    <key>Label</key><string>com.vibexforge.predictions-feed</string>
    <key>ProgramArguments</key><array>
      <string>/Users/alexji/.orallexa/markets/scripts/sync_predictions_feed.sh</string>
    </array>
    <key>StartCalendarInterval</key><array>
      <dict><key>Hour</key><integer>16</integer><key>Minute</key><integer>30</integer></dict>
      <dict><key>Hour</key><integer>1</integer><key>Minute</key><integer>0</integer></dict>
    </array>
    <key>StandardOutPath</key><string>/Users/alexji/.orallexa/markets/logs/predictions-feed-sync.out</string>
    <key>StandardErrorPath</key><string>/Users/alexji/.orallexa/markets/logs/predictions-feed-sync.err</string>
  </dict>
</plist>
```

> Times above are UTC (launchd uses local-machine time, but Alex's `~/Library/LaunchAgents/` plists already use 16:30 = 12:30 ET pattern. Match the rest of the markets crons.)

### 3c. Optional: gitignore secrets

The JSONL files don't contain anything sensitive (just predictions + Brier
math). No API keys, no Polymarket account IDs, no Alex-side P&L. Safe to
publish. If that changes later, add a sanitizer step to the sync script.

## 4. Vercel deploy — what to set

```bash
# At project root, only if Alex wants the live page to use the real repo
# without rebuilding source:
vercel env add --no-sensitive --value="https://raw.githubusercontent.com/alex-jb/predictions-feed/main" PREDICTIONS_FEED_REPO_URL production --yes
# Leave PREDICTIONS_USE_FIXTURE *unset* in prod so the live repo wins.
```

That's it. The page is Server Components + ISR; there is no extra build flag
to flip.

### Vercel build-cost reminder (per AGENTS.md)

This launch is a code change → triggers ~$0.10 build. Batch with any other
pending master pushes today. `npm run build` locally before pushing.

## 5. Verify post-deploy

Run these in order. Each should pass without any auth.

- [ ] `curl -sI https://www.vibexforge.com/predictions | grep -i "200 OK"`
- [ ] Visit `/predictions` — confirm the **fixture banner is gone** (means live repo wired)
- [ ] Visit `/predictions/opengraph-image` → 1200×630 PNG renders
- [ ] Tweet a link to `/predictions` from a throwaway X account → confirm card preview shows the new OG
- [ ] HN preview at `https://news.ycombinator.com/submitlink?u=https://www.vibexforge.com/predictions` → confirm title + description
- [ ] `curl -s https://www.vibexforge.com/predictions | grep -c "application/ld+json"` → should be `1` (the layout)
- [ ] Lighthouse on `/predictions` → ≥95 perf / 100 SEO / 100 a11y
- [ ] AI Overviews check after 7-10 days: search "brier-audited AI sports predictions solo founder" → site should appear in the citations panel

## 6. Distribution kit (after live data is wired)

These are 1-line drafts only; pass through marketing-agent for the full
multi-platform render.

- **HN** — "Show HN: I'm a solo founder publishing Brier-audited AI sports + Polymarket picks daily"
- **X** — "Built FiveThirtyEight in a weekend. NBA Finals, World Cup, SpaceX 8, Polymarket — all Brier-scored. No paywall. → vibexforge.com/predictions"
- **r/sportsbook** — "Brier-scored AI sports picks (free, no signup). NBA / NHL Finals + MLB today. Edge column shows whether we're beating the line."
- **Dev.to** — "How I built a self-auditing prediction site as a solo founder (Next.js 16 Server Components + GitHub raw + ISR)"
- **小红书** — "我做了一个独立开发者的 AI 预测面板,Brier 校准,无付费墙"
- **LinkedIn** — "Calibration > confidence. Here's the public Brier-scored dashboard I run."

## 7. Known limitations / next iteration

- **Real-time NBA quarter scores**: not built. Would need ESPN scoreboard
  poll or socket — defer until launch traction warrants the spend.
- **Historical Brier chart**: today only shows cumulative-by-category. A
  trailing 30-day line chart would be the next visual upgrade.
- **Notifications email**: not built. Funnel-analytics-agent can drop a
  daily 12:00 ET digest into Alex's existing Resend list when ready.
- **CLV (closing line value) column**: the SettledPrediction shape already
  carries `clv_pp` from upstream — surface it in the Brier table once
  `predictions-feed` has 30+ settled rows.
- **MLS / NHL split**: currently lumped under "Other sports". When more than
  6 rows accumulate, split into their own card grids.

## 8. Why this exists

The pitch: "I built FiveThirtyEight as a solo founder, and the Brier-score
table makes it impossible for me to lie about how well it's actually
working." Every visitor can verify the math from the GitHub raw URLs at the
bottom of the page. That's the moat — not the predictions, the calibration.
