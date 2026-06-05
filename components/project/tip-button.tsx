/**
 * <TipButton /> — Backer Mode v0 PMF button.
 *
 * Drops onto /project/[id] page. Opens a small modal asking for amount
 * + email. POSTs to /api/tip-interest. NO MONEY MOVES.
 *
 * Why this exists instead of full Stripe: 6/4 audit identified Backer
 * Mode spec deferred 6 weeks waiting on traction signal. This is the
 * traction signal: capture "would tip" intent at launch week zero
 * cost. If 20+ visitors submit → ship full Stripe. If <5 → don't.
 *
 * Spec ref: docs/superpowers/specs/2026-04-23-backer-mode-design.md
 */
"use client";

import { useState, useCallback } from "react";
import { trackEvent } from "@/lib/analytics";

interface TipButtonProps {
  projectId: string;
  projectTitle: string;
  creatorName?: string;
}

const PRESET_AMOUNTS = [1, 5, 20] as const;

export function TipButton({ projectId, projectTitle, creatorName }: TipButtonProps) {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState<number>(5);
  const [email, setEmail] = useState("");
  const [note, setNote] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState<string>("");

  const visitorToken = useCallback(() => {
    if (typeof window === "undefined") return null;
    let t = window.localStorage.getItem("vibex_visitor_token");
    if (!t) {
      t = crypto.randomUUID();
      window.localStorage.setItem("vibex_visitor_token", t);
    }
    return t;
  }, []);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setStatus("submitting");
      setErrorMsg("");
      try {
        const res = await fetch("/api/tip-interest", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            project_id: projectId,
            email: email.trim().toLowerCase(),
            amount_usd: amount,
            note: note.trim() || null,
            referrer: typeof window !== "undefined" ? window.location.pathname : null,
            visitor_token: visitorToken(),
          }),
        });
        if (!res.ok) {
          const data = (await res.json().catch(() => ({}))) as { error?: string };
          throw new Error(data.error || `HTTP ${res.status}`);
        }
        trackEvent("tip_interest_submit", { project_id: projectId, amount_usd: amount });
        setStatus("success");
      } catch (err) {
        setStatus("error");
        setErrorMsg(err instanceof Error ? err.message : "save failed");
      }
    },
    [projectId, email, amount, note, visitorToken],
  );

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => {
          setOpen(true);
          trackEvent("tip_interest_open", { project_id: projectId });
        }}
        className="inline-flex items-center gap-2 rounded-md border border-[#F97316] bg-[#1a1a20] px-4 py-2 text-[#F97316] hover:bg-[#F97316] hover:text-black transition-colors text-sm font-medium"
        aria-label={`Tip ${creatorName || "the creator"}`}
      >
        <span aria-hidden>💰</span>
        <span>Tip {creatorName ? creatorName.split(" ")[0] : "creator"}</span>
      </button>
    );
  }

  if (status === "success") {
    return (
      <div
        role="status"
        className="rounded-md border border-[#39FF14] bg-[#0a1a0a] px-4 py-3 text-sm text-[#39FF14]"
      >
        ✓ Thanks. We&apos;ll email you when Backer Mode opens for {projectTitle}.
      </div>
    );
  }

  return (
    <div className="rounded-md border border-[#2A2A30] bg-[#14141A] p-4">
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="text-sm text-[#E8E8EC]">
          <strong>Backer Mode is coming.</strong>{" "}
          <span className="text-[#857596]">No money moves yet. Tell us what you&apos;d back this at.</span>
        </div>

        <div className="flex gap-2">
          {PRESET_AMOUNTS.map((a) => (
            <button
              key={a}
              type="button"
              onClick={() => setAmount(a)}
              className={`px-3 py-1.5 text-sm rounded border ${
                amount === a
                  ? "border-[#F97316] bg-[#F97316] text-black font-medium"
                  : "border-[#3A3A42] text-[#E8E8EC] hover:border-[#F97316]"
              }`}
            >
              ${a}
            </button>
          ))}
          <input
            type="number"
            min={1}
            max={1000}
            value={amount}
            onChange={(e) => setAmount(Math.max(1, Math.min(1000, Number(e.target.value) || 0)))}
            className="w-20 px-2 py-1 text-sm rounded border border-[#3A3A42] bg-[#0A0A0C] text-[#E8E8EC]"
            aria-label="Custom amount"
          />
        </div>

        <input
          type="email"
          required
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-3 py-2 text-sm rounded border border-[#3A3A42] bg-[#0A0A0C] text-[#E8E8EC] placeholder-[#857596]"
          aria-label="Email"
        />

        <textarea
          placeholder="Optional: why you'd back this (max 200 chars)"
          value={note}
          onChange={(e) => setNote(e.target.value.slice(0, 200))}
          rows={2}
          className="w-full px-3 py-2 text-sm rounded border border-[#3A3A42] bg-[#0A0A0C] text-[#E8E8EC] placeholder-[#857596] resize-none"
          aria-label="Note"
        />

        <div className="flex gap-2 items-center">
          <button
            type="submit"
            disabled={status === "submitting" || !email}
            className="rounded-md bg-[#F97316] px-4 py-2 text-black text-sm font-medium hover:bg-[#FFE27D] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {status === "submitting" ? "Saving..." : `Back at $${amount}`}
          </button>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="rounded-md border border-[#3A3A42] px-4 py-2 text-[#E8E8EC] text-sm hover:border-[#F97316]"
          >
            Cancel
          </button>
          {errorMsg && (
            <span role="alert" className="text-xs text-[#EF4444]">
              {errorMsg}
            </span>
          )}
        </div>
      </form>
    </div>
  );
}
