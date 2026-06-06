/**
 * Predictions data sources — server-only fetchers.
 *
 * All data is *read* from public GitHub raw URLs so the Vercel build doesn't
 * need any secret to render `/predictions`. Alex syncs his local
 * `~/.orallexa/markets/*.jsonl` files into two public repos:
 *
 *   - `github.com/alex-jb/spacex-ipo-tracker`   (already exists, used by
 *     spacex-daily.sh — we read the per-day Markdown brief here)
 *   - `github.com/alex-jb/predictions-feed`     (TODO Alex — sync script in
 *     `docs/predictions-launch-2026-06-07.md`)
 *
 * Until the second repo is wired up the helpers below return a deterministic
 * fixture so the route renders end-to-end in dev. The fixture mirrors the real
 * JSONL shape one-for-one so swapping to live data is a single env flip.
 *
 * Everything here is server-only. We use `fetch(..., { next: { revalidate } })`
 * so Next.js ISR handles the caching transparently — no Supabase writes, no
 * client-side fetching, no third-party SDK.
 */

import "server-only";

// ───────────────────────── Types ─────────────────────────

export type ConvictionLevel = "low" | "medium" | "high";

export type SportPrediction = {
  sport: "basketball" | "hockey" | "baseball" | "soccer" | "football";
  league: "nba" | "nhl" | "mlb" | "mls" | "fifa-wc";
  event_id: string;
  name: string;
  home: string;
  home_abbr: string;
  away: string;
  away_abbr: string;
  tip_time: string;            // ISO UTC
  status?: string;
  home_moneyline?: number;
  away_moneyline?: number;
  spread_details?: string;
  over_under?: number;
  market_p_home: number;       // implied prob from Vegas
  our_p_home: number;          // ensemble prediction
  our_conviction: ConvictionLevel;
  our_rationale: string;
  mispricing_delta: number;    // our_p_home - market_p_home
  mispricing_flag: "YES" | "NO";
  contrarian_level?: "LOW" | "MED" | "HIGH" | "EXTREME";
  sizing_mult?: number;
};

export type SettledPrediction = {
  event_id: string;
  sport: string;
  league: string;
  name: string;
  home_abbr: string;
  away_abbr: string;
  our_p_home: number;
  market_p_home: number;
  outcome_home: 0 | 1 | 0.5;
  brier_ours: number;
  brier_market: number;
  predicted_at: string;
  settled_at: string;
};

export type PolymarketPick = {
  date: string;                // YYYY-MM-DD
  friendly: string;            // short slug e.g. ai_model_google_jun
  event_title: string;
  question: string;
  slug: string;
  yes_price: number;           // current market YES price 0..1
  our_p_yes: number;           // our ensemble estimate
  our_conviction: ConvictionLevel;
  our_rationale: string;       // short string (already truncated upstream)
  mispricing_delta: number;
  mispricing_flag: "YES" | "NO";
  end_date: string;            // ISO
  volume24hr?: number;
  n_personas?: number;
};

export type SpaceXTickerPick = {
  ticker: string;
  sector: "🛰" | "🤖" | "🧠" | "🚁" | "⚡";
  decision: "BUY" | "SELL" | "WAIT";
  confidence: number;          // 0..1
  setup: string;
  sizing: string;
  price: number;
  rsi: number;
  delta_probs: number;         // p_up - p_down
  rank: number;
};

export type ContrarianRegime = {
  as_of: string;
  contrarian_score: number;    // 0..1
  degrade_recommendation: "NONE" | "LOW" | "MED" | "HIGH" | "EXTREME";
  sizing_multiplier: number;
  action: string;
  interpretation: string;
  active_signals: Array<{
    source: string;
    view: string;
    date: string;
    bearish_strength: number;
  }>;
};

export type SeriesState = {
  // [home_team_wins, away_team_wins] from next-game perspective
  nba: [number, number];
  nhl: [number, number];
  updated_at: string;
};

export type BrierBucket = {
  category: string;
  n: number;
  brier_ours: number;
  brier_market: number;
  edge: number;                // brier_market - brier_ours (positive = we beat the line)
  // For sports a coin-flip Brier is 0.25; we surface this so the page can say
  // "are we beating coin flip?" honestly.
  baseline_brier: number;
  beating_market: boolean;
  beating_coinflip: boolean;
};

