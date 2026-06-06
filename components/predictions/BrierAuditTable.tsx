import type { BrierBucket } from "@/lib/predictions/sources";

/**
 * Brier-score audit table. Lower is better. Coin-flip baseline is 0.25 for
 * binary forecasts — so the honest answer to "are we beating coin flip" is
 * `brier_ours < 0.25`.
 *
 * We also surface the *market* Brier (whatever Vegas / Polymarket priced) and
 * `edge = brier_market - brier_ours` so visitors can see whether we are
 * outperforming the most-informed counterparty in the room.
 */
export function BrierAuditTable({
  buckets,
  lang = "en",
}: {
  buckets: BrierBucket[];
  lang?: "en" | "zh";
}) {
  if (!buckets.length) {
    return (
      <p className="text-sm italic text-zinc-500">
        {lang === "zh"
          ? "尚未有已结算的预测。"
          : "No settled forecasts yet."}
      </p>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl ring-1 ring-zinc-800">
      <table className="w-full text-sm">
        <thead className="bg-zinc-900/60 text-xs uppercase tracking-wider text-zinc-400">
          <tr>
            <th className="px-4 py-3 text-left">{lang === "zh" ? "类别" : "Category"}</th>
            <th className="px-4 py-3 text-right">N</th>
            <th className="px-4 py-3 text-right">{lang === "zh" ? "我们" : "Ours"}</th>
            <th className="px-4 py-3 text-right">{lang === "zh" ? "市场" : "Market"}</th>
            <th className="px-4 py-3 text-right">{lang === "zh" ? "差值" : "Edge"}</th>
            <th className="px-4 py-3 text-left">{lang === "zh" ? "结论" : "Verdict"}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-800">
          {buckets.map((b) => {
            const isOverall = b.category === "ALL FORECASTS";
            const verdict = !b.beating_coinflip
              ? { text: lang === "zh" ? "未超过抛硬币" : "Worse than coin flip", color: "text-red-300" }
              : b.beating_market
                ? { text: lang === "zh" ? "击败市场" : "Beating the market", color: "text-emerald-300" }
                : { text: lang === "zh" ? "弱于市场" : "Trailing market", color: "text-yellow-300" };
            return (
              <tr
                key={b.category}
                className={isOverall ? "bg-zinc-900/40 font-semibold text-zinc-100" : "text-zinc-300"}
              >
                <td className="px-4 py-3 font-mono uppercase tracking-wider">{b.category}</td>
                <td className="px-4 py-3 text-right font-mono tabular-nums">{b.n}</td>
                <td className="px-4 py-3 text-right font-mono tabular-nums">{b.brier_ours.toFixed(3)}</td>
                <td className="px-4 py-3 text-right font-mono tabular-nums text-zinc-400">{b.brier_market.toFixed(3)}</td>
                <td
                  className={`px-4 py-3 text-right font-mono tabular-nums ${
                    b.edge > 0 ? "text-emerald-300" : b.edge < 0 ? "text-red-300" : "text-zinc-400"
                  }`}
                >
                  {b.edge > 0 ? "+" : ""}
                  {b.edge.toFixed(3)}
                </td>
                <td className={`px-4 py-3 ${verdict.color}`}>{verdict.text}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <p className="border-t border-zinc-800 bg-zinc-950/60 px-4 py-3 text-xs text-zinc-500">
        {lang === "zh" ? (
          <>
            Brier 分越低越好。二元预测抛硬币基线 = <span className="font-mono">0.250</span>。差值 ={" "}
            <span className="font-mono">Brier(市场) − Brier(我们)</span> · 正数表示我们更准。
          </>
        ) : (
          <>
            Lower Brier is better. Coin-flip baseline for binary forecasts ={" "}
            <span className="font-mono">0.250</span>. Edge ={" "}
            <span className="font-mono">Brier(market) − Brier(ours)</span> · positive = we beat the line.
          </>
        )}
      </p>
    </div>
  );
}
