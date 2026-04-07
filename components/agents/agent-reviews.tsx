"use client";

import { useState, useEffect, useCallback } from "react";

interface Review {
  id: string;
  user_name: string;
  rating: number;
  content: string | null;
  created_at: string;
}

interface AgentReviewsProps {
  agentId: string;
}

function StarRating({ rating, interactive, onChange }: { rating: number; interactive?: boolean; onChange?: (r: number) => void }) {
  return (
    <div style={{ display: "flex", gap: 2 }}>
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          onClick={() => interactive && onChange?.(star)}
          style={{
            cursor: interactive ? "pointer" : "default",
            color: star <= rating ? "#FACC15" : "#2A2A30",
            fontSize: 14,
          }}
        >
          {"\u2605"}
        </span>
      ))}
    </div>
  );
}

export function AgentReviews({ agentId }: AgentReviewsProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [avgRating, setAvgRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [loading, setLoading] = useState(true);

  // Review form state
  const [myRating, setMyRating] = useState(0);
  const [myContent, setMyContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    fetch(`/api/agents/${agentId}/reviews`)
      .then((res) => res.json())
      .then((data) => {
        setReviews(data.reviews ?? []);
        setAvgRating(data.avgRating ?? 0);
        setTotalReviews(data.totalReviews ?? 0);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [agentId]);

  const handleSubmit = useCallback(async () => {
    if (myRating === 0 || submitting) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/agents/${agentId}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating: myRating, content: myContent || null }),
      });
      if (res.ok) {
        const newReview = await res.json();
        setReviews((prev) => [newReview, ...prev]);
        setSubmitted(true);
        setMyRating(0);
        setMyContent("");
      }
    } catch {} finally {
      setSubmitting(false);
    }
  }, [agentId, myRating, myContent, submitting]);

  return (
    <div className="rpgui-container framed" style={{ padding: 16, marginTop: 16 }}>
      {/* Header with avg rating */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
        <div className="font-pixel" style={{ fontSize: 10, color: "#FACC15" }}>
          {"\u2B50 \u8BC4\u4EF7"} ({totalReviews})
        </div>
        {avgRating > 0 && (
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <StarRating rating={Math.round(avgRating)} />
            <span className="font-pixel" style={{ fontSize: 8, color: "#FACC15" }}>
              {avgRating.toFixed(1)}
            </span>
          </div>
        )}
      </div>

      {/* Write review form */}
      {!submitted && (
        <div style={{ marginBottom: 16, padding: 10, background: "#0A0A0C", border: "1px solid #2A2A30" }}>
          <div className="font-pixel" style={{ fontSize: 7, color: "#888", marginBottom: 6 }}>
            {"\u5199\u8BC4\u4EF7"}
          </div>
          <StarRating rating={myRating} interactive onChange={setMyRating} />
          <textarea
            value={myContent}
            onChange={(e) => setMyContent(e.target.value.slice(0, 1000))}
            placeholder={"\u5206\u4EAB\u4F60\u7684\u4F7F\u7528\u4F53\u9A8C... (\u53EF\u9009)"}
            className="font-retro"
            style={{
              width: "100%", minHeight: 50, marginTop: 8,
              background: "transparent", border: "1px solid #2A2A30",
              padding: 8, fontSize: 12, color: "#E8E8EC", resize: "none", outline: "none",
            }}
          />
          <button
            className="nes-btn is-success"
            onClick={handleSubmit}
            disabled={myRating === 0 || submitting}
            style={{ fontSize: 8, padding: "4px 12px", marginTop: 6, opacity: myRating === 0 ? 0.4 : 1 }}
          >
            {submitting ? "\u63D0\u4EA4\u4E2D..." : "\u63D0\u4EA4\u8BC4\u4EF7"}
          </button>
        </div>
      )}

      {/* Review list */}
      {loading && <div className="font-pixel" style={{ fontSize: 8, color: "#555" }}>Loading...</div>}
      {!loading && reviews.length === 0 && (
        <div className="font-pixel" style={{ fontSize: 8, color: "#555", textAlign: "center", padding: 16 }}>
          {"\u6682\u65E0\u8BC4\u4EF7\uFF0C\u6210\u4E3A\u7B2C\u4E00\u4E2A\u8BC4\u4EF7\u8005\uFF01"}
        </div>
      )}
      {reviews.map((r) => (
        <div key={r.id} style={{ padding: "8px 0", borderTop: "1px solid #1A1A1E" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <span className="font-pixel" style={{ fontSize: 7, color: "#9D00FF" }}>{r.user_name}</span>
            <StarRating rating={r.rating} />
          </div>
          {r.content && (
            <div className="font-retro" style={{ fontSize: 12, color: "#AAA", lineHeight: 1.4 }}>
              {r.content}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
