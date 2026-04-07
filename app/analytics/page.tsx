"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  BarChart3,
  Zap,
  DollarSign,
  CheckCircle,
  Clock,
  TrendingUp,
  Cpu,
} from "lucide-react";
import { agents } from "@/lib/mock-data/agents";
import { Badge } from "@/components/ui/badge";
import { useLang } from "@/lib/i18n";

// ── Mock data (inline) ──────────────────────────────────────────────

const totalRuns = agents.reduce((s, a) => s + a.runs, 0);
const avgSuccess =
  (agents.reduce((s, a) => s + a.successRate, 0) / agents.length).toFixed(1);

const dailyRuns = [182, 245, 198, 310, 274, 356, 321]; // last 7 days
const dayLabels = ["周一", "周二", "周三", "周四", "周五", "周六", "周日"];
const maxDaily = Math.max(...dailyRuns);

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
  { agentId: "agent-7", agent: "TaskPilot", status: "completed" as const, input: "Schedule weekly standup every Monday at 10am...", tokens: 1240, latency: 1180, time: "2 分钟前" },
  { agentId: "agent-1", agent: "CodeReviewer Pro", status: "completed" as const, input: "Review PR #482: add rate limiter middleware...", tokens: 3800, latency: 3100, time: "8 分钟前" },
  { agentId: "agent-5", agent: "AlphaSignal", status: "failed" as const, input: "Analyze BTC/USD 4h chart with RSI divergence...", tokens: 2100, latency: 8400, time: "15 分钟前" },
  { agentId: "agent-2", agent: "DeepResearch", status: "completed" as const, input: "Research latest advances in protein folding...", tokens: 7200, latency: 12800, time: "23 分钟前" },
  { agentId: "agent-6", agent: "StudyBuddy", status: "completed" as const, input: "Generate calculus practice quiz on integrals...", tokens: 2400, latency: 3600, time: "31 分钟前" },
];

const modelCosts = [
  { model: "Haiku 4.5", pct: 45, cost: "$18.20", color: "from-cyan-500 to-blue-500" },
  { model: "Sonnet 4.6", pct: 38, cost: "$48.30", color: "from-violet-500 to-purple-500" },
  { model: "Opus 4.6", pct: 17, cost: "$61.00", color: "from-fuchsia-500 to-rose-500" },
];

const dailyCosts = [14.2, 18.6, 16.1, 22.4, 19.8, 24.1, 12.3];
const maxCost = Math.max(...dailyCosts);

// ── Animations ──────────────────────────────────────────────────────

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

// ── Page ─────────────────────────────────────────────────────────────

