import {
  Lightbulb,
  Clock,
  Rocket,
} from "lucide-react";
import type { Idea, IdeaEvaluation } from "@/lib/types";

export function difficultyColor(d: IdeaEvaluation["difficulty"]) {
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

export function competitionColor(c: IdeaEvaluation["competition"]) {
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

export function statusConfig(s: Idea["status"], t: (key: string) => string) {
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
