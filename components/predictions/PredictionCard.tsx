import type {
  ConvictionLevel,
  PolymarketPick,
  SportPrediction,
  SpaceXTickerPick,
} from "@/lib/predictions/sources";

/**
 * Unified prediction card. One of three input shapes:
 *   - `prediction: SportPrediction`    (NBA / NHL / MLB / MLS / FIFA-WC)
 *   - `polymarket: PolymarketPick`     (binary event)
 *   - `stock:      SpaceXTickerPick`   (BUY / SELL / WAIT)
 *
 * Server Component, zero JS. Pure tailwind, mobile-first single column.
 */

type Variant =
  | { kind: "sport"; prediction: SportPrediction }
  | { kind: "polymarket"; polymarket: PolymarketPick }
  | { kind: "stock"; stock: SpaceXTickerPick };

type Props = {
  lang?: "en" | "zh";
  compact?: boolean;
} & (
  | { prediction: SportPrediction; polymarket?: never; stock?: never }
  | { polymarket: PolymarketPick; prediction?: never; stock?: never }
  | { stock: SpaceXTickerPick; prediction?: never; polymarket?: never }
);

function variantOf(props: Props): Variant {
  if ("prediction" in props && props.prediction)
    return { kind: "sport", prediction: props.prediction };
  if ("polymarket" in props && props.polymarket)
    return { kind: "polymarket", polymarket: props.polymarket };
  return { kind: "stock", stock: props.stock! };
}

const convictionStyle: Record<ConvictionLevel, string> = {
  low: "text-zinc-400",
  medium: "text-yellow-300",
  high: "text-emerald-300",
};

function ConvictionPip({ conviction }: { conviction: ConvictionLevel }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full bg-zinc-900 px-2 py-0.5 text-[10px] uppercase tracking-wider ring-1 ring-zinc-800 ${convictionStyle[conviction]}`}
    >
      <span aria-hidden>●</span>
      {conviction}
    </span>
  );
}

function fmtPct(p: number): string {
  return `${(p * 100).toFixed(1)}%`;
}

function fmtTime(iso: string, lang: "en" | "zh"): string {
  try {
    const d = new Date(iso);
    return d.toLocaleString(lang === "zh" ? "zh-CN" : "en-US", {
      weekday: "short",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
      timeZone: "America/New_York",
    }) + (lang === "zh" ? " (东部)" : " ET");
  } catch {
    return iso;
  }
}

// ───────────────────────── Sport variant ─────────────────────────

function SportCard({ p, lang, compact }: { p: SportPrediction; lang: "en" | "zh"; compact: boolean }) {
  const edge = p.our_p_home - p.market_p_home;
  const edgeColor =
    p.mispricing_flag === "YES"
      ? edge > 0
        ? "text-emerald-300"
        : "text-red-300"
      : "text-zinc-400";
  const pickHome = p.our_p_home >= 0.5;
  const pickLabel = pickHome ? p.home_abbr : p.away_abbr;
  const pickProb = pickHome ? p.our_p_home : 1 - p.our_p_home;

  return (
    <article className="rounded-2xl bg-zinc-900/60 p-5 ring-1 ring-zinc-800 transition hover:ring-zinc-700">
      <div className="mb-2 flex items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2">
          <span className="rounded bg-zinc-800 px-1.5 py-0.5 font-mono uppercase tracking-wider text-orange-300">
            {p.league.toUpperCase()}
          </span>
          <span className="text-zinc-500">{fmtTime(p.tip_time, lang)}</span>
        </div>
        <ConvictionPip conviction={p.our_conviction} />
      </div>

      <h3 className="mb-1 text-base font-semibold text-zinc-100">
        <span className="text-zinc-400">{p.away_abbr}</span>
        <span className="px-2 text-zinc-600">@</span>
        <span>{p.home_abbr}</span>
      </h3>
      {!compact && (
        <p className="mb-3 text-xs text-zinc-500">{p.name}</p>
      )}

      <div className="mb-3 grid grid-cols-3 gap-3 rounded-xl bg-zinc-950/40 p-3 text-xs">
        <div>
          <p className="text-zinc-500">{lang === "zh" ? "我们的选择" : "Our pick"}</p>
          <p className="mt-0.5 font-mono text-lg font-bold text-zinc-100 tabular-nums">
            {pickLabel} <span className="text-sm text-zinc-400">{fmtPct(pickProb)}</span>
          </p>
        </div>
        <div>
          <p className="text-zinc-500">{lang === "zh" ? "市场" : "Vegas"}</p>
          <p className="mt-0.5 font-mono text-lg tabular-nums text-zinc-300">
            {fmtPct(p.market_p_home)}
          </p>
        </div>
        <div>
          <p className="text-zinc-500">{lang === "zh" ? "差值" : "Edge"}</p>
          <p className={`mt-0.5 font-mono text-lg tabular-nums ${edgeColor}`}>
            {edge > 0 ? "+" : ""}
            {(edge * 100).toFixed(1)}pp
            {p.mispricing_flag === "YES" && (
              <span className="ml-1 text-[10px] uppercase tracking-wider text-orange-400">flag</span>
            )}
          </p>
        </div>
      </div>

      {!compact && (
        <p className="text-xs leading-5 text-zinc-400 line-clamp-3">
          {p.our_rationale}
        </p>
      )}
    </article>
  );
}

// ───────────────────────── Polymarket variant ─────────────────────────

function PolyCard({ p, lang }: { p: PolymarketPick; lang: "en" | "zh" }) {
  const edge = p.our_p_yes - p.yes_price;
  const edgeColor =
    p.mispricing_flag === "YES"
      ? edge > 0
        ? "text-emerald-300"
        : "text-red-300"
      : "text-zinc-400";
  const link = `https://polymarket.com/event/${encodeURIComponent(p.slug)}`;

  return (
    <article className="rounded-2xl bg-zinc-900/60 p-5 ring-1 ring-zinc-800 transition hover:ring-zinc-700">
      <div className="mb-2 flex items-center justify-between gap-2 text-xs">
        <span className="rounded bg-zinc-800 px-1.5 py-0.5 font-mono uppercase tracking-wider text-violet-300">
          POLYMARKET
        </span>
        <ConvictionPip conviction={p.our_conviction} />
      </div>

      <h3 className="mb-3 text-base font-semibold leading-snug text-zinc-100">
        {p.question}
      </h3>

      <div className="mb-3 grid grid-cols-3 gap-3 rounded-xl bg-zinc-950/40 p-3 text-xs">
        <div>
          <p className="text-zinc-500">{lang === "zh" ? "我们 YES" : "Our YES"}</p>
          <p className="mt-0.5 font-mono text-lg font-bold text-zinc-100 tabular-nums">
            {fmtPct(p.our_p_yes)}
          </p>
        </div>
        <div>
          <p className="text-zinc-500">{lang === "zh" ? "市场" : "Market"}</p>
          <p className="mt-0.5 font-mono text-lg tabular-nums text-zinc-300">
            {fmtPct(p.yes_price)}
          </p>
        </div>
        <div>
          <p className="text-zinc-500">{lang === "zh" ? "差值" : "Edge"}</p>
          <p className={`mt-0.5 font-mono text-lg tabular-nums ${edgeColor}`}>
            {edge > 0 ? "+" : ""}
            {(edge * 100).toFixed(1)}pp
            {p.mispricing_flag === "YES" && (
              <span className="ml-1 text-[10px] uppercase tracking-wider text-orange-400">flag</span>
            )}
          </p>
        </div>
      </div>

      <p className="mb-3 text-xs leading-5 text-zinc-400 line-clamp-3">
        {p.our_rationale}
      </p>

      <div className="flex items-center justify-between text-[11px] text-zinc-500">
        <span>
          {lang === "zh" ? "截止 " : "Closes "}
          {new Date(p.end_date).toISOString().slice(0, 10)}
        </span>
        <a
          href={link}
          target="_blank"
          rel="noreferrer"
          className="text-violet-300 hover:underline"
        >
          {lang === "zh" ? "去 Polymarket →" : "Open on Polymarket →"}
        </a>
      </div>
    </article>
  );
}