export default function AnalyticsPage() {
  const { t } = useLang();
  void t; // available for future i18n keys

  return (
    <main className="min-h-screen bg-background pt-24 pb-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 space-y-12">
        {/* ── Hero ─────────────────────────────────────── */}
        <motion.section variants={fadeUp} initial="hidden" animate="visible" className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-violet-500/20 bg-violet-500/10 px-4 py-1.5 text-xs font-medium text-violet-300">
            <BarChart3 className="size-3.5" /> Beta
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">
            分析<span className="text-gradient-subtle">面板</span>
          </h1>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Agent 运行数据、成本追踪和性能趋势
          </p>
        </motion.section>

        {/* ── Overview Stats ──────────────────────────── */}
        <motion.section variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "总运行次数", value: totalRuns.toLocaleString(), icon: Zap, accent: "text-violet-400" },
            { label: "总 Token 消耗", value: "2.4M", icon: Cpu, accent: "text-cyan-400" },
            { label: "总成本", value: "$127.50", icon: DollarSign, accent: "text-emerald-400" },
            { label: "平均成功率", value: `${avgSuccess}%`, icon: CheckCircle, accent: "text-fuchsia-400" },
          ].map((s) => (
            <div key={s.label} className="glass-card-strong rounded-2xl p-5 space-y-2">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <s.icon className={`size-4 ${s.accent}`} />
                {s.label}
              </div>
              <p className="text-2xl font-bold">{s.value}</p>
            </div>
          ))}
        </motion.section>

        {/* ── 运行趋势图 ─────────────────────────────── */}
        <motion.section variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="glass-card-strong rounded-2xl p-6 space-y-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <TrendingUp className="size-5 text-violet-400" /> 运行趋势图
          </h2>
          <div className="flex items-end gap-3 h-48">
            {dailyRuns.map((v, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2">
                <span className="text-xs text-muted-foreground">{v}</span>
                <div
                  className="w-full rounded-t-md bg-gradient-to-t from-violet-600 to-fuchsia-500 transition-all duration-500"
                  style={{ height: `${(v / maxDaily) * 100}%` }}
                />
                <span className="text-[11px] text-muted-foreground">{dayLabels[i]}</span>
              </div>
            ))}
          </div>
        </motion.section>

        {/* ── Agent 排行 ──────────────────────────────── */}
        <motion.section variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="glass-card-strong rounded-2xl p-6 space-y-4">
          <h2 className="text-lg font-semibold">Agent 排行</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-muted-foreground text-xs border-b border-white/5">
                  <th className="pb-2 pr-4">#</th>
                  <th className="pb-2 pr-4">Agent</th>
                  <th className="pb-2 pr-4">类别</th>
                  <th className="pb-2 pr-4 text-right">运行次数</th>
                  <th className="pb-2 pr-4 text-right">成功率</th>
                  <th className="pb-2 pr-4 text-right">平均延迟</th>
                  <th className="pb-2 text-right">预估成本</th>
                </tr>
              </thead>
              <tbody>
                {sortedAgents.map((a, i) => {
                  const highlight = i < 3;
                  const estCost = ((a.runs * a.avgLatencyMs) / 1_000_000 * 2.5).toFixed(2);
                  return (
                    <tr
                      key={a.id}
                      className={`border-b border-white/[0.03] ${highlight ? "bg-violet-500/5" : ""}`}
                    >
                      <td className="py-2.5 pr-4 font-mono text-muted-foreground">
                        {highlight ? (
                          <span className="text-violet-400 font-bold">{i + 1}</span>
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
        </motion.section>

        {/* ── Token 消耗分布 ──────────────────────────── */}
        <motion.section variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="glass-card-strong rounded-2xl p-6 space-y-4">
          <h2 className="text-lg font-semibold">Token 消耗分布</h2>
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

        {/* ── 最近运行 ───────────────────────────────── */}
        <motion.section variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="glass-card-strong rounded-2xl p-6 space-y-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Clock className="size-5 text-violet-400" /> 最近运行
          </h2>
          <div className="space-y-2">
            {recentRuns.map((r, i) => (
              <Link
                key={i}
                href={`/agents/${r.agentId}`}
                className="flex items-center gap-4 rounded-xl px-4 py-3 hover:bg-white/[0.03] transition-colors"
              >
                <span className="text-sm font-medium w-36 truncate">{r.agent}</span>
                <Badge variant={r.status === "completed" ? "default" : "destructive"} className="text-[10px] w-12 justify-center">
                  {r.status === "completed" ? "成功" : "失败"}
                </Badge>
                <span className="flex-1 text-xs text-muted-foreground truncate">{r.input}</span>
                <span className="text-xs font-mono text-muted-foreground w-16 text-right">{r.tokens.toLocaleString()} tk</span>
                <span className="text-xs font-mono text-muted-foreground w-14 text-right">{(r.latency / 1000).toFixed(1)}s</span>
                <span className="text-xs text-muted-foreground w-20 text-right">{r.time}</span>
              </Link>
            ))}
          </div>
        </motion.section>

        {/* ── 成本追踪 ───────────────────────────────── */}
        <motion.section variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="glass-card-strong rounded-2xl p-6 space-y-6">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <DollarSign className="size-5 text-emerald-400" /> 成本追踪
          </h2>

          {/* Model breakdown */}
          <div className="space-y-3">
            <h3 className="text-sm text-muted-foreground">模型用量分布</h3>
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
            <h3 className="text-sm text-muted-foreground">每日成本趋势</h3>
            <div className="flex items-end gap-3 h-32">
              {dailyCosts.map((v, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-2">
                  <span className="text-[10px] text-muted-foreground">${v}</span>
                  <div
                    className="w-full rounded-t-md bg-gradient-to-t from-emerald-600 to-cyan-500 transition-all duration-500"
                    style={{ height: `${(v / maxCost) * 100}%` }}
                  />
                  <span className="text-[11px] text-muted-foreground">{dayLabels[i]}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.section>
      </div>
    </main>
  );
}
