"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronUp,
  ArrowRight,
} from "lucide-react";
import type { Idea } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { useLang } from "@/lib/i18n";
import { localizeCategory } from "@/lib/i18n-categories";
import Link from "next/link";
import { AiEvaluationPanel } from "./ai-evaluation";
import { statusConfig } from "./idea-helpers";

function formatIdeaDate(raw: string, lang: "en" | "zh"): string {
  if (!raw) return "";
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return raw;
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - d.getTime()) / 86_400_000);
  if (lang === "zh") {
    if (diffDays === 0) return "今天";
    if (diffDays === 1) return "昨天";
    if (diffDays < 30) return `${diffDays} 天前`;
    return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
  }
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 30) return `${diffDays}d ago`;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function IdeaCard({
  idea,
  index,
  isExpanded,
  onToggle,
}: {
  idea: Idea;
  index: number;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const { t, lang } = useLang();
  const status = statusConfig(idea.status, t);
  const StatusIcon = status.icon;
  const title = lang === "zh" && idea.title_zh ? idea.title_zh : idea.title;
  const description =
    lang === "zh" && idea.description_zh ? idea.description_zh : idea.description;

  return (
    <motion.div
      key={idea.id}
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{
        duration: 0.4,
        delay: index * 0.05,
        ease: [0.22, 1, 0.36, 1],
      }}
      className="glass-card rounded-xl border border-white/[0.06] overflow-hidden"
    >
      {/* Idea Header */}
      <button
        onClick={onToggle}
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
            <h3 className="text-base font-semibold leading-snug" style={{ color: "var(--text)" }}>
              {title}
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
          <p className="text-sm line-clamp-2 leading-relaxed" style={{ color: "var(--text-muted)" }}>
            {description}
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
              {localizeCategory(idea.category, lang)}
            </Badge>
            <span className="text-[11px]" style={{ color: "var(--text-muted)" }}>
              {t("ideas.by")} {idea.creatorName}
            </span>
            <span className="text-[11px]" style={{ color: "var(--text-muted)" }}>
              {formatIdeaDate(idea.createdAt, lang)}
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
            <AiEvaluationPanel evaluation={idea.aiEvaluation} />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
