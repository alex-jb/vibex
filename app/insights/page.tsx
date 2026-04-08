"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import {
  TrendingUp,
  TrendingDown,
  Zap,
  Target,
  BarChart3,
  Sparkles,
  ArrowUp,
  Signal,
  Activity,
} from "lucide-react";
import { trendInsights } from "@/lib/mock-data";
import type { TrendInsight } from "@/lib/types";
import { SectionHeader } from "@/components/section-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useLang } from "@/lib/i18n";

const typeConfig: Record<
  TrendInsight["type"],
  {
    icon: typeof TrendingUp;
    color: string;
    barFrom: string;
    barTo: string;
    bgColor: string;
    label: string;
    dotColor: string;
  }
> = {
  rising: {
    icon: TrendingUp,
    color: "text-emerald-400",
    barFrom: "from-emerald-500",
    barTo: "to-emerald-400/60",
    bgColor: "bg-emerald-500/10",
    label: "Rising",
    dotColor: "bg-emerald-400",
  },
  saturated: {
    icon: TrendingDown,
    color: "text-orange-400",
    barFrom: "from-orange-500",
    barTo: "to-orange-400/60",
    bgColor: "bg-orange-500/10",
    label: "Saturated",
    dotColor: "bg-orange-400",
  },
  opportunity: {
    icon: Target,
    color: "text-violet-400",
    barFrom: "from-violet-500",
    barTo: "to-fuchsia-400/60",
    bgColor: "bg-violet-500/10",
    label: "Opportunity",
    dotColor: "bg-violet-400",
  },
  emerging: {
    icon: Zap,
    color: "text-cyan-400",
    barFrom: "from-cyan-500",
    barTo: "to-cyan-400/60",
    bgColor: "bg-cyan-500/10",
    label: "Emerging",
    dotColor: "bg-cyan-400",
  },
};

const signalConfig: Record<
  TrendInsight["signal"],
  { style: string; label: string }
> = {
  strong: {
    style:
      "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
    label: "Strong",
  },
  moderate: {
    style:
      "bg-amber-500/10 text-amber-400 border-amber-500/20",
    label: "Moderate",
  },
  early: {
    style:
      "bg-blue-500/10 text-blue-400 border-dashed border-blue-500/25",
    label: "Early",
  },
};

const statTypes: TrendInsight["type"][] = [
  "rising",
  "opportunity",
  "saturated",
  "emerging",
];

function getTypeLabel(type: TrendInsight["type"], t: (key: any) => string): string {
  const labels: Record<TrendInsight["type"], string> = {
    rising: t("insights.rising"),
    saturated: t("insights.saturated"),
    opportunity: t("insights.opportunity"),
    emerging: t("insights.emerging"),
  };
  return labels[type];
}

function getSignalLabel(signal: TrendInsight["signal"], t: (key: any) => string): string {
  const labels: Record<TrendInsight["signal"], string> = {
    strong: t("insights.strong"),
    moderate: t("insights.moderate"),
    early: t("insights.early"),
  };
  return labels[signal];
}

function getStatLabel(type: TrendInsight["type"], t: (key: any) => string): string {
  const labels: Record<TrendInsight["type"], string> = {
    rising: t("insights.risingCategories"),
    opportunity: t("insights.opportunityZones"),
    saturated: t("insights.saturatedAreas"),
    emerging: t("insights.emergingSignals"),
  };
  return labels[type];
}

function getCountByType(type: TrendInsight["type"]): number {
  return trendInsights.filter((t) => t.type === type).length;
}

function StatCard({
  type,
  index,
}: {
  type: TrendInsight["type"];
  index: number;
}) {
  const { t } = useLang();
  const config = typeConfig[type];
  const Icon = config.icon;
  const count = getCountByType(type);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: index * 0.08, ease: "easeOut" }}
      className="glass-card-strong relative overflow-hidden p-5"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-3xl font-bold font-mono tracking-tight text-white/95">
            {count}
          </p>
          <p className="mt-1 text-xs text-muted-foreground/60 font-medium">
            {getStatLabel(type, t)}
          </p>
        </div>
        <div
          className={`flex h-9 w-9 items-center justify-center rounded-lg ${config.bgColor}`}
        >
          <Icon className={`h-4.5 w-4.5 ${config.color}`} />
        </div>
      </div>
    </motion.div>
  );
}