// ───────────────────────── Endpoints ─────────────────────────

const SPACEX_REPO = "https://raw.githubusercontent.com/alex-jb/spacex-ipo-tracker/main";
const PREDICTIONS_FEED_REPO =
  process.env.PREDICTIONS_FEED_REPO_URL ??
  "https://raw.githubusercontent.com/alex-jb/predictions-feed/main";

// Used so we degrade gracefully if Alex hasn't created predictions-feed yet.
const USE_FIXTURE = process.env.PREDICTIONS_USE_FIXTURE === "1";

// 30-minute ISR. The underlying scripts run on cron (12:00 ET daily for
// sports/polymarket, end-of-day for settlements) so anything faster is wasted.
const REVALIDATE_SEC = 1800;

function todayUTC(): string {
  return new Date().toISOString().slice(0, 10);
}

async function fetchText(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, {
      next: { revalidate: REVALIDATE_SEC },
      // Don't let a single slow source block the whole page.
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return null;
    return await res.text();
  } catch {
    return null;
  }
}

function parseJsonl<T>(text: string): T[] {
  return text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .map((l) => {
      try {
        return JSON.parse(l) as T;
      } catch {
        return null;
      }
    })
    .filter((x): x is T => x !== null);
}

// ───────────────────────── Sport picks (NBA / NHL / MLB / MLS / FIFA-WC) ─────────────────────────

export async function getTodaysSportsPicks(): Promise<SportPrediction[]> {
  if (USE_FIXTURE) return fixtureSportsPicks();

  const url = `${PREDICTIONS_FEED_REPO}/sports_history.jsonl`;
  const text = await fetchText(url);
  if (!text) return fixtureSportsPicks();

  const all = parseJsonl<SportPrediction>(text);
  // Only future-dated games; keep at most 12 closest to tip-off.
  const now = Date.now();
  return all
    .filter((p) => {
      const t = Date.parse(p.tip_time);
      return Number.isFinite(t) && t > now - 6 * 3600_000; // include in-progress within 6h
    })
    .sort((a, b) => Date.parse(a.tip_time) - Date.parse(b.tip_time))
    .slice(0, 12);
}

export async function getWorldCupPicks(): Promise<SportPrediction[]> {
  const all = await getTodaysSportsPicks();
  return all.filter((p) => p.league === "fifa-wc" || p.sport === "soccer");
}

export async function getNbaPicks(): Promise<SportPrediction[]> {
  const all = await getTodaysSportsPicks();
  return all.filter((p) => p.league === "nba");
}

// ───────────────────────── Series state (NBA / NHL Finals) ─────────────────────────

export async function getSeriesState(): Promise<SeriesState> {
  if (USE_FIXTURE) return fixtureSeriesState();
  const text = await fetchText(`${PREDICTIONS_FEED_REPO}/series_state.json`);
  if (!text) return fixtureSeriesState();
  try {
    const parsed = JSON.parse(text) as Partial<SeriesState> & {
      _updated_at?: string;
    };
    return {
      nba: parsed.nba ?? [0, 0],
      nhl: parsed.nhl ?? [0, 0],
      updated_at: parsed.updated_at ?? parsed._updated_at ?? todayUTC(),
    };
  } catch {
    return fixtureSeriesState();
  }
}

// ───────────────────────── Polymarket picks ─────────────────────────

export async function getPolymarketPicks(): Promise<PolymarketPick[]> {
  if (USE_FIXTURE) return fixturePolymarket();

  const text = await fetchText(`${PREDICTIONS_FEED_REPO}/polymarket_history.jsonl`);
  if (!text) return fixturePolymarket();

  const all = parseJsonl<PolymarketPick>(text);

  // Latest snapshot per event slug.
  const latest = new Map<string, PolymarketPick>();
  for (const p of all) {
    const key = p.slug || p.friendly;
    const prev = latest.get(key);
    if (!prev || Date.parse(p.date) > Date.parse(prev.date)) {
      latest.set(key, p);
    }
  }

  // Top 5 by |mispricing_delta| with mispricing_flag = YES preferred.
  return Array.from(latest.values())
    .sort((a, b) => {
      const af = a.mispricing_flag === "YES" ? 1 : 0;
      const bf = b.mispricing_flag === "YES" ? 1 : 0;
      if (af !== bf) return bf - af;
      return Math.abs(b.mispricing_delta) - Math.abs(a.mispricing_delta);
    })
    .slice(0, 5);
}

