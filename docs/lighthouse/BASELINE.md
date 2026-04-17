# Lighthouse Baseline — vibexforge.com

Run date: 2026-04-17 (after 11 commits of GEO/UI/submit fixes)
Tool: Chrome DevTools Lighthouse via chrome-devtools MCP
Device: desktop, navigation mode

## Scores

| Page | Accessibility | Best Practices | SEO |
|---|---|---|---|
| `/` (arcade splash) | **100** | 96 | **100** |
| `/home` (HQ dashboard) | 98 | 96 | **100** |
| `/project/2` (AgentForge) | 98 | 96 | 92 |

Performance category intentionally omitted — the chrome-devtools
tool's `performance_start_trace` is a better signal. On `/home`
it measured LCP 230 ms, CLS 0.00 during the 2026-04-17 audit.

## What the missing points are

### /project/2 — SEO 92

- **`meta-description` flagged missing** in the Lighthouse report
  despite `<meta name="description">` being present in the HTML
  (`curl` confirms it: "Build autonomous AI agents with
  drag-and-drop workflows"). Lighthouse may be evaluating the
  DOM post-hydration and something is stripping the tag — worth
  investigating but low impact (92 is still a green tile; meta
  description is one of 8 SEO audits).

### `/home` and `/project/2` — Accessibility 98

- **`heading-order`** — one non-sequential heading somewhere in
  the tree (e.g. `<h1>` followed directly by `<h3>`). Likely
  comes from the sr-only FAQ section or the AIReviewPanel
  structure. Low priority, cosmetic.

### All three — Best Practices 96

- **`errors-in-console`** — one or more browser console errors.
  Not a crash; could be Sentry noise, a late-loading asset 404,
  or a React hydration warning. Run the audit locally with
  DevTools open to attribute specific messages.

## How to re-run

```bash
# Via chrome-devtools MCP (fastest)
mcp__chrome-devtools__new_page url=https://www.vibexforge.com/
mcp__chrome-devtools__lighthouse_audit device=desktop \
  outputDirPath=/Users/alexji/Desktop/vibex/docs/lighthouse
```

Reports saved to:
- `docs/lighthouse/report.{html,json}` — /
- `docs/lighthouse/home/report.{html,json}` — /home
- `docs/lighthouse/project-2/report.{html,json}` — /project/2

## Next opportunities (ranked)

1. **Fix heading-order on /home + /project/2** (+2 pts Accessibility,
   ~15 min). Scan for `<h1>`→`<h3>` or `<h2>`→`<h4>` jumps.
2. **Silence the browser console errors** (+4 pts Best Practices,
   ~30 min). Open DevTools on each page, attribute every error, fix
   or suppress. Sentry already filters most of them — this is about
   visible noise.
3. **Investigate /project/2 meta-description miss** (+8 pts SEO,
   ~20 min). Compare HTML-in-wire vs DOM-after-hydration.
4. **Run mobile-viewport Lighthouse** — Google's mobile-first index
   weights this more heavily. Desktop scores don't guarantee mobile
   parity.

Once these land, every page should sit at ≥ 98 across all three
categories.
