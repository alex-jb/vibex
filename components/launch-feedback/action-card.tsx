"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, X, SkipForward, Sparkles, AlertTriangle, Lightbulb } from "lucide-react";
import type { FeedbackAction, FeedbackSeverity, FeedbackActionType } from "@/lib/types";

const SEVERITY_STYLE: Record<
  FeedbackSeverity,
  { label: string; color: string; bg: string; border: string; accentBar: string }
> = {
  must_fix: {
    label: "MUST FIX",
    color: "var(--neon-orange)",
    bg: "rgba(249,115,22,0.08)",
    border: "var(--neon-orange)",
    accentBar: "var(--neon-orange)",
  },
  should_try: {
    label: "SHOULD TRY",
    color: "var(--neon-yellow)",
    bg: "rgba(250,204,21,0.06)",
    border: "rgba(250,204,21,0.4)",
    accentBar: "var(--neon-yellow)",
  },
  consider: {
    label: "CONSIDER",
    color: "var(--neon-cyan)",
    bg: "rgba(6,182,212,0.06)",
    border: "rgba(6,182,212,0.3)",
    accentBar: "var(--neon-cyan)",
  },
};

const TYPE_LABEL: Record<FeedbackActionType, string> = {
  tagline_rewrite: "Tagline",
  description_rewrite: "Description",
  demo_add: "Demo (missing)",
  demo_quality: "Demo quality",
  audience_narrow: "Audience",
  cta_revamp: "Call to action",
  tag_fix: "Tags",
  category_retarget: "Category",
  thumbnail_upgrade: "Thumbnail",
  pricing_clarify: "Pricing",
};

export interface ActionCardProps {
  action: FeedbackAction;
  onApply: (actionId: string, appliedValue: string) => Promise<void> | void;
  onSkip: (actionId: string) => Promise<void> | void;
  onReject: (actionId: string, reason?: string) => Promise<void> | void;
}

