"use client";

import { useState, useEffect } from "react";
import { useLang } from "@/lib/i18n";

interface TrendingTag {
  tag: string;
  post_count: number;
  trending_score?: number;
}

interface TrendingSidebarProps {
  activeTag?: string;
  onTagClick: (tag: string | null) => void;
}

function getHeatIndicator(score: number): string {
  if (score >= 80) return "\uD83D\uDD25\uD83D\uDD25\uD83D\uDD25";
  if (score >= 50) return "\uD83D\uDD25\uD83D\uDD25";
  if (score >= 25) return "\uD83D\uDD25";
  return "";
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
        {tags.map((tag) => {
          const heat = getHeatIndicator(tag.trending_score ?? 0);
          return (
            <button
              key={tag.tag}
              onClick={() => onTagClick(tag.tag === activeTag ? null : tag.tag)}
              className="font-pixel"
              aria-label={`Filter by #${tag.tag}`}
              aria-pressed={tag.tag === activeTag}
              style={{
                fontSize: 7,
                color: tag.tag === activeTag ? "#FACC15" : "#9D00FF",
                background: tag.tag === activeTag ? "#FACC1515" : "none",
                border: "none",
                cursor: "pointer",
                textAlign: "left",
                padding: "3px 6px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 6,
              }}
            >
              <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                #{tag.tag}
              </span>
              <span style={{ display: "flex", alignItems: "center", gap: 4, flexShrink: 0 }}>
                {heat && <span style={{ fontSize: 9, lineHeight: 1 }}>{heat}</span>}
                <span style={{ color: "#555" }}>{tag.post_count}</span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