// ───────────────────────── Stock variant ─────────────────────────

function StockCard({ s, lang }: { s: SpaceXTickerPick; lang: "en" | "zh" }) {
  const decisionPalette =
    s.decision === "BUY"
      ? { color: "text-emerald-300", ring: "ring-emerald-500/40", bg: "bg-emerald-500/5" }
      : s.decision === "SELL"
        ? { color: "text-red-300", ring: "ring-red-500/40", bg: "bg-red-500/5" }
        : { color: "text-zinc-300", ring: "ring-zinc-700", bg: "bg-zinc-900/60" };

  return (
    <article className={`rounded-2xl p-5 ring-1 transition hover:ring-zinc-600 ${decisionPalette.bg} ${decisionPalette.ring}`}>
      <div className="mb-2 flex items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2">
          <span aria-hidden>{s.sector}</span>
          <span className="font-mono text-base font-bold text-zinc-100">{s.ticker}</span>
        </div>
        <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ring-1 ${decisionPalette.color} ${decisionPalette.ring}`}>
          {s.decision}
        </span>
      </div>

      <div className="mb-3 grid grid-cols-3 gap-2 rounded-xl bg-zinc-950/40 p-3 text-xs">
        <div>
          <p className="text-zinc-500">{lang === "zh" ? "价格" : "Price"}</p>
          <p className="mt-0.5 font-mono tabular-nums text-zinc-100">${s.price.toFixed(2)}</p>
        </div>
        <div>
          <p className="text-zinc-500">{lang === "zh" ? "置信度" : "Conf"}</p>
          <p className="mt-0.5 font-mono tabular-nums text-zinc-100">{fmtPct(s.confidence)}</p>
        </div>
        <div>
          <p className="text-zinc-500">RSI</p>
          <p className="mt-0.5 font-mono tabular-nums text-zinc-100">{s.rsi.toFixed(1)}</p>
        </div>
      </div>

      <div className="flex items-center justify-between text-[11px] text-zinc-500">
        <span>
          {lang === "zh" ? "形态" : "Setup"}: <span className="text-zinc-300">{s.setup}</span>
        </span>
        <span>
          Δ <span className={s.delta_probs > 0 ? "text-emerald-300" : "text-red-300"}>
            {s.delta_probs > 0 ? "+" : ""}
            {s.delta_probs.toFixed(2)}
          </span>
        </span>
      </div>
    </article>
  );
}

// ───────────────────────── Public component ─────────────────────────

export function PredictionCard(props: Props) {
  const v = variantOf(props);
  const lang = props.lang ?? "en";
  const compact = props.compact ?? false;
  if (v.kind === "sport") return <SportCard p={v.prediction} lang={lang} compact={compact} />;
  if (v.kind === "polymarket") return <PolyCard p={v.polymarket} lang={lang} />;
  return <StockCard s={v.stock} lang={lang} />;
}
