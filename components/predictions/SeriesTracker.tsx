import type { SeriesState, SportPrediction } from "@/lib/predictions/sources";
import { PredictionCard } from "./PredictionCard";

/**
 * NBA / NHL Finals series tracker — shows current 1-1 (or whatever) state and
 * surfaces today's live or upcoming game inline.
 *
 * The series_state.json file is updated by hand after each game (Alex's cron
 * doesn't try to scrape ESPN's live box scores — too brittle). So this widget
 * shows the "as of last update" timestamp honestly.
 */
export function SeriesTracker({
  series,
  todayGame,
  league,
  lang = "en",
}: {
  series: SeriesState;
  todayGame: SportPrediction | null;
  league: "nba" | "nhl";
  lang?: "en" | "zh";
}) {
  const [homeWins, awayWins] = league === "nba" ? series.nba : series.nhl;
  const total = homeWins + awayWins;
  const gameN = total + 1;
  const seriesLabel = league === "nba" ? "NBA FINALS" : "STANLEY CUP FINAL";

  return (
    <div className="rounded-2xl bg-zinc-900/40 p-6 ring-1 ring-zinc-800">
      <div className="mb-4 flex items-baseline justify-between">
        <p className="text-xs uppercase tracking-widest text-orange-400">{seriesLabel}</p>
        <span className="font-mono text-xs text-zinc-500">
          {lang === "zh" ? "更新于 " : "as of "}
          {new Date(series.updated_at).toISOString().slice(0, 10)}
        </span>
      </div>

      {/* Series score display */}
      <div className="mb-5 flex items-center gap-4">
        <div className="flex items-baseline gap-2">
          <span className="font-mono text-4xl font-bold tabular-nums text-zinc-100">
            {homeWins}
          </span>
          <span className="text-sm text-zinc-500">—</span>
          <span className="font-mono text-4xl font-bold tabular-nums text-zinc-100">
            {awayWins}
          </span>
        </div>
        <div className="flex flex-col">
          <span className="text-xs uppercase tracking-wider text-zinc-400">
            {lang === "zh" ? `第 ${gameN} 场` : `Game ${gameN}`}
          </span>
          <span className="text-xs text-zinc-500">
            {homeWins === awayWins
              ? lang === "zh" ? "系列赛持平" : "Series tied"
              : homeWins > awayWins
                ? lang === "zh" ? "主场先" : "Home leads"
                : lang === "zh" ? "客场先" : "Away leads"}
          </span>
        </div>
      </div>

      {/* Today's game card if there is one */}
      {todayGame ? (
        <div>
          <p className="mb-2 text-xs uppercase tracking-widest text-zinc-400">
            {lang === "zh" ? "今日比赛" : "Today's game"}
          </p>
          <PredictionCard prediction={todayGame} lang={lang} compact />
        </div>
      ) : (
        <p className="rounded-xl bg-zinc-950/40 p-4 text-sm italic text-zinc-500 ring-1 ring-zinc-800">
          {lang === "zh"
            ? "今日无 Finals 比赛。下一场预测将在比赛日 12:00 ET 发布。"
            : "No Finals game today. Next pick drops 12:00 ET on game day."}
        </p>
      )}
    </div>
  );
}