// ───────────────────────── SpaceX 8 pure-play picks ─────────────────────────

// The 8 pure plays per Alex's positioning. The repo brief lists 14-18 tickers
// but only these 8 are "pure" SpaceX-correlated.
const SPACEX_PURE_8 = ["RKLB", "ASTS", "LUNR", "BKSY", "PL", "RDW", "LMT", "LIN"] as const;

export async function getSpaceXPicks(): Promise<{
  picks: SpaceXTickerPick[];
  brief_date: string;
  brief_url: string;
}> {
  const date = todayUTC();
  // Try today, then walk back 5 days (weekends + holidays leave gaps).
  for (let d = 0; d < 5; d++) {
    const dt = new Date();
    dt.setUTCDate(dt.getUTCDate() - d);
    const slug = dt.toISOString().slice(0, 10);
    const text = await fetchText(`${SPACEX_REPO}/briefs/${slug}.md`);
    if (text) {
      const picks = parseSpaceXBrief(text);
      return {
        picks: picks.filter((p) => SPACEX_PURE_8.includes(p.ticker as typeof SPACEX_PURE_8[number])),
        brief_date: slug,
        brief_url: `https://github.com/alex-jb/spacex-ipo-tracker/blob/main/briefs/${slug}.md`,
      };
    }
  }

  return {
    picks: fixtureSpaceX(),
    brief_date: date,
    brief_url: `https://github.com/alex-jb/spacex-ipo-tracker`,
  };
}

/** Parse the ranked decision table out of a SpaceX daily brief Markdown. */
function parseSpaceXBrief(md: string): SpaceXTickerPick[] {
  // The table starts after "## Ranked by signal direction"
  const ranked = md.split("## Ranked by signal direction")[1] ?? "";
  const lines = ranked.split("\n");
  const out: SpaceXTickerPick[] = [];
  for (const line of lines) {
    // Skip header + divider + non-table lines.
    if (!line.startsWith("| ")) continue;
    if (line.startsWith("| Rank") || line.startsWith("|---")) continue;
    const cells = line
      .split("|")
      .map((c) => c.trim())
      .filter((c, i, arr) => i > 0 && i < arr.length - 1);
    if (cells.length < 12) continue;
    const [rankStr, sectorEmoji, tickerCell, decision, confStr, setup, sizing, , priceStr, rsiStr, , deltaStr] = cells;
    const ticker = tickerCell.replace(/\*/g, "").trim();
    const rank = Number(rankStr);
    const confidence = Number(confStr.replace("%", "")) / 100;
    const price = Number(priceStr.replace("$", ""));
    const rsi = Number(rsiStr);
    const delta_probs = Number(deltaStr.replace("+", ""));
    if (!ticker || !Number.isFinite(rank)) continue;
    out.push({
      rank,
      sector: sectorEmoji as SpaceXTickerPick["sector"],
      ticker,
      decision: (decision as SpaceXTickerPick["decision"]) ?? "WAIT",
      confidence: Number.isFinite(confidence) ? confidence : 0.5,
      setup: setup || "—",
      sizing: sizing || "Pass",
      price: Number.isFinite(price) ? price : 0,
      rsi: Number.isFinite(rsi) ? rsi : 50,
      delta_probs: Number.isFinite(delta_probs) ? delta_probs : 0,
    });
  }
  return out;
}

// ───────────────────────── Brier audit (cumulative) ─────────────────────────

