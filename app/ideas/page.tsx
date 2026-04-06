"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Lightbulb,
  Sparkles,
  Search,
  ChevronUp,
  ArrowRight,
  Zap,
  Target,
  Shield,
  TrendingUp,
  Rocket,
  CheckCircle2,
  Clock,
  AlertTriangle,
  BarChart3,
  Star,
  Filter,
} from "lucide-react";
import { ideas, categories } from "@/lib/mock-data";
import type { Idea, IdeaEvaluation, ProjectCategory } from "@/lib/types";
import { SectionHeader } from "@/components/section-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useLang } from "@/lib/i18n";
import Link from "next/link";

/* ─── helpers ─── */

function difficultyColor(d: IdeaEvaluation["difficulty"]) {
  switch (d) {
    case "easy":
      return "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
    case "medium":
      return "text-amber-400 bg-amber-500/10 border-amber-500/20";
    case "hard":
      return "text-orange-400 bg-orange-500/10 border-orange-500/20";
    case "expert":
      return "text-red-400 bg-red-500/10 border-red-500/20";
  }
}

function competitionColor(c: IdeaEvaluation["competition"]) {
  switch (c) {
    case "low":
      return "text-emerald-400";
    case "moderate":
      return "text-amber-400";
    case "high":
      return "text-orange-400";
    case "saturated":
      return "text-red-400";
  }
}

function statusConfig(s: Idea["status"], t: (key: any) => string) {
  switch (s) {
    case "idea":
      return {
        label: t("ideas.statusIdea"),
        icon: Lightbulb,
        color: "text-violet-400 bg-violet-500/10 border-violet-500/20",
      };
    case "in-progress":
      return {
        label: t("ideas.statusInProgress"),
        icon: Clock,
        color: "text-amber-400 bg-amber-500/10 border-amber-500/20",
      };
    case "launched":
      return {
        label: t("ideas.statusLaunched"),
        icon: Rocket,
        color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
      };
  }
}

function ScoreBar({ label, value }: { label: string; value: number }) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium text-foreground">{value}%</span>
      </div>
      <div className="h-1.5 rounded-full bg-white/5">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500"
          initial={{ width: 0 }}
          whileInView={{ width: `${value}%` }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>
    </div>
  );
}

/* ─── page ─── */

