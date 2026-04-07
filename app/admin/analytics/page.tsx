"use client";

import { useState, useEffect } from "react";

interface Analytics {
  overview: Record<string, number>;
  daily: Record<string, number>;
  topCreators?: { name: string; posts: number; reactions_received: number; level: string }[];
  topHashtags?: { tag: string; count: number }[];
  growth?: Record<string, number>;
}

function StatCard({ label, value, color }: { label: string; value: string | number; color: string }) {
  return (
    <div className="retro-card l-corner" style={{ padding: 12, textAlign: "center", minWidth: 120 }}>
      <div className="font-pixel" style={{ fontSize: 16, color, marginBottom: 4 }}>
        {typeof value === "number" ? value.toLocaleString() : value}
      </div>
      <div className="font-pixel" style={{ fontSize: 7, color: "#888" }}>{label}</div>
    </div>
  );
}

function BarChart({ data, labelKey, valueKey, color }: { data: Record<string, unknown>[]; labelKey: string; valueKey: string; color: string }) {
  const maxVal = Math.max(...data.map((d) => (d[valueKey] as number) || 0), 1);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      {data.map((item, i) => {
        const val = (item[valueKey] as number) || 0;
        const width = Math.max(4, (val / maxVal) * 100);
        return (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span className="font-pixel" style={{ fontSize: 7, color: "#9D00FF", width: 80, textAlign: "right" }}>
              {String(item[labelKey])}
            </span>
            <div style={{ flex: 1, background: "#1A1A1E", height: 12 }}>
              <div style={{ width: `${width}%`, height: "100%", background: color, transition: "width 0.5s" }} />
            </div>
            <span className="font-pixel" style={{ fontSize: 7, color: "#FACC15", width: 40 }}>
              {val.toLocaleString()}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export default function AnalyticsPage() {
  const [data, setData] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/analytics")
      .then((res) => res.json())
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      {/* Terminal Header */}
      <div style={{ background: "#0A0A0C", padding: "8px 12px", display: "flex", alignItems: "center", gap: 8, borderBottom: "2px solid #2A2A30" }}>
        <span style={{ width: 10, height: 10, background: "#FF4500", display: "inline-block" }} />
        <span style={{ width: 10, height: 10, background: "#FACC15", display: "inline-block" }} />
        <span style={{ width: 10, height: 10, background: "#39FF14", display: "inline-block" }} />
        <span className="font-pixel" style={{ fontSize: 8, color: "#555", letterSpacing: 2, marginLeft: 8 }}>
          VIBEX://ANALYTICS v1.0
        </span>
      </div>

      <div className="rpgui-container framed" style={{ padding: 20, minHeight: "70vh" }}>
        <div className="font-pixel" style={{ fontSize: 14, color: "#06B6D4", marginBottom: 16 }}>
          {"> \u6570\u636E\u5206\u6790"}
        </div>

        {loading && (
          <div className="font-pixel" style={{ fontSize: 8, color: "#555", textAlign: "center", padding: 40 }}>
            LOADING ANALYTICS...
          </div>
        )}

        {data && (
          <>
            {/* Overview Stats */}
            <div className="font-pixel" style={{ fontSize: 9, color: "#FACC15", marginBottom: 8 }}>
              {"\uD83D\uDCCA \u5E73\u53F0\u6982\u89C8"}
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20 }}>
              {Object.entries(data.overview).map(([key, val]) => (
                <StatCard
                  key={key}
                  label={key.replace(/([A-Z])/g, " $1").replace(/^./, (s) => s.toUpperCase())}
                  value={val}
                  color={key.includes("Reaction") ? "#FF69B4" : key.includes("Post") ? "#39FF14" : "#06B6D4"}
                />
              ))}
            </div>

            {/* Daily Stats */}
            <div className="font-pixel" style={{ fontSize: 9, color: "#FACC15", marginBottom: 8 }}>
              {"\uD83D\uDCC5 \u4ECA\u65E5\u6570\u636E"}
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20 }}>
              {Object.entries(data.daily).map(([key, val]) => (
                <StatCard
                  key={key}
                  label={key.replace(/([A-Z])/g, " $1").replace(/Today/, "").trim()}
                  value={val}
                  color="#FACC15"
                />
              ))}
            </div>

            {/* Growth */}
            {data.growth && (
              <>
                <div className="font-pixel" style={{ fontSize: 9, color: "#FACC15", marginBottom: 8 }}>
                  {"\uD83D\uDCC8 \u5468\u73AF\u6BD4\u589E\u957F"}
                </div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20 }}>
                  {Object.entries(data.growth).map(([key, val]) => (
                    <StatCard
                      key={key}
                      label={key.replace(/WeekOverWeek/, "").replace(/([A-Z])/g, " $1").trim()}
                      value={`${val > 0 ? "+" : ""}${val}%`}
                      color={val > 0 ? "#39FF14" : "#FF4500"}
                    />
                  ))}
                </div>
              </>
            )}

            {/* Top Creators */}
            {data.topCreators && data.topCreators.length > 0 && (
              <>
                <div className="font-pixel" style={{ fontSize: 9, color: "#FACC15", marginBottom: 8 }}>
                  {"\uD83C\uDFC6 \u9876\u7EA7\u521B\u4F5C\u8005"}
                </div>
                <BarChart data={data.topCreators} labelKey="name" valueKey="reactions_received" color="#9D00FF" />
                <div style={{ marginBottom: 20 }} />
              </>
            )}

            {/* Top Hashtags */}
            {data.topHashtags && data.topHashtags.length > 0 && (
              <>
                <div className="font-pixel" style={{ fontSize: 9, color: "#FACC15", marginBottom: 8 }}>
                  {"# \u70ED\u95E8\u6807\u7B7E"}
                </div>
                <BarChart data={data.topHashtags} labelKey="tag" valueKey="count" color="#06B6D4" />
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
