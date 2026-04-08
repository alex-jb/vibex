"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  Zap,
  DollarSign,
  CheckCircle,
  Clock,
  TrendingUp,
  Cpu,
  Download,
} from "lucide-react";
import { agents } from "@/lib/mock-data/agents";
import { Badge } from "@/components/ui/badge";
import { useLang } from "@/lib/i18n";

// ── Mock data (inline) ──────────────────────────────────────────────

const totalRuns = agents.reduce((s, a) => s + a.runs, 0);
const avgSuccess =
  (agents.reduce((s, a) => s + a.successRate, 0) / agents.length).toFixed(1);

const dailyRuns = [182, 245, 198, 310, 274, 356, 321]; // last 7 days
const dayLabelKeys = ["analytics.mon", "analytics.tue", "analytics.wed", "analytics.thu", "analytics.fri", "analytics.sat", "analytics.sun"] as const;

const sortedAgents = [...agents].sort((a, b) => b.runs - a.runs);

const tokensByAgent = [
  { name: "TaskPilot", tokens: 840_000, category: "assistant" },
  { name: "AlphaSignal", tokens: 620_000, category: "trading" },
  { name: "CodeReviewer Pro", tokens: 410_000, category: "coding" },
  { name: "StudyBuddy", tokens: 240_000, category: "education" },
  { name: "DeepResearch", tokens: 180_000, category: "research" },
  { name: "StoryWeaver", tokens: 72_000, category: "creative" },
  { name: "DataPipeline Builder", tokens: 38_000, category: "automation" },
];
const maxTokens = Math.max(...tokensByAgent.map((t) => t.tokens));

const categoryColors: Record<string, string> = {
  coding: "bg-blue-500",
  research: "bg-emerald-500",
  creative: "bg-pink-500",
  automation: "bg-amber-500",
  trading: "bg-red-500",
  education: "bg-cyan-500",
  assistant: "bg-violet-500",
  other: "bg-gray-500",
};

const recentRuns = [
  { agentId: "agent-7", agent: "TaskPilot", status: "completed" as const, input: "Schedule weekly standup every Monday at 10am...", tokens: 1240, latency: 1180, time: "2 min ago" },
  { agentId: "agent-1", agent: "CodeReviewer Pro", status: "completed" as const, input: "Review PR #482: add rate limiter middleware...", tokens: 3800, latency: 3100, time: "8 min ago" },
  { agentId: "agent-5", agent: "AlphaSignal", status: "failed" as const, input: "Analyze BTC/USD 4h chart with RSI divergence...", tokens: 2100, latency: 8400, time: "15 min ago" },
  { agentId: "agent-2", agent: "DeepResearch", status: "completed" as const, input: "Research latest advances in protein folding...", tokens: 7200, latency: 12800, time: "23 min ago" },
  { agentId: "agent-6", agent: "StudyBuddy", status: "completed" as const, input: "Generate calculus practice quiz on integrals...", tokens: 2400, latency: 3600, time: "31 min ago" },
];

const modelCosts = [
  { model: "Haiku 4.5", pct: 45, cost: "$18.20", color: "from-cyan-500 to-blue-500" },
  { model: "Sonnet 4.6", pct: 38, cost: "$48.30", color: "from-violet-500 to-purple-500" },
  { model: "Opus 4.6", pct: 17, cost: "$61.00", color: "from-fuchsia-500 to-rose-500" },
];

const dailyCosts = [14.2, 18.6, 16.1, 22.4, 19.8, 24.1, 12.3];

// ── Animations ──────────────────────────────────────────────────────

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

// ── Page ─────────────────────────────────────────────────────────────

type DateRange = 7 | 30 | 90;

const rangeLabelKeyMap: Record<DateRange, "analytics.7d" | "analytics.30d" | "analytics.90d"> = { 7: "analytics.7d", 30: "analytics.30d", 90: "analytics.90d" };

function dayLabelsForRange(range: DateRange, t: (k: typeof dayLabelKeys[number]) => string): string[] {
  if (range === 7) return dayLabelKeys.map((k) => t(k));
  const base = dayLabelKeys.map((k) => t(k));
  const out: string[] = [];
  for (let i = 0; i < range; i++) out.push(base[i % 7]);
  return out;
}

function runsForRange(range: DateRange): number[] {
  if (range === 7) return dailyRuns;
  const out: number[] = [];
  for (let i = 0; i < range; i++) out.push(dailyRuns[i % 7] + Math.round((i * 7) % 50 - 25));
  return out;
}

