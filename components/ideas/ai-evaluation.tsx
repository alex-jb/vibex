"use client";

import { motion } from "framer-motion";
import {
  Sparkles,
  Zap,
  Target,
  CheckCircle2,
  Star,
  AlertTriangle,
} from "lucide-react";
import type { IdeaEvaluation } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { useLang } from "@/lib/i18n";
import { difficultyColor, competitionColor } from "./idea-helpers";

function ScoreBar({ label, value }: { label: string; value: number }) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium text-foreground">{value}%</span>
      </div>
      <div className="h-1.5 rounded-full bg-white/5">
        <motion.div
          className="h-full rounded-full"
          style={{ background: "var(--neon-purple)" }}
          initial={{ width: 0 }}
          whileInView={{ width: `${value}%` }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>
    </div>
  );
}

export function AiEvaluationPanel({
  evaluation,
  estimatedCategory,
}: {
  evaluation: IdeaEvaluation;
  estimatedCategory?: string;
}) {
  const { t } = useLang();

  return (
    <div className="border-t border-white/[0.06] p-5 sm:p-6 bg-white/[0.01]">
      <div className="flex items-center gap-2 mb-5">
        <Sparkles className="size-4 text-violet-400" />
        <h4 className="text-sm font-semibold">
          {t("ideas.aiEvaluation")}
        </h4>
        {estimatedCategory && (
          <Badge
            variant="outline"
            className="text-[10px] ml-auto"
          >
            {estimatedCategory}
          </Badge>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Scores */}
        <div className="space-y-3">
          <ScoreBar
            label={t("ideas.viability")}
            value={evaluation.viability}
          />
          <ScoreBar
            label={t("ideas.marketFit")}
            value={evaluation.marketFit}
          />
          <ScoreBar
            label={t("ideas.uniqueness")}
            value={evaluation.uniqueness}
          />

          <div className="flex items-center gap-4 pt-2">
            <div className="flex items-center gap-1.5">
              <Target className="size-3.5 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">
                {t("ideas.competition")}
              </span>
              <span
                className={`text-xs font-medium capitalize ${competitionColor(evaluation.competition)}`}
              >
                {evaluation.competition}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <Zap className="size-3.5 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">
                {t("ideas.difficulty")}
              </span>
              <span
                className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium border capitalize ${difficultyColor(evaluation.difficulty)}`}
              >
                {evaluation.difficulty}
              </span>
            </div>
          </div>
        </div>

        {/* Suggestions & Similar */}
        <div className="space-y-4">
          {evaluation.suggestions.length > 0 && (
            <div>
              <h5 className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1.5">
                <Star className="size-3" />
                {t("ideas.aiSuggestions")}
              </h5>
              <ul className="space-y-1.5">
                {evaluation.suggestions.map(
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
          )}

          {evaluation.similarProjects.length > 0 && (
            <div>
              <h5 className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1.5">
                <AlertTriangle className="size-3" />
                {t("ideas.similarProjects")}
              </h5>
              <div className="flex flex-wrap gap-1.5">
                {evaluation.similarProjects.map(
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
  );
}
