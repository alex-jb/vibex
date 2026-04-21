"use client";

import { useCallback, useEffect, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { RefreshCw, Sparkles, AlertCircle } from "lucide-react";
import type {
  FeedbackAction,
  FeedbackSeverity,
  StructuredReview,
} from "@/lib/types";
import { ActionCard } from "./action-card";

interface FeedbackPanelProps {
  projectId: string;
}

type TabValue = "all" | FeedbackSeverity | "applied";

const TABS: { key: TabValue; label: string; color: string }[] = [
  { key: "all",        label: "ALL",        color: "var(--neon-purple)" },
  { key: "must_fix",   label: "MUST FIX",   color: "var(--neon-orange)" },
  { key: "should_try", label: "SHOULD TRY", color: "var(--neon-yellow)" },
  { key: "consider",   label: "CONSIDER",   color: "var(--neon-cyan)" },
  { key: "applied",    label: "APPLIED",    color: "var(--neon-green)" },
];

export function FeedbackPanel({ projectId }: FeedbackPanelProps) {
  const [review, setReview] = useState<StructuredReview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<TabValue>("all");

  // Local optimistic state for action status changes. Keyed by action_id.
  const [localStatus, setLocalStatus] = useState<
    Record<string, Partial<FeedbackAction>>
  >({});

  const loadReview = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/launch-feedback/${projectId}`, {
        cache: "no-store",
      });
      if (!res.ok) {
        const msg = await res.text();
        throw new Error(msg || `HTTP ${res.status}`);
      }
      const data = (await res.json()) as StructuredReview;
      setReview(data);
      setLocalStatus({}); // fresh review wipes local overrides
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load feedback");
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    loadReview();
  }, [loadReview]);

  const regenerate = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/launch-feedback/generate", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ projectId }),
      });
      if (!res.ok) {
        const msg = await res.text();
        throw new Error(msg || `HTTP ${res.status}`);
      }
      const data = (await res.json()) as StructuredReview;
      setReview(data);
      setLocalStatus({});
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to regenerate");
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  const handleApply = useCallback(
    async (actionId: string, appliedValue: string) => {
      if (!review) return;
      // Optimistic update
      setLocalStatus((prev) => ({
        ...prev,
        [actionId]: { status: "applied", applied_value: appliedValue, applied_at: new Date().toISOString() },
      }));
      try {
        await fetch("/api/launch-feedback/apply", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            projectId,
            reviewId: review.review_id,
            actionId,
            appliedValue,
          }),
        });
      } catch {
        // Roll back on network error
        setLocalStatus((prev) => {
          const next = { ...prev };
          delete next[actionId];
          return next;
        });
      }
    },
    [projectId, review],
  );

  const handleSkip = useCallback(
    async (actionId: string) => {
      if (!review) return;
      setLocalStatus((prev) => ({
        ...prev,
        [actionId]: { status: "skipped" },
      }));
      try {
        await fetch("/api/launch-feedback/skip", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            projectId,
            reviewId: review.review_id,
            actionId,
          }),
        });
      } catch {
        setLocalStatus((prev) => {
          const next = { ...prev };
          delete next[actionId];
          return next;
        });
      }
    },
    [projectId, review],
  );

  const handleReject = useCallback(
    async (actionId: string, reason?: string) => {
      if (!review) return;
      setLocalStatus((prev) => ({
        ...prev,
        [actionId]: { status: "rejected", reject_reason: reason },
      }));
      try {
        await fetch("/api/launch-feedback/reject", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            projectId,
            reviewId: review.review_id,
            actionId,
            reason,
          }),
        });
      } catch {
        setLocalStatus((prev) => {
          const next = { ...prev };
          delete next[actionId];
          return next;
        });
      }
    },
    [projectId, review],
  );

  // Merge server actions with local optimistic overrides.
  const mergedActions: FeedbackAction[] =
    review?.actions.map((a) => ({ ...a, ...localStatus[a.action_id] })) ?? [];

  // Counts for tab badges
  const counts = {
    all: mergedActions.filter((a) => a.status !== "rejected").length,
    must_fix: mergedActions.filter(
      (a) => a.severity === "must_fix" && a.status === "suggested",
    ).length,
    should_try: mergedActions.filter(
      (a) => a.severity === "should_try" && a.status === "suggested",
    ).length,
    consider: mergedActions.filter(
      (a) => a.severity === "consider" && a.status === "suggested",
    ).length,
    applied: mergedActions.filter((a) => a.status === "applied").length,
  };

  const visibleActions = mergedActions.filter((a) => {
    if (tab === "all") return a.status !== "rejected";
    if (tab === "applied") return a.status === "applied";
    // Severity tabs — only show suggested (non-terminal) in that severity.
    return a.severity === tab && a.status === "suggested";
  });

  return (
    <section
      aria-label="AI launch feedback"
      className="relative overflow-hidden rounded-2xl glass-card-strong"
      style={{ borderTop: "4px solid var(--neon-purple)" }}
    >
      {/* Header */}
      <header className="flex items-center gap-3 border-b border-white/[0.04] px-5 py-4">
        <Sparkles className="h-4 w-4" style={{ color: "var(--neon-green)", filter: "drop-shadow(0 0 4px rgba(57,255,20,0.5))" }} />
        <h2 className="font-pixel text-sm uppercase tracking-widest text-foreground">
          AI Launch Review
        </h2>
        <button
          type="button"
          onClick={regenerate}
          disabled={loading}
          className="ml-auto inline-flex items-center gap-1.5 min-h-9 rounded border border-white/10 px-3 font-pixel text-[9px] uppercase tracking-wider text-muted-foreground hover:text-foreground hover:border-white/20 transition-colors disabled:opacity-50"
          title="Regenerate with a fresh review pass"
        >
          <RefreshCw className={`h-3 w-3 ${loading ? "animate-spin" : ""}`} />
          Regenerate
        </button>
      </header>

      {/* Tabs */}
      <div className="flex items-center gap-1 overflow-x-auto border-b border-white/[0.04] px-3 py-2">
        {TABS.map((t) => {
          const active = tab === t.key;
          const count = counts[t.key];
          return (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              className="inline-flex items-center gap-1.5 min-h-9 px-3 font-pixel text-[9px] uppercase tracking-wider transition-colors rounded"
              style={{
                color: active ? t.color : "var(--text-muted, #8888A0)",
                background: active ? "rgba(255,255,255,0.05)" : "transparent",
                border: active ? `1px solid ${t.color}` : "1px solid transparent",
                textShadow: active ? `0 0 8px ${t.color}` : "none",
              }}
              aria-pressed={active}
            >
              {t.label}
              <span
                className="inline-flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[8px]"
                style={{
                  background: active ? t.color : "rgba(255,255,255,0.08)",
                  color: active ? "#000" : "var(--text-muted, #8888A0)",
                }}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Body */}
      <div className="p-5">
        {loading && (
          <div className="flex items-center justify-center py-12 font-pixel text-[10px] uppercase tracking-widest text-muted-foreground">
            <RefreshCw className="mr-2 h-3 w-3 animate-spin" />
            Thinking...
          </div>
        )}

        {error && !loading && (
          <div
            role="alert"
            className="flex items-start gap-3 rounded border border-red-500/30 bg-red-500/10 p-4"
          >
            <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-red-400" />
            <div className="flex-1">
              <div className="font-pixel text-[10px] uppercase tracking-wider text-red-400">
                Review failed
              </div>
              <div className="mt-1 font-retro text-sm text-muted-foreground break-words">
                {error}
              </div>
            </div>
          </div>
        )}

        {!loading && !error && visibleActions.length === 0 && (
          <div className="flex flex-col items-center justify-center gap-2 py-12">
            <Sparkles className="h-6 w-6" style={{ color: "rgba(57,255,20,0.4)" }} />
            <div className="font-pixel text-[10px] uppercase tracking-widest text-muted-foreground">
              {tab === "applied" ? "No actions applied yet" : "All clear in this bucket"}
            </div>
          </div>
        )}

        {!loading && !error && visibleActions.length > 0 && (
          <div className="flex flex-col gap-4">
            <AnimatePresence mode="popLayout">
              {visibleActions.map((action) => (
                <ActionCard
                  key={action.action_id}
                  action={action}
                  onApply={handleApply}
                  onSkip={handleSkip}
                  onReject={handleReject}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </section>
  );
}