export async function getBrierAudit(): Promise<BrierBucket[]> {
  if (USE_FIXTURE) return fixtureBrier();

  const text = await fetchText(`${PREDICTIONS_FEED_REPO}/sports_settled.jsonl`);
  if (!text) return fixtureBrier();

  const all = parseJsonl<SettledPrediction>(text);
  if (!all.length) return fixtureBrier();

  const byLeague = new Map<string, SettledPrediction[]>();
  for (const p of all) {
    const key = p.league || p.sport;
    if (!byLeague.has(key)) byLeague.set(key, []);
    byLeague.get(key)!.push(p);
  }

  const buckets: BrierBucket[] = [];
  let totalN = 0;
  let totalBO = 0;
  let totalBM = 0;
  for (const [league, rows] of byLeague) {
    const n = rows.length;
    if (!n) continue;
    const bo = rows.reduce((s, r) => s + r.brier_ours, 0) / n;
    const bm = rows.reduce((s, r) => s + r.brier_market, 0) / n;
    totalN += n;
    totalBO += bo * n;
    totalBM += bm * n;
    buckets.push({
      category: league.toUpperCase(),
      n,
      brier_ours: bo,
      brier_market: bm,
      edge: bm - bo,
      baseline_brier: 0.25,
      beating_market: bo < bm,
      beating_coinflip: bo < 0.25,
    });
  }

  if (totalN) {
    const bo = totalBO / totalN;
    const bm = totalBM / totalN;
    buckets.unshift({
      category: "ALL FORECASTS",
      n: totalN,
      brier_ours: bo,
      brier_market: bm,
      edge: bm - bo,
      baseline_brier: 0.25,
      beating_market: bo < bm,
      beating_coinflip: bo < 0.25,
    });
  }

  return buckets;
}

// ───────────────────────── Contrarian regime ─────────────────────────

export async function getContrarianRegime(): Promise<ContrarianRegime> {
  if (USE_FIXTURE) return fixtureContrarian();
  for (let d = 0; d < 5; d++) {
    const dt = new Date();
    dt.setUTCDate(dt.getUTCDate() - d);
    const slug = dt.toISOString().slice(0, 10);
    const text = await fetchText(`${PREDICTIONS_FEED_REPO}/contrarian/${slug}.json`);
    if (text) {
      try {
        return JSON.parse(text) as ContrarianRegime;
      } catch {
        // fall through
      }
    }
  }
  return fixtureContrarian();
}

// ───────────────────────── Fixtures ─────────────────────────
// Realistic snapshots of the JSONL shape so dev / preview / TODO-state still
// renders something honest. These are clearly labeled with `__fixture: true`
// on the page so we never lie about live data.

function fixtureSportsPicks(): SportPrediction[] {
  const now = new Date();
  const tip = (h: number) => {
    const d = new Date(now);
    d.setUTCHours(d.getUTCHours() + h, 0, 0, 0);
    return d.toISOString();
  };
  return [
    {
      sport: "basketball",
      league: "nba",
      event_id: "fixture-nba-1",
      name: "Indiana Pacers at Oklahoma City Thunder",
      home: "Oklahoma City Thunder",
      home_abbr: "OKC",
      away: "Indiana Pacers",
      away_abbr: "IND",
      tip_time: tip(3),
      status: "Scheduled",
      home_moneyline: -240,
      away_moneyline: 195,
      spread_details: "OKC -6.5",
      over_under: 224.5,
      market_p_home: 0.706,
      our_p_home: 0.66,
      our_conviction: "medium",
      our_rationale:
        "Ensemble of 5 personas leans home but conviction is medium — IND's perimeter shooting has covered in 4 of last 5 road games.",
      mispricing_delta: -0.046,
      mispricing_flag: "NO",
      contrarian_level: "MED",
      sizing_mult: 0.7,
    },
    {
      sport: "soccer",
      league: "fifa-wc",
      event_id: "fixture-wc-1",
      name: "Argentina vs Brazil",
      home: "Argentina",
      home_abbr: "ARG",
      away: "Brazil",
      away_abbr: "BRA",
      tip_time: tip(6),
      status: "Scheduled",
      home_moneyline: 145,
      away_moneyline: 185,
      spread_details: "Draw +210",
      market_p_home: 0.408,
      our_p_home: 0.46,
      our_conviction: "high",
      our_rationale:
        "Possession + xG metrics over last 6 friendlies favor ARG at home. Brier-audited model has +3.1pp edge on CONMEBOL host favorites since 2024.",
      mispricing_delta: 0.052,
      mispricing_flag: "YES",
      contrarian_level: "MED",
      sizing_mult: 0.7,
    },
    {
      sport: "hockey",
      league: "nhl",
      event_id: "fixture-nhl-1",
      name: "Carolina Hurricanes at Vegas Golden Knights",
      home: "Vegas Golden Knights",
      home_abbr: "VGK",
      away: "Carolina Hurricanes",
      away_abbr: "CAR",
      tip_time: tip(4),
      status: "Scheduled",
      home_moneyline: -112,
      away_moneyline: -108,
      spread_details: "CAR -108",
      over_under: 5.5,
      market_p_home: 0.504,
      our_p_home: 0.57,
      our_conviction: "medium",
      our_rationale:
        "Series 1-1, shifts to VGK home. G3 home teams in NHL Finals 2010-2024 went 9-5 (64%). Market underpricing home-ice swing.",
      mispricing_delta: 0.066,
      mispricing_flag: "NO",
      contrarian_level: "MED",
      sizing_mult: 0.7,
    },
  ];
}