function MomentumBar({
  momentum,
  type,
}: {
  momentum: number;
  type: TrendInsight["type"];
}) {
  const { t } = useLang();
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-40px" });
  const config = typeConfig[type];

  return (
    <div ref={ref} className="mt-4">
      <div className="flex items-center justify-between text-xs text-muted-foreground/50 mb-1.5">
        <span className="font-medium">{t("insights.momentum")}</span>
        <span className="flex items-center gap-1 font-mono">
          <ArrowUp className="h-3 w-3" />
          {momentum}%
        </span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-white/[0.04]">
        <motion.div
          className={`h-1.5 rounded-full bg-gradient-to-r ${config.barFrom} ${config.barTo}`}
          initial={{ width: 0 }}
          animate={isInView ? { width: `${momentum}%` } : { width: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}

function TrendCard({
  insight,
  index,
}: {
  insight: TrendInsight;
  index: number;
}) {
  const { t } = useLang();
  const config = typeConfig[insight.type];
  const signal = signalConfig[insight.signal];
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: index * 0.08, ease: "easeOut" }}
      className="glass-card-strong noise-bg relative flex overflow-hidden"
    >
      {/* Left accent bar */}
      <div
        className={`w-1 shrink-0 rounded-l-full bg-gradient-to-b ${config.barFrom} ${config.barTo}`}
      />

      <div className="flex-1 p-6">
        {/* Header row */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <Icon className={`h-4 w-4 ${config.color}`} />
            <span
              className={`text-xs font-semibold uppercase tracking-wider ${config.color}`}
            >
              {getTypeLabel(insight.type, t)}
            </span>
          </div>
          <span
            className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-medium ${signal.style}`}
          >
            {getSignalLabel(insight.signal, t)}
          </span>
        </div>

        {/* Title */}
        <h3 className="mt-3 font-semibold text-white/90 tracking-tight">
          {insight.title}
        </h3>

        {/* Category badge */}
        <Badge
          variant="secondary"
          className="mt-2.5 bg-white/[0.04] text-muted-foreground/60 border border-white/[0.04] text-[11px] font-medium"
        >
          {insight.category}
        </Badge>

        {/* Summary */}
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground/65">
          {insight.summary}
        </p>

        {/* Momentum bar */}
        <MomentumBar momentum={insight.momentum} type={insight.type} />

        {/* Confidence */}
        <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground/45">
          <span
            className={`h-1.5 w-1.5 rounded-full ${config.dotColor} opacity-70`}
          />
          <span className="font-medium">
            {t("insights.confidence")}{" "}
            <span className="font-mono text-muted-foreground/60">
              {insight.confidence}%
            </span>
          </span>
        </div>
      </div>
    </motion.div>
  );
}

export default function InsightsPage() {
  const { t } = useLang();
  return (
    <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-16">
      {/* Background gradient orbs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-24 left-1/3 h-72 w-72 rounded-full bg-violet-600/8 blur-[120px]" />
        <div className="absolute top-64 right-1/4 h-56 w-56 rounded-full bg-cyan-600/6 blur-[100px]" />
        <div className="absolute bottom-48 left-1/5 h-48 w-48 rounded-full bg-emerald-600/4 blur-[90px]" />
      </div>

      {/* Page Hero */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative"
      >
        <SectionHeader
          badge={t("insights.badge")}
          title={`${t("insights.title")} ${t("insights.titleHighlight")}`}
          description={t("insights.description")}
        />
        {/* Override title with gradient word */}
        <div className="mt-[-2.1rem] sm:mt-[-2.4rem]">
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            {t("insights.title")}{" "}
            <span className="text-gradient">{t("insights.titleHighlight")}</span>
          </h1>
        </div>
      </motion.div>

      {/* Overview Stats */}
      <section className="relative mt-14">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {statTypes.map((type, index) => (
            <StatCard key={type} type={type} index={index} />
          ))}
        </div>
      </section>

      {/* Trend Cards */}
      <section className="relative mt-16">
        <motion.h2
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="mb-8 flex items-center gap-2.5 text-sm font-semibold uppercase tracking-widest text-muted-foreground/60"
        >
          <Activity className="h-4 w-4 text-violet-400/80" />
          {t("insights.allSignals")}
        </motion.h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {trendInsights.map((insight, index) => (
            <TrendCard key={insight.id} insight={insight} index={index} />
          ))}
        </div>
      </section>

      {/* Full Analytics Coming Soon */}
      <section className="relative mt-20">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="border-glow noise-bg relative overflow-hidden rounded-2xl p-10 sm:p-12"
        >
          {/* Interior gradient orbs */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-2xl">
            <div className="absolute -top-16 -right-16 h-56 w-56 rounded-full bg-violet-600/10 blur-[80px]" />
            <div className="absolute -bottom-12 -left-12 h-44 w-44 rounded-full bg-cyan-600/8 blur-[70px]" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-32 w-32 rounded-full bg-fuchsia-500/5 blur-[60px]" />
          </div>

          <div className="relative flex flex-col items-center text-center">
            {/* Icon with gradient */}
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500/20 to-cyan-500/20 ring-1 ring-white/[0.06]">
              <BarChart3 className="h-7 w-7 text-violet-300/90" />
            </div>

            {/* Title */}
            <h3 className="mt-6 text-2xl font-bold tracking-tight text-white/95">
              {t("insights.deepAnalytics")}
            </h3>

            {/* Description bullets */}
            <div className="mt-5 flex flex-col gap-2.5 text-sm text-muted-foreground/65">
              <div className="flex items-center gap-2.5">
                <Signal className="h-3.5 w-3.5 text-violet-400/60 shrink-0" />
                <span>{t("insights.analytic1")}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Sparkles className="h-3.5 w-3.5 text-violet-400/60 shrink-0" />
                <span>
                  {t("insights.analytic2")}
                </span>
              </div>
              <div className="flex items-center gap-2.5">
                <TrendingUp className="h-3.5 w-3.5 text-violet-400/60 shrink-0" />
                <span>
                  {t("insights.analytic3")}
                </span>
              </div>
            </div>

            {/* CTA */}
            <Button
              className="mt-8 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-lg shadow-violet-500/20 transition-all duration-300 hover:shadow-violet-500/40 hover:brightness-110 border-0 px-8"
              size="default"
            >
              <Sparkles className="mr-2 h-4 w-4" />
              {t("insights.joinWaitlist")}
            </Button>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
