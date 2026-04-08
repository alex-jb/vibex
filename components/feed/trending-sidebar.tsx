"use client";

import { useState, useEffect } from "react";
import { useLang } from "@/lib/i18n";

interface TrendingTag {
  tag: string;
  post_count: number;
}

interface TrendingSidebarProps {
  activeTag?: string;
  onTagClick: (tag: string | null) => void;
}

export function TrendingSidebar({ activeTag, onTagClick }: TrendingSidebarProps) {
  const { t } = useLang();
  const [tags, setTags] = useState<TrendingTag[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/feed/tags")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setTags(data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="rpgui-container framed" style={{ padding: 12 }}>
        <div className="font-pixel" style={{ fontSize: 8, color: "#555" }}>
          LOADING TAGS...
        </div>
      </div>
    );
  }

  if (tags.length === 0) return null;

  return (
    <div className="rpgui-container framed" style={{ padding: 12 }}>
      {/* Header */}
      <div
        className="font-pixel"
        style={{ fontSize: 8, color: "#FACC15", marginBottom: 10 }}
      >
        {"\uD83D\uDD25 "}{t("feed.trendingTags")}
      </div>

      {/* Tag list */}
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        {activeTag && (
          <button
            onClick={() => onTagClick(null)}
            className="font-pixel"
            aria-label={t("feed.clearFilter")}
            style={{
              fontSize: 7,
              color: "#FF4500",
              background: "none",
              border: "none",
              cursor: "pointer",
              textAlign: "left",
              padding: "2px 0",
            }}
          >
            {"\u2716 "}{t("feed.clearFilter")}
          </button>
        )}
        {tags.map((t) => (
          <button
            key={t.tag}
            onClick={() => onTagClick(t.tag === activeTag ? null : t.tag)}
            className="font-pixel"
            aria-label={`Filter by #${t.tag}`}
            aria-pressed={t.tag === activeTag}
            style={{
              fontSize: 7,
              color: t.tag === activeTag ? "#FACC15" : "#9D00FF",
              background: t.tag === activeTag ? "#FACC1515" : "none",
              border: "none",
              cursor: "pointer",
              textAlign: "left",
              padding: "3px 6px",
              display: "flex",
              justifyContent: "space-between",
              gap: 8,
            }}
          >
            <span>#{t.tag}</span>
            <span style={{ color: "#555" }}>{t.post_count}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