export function ActionCard({ action, onApply, onSkip, onReject }: ActionCardProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [pending, setPending] = useState<null | "apply" | "skip" | "reject">(null);

  const severity = SEVERITY_STYLE[action.severity];
  const typeLabel = TYPE_LABEL[action.type];
  const isTerminal = action.status !== "suggested";

  const handleApply = async () => {
    const value = action.suggested_values[selectedIndex] ?? action.suggested_values[0];
    if (!value) return;
    setPending("apply");
    try {
      await onApply(action.action_id, value);
    } finally {
      setPending(null);
    }
  };

  const handleSkip = async () => {
    setPending("skip");
    try {
      await onSkip(action.action_id);
    } finally {
      setPending(null);
    }
  };

  const handleReject = async () => {
    setPending("reject");
    try {
      await onReject(action.action_id);
    } finally {
      setPending(null);
    }
  };

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className="relative overflow-hidden rounded-lg glass-card-strong"
      style={{
        borderLeft: `4px solid ${severity.accentBar}`,
        background: severity.bg,
      }}
    >
      {/* Header: severity badge + type */}
      <div className="flex items-center gap-2 px-4 pt-4">
        <span
          className="inline-flex items-center min-h-6 font-pixel text-[8px] uppercase tracking-widest px-2 py-1"
          style={{
            color: severity.color,
            border: `2px solid ${severity.border}`,
            background: "rgba(0,0,0,0.35)",
            textShadow: `0 0 8px ${severity.color}`,
          }}
        >
          {severity.label}
        </span>
        <span className="font-pixel text-[9px] uppercase tracking-widest text-muted-foreground">
          {typeLabel}
        </span>
        {isTerminal && (
          <span className="ml-auto font-pixel text-[8px] uppercase tracking-widest text-muted-foreground/60">
            {action.status}
          </span>
        )}
      </div>

      {/* Rationale */}
      <p className="px-4 pt-3 font-retro text-base leading-relaxed text-foreground/90">
        {action.rationale}
      </p>

      {/* Current value */}
      {action.current_value && (
        <div className="mx-4 mt-3 rounded border border-white/[0.06] bg-black/40 p-3">
          <div className="mb-1 font-pixel text-[7px] uppercase tracking-widest text-muted-foreground/70">
            Now
          </div>
          <div className="font-retro text-sm text-muted-foreground break-words">
            {action.current_value}
          </div>
        </div>
      )}

      {/* Suggested candidates */}
      {!isTerminal && action.suggested_values.length > 0 && (
        <div className="px-4 pt-3">
          <div className="mb-2 font-pixel text-[7px] uppercase tracking-widest text-muted-foreground/70">
            Pick one
          </div>
          <div className="flex flex-col gap-2">
            {action.suggested_values.map((candidate, i) => {
              const isSelected = i === selectedIndex;
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => setSelectedIndex(i)}
                  className="group flex items-start gap-3 rounded border p-3 text-left transition-colors min-h-11"
                  style={{
                    borderColor: isSelected ? severity.color : "rgba(255,255,255,0.08)",
                    background: isSelected ? "rgba(255,255,255,0.04)" : "transparent",
                  }}
                  aria-pressed={isSelected}
                >
                  <span
                    className="mt-0.5 flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full border-2"
                    style={{
                      borderColor: isSelected ? severity.color : "rgba(255,255,255,0.2)",
                      background: isSelected ? severity.color : "transparent",
                    }}
                  >
                    {isSelected && <Check className="h-2.5 w-2.5 text-black" strokeWidth={4} />}
                  </span>
                  <span className="font-retro text-sm text-foreground break-words">
                    {candidate}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Outcome delta (for applied actions with computed outcome) */}
      <AnimatePresence>
        {action.outcome_delta && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mx-4 mt-3 overflow-hidden rounded border border-green-500/20 bg-green-500/5 p-3"
          >
            <div className="mb-1 flex items-center gap-2">
              <Sparkles className="h-3 w-3 text-green-400" />
              <span className="font-pixel text-[7px] uppercase tracking-widest text-green-400">
                Outcome · {action.outcome_delta.window_hours}h
              </span>
            </div>
            <div className="font-retro text-sm text-foreground">
              {action.outcome_delta.metric}:{" "}
              <span className="text-muted-foreground">{action.outcome_delta.baseline}</span> →{" "}
              <span className="text-green-400 font-semibold">{action.outcome_delta.after}</span>
              {action.outcome_delta.delta_pct >= 0 && " (+"}
              {action.outcome_delta.delta_pct < 0 && " ("}
              <span
                className={action.outcome_delta.delta_pct >= 0 ? "text-green-400" : "text-red-400"}
              >
                {action.outcome_delta.delta_pct.toFixed(0)}%
              </span>
              )
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Actions */}
      {!isTerminal && (
        <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-white/[0.04] px-4 py-3">
          <button
            type="button"
            onClick={handleApply}
            disabled={pending !== null}
            className="inline-flex items-center gap-1.5 min-h-11 rounded px-4 font-pixel text-[10px] uppercase tracking-wider text-black transition-opacity disabled:opacity-50"
            style={{ background: severity.color }}
          >
            <Check className="h-3 w-3" />
            {pending === "apply" ? "Applying..." : "Apply"}
          </button>
          <button
            type="button"
            onClick={handleSkip}
            disabled={pending !== null}
            className="inline-flex items-center gap-1.5 min-h-11 rounded border border-white/10 px-3 font-pixel text-[10px] uppercase tracking-wider text-muted-foreground hover:text-foreground hover:border-white/20 transition-colors disabled:opacity-50"
          >
            <SkipForward className="h-3 w-3" />
            Skip
          </button>
          <button
            type="button"
            onClick={handleReject}
            disabled={pending !== null}
            className="inline-flex items-center gap-1.5 min-h-11 rounded px-3 font-pixel text-[10px] uppercase tracking-wider text-muted-foreground/60 hover:text-red-400 transition-colors disabled:opacity-50"
          >
            <X className="h-3 w-3" />
            Reject
          </button>
          <span
            className="ml-auto inline-flex items-center gap-1.5 font-pixel text-[7px] uppercase tracking-widest text-muted-foreground/60"
            title="Metric we'll watch to measure whether this action helped"
          >
            <Lightbulb className="h-2.5 w-2.5" />
            track · {action.success_metric}
          </span>
        </div>
      )}

      {/* Terminal states */}
      {isTerminal && action.status === "applied" && (
        <div className="mt-4 flex items-center gap-2 border-t border-white/[0.04] px-4 py-3">
          <Check className="h-3 w-3 text-green-400" />
          <span className="font-pixel text-[8px] uppercase tracking-widest text-green-400">
            Applied
          </span>
          {action.applied_value && (
            <span className="font-retro text-sm text-muted-foreground truncate">
              — {action.applied_value}
            </span>
          )}
        </div>
      )}
      {isTerminal && action.status === "skipped" && (
        <div className="mt-4 flex items-center gap-2 border-t border-white/[0.04] px-4 py-3">
          <SkipForward className="h-3 w-3 text-muted-foreground" />
          <span className="font-pixel text-[8px] uppercase tracking-widest text-muted-foreground">
            Skipped — still visible for later
          </span>
        </div>
      )}
      {isTerminal && action.status === "rejected" && (
        <div className="mt-4 flex items-center gap-2 border-t border-white/[0.04] px-4 py-3 opacity-50">
          <AlertTriangle className="h-3 w-3 text-red-400" />
          <span className="font-pixel text-[8px] uppercase tracking-widest text-red-400">
            Rejected
          </span>
        </div>
      )}
    </motion.article>
  );
}