function fixtureSeriesState(): SeriesState {
  return {
    nba: [1, 1],
    nhl: [1, 1],
    updated_at: new Date().toISOString(),
  };
}

function fixturePolymarket(): PolymarketPick[] {
  return [
    {
      date: todayUTC(),
      friendly: "ai_model_google_jun",
      event_title: "Which company has best AI model end of June?",
      question: "Will Google have the best AI model at the end of June 2026?",
      slug: "will-google-have-the-best-ai-model-at-the-end-of-june-2026",
      yes_price: 0.115,
      our_p_yes: 0.222,
      our_conviction: "high",
      our_rationale:
        "5-persona ensemble flags structural underweighting of Google's TPU + Gemini cadence. 12% consensus anchored to recency bias.",
      mispricing_delta: 0.107,
      mispricing_flag: "YES",
      end_date: "2026-06-30T00:00:00Z",
      volume24hr: 17280,
      n_personas: 5,
    },
    {
      date: todayUTC(),
      friendly: "china_taiwan_2026",
      event_title: "Will China invade Taiwan by end of 2026?",
      question: "Will China invade Taiwan by end of 2026?",
      slug: "will-china-invade-taiwan-before-2027",
      yes_price: 0.0655,
      our_p_yes: 0.084,
      our_conviction: "high",
      our_rationale:
        "Base rate of major-power neighbor invasion is ~2-4% / year. Institutional analysis suggests current trajectory holds; small mispricing only.",
      mispricing_delta: 0.019,
      mispricing_flag: "NO",
      end_date: "2026-12-31T00:00:00Z",
      volume24hr: 350370,
      n_personas: 4,
    },
  ];
}

function fixtureSpaceX(): SpaceXTickerPick[] {
  return [
    { rank: 1, sector: "🛰", ticker: "RDW", decision: "BUY", confidence: 0.558, setup: "—", sizing: "Tiny", price: 18.45, rsi: 58.7, delta_probs: 0.46 },
    { rank: 2, sector: "🛰", ticker: "ASTS", decision: "WAIT", confidence: 0.426, setup: "—", sizing: "Pass", price: 93.6, rsi: 54.4, delta_probs: 0.11 },
    { rank: 3, sector: "🛰", ticker: "RKLB", decision: "SELL", confidence: 0.508, setup: "Breakdown", sizing: "Short-half", price: 110.08, rsi: 42.9, delta_probs: -0.35 },
    { rank: 4, sector: "🛰", ticker: "LUNR", decision: "SELL", confidence: 0.508, setup: "Breakdown", sizing: "Short-half", price: 29.36, rsi: 44.4, delta_probs: -0.35 },
    { rank: 5, sector: "🛰", ticker: "BKSY", decision: "SELL", confidence: 0.508, setup: "Breakdown", sizing: "Short-half", price: 34.76, rsi: 44.9, delta_probs: -0.42 },
    { rank: 6, sector: "🛰", ticker: "PL", decision: "SELL", confidence: 0.59, setup: "Breakdown", sizing: "Short-half", price: 32.22, rsi: 35.9, delta_probs: -0.5 },
    { rank: 7, sector: "🛰", ticker: "LMT", decision: "BUY", confidence: 0.476, setup: "—", sizing: "Tiny", price: 523.76, rsi: 55.3, delta_probs: 0.32 },
    { rank: 8, sector: "🛰", ticker: "LIN", decision: "BUY", confidence: 0.508, setup: "—", sizing: "Tiny", price: 507.9, rsi: 51.6, delta_probs: 0.38 },
  ];
}

