import type { ContrarianRegime } from "@/lib/predictions/sources";

/**
 * Contrarian regime badge — single line color-coded indicator.
 *
 * Color mapping:
 *  - score < 0.3 → green ("clear water")
 *  - 0.3 ≤ score < 0.55 → yellow ("MED degrade")
 *  - 0.55 ≤ score < 0.8 → orange ("HIGH degrade")
 *  - score ≥ 0.8 → red ("EXTREME — halt new longs")
 */
export function ContrarianBadge({
  regime,
  lang = "en",
  compact = false,
}: {
  regime: ContrarianRegime;
  lang?: "en" | "zh";
  compact?: boolean;
}) {
  const score = regime.contrarian_score;
  const palette =
    score < 0.3
      ? { ring: "ring-emerald-500/40", text: "text-emerald-300", bg: "bg-emerald-500/10", label: "CLEAR", labelZh: "通畅" }
      : score < 0.55
        ? { ring: "ring-yellow-500/40", text: "text-yellow-300", bg: "bg-yellow-500/10", label: regime.degrade_recommendation || "MED", labelZh: "中度" }
        : score < 0.8
          ? { ring: "ring-orange-500/50", text: "text-orange-300", bg: "bg-orange-500/10", label: regime.degrade_recommendation || "HIGH", labelZh: "高度" }
          : { ring: "ring-red-500/60", text: "text-red-300", bg: "bg-red-500/10", label: regime.degrade_recommendation || "EXTREME", labelZh: "极度" };

  const labelTxt = lang === "zh" ? palette.labelZh : palette.label;

  if (compact) {
    return (
      <span
        className={`inline-flex items-center gap-2 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ${palette.bg} ${palette.ring} ${palette.text}`}
      >
        <span className="font-mono">{score.toFixed(2)}</span>
        <span className="uppercase tracking-wider">{labelTxt}</span>
      </span>
    );
  }

  return (
    <div
      className={`rounded-2xl p-5 ring-1 ${palette.bg} ${palette.ring}`}
    >
      <div className="mb-3 flex items-baseline justify-between">
        <p className="text-xs uppercase tracking-widest text-zinc-400">
          {lang === "zh" ? "反向规则指标" : "Contrarian regime"}
        </p>
        <span className={`font-mono text-xs ${palette.text}`}>
          {new Date(regime.as_of).toISOString().slice(0, 10)}
        </span>
      </div>
      <div className="flex items-baseline gap-3">
        <span className={`font-mono text-5xl font-bold tabular-nums ${palette.text}`}>
          {score.toFixed(2)}
        </span>
        <span className={`text-sm uppercase tracking-widest ${palette.text}`}>
          {labelTxt}
        </span>
      </div>
      <p className="mt-3 text-sm leading-6 text-zinc-300">
        {regime.interpretation}
      </p>
      <p className="mt-2 text-xs text-zinc-500">
        {lang === "zh"
          ? `仓位乘数: ${regime.sizing_multiplier.toFixed(2)}× · 信号源 ${regime.active_signals.length} 个`
          : `Sizing multiplier ${regime.sizing_multiplier.toFixed(2)}× · ${regime.active_signals.length} active macro signals`}
      </p>
    </div>
  );
}
