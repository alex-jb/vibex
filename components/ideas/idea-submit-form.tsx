"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  ChevronUp,
  Plus,
  Loader2,
} from "lucide-react";
import type { IdeaEvaluation, ProjectCategory } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLang } from "@/lib/i18n";
import { AiEvaluationPanel } from "./ai-evaluation";

const categoryOptions: ProjectCategory[] = [
  "AI Agent",
  "AI Tool",
  "AI Game",
  "AI Workflow",
  "AI Utility",
  "Experimental",
  "Demo",
];

export function IdeaSubmitForm() {
  const { t } = useLang();
  const [showSubmitForm, setShowSubmitForm] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newCategory, setNewCategory] = useState<ProjectCategory>("AI Tool");
  const [evaluating, setEvaluating] = useState(false);
  const [evalResult, setEvalResult] = useState<IdeaEvaluation | null>(null);
  const [evalError, setEvalError] = useState<string | null>(null);

  const handleEvaluate = async () => {
    if (!newTitle.trim() || !newDescription.trim()) return;
    setEvaluating(true);
    setEvalResult(null);
    setEvalError(null);
    try {
      const res = await fetch("/api/ai/evaluate-idea", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newTitle,
          description: newDescription,
          category: newCategory,
        }),
      });
      if (!res.ok) {
        throw new Error(`API error: ${res.status}`);
      }
      const data = await res.json();
      setEvalResult(data as IdeaEvaluation);
    } catch (err) {
      setEvalError(err instanceof Error ? err.message : t("ideas.evalFailed"));
    } finally {
      setEvaluating(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="mt-16"
    >
      <div className="glass-card-strong rounded-2xl border border-white/[0.06] p-8 sm:p-10 max-w-2xl mx-auto">
        {/* Header / Toggle */}
        <button
          onClick={() => setShowSubmitForm((prev) => !prev)}
          className="w-full flex items-center justify-center gap-3 group"
        >
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/20 group-hover:bg-violet-500/20 transition-colors">
            <Plus className="size-5 text-violet-400" />
          </div>
          <div className="text-left">
            <h2 className="text-xl font-bold">{t("ideas.submitNew")}</h2>
            <p className="text-xs text-muted-foreground">
              {t("ideas.submitDesc")}
            </p>
          </div>
          <motion.div
            animate={{ rotate: showSubmitForm ? 180 : 0 }}
            transition={{ duration: 0.2 }}
            className="ml-auto"
          >
            <ChevronUp className="size-5 text-muted-foreground/40" />
          </motion.div>
        </button>

        <AnimatePresence>
          {showSubmitForm && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="overflow-hidden"
            >
              <div className="pt-6 space-y-4">
                {/* Title */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">
                    {t("ideas.titleField")}
                  </label>
                  <Input
                    placeholder={t("ideas.titlePlaceholder")}
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="h-10 bg-white/[0.03] border-white/[0.08] text-sm focus-visible:ring-violet-500/30"
                  />
                </div>

                {/* Description */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">
                    {t("ideas.descField")}
                  </label>
                  <textarea
                    placeholder={t("ideas.descPlaceholder")}
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                    rows={4}
                    className="w-full rounded-md bg-white/[0.03] border border-white/[0.08] px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500/30 resize-none"
                  />
                </div>

                {/* Category */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">
                    {t("ideas.category")}
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {categoryOptions.map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setNewCategory(cat)}
                        className={`rounded-full px-3 py-1.5 text-xs font-medium transition-all duration-200 border ${
                          newCategory === cat
                            ? "bg-violet-500/15 text-violet-300 border-violet-500/30"
                            : "bg-white/[0.03] text-muted-foreground border-white/[0.06] hover:bg-white/[0.06] hover:text-foreground"
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Evaluate Button */}
                <Button
                  onClick={handleEvaluate}
                  disabled={evaluating || !newTitle.trim() || !newDescription.trim()}
                  className="w-full bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white hover:from-violet-500 hover:to-fuchsia-500 shadow-lg shadow-violet-500/10 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {evaluating ? (
                    <>
                      <Loader2 className="mr-2 size-4 animate-spin" />
                      {t("ideas.aiEvaluating")}
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 size-4" />
                      {t("ideas.aiEvaluate")}
                    </>
                  )}
                </Button>

                {/* Error */}
                {evalError && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-lg border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400"
                  >
                    {evalError}
                  </motion.div>
                )}

                {/* Evaluation Result */}
                {evalResult && (
                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                    className="border-t border-white/[0.06] pt-6"
                  >
                    <AiEvaluationPanel
                      evaluation={evalResult}
                      estimatedCategory={evalResult.estimatedCategory}
                    />
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
