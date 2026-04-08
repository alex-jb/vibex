"use client";

import { use, useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import type { GrowthSuggestion } from "@/lib/ai";

interface DailyStat {
  day: string;
  views: number;
  clicks: number;
  shares: number;
  upvotes: number;
  demo_plays: number;
}

interface AnalyticsData {
  projectId: string;
  period: string;
  totals: Record<string, number>;
  daily: DailyStat[];
  conversionRate: number;
}

function PixelChart({ data, dataKey, color, height = 80 }: { data: DailyStat[]; dataKey: keyof DailyStat; color: string; height?: number }) {
  const values = data.map((d) => d[dataKey] as number);
  const max = Math.max(...values, 1);

  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 2, height }}>
      {values.map((val, i) => {
        const h = Math.max(2, (val / max) * height);
        return (
          <div
            key={i}
            title={`${data[i].day}: ${val}`}
            style={{
              flex: 1,
              height: h,
              background: color,
              opacity: 0.7 + (val / max) * 0.3,
              transition: "height 0.3s",
            }}
          />
        );
      })}
    </div>
  );
}

export default function ProjectAnalyticsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: projectId } = use(params);
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [suggestions, setSuggestions] = useState<GrowthSuggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [sugLoading, setSugLoading] = useState(false);

  useEffect(() => {
    fetch(`/api/project/${projectId}/analytics`)
      .then((res) => res.json())
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [projectId]);

  const fetchSuggestions = useCallback(async () => {
    if (!data) return;
    setSugLoading(true);
    try {
      const res = await fetch("/api/ai/growth-suggestions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: `Project ${projectId}`,
          description: "AI project",
          category: "AI Tool",
          views: data.totals.views,
          upvotes: data.totals.upvotes,
          comments: 0,
          daysSinceLaunch: data.daily.length,
        }),
      });
      if (res.ok) {
        setSuggestions(await res.json());
      }
    } catch {} finally {
      setSugLoading(false);
    }
  }, [data, projectId]);

  const EFFORT_COLORS: Record<string, string> = {
    "5min": "#39FF14",
    "30min": "#FACC15",
    "1hr": "#FF4500",
    "1day": "#9D00FF",
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6">
      {/* Terminal Header */}
      <div
        style={{
          background: "#0A0A0C", padding: "8px 12px",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          borderBottom: "2px solid #2A2A30",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ width: 10, height: 10, background: "#FF4500", display: "inline-block" }} />
          <span style={{ width: 10, height: 10, background: "#FACC15", display: "inline-block" }} />
          <span style={{ width: 10, height: 10, background: "#39FF14", display: "inline-block" }} />
        </div>
        <span className="font-pixel" style={{ fontSize: 8, color: "#555", letterSpacing: 2 }}>
          VIBEX://PROJECT-ANALYTICS
        </span>
      </div>

      <div className="rpgui-container framed" style={{ padding: 20, minHeight: "60vh", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, background: "repeating-linear-gradient(0deg, transparent 0, transparent 2px, rgba(0,0,0,0.08) 2px, rgba(0,0,0,0.08) 4px)", pointerEvents: "none", zIndex: 1 }} />

        <div style={{ position: "relative", zIndex: 2 }}>
          <motion.div initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} className="font-pixel" style={{ fontSize: 14, color: "#06B6D4", marginBottom: 16 }}>
            {"> Project Analytics"}
          </motion.div>

          {loading && (
            <div className="font-pixel" style={{ fontSize: 8, color: "#555", textAlign: "center", padding: 40 }}>
              LOADING ANALYTICS...
            </div>
          )}

          {data && (
            <>
              {/* Stat cards */}
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20 }}>
                {[
                  { label: "Views", value: data.totals.views, color: "#39FF14" },
                  { label: "Clicks", value: data.totals.clicks, color: "#06B6D4" },
                  { label: "Shares", value: data.totals.shares, color: "#9D00FF" },
                  { label: "Upvotes", value: data.totals.upvotes, color: "#FACC15" },
                  { label: "Demo", value: data.totals.demo_plays, color: "#FF4500" },
                  { label: "Conv. Rate", value: `${data.conversionRate}%`, color: "#FF69B4" },
                ].map((s) => (
                  <div key={s.label} className="retro-card" style={{ padding: "8px 14px", textAlign: "center", minWidth: 80 }}>
                    <div className="font-pixel" style={{ fontSize: 14, color: s.color }}>{s.value}</div>
                    <div className="font-pixel" style={{ fontSize: 7, color: "#888" }}>{s.label}</div>
                  </div>
                ))}
              </div>

              {/* Charts */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
                {[
                  { key: "views" as const, label: "Views", color: "#39FF14" },
                  { key: "clicks" as const, label: "Clicks", color: "#06B6D4" },
                  { key: "shares" as const, label: "Shares", color: "#9D00FF" },
                  { key: "upvotes" as const, label: "Upvotes", color: "#FACC15" },
                ].map((chart) => (
                  <div key={chart.key} className="retro-card" style={{ padding: 10 }}>
                    <div className="font-pixel" style={{ fontSize: 7, color: chart.color, marginBottom: 6 }}>
                      {chart.label} ({data.period})
                    </div>
                    <PixelChart data={data.daily} dataKey={chart.key} color={chart.color} />
                  </div>
                ))}
              </div>

              {/* AI Growth Suggestions */}
              <div className="retro-card l-corner" style={{ padding: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                  <div className="font-pixel" style={{ fontSize: 10, color: "#FACC15" }}>
                    {"AI Growth Suggestions"}
                  </div>
                  <button
                    className="nes-btn is-primary"
                    onClick={fetchSuggestions}
                    disabled={sugLoading}
                    style={{ fontSize: 7, padding: "3px 10px" }}
                  >
                    {sugLoading ? "..." : "Generate Suggestions"}
                  </button>
                </div>

                {suggestions.length === 0 && !sugLoading && (
                  <div className="font-pixel" style={{ fontSize: 8, color: "#555" }}>
                    {"Click 'Generate Suggestions' to get AI optimization tips"}
                  </div>
                )}

                {suggestions.map((sug, i) => (
                  <div key={i} style={{ padding: "6px 0", borderBottom: "1px solid #1A1A1E" }}>
                    <div style={{ display: "flex", gap: 6, alignItems: "center", marginBottom: 2 }}>
                      <span className="font-pixel" style={{
                        fontSize: 6, color: "#0D0D0D", padding: "0 5px",
                        background: sug.priority === "high" ? "#FF4500" : sug.priority === "medium" ? "#FACC15" : "#39FF14",
                      }}>
                        {sug.priority.toUpperCase()}
                      </span>
                      <span className="font-pixel" style={{ fontSize: 6, color: EFFORT_COLORS[sug.effort] ?? "#888", padding: "0 4px", border: `1px solid ${EFFORT_COLORS[sug.effort] ?? "#888"}` }}>
                        {sug.effort}
                      </span>
                    </div>
                    <div className="font-retro" style={{ fontSize: 12, color: "#E8E8EC" }}>{sug.action}</div>
                    <div className="font-retro" style={{ fontSize: 11, color: "#888" }}>{sug.reason}</div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
