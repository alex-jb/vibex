"use client";

import { useState, useCallback } from "react";

const REASONS = [
  { value: "spam", label: "\u5783\u573E\u5185\u5BB9" },
  { value: "harassment", label: "\u9A9A\u6270/\u8FB1\u9A82" },
  { value: "nsfw", label: "\u4E0D\u5F53\u5185\u5BB9" },
  { value: "misinformation", label: "\u8BEF\u5BFC\u4FE1\u606F" },
  { value: "other", label: "\u5176\u4ED6" },
] as const;

interface ReportButtonProps {
  postId: string;
}

export function ReportButton({ postId }: ReportButtonProps) {
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
          setError(data.error ?? "\u4E3E\u62A5\u5931\u8D25");
        }
      } catch {
        setError("\u7F51\u7EDC\u9519\u8BEF");
      } finally {
        setSubmitting(false);
      }
    },
    [postId],
  );

  if (done) {
    return (
      <span className="font-pixel" style={{ fontSize: 7, color: "#39FF14" }}>
        {"\u2714 \u5DF2\u4E3E\u62A5"}
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
        aria-label={"\u4E3E\u62A5"}
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
          <div className="font-pixel" style={{ fontSize: 7, color: "#FF4500", marginBottom: 6 }}>
            {"\u4E3E\u62A5\u539F\u56E0"}
          </div>
          {error && (
            <div className="font-pixel" style={{ fontSize: 7, color: "#FF4500", marginBottom: 4 }}>
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
