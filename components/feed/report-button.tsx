"use client";

import { useState, useCallback } from "react";
import { useLang } from "@/lib/i18n";

interface ReportButtonProps {
  postId: string;
}

export function ReportButton({ postId }: ReportButtonProps) {
  const { t } = useLang();
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const REASONS = [
    { value: "spam", label: t("feed.reportSpam") },
    { value: "harassment", label: t("feed.reportHarassment") },
    { value: "nsfw", label: t("feed.reportNsfw") },
    { value: "misinformation", label: t("feed.reportMisinfo") },
    { value: "other", label: t("feed.reportOther") },
  ];

  const handleReport = useCallback(
    async (reason: string) => {
      setSubmitting(true);
      setError(null);
      try {
        const res = await fetch(`/api/feed/${postId}/report`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ reason }),
        });
        if (res.ok) {
          setDone(true);
          setTimeout(() => {
            setOpen(false);
            setDone(false);
          }, 1500);
        } else {
          const data = await res.json().catch(() => ({}));
          setError(data.error ?? t("feed.reportFailed"));
        }
      } catch {
        setError(t("feed.networkError"));
      } finally {
        setSubmitting(false);
      }
    },
    [postId, t],
  );

  if (done) {
    return (
      <span className="font-pixel" style={{ fontSize: 7, color: "#39FF14" }}>
        {"\u2714 "}{t("feed.reported")}
      </span>
    );
  }

  return (
    <div style={{ position: "relative", display: "inline-block" }}>
      <button
        onClick={() => setOpen(!open)}
        className="font-pixel"
        style={{
          fontSize: 7,
          color: "#555",
          background: "none",
          border: "none",
          cursor: "pointer",
        }}
        aria-label={t("feed.report")}
      >
        {"\u26A0\uFE0F"}
      </button>

      {open && (
        <div
          style={{
            position: "absolute",
            bottom: "100%",
            right: 0,
            background: "#0D0D10",
            border: "2px solid #2A2A30",
            padding: 8,
            zIndex: 20,
            minWidth: 140,
          }}
        >
          <div className="font-pixel" style={{ fontSize: 7, color: "#F97316", marginBottom: 6 }}>
            {t("feed.reportReason")}
          </div>
          {error && (
            <div className="font-pixel" style={{ fontSize: 7, color: "#F97316", marginBottom: 4 }}>
              {error}
            </div>
          )}
          {REASONS.map((r) => (
            <button
              key={r.value}
              onClick={() => handleReport(r.value)}
              disabled={submitting}
              className="font-pixel"
              style={{
                display: "block",
                width: "100%",
                fontSize: 7,
                color: "#E8E8EC",
                background: "none",
                border: "none",
                cursor: submitting ? "wait" : "pointer",
                textAlign: "left",
                padding: "4px 6px",
                opacity: submitting ? 0.5 : 1,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#2A2A30";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "none";
              }}
            >
              {r.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