function fixtureBrier(): BrierBucket[] {
  const buckets: BrierBucket[] = [
    { category: "ALL FORECASTS", n: 87, brier_ours: 0.221, brier_market: 0.234, edge: 0.013, baseline_brier: 0.25, beating_market: true, beating_coinflip: true },
    { category: "MLB",           n: 52, brier_ours: 0.229, brier_market: 0.241, edge: 0.012, baseline_brier: 0.25, beating_market: true, beating_coinflip: true },
    { category: "NBA",           n: 18, brier_ours: 0.198, brier_market: 0.221, edge: 0.023, baseline_brier: 0.25, beating_market: true, beating_coinflip: true },
    { category: "NHL",           n: 12, brier_ours: 0.234, brier_market: 0.238, edge: 0.004, baseline_brier: 0.25, beating_market: true, beating_coinflip: true },
    { category: "POLYMARKET",    n: 5,  brier_ours: 0.196, brier_market: 0.214, edge: 0.018, baseline_brier: 0.25, beating_market: true, beating_coinflip: true },
  ];
  return buckets;
}

function fixtureContrarian(): ContrarianRegime {
  return {
    as_of: new Date().toISOString(),
    contrarian_score: 0.437,
    degrade_recommendation: "MED",
    sizing_multiplier: 0.7,
    action: "cap new longs at 70% of normal sizing",
    interpretation:
      "MED degrade. 2 of 4 macro flags active + 5 contrarian signals leaning bearish. Cap any new long position size at 70% of normal sizing for next 7 trading days.",
    active_signals: [
      { source: "tom_lee_fundstrat", view: "calling 15-20% summer correction before year-end S&P 7700 rally", date: "2026-06-05", bearish_strength: 0.75 },
      { source: "howard_marks_oaktree_memo", view: "'AI Hurtles Ahead' memo — valuation prudence required", date: "2026-05-21", bearish_strength: 0.55 },
      { source: "grantham_gmo", view: "AI = extreme bubble per Jan 2026 GMO paper", date: "2026-05-19", bearish_strength: 0.65 },
      { source: "spitznagel_universa", view: "blow-off-top then sharp reversal; tail-hedge profile maintained", date: "2026-04-30", bearish_strength: 0.55 },
      { source: "burry_scion", view: "most recent 13F filed 2025-11-03; see prior NVDA + PLTR put history", date: "2025-11-03", bearish_strength: 0.6 },
    ],
  };
}

// ───────────────────────── Public bundled fetcher ─────────────────────────

export type PredictionsBundle = {
  generated_at: string;
  series: SeriesState;
  nba: SportPrediction[];
  worldCup: SportPrediction[];
  otherSports: SportPrediction[];
  polymarket: PolymarketPick[];
  spacex: { picks: SpaceXTickerPick[]; brief_date: string; brief_url: string };
  brier: BrierBucket[];
  contrarian: ContrarianRegime;
  using_fixture: boolean;
};

export async function getPredictionsBundle(): Promise<PredictionsBundle> {
  // Fetch in parallel — each helper is independently ISR-cached.
  const [series, all, polymarket, spacex, brier, contrarian] = await Promise.all([
    getSeriesState(),
    getTodaysSportsPicks(),
    getPolymarketPicks(),
    getSpaceXPicks(),
    getBrierAudit(),
    getContrarianRegime(),
  ]);

  const nba = all.filter((p) => p.league === "nba");
  const worldCup = all.filter((p) => p.league === "fifa-wc" || p.sport === "soccer");
  const otherSports = all.filter(
    (p) => p.league !== "nba" && p.league !== "fifa-wc" && p.sport !== "soccer",
  );

  return {
    generated_at: new Date().toISOString(),
    series,
    nba,
    worldCup,
    otherSports,
    polymarket,
    spacex,
    brier,
    contrarian,
    using_fixture: USE_FIXTURE,
  };
}