function costsForRange(range: DateRange): number[] {
  if (range === 7) return dailyCosts;
  const out: number[] = [];
  for (let i = 0; i < range; i++) out.push(+(dailyCosts[i % 7] + ((i * 3) % 8 - 4)).toFixed(1));
  return out;
}

export default function AnalyticsPage() {
  const { t } = useLang();
  const [range, setRange] = useState<DateRange>(7);

  const currentRuns = runsForRange(range);
  const currentCosts = costsForRange(range);
  const currentLabels = dayLabelsForRange(range, t);
  const currentMaxDaily = Math.max(...currentRuns);
  const currentMaxCost = Math.max(...currentCosts);

  const handleExportCsv = useCallback(() => {
    const header = "Agent,Runs,Success Rate,Avg Latency (s),Est. Cost ($)";
    const rows = sortedAgents.map((a) => {
      const estCost = ((a.runs * a.avgLatencyMs) / 1_000_000 * 2.5).toFixed(2);
      return `"${a.name}",${a.runs},${a.successRate}%,${(a.avgLatencyMs / 1000).toFixed(1)},${estCost}`;
    });
    const csv = [header, ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `vibex-analytics-${range}d.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }, [range]);

  return (
    <main className="min-h-screen bg-background pt-24 pb-20" style={{ position: "relative", overflow: "hidden" }}>
      {/* Scanline overlay */}
      <div
        className="scanline-overlay"
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          background:
            "repeating-linear-gradient(0deg, transparent 0, transparent 2px, rgba(0,0,0,0.08) 2px, rgba(0,0,0,0.08) 4px)",
          pointerEvents: "none",
          zIndex: 1,
        }}
      />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 space-y-12" style={{ position: "relative", zIndex: 2 }}>
        {/* ── Hero ─────────────────────────────────────── */}
        <motion.section variants={fadeUp} initial="hidden" animate="visible" className="text-center space-y-3">
          <div className="font-pixel" style={{ fontSize: 10, color: "#555", letterSpacing: 2 }}>
            {">"} VIBEX://ANALYTICS v2.0
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">
            {t("analytics.title")}<span className="text-gradient-subtle">{t("analytics.titleHighlight")}</span>
          </h1>
          <p className="font-pixel text-muted-foreground max-w-lg mx-auto" style={{ fontSize: 10 }}>
            {t("analytics.subtitle")}
          </p>
          {/* Date range picker + CSV export */}
          <div className="flex items-center justify-center gap-2 mt-4 flex-wrap">
            {([7, 30, 90] as DateRange[]).map((r) => (
              <button
                key={r}
                onClick={() => setRange(r)}
                className={range === r ? "nes-btn is-primary" : "nes-btn"}
                style={{ fontSize: 10, padding: "4px 12px" }}
              >
                <span className="font-pixel">{t(rangeLabelKeyMap[r])}</span>
              </button>
            ))}
            <button
              onClick={handleExportCsv}
              className="nes-btn"
              style={{ fontSize: 10, padding: "4px 12px" }}
            >
              <span className="font-pixel flex items-center gap-1">
                <Download className="size-3 inline-block" /> {t("analytics.exportCsv")}
              </span>
            </button>
          </div>
        </motion.section>

        {/* ── Overview Stats ──────────────────────────── */}
        <motion.section variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
          <div className="rpgui-container framed" style={{ padding: 16 }}>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: t("analytics.totalRuns"), value: totalRuns.toLocaleString(), icon: Zap, accent: "text-violet-400" },
                { label: t("analytics.totalTokens"), value: "2.4M", icon: Cpu, accent: "text-cyan-400" },
                { label: t("analytics.totalCost"), value: "$127.50", icon: DollarSign, accent: "text-emerald-400" },
                { label: t("analytics.avgSuccess"), value: `${avgSuccess}%`, icon: CheckCircle, accent: "text-fuchsia-400" },
              ].map((s) => (
                <div key={s.label} className="glass-card-strong rounded-2xl p-5 space-y-2">
                  <div className="flex items-center gap-2">
                    <s.icon className={`size-4 ${s.accent}`} />
                    <span className="font-pixel text-[7px] text-muted-foreground">{s.label}</span>
                  </div>
                  <p className="font-pixel text-[14px]">{s.value}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* ── Run Trend Chart ─────────────────────────── */}
        <motion.section variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="glass-card-strong rounded-2xl p-6 space-y-4">
          <h2 className="font-pixel text-[12px] flex items-center gap-2">
            <TrendingUp className="size-5 text-violet-400" /> {">"} {t("analytics.runTrend")}
          </h2>
          <div aria-label={t("analytics.runTrend")} className="flex items-end gap-[2px] h-48 overflow-x-auto" style={{ imageRendering: "pixelated" as const }}>
            {currentRuns.map((v, i) => (
              <div key={i} className="flex-1 min-w-[12px] flex flex-col items-center gap-1">
                {range === 7 && <span className="font-pixel text-[8px] text-muted-foreground">{v}</span>}
                <div
                  className="w-full bg-gradient-to-t from-violet-600 to-fuchsia-500 transition-all duration-500"
                  style={{
                    height: `${(v / currentMaxDaily) * 100}%`,
                    position: "relative",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      background:
                        "repeating-linear-gradient(90deg, transparent 0, transparent 4px, rgba(0,0,0,0.3) 4px, rgba(0,0,0,0.3) 6px)",
                    }}
                  />
                </div>
                {range === 7 && <span className="font-pixel text-[8px] text-muted-foreground">{currentLabels[i]}</span>}
              </div>
            ))}
          </div>
        </motion.section>

        {/* ── Agent Ranking ────────────────────────────── */}
        <motion.section variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
          <div className="rpgui-container framed-golden" style={{ padding: 16 }}>
            <h2 className="font-pixel text-[12px] mb-4">{">"} {t("analytics.agentRanking")}</h2>
            <div className="overflow-x-auto">
              <table role="table" className="w-full text-sm">
                <thead>
                  <tr role="row" className="text-left text-muted-foreground border-b border-white/5">
                    <th className="font-pixel text-[8px] pb-2 pr-4">#</th>
                    <th className="font-pixel text-[8px] pb-2 pr-4">Agent</th>
                    <th className="font-pixel text-[8px] pb-2 pr-4">{t("analytics.category")}</th>
                    <th className="font-pixel text-[8px] pb-2 pr-4 text-right">{t("analytics.runCount")}</th>
                    <th className="font-pixel text-[8px] pb-2 pr-4 text-right">{t("analytics.successRate")}</th>
                    <th className="font-pixel text-[8px] pb-2 pr-4 text-right">{t("analytics.avgLatency")}</th>
                    <th className="font-pixel text-[8px] pb-2 text-right">{t("analytics.estCost")}</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedAgents.map((a, i) => {
                    const highlight = i < 3;
                    const estCost = ((a.runs * a.avgLatencyMs) / 1_000_000 * 2.5).toFixed(2);
                    const rankBg = i === 0 ? "#B8860B" : i === 1 ? "#8888A0" : i === 2 ? "#CD7F32" : "transparent";
                    const rankColor = i < 3 ? "#0D0D0D" : undefined;
                    return (
                      <tr
                        key={a.id}
                        role="row"
                        className={`border-b border-white/[0.03] ${highlight ? "bg-violet-500/5" : ""}`}
                      >
                        <td className="py-2.5 pr-4 font-mono text-muted-foreground">
                          {highlight ? (
                            <span
                              className="font-pixel"
                              style={{
                                fontSize: 8,
                                background: rankBg,
                                color: rankColor,
                                padding: "2px 6px",
                                fontWeight: "bold",
                              }}
                            >
                              {i + 1}
                            </span>
                          ) : (
                            i + 1
                          )}
                        </td>
                        <td className="py-2.5 pr-4 font-medium">{a.name}</td>
                        <td className="py-2.5 pr-4">
                          <Badge variant="secondary" className="text-[10px]">{a.category}</Badge>
                        </td>
                        <td className="py-2.5 pr-4 text-right font-mono">{a.runs.toLocaleString()}</td>
                        <td className="py-2.5 pr-4 text-right">
                          <span className={a.successRate >= 97 ? "text-emerald-400" : a.successRate >= 95 ? "text-amber-400" : "text-red-400"}>
                            {a.successRate}%
                          </span>
                        </td>
                        <td className="py-2.5 pr-4 text-right font-mono text-muted-foreground">{(a.avgLatencyMs / 1000).toFixed(1)}s</td>
                        <td className="py-2.5 text-right font-mono">${estCost}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </motion.section>

        {/* ── Token Distribution ─────────────────────── */}
        <motion.section variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="glass-card-strong rounded-2xl p-6 space-y-4" aria-label={t("analytics.tokenDistribution")}>
          <h2 className="font-pixel text-[12px]">{">"} {t("analytics.tokenDistribution")}</h2>
          <div className="space-y-3">
            {tokensByAgent.map((t) => (
              <div key={t.name} className="flex items-center gap-3">
                <span className="w-40 truncate text-sm">{t.name}</span>
                <div className="flex-1 h-5 rounded-full bg-white/5 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${categoryColors[t.category] ?? "bg-gray-500"} transition-all duration-700`}
                    style={{ width: `${(t.tokens / maxTokens) * 100}%` }}
                  />
                </div>
                <span className="text-xs text-muted-foreground w-16 text-right font-mono">
                  {t.tokens >= 1_000_000 ? `${(t.tokens / 1_000_000).toFixed(1)}M` : `${(t.tokens / 1_000).toFixed(0)}K`}
                </span>
              </div>
            ))}
          </div>
        </motion.section>

        {/* ── Recent Runs ──────────────────────────────── */}
        <motion.section variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="glass-card-strong rounded-2xl p-6 space-y-4">
          <h2 className="font-pixel text-[12px] flex items-center gap-2">
            <Clock className="size-5 text-violet-400" /> {">"} {t("analytics.recentRuns")}
          </h2>
          <div className="space-y-2">
            {recentRuns.map((r, i) => (
              <Link
                key={i}
                href={`/agents/${r.agentId}`}
                className="flex items-center gap-4 rounded-xl px-4 py-3 hover:bg-white/[0.03] transition-colors"
              >
                <span className="text-sm font-medium w-36 truncate">{r.agent}</span>
                {r.status === "completed" ? (
                  <span className="nes-btn is-success" style={{ fontSize: 8, padding: "2px 8px" }}>{t("analytics.success")}</span>
                ) : (
                  <span className="nes-btn is-error" style={{ fontSize: 8, padding: "2px 8px" }}>{t("analytics.failed")}</span>
                )}
                <span className="flex-1 text-xs text-muted-foreground truncate">{r.input}</span>
                <span className="text-xs font-mono text-muted-foreground w-16 text-right">{r.tokens.toLocaleString()} tk</span>
                <span className="text-xs font-mono text-muted-foreground w-14 text-right">{(r.latency / 1000).toFixed(1)}s</span>
                <span className="text-xs text-muted-foreground w-20 text-right">{r.time}</span>
              </Link>
            ))}
          </div>
        </motion.section>

        {/* ── Cost Tracking ────────────────────────────── */}
        <motion.section variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="glass-card-strong rounded-2xl p-6 space-y-6" aria-label={t("analytics.costTracking")}>
          <h2 className="font-pixel text-[12px] flex items-center gap-2">
            <DollarSign className="size-5 text-emerald-400" /> {">"} {t("analytics.costTracking")}
          </h2>

          {/* Model breakdown */}
          <div className="space-y-3">
            <h3 className="font-pixel text-[9px] text-muted-foreground">{">"} {t("analytics.modelUsage")}</h3>
            {modelCosts.map((m) => (
              <div key={m.model} className="flex items-center gap-3">
                <span className="w-24 text-sm">{m.model}</span>
                <div className="flex-1 h-4 rounded-full bg-white/5 overflow-hidden">
                  <div
                    className={`h-full rounded-full bg-gradient-to-r ${m.color}`}
                    style={{ width: `${m.pct}%` }}
                  />
                </div>
                <span className="text-xs font-mono w-14 text-right">{m.cost}</span>
                <span className="text-xs text-muted-foreground w-10 text-right">{m.pct}%</span>
              </div>
            ))}
          </div>

          {/* Daily cost trend */}
          <div className="space-y-3">
            <h3 className="font-pixel text-[9px] text-muted-foreground">{">"} {t("analytics.dailyCostTrend")}</h3>
            <div className="flex items-end gap-[2px] h-32 overflow-x-auto" style={{ imageRendering: "pixelated" as const }}>
              {currentCosts.map((v, i) => (
                <div key={i} className="flex-1 min-w-[12px] flex flex-col items-center gap-1">
                  {range === 7 && <span className="font-pixel text-[8px] text-muted-foreground">${v}</span>}
                  <div
                    className="w-full bg-gradient-to-t from-emerald-600 to-cyan-500 transition-all duration-500"
                    style={{
                      height: `${(v / currentMaxCost) * 100}%`,
                      position: "relative",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        position: "absolute",
                        inset: 0,
                        background:
                          "repeating-linear-gradient(90deg, transparent 0, transparent 4px, rgba(0,0,0,0.3) 4px, rgba(0,0,0,0.3) 6px)",
                      }}
                    />
                  </div>
                  {range === 7 && <span className="font-pixel text-[8px] text-muted-foreground">{currentLabels[i]}</span>}
                </div>
              ))}
            </div>
          </div>
        </motion.section>
      </div>
    </main>
  );
}