export default function IdeasPage() {
  const { t } = useLang();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const statuses = ["all", "idea", "in-progress", "launched"] as const;

  const filteredIdeas = ideas.filter((idea) => {
    const matchesCategory =
      selectedCategory === "All" || idea.category === selectedCategory;
    const matchesStatus =
      selectedStatus === "all" || idea.status === selectedStatus;
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      query === "" ||
      idea.title.toLowerCase().includes(query) ||
      idea.description.toLowerCase().includes(query);
    return matchesCategory && matchesStatus && matchesSearch;
  });

  return (
    <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-16">
      {/* Background gradient orb */}
      <div className="pointer-events-none absolute -top-32 left-1/2 -translate-x-1/2 h-[480px] w-[480px] rounded-full bg-violet-600/8 blur-[120px]" />

      {/* Page Hero */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative text-center mb-12"
      >
        <div className="inline-flex items-center gap-2 rounded-full border border-violet-500/20 bg-violet-500/10 px-4 py-1.5 mb-5">
          <Lightbulb className="size-3.5 text-violet-400" />
          <span className="text-xs font-medium text-violet-400 tracking-wide">
            {t("ideas.badge")}
          </span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">
          {t("ideas.title")}{" "}
          <span className="text-gradient">{t("ideas.titleHighlight")}</span>
        </h1>
        <p className="mt-3 text-muted-foreground max-w-lg mx-auto text-sm leading-relaxed">
          {t("ideas.description")}
        </p>
      </motion.div>

      {/* Search & Filters */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="relative glass-card-strong rounded-xl p-1 mb-6"
      >
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder={t("ideas.searchPlaceholder")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-12 bg-transparent border-none pl-11 pr-4 text-sm placeholder:text-muted-foreground/60 focus-visible:ring-0 focus-visible:ring-offset-0"
          />
        </div>
      </motion.div>

      {/* Category Pills */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.15 }}
        className="flex flex-wrap gap-2 mb-4"
      >
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition-all duration-200 border ${
              selectedCategory === cat
                ? "bg-violet-500/15 text-violet-300 border-violet-500/30"
                : "bg-white/[0.03] text-muted-foreground border-white/[0.06] hover:bg-white/[0.06] hover:text-foreground"
            }`}
          >
            {cat}
          </button>
        ))}
      </motion.div>

      {/* Status Filter */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="flex items-center gap-2 mb-10"
      >
        <Filter className="size-3.5 text-muted-foreground" />
        <span className="text-xs text-muted-foreground mr-1">{t("ideas.statusLabel")}</span>
        {statuses.map((s) => {
          const cfg =
            s === "all"
              ? { label: t("ideas.statusAll"), color: "text-foreground bg-white/[0.06] border-white/[0.08]" }
              : statusConfig(s, t);
          return (
            <button
              key={s}
              onClick={() => setSelectedStatus(s)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-all duration-200 border ${
                selectedStatus === s
                  ? s === "all"
                    ? "bg-white/10 text-foreground border-white/20"
                    : cfg!.color
                  : "bg-transparent text-muted-foreground border-white/[0.06] hover:bg-white/[0.04]"
              }`}
            >
              {cfg!.label}
            </button>
          );
        })}
      </motion.div>

      {/* Ideas List */}
      <AnimatePresence mode="popLayout">
        {filteredIdeas.length === 0 ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center py-20"
          >
            <Lightbulb className="mx-auto size-10 text-muted-foreground/40 mb-4" />
            <p className="text-muted-foreground text-sm">
              {t("ideas.noResults")}
            </p>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {filteredIdeas.map((idea, i) => {
              const status = statusConfig(idea.status, t);
              const StatusIcon = status.icon;
              const isExpanded = expandedId === idea.id;

              return (
                <motion.div
                  key={idea.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{
                    duration: 0.4,
                    delay: i * 0.05,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  className="glass-card rounded-xl border border-white/[0.06] overflow-hidden"
                >
                  {/* Idea Header */}
                  <button
                    onClick={() =>
                      setExpandedId(isExpanded ? null : idea.id)
                    }
                    className="w-full text-left p-5 sm:p-6 flex flex-col sm:flex-row sm:items-start gap-4 hover:bg-white/[0.02] transition-colors"
                  >
                    {/* Left: Upvotes */}
                    <div className="flex sm:flex-col items-center gap-1.5 sm:gap-0.5 sm:min-w-[56px]">
                      <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-white/[0.04] border border-white/[0.06]">
                        <ChevronUp className="size-4 text-violet-400" />
                      </div>
                      <span className="text-sm font-semibold">{idea.upvotes}</span>
                    </div>

                    {/* Center: Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1.5">
                        <h3 className="text-base font-semibold leading-snug">
                          {idea.title}
                        </h3>
                        {idea.status === "launched" && idea.launchedProjectId && (
                          <Link
                            href={`/project/${idea.launchedProjectId}`}
                            onClick={(e) => e.stopPropagation()}
                            className="inline-flex items-center gap-1 text-xs text-emerald-400 hover:text-emerald-300 transition-colors"
                          >
                            {t("ideas.viewProject")}
                            <ArrowRight className="size-3" />
                          </Link>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                        {idea.description}
                      </p>
                      <div className="flex flex-wrap items-center gap-2 mt-3">
                        <Badge
                          variant="outline"
                          className={`text-[10px] ${status.color}`}
                        >
                          <StatusIcon className="size-3 mr-1" />
                          {status.label}
                        </Badge>
                        <Badge variant="outline" className="text-[10px]">
                          {idea.category}
                        </Badge>
                        <span className="text-[11px] text-muted-foreground">
                          {t("ideas.by")} {idea.creatorName}
                        </span>
                        <span className="text-[11px] text-muted-foreground/60">
                          {idea.createdAt}
                        </span>
                      </div>
                    </div>

                    {/* Right: Quick Scores */}
                    <div className="hidden lg:flex items-center gap-4 text-xs text-muted-foreground">
                      <div className="text-center">
                        <div className="text-lg font-bold text-foreground">
                          {idea.aiEvaluation.viability}
                        </div>
                        <div>{t("ideas.viability")}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-foreground">
                          {idea.aiEvaluation.marketFit}
                        </div>
                        <div>{t("ideas.marketFit")}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-foreground">
                          {idea.aiEvaluation.uniqueness}
                        </div>
                        <div>{t("ideas.uniqueness")}</div>
                      </div>
                      <motion.div
                        animate={{ rotate: isExpanded ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                        className="ml-2"
                      >
                        <ChevronUp className="size-4 rotate-180 text-muted-foreground/40" />
                      </motion.div>
                    </div>
                  </button>

                  {/* Expanded: AI Evaluation */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                        className="overflow-hidden"
                      >
                        <div className="border-t border-white/[0.06] p-5 sm:p-6 bg-white/[0.01]">
                          <div className="flex items-center gap-2 mb-5">
                            <Sparkles className="size-4 text-violet-400" />
                            <h4 className="text-sm font-semibold">
                              {t("ideas.aiEvaluation")}
                            </h4>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Scores */}
                            <div className="space-y-3">
                              <ScoreBar
                                label={t("ideas.viability")}
                                value={idea.aiEvaluation.viability}
                              />
                              <ScoreBar
                                label={t("ideas.marketFit")}
                                value={idea.aiEvaluation.marketFit}
                              />
                              <ScoreBar
                                label={t("ideas.uniqueness")}
                                value={idea.aiEvaluation.uniqueness}
                              />

                              <div className="flex items-center gap-4 pt-2">
                                <div className="flex items-center gap-1.5">
                                  <Target className="size-3.5 text-muted-foreground" />
                                  <span className="text-xs text-muted-foreground">
                                    {t("ideas.competition")}
                                  </span>
                                  <span
                                    className={`text-xs font-medium capitalize ${competitionColor(idea.aiEvaluation.competition)}`}
                                  >
                                    {idea.aiEvaluation.competition}
                                  </span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <Zap className="size-3.5 text-muted-foreground" />
                                  <span className="text-xs text-muted-foreground">
                                    {t("ideas.difficulty")}
                                  </span>
                                  <span
                                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium border capitalize ${difficultyColor(idea.aiEvaluation.difficulty)}`}
                                  >
                                    {idea.aiEvaluation.difficulty}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Suggestions & Similar */}
                            <div className="space-y-4">
                              <div>
                                <h5 className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1.5">
                                  <Star className="size-3" />
                                  {t("ideas.aiSuggestions")}
                                </h5>
                                <ul className="space-y-1.5">
                                  {idea.aiEvaluation.suggestions.map(
                                    (s, idx) => (
                                      <li
                                        key={idx}
                                        className="flex items-start gap-2 text-xs text-muted-foreground leading-relaxed"
                                      >
                                        <CheckCircle2 className="size-3 text-violet-400 mt-0.5 shrink-0" />
                                        {s}
                                      </li>
                                    )
                                  )}
                                </ul>
                              </div>

                              {idea.aiEvaluation.similarProjects.length > 0 && (
                                <div>
                                  <h5 className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1.5">
                                    <AlertTriangle className="size-3" />
                                    {t("ideas.similarProjects")}
                                  </h5>
                                  <div className="flex flex-wrap gap-1.5">
                                    {idea.aiEvaluation.similarProjects.map(
                                      (p) => (
                                        <Badge
                                          key={p}
                                          variant="outline"
                                          className="text-[10px]"
                                        >
                                          {p}
                                        </Badge>
                                      )
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        )}
      </AnimatePresence>

      {/* Submit CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="mt-16 text-center"
      >
        <div className="glass-card-strong rounded-2xl border border-white/[0.06] p-8 sm:p-12 max-w-2xl mx-auto">
          <Lightbulb className="mx-auto size-8 text-violet-400 mb-4" />
          <h2 className="text-2xl font-bold mb-2">
            {t("ideas.haveAnIdea")}
          </h2>
          <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
            {t("ideas.ctaDesc")}
          </p>
          <Link href="/launch">
            <Button className="bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white hover:from-violet-500 hover:to-fuchsia-500 shadow-lg shadow-violet-500/10">
              <Rocket className="mr-2 size-4" />
              {t("ideas.submitIdea")}
            </Button>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
