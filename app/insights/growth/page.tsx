"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";

interface GrowthPattern {
  pattern_name: string;
  pattern_type: string;
  description: string;
  evidence_count: number;
  avg_impact: number;
  confidence: number;
}

interface Benchmark {
  category: string;
  avgDay1Views: number;
  avgDay7Views: number;
  avgUpvotes: number;
  avgConversion: number;
  projectCount: number;
}

const TYPE_COLORS: Record<string, string> = {
  timing: "#FACC15",
  copy: "#39FF14",
  strategy: "#9D00FF",
  channel: "#06B6D4",
  category: "#F97316",
};

const TYPE_EMOJI: Record<string, string> = {
  timing: "\u23F0",
  copy: "\u270D\uFE0F",
  strategy: "\uD83C\uDFAF",
  channel: "\uD83D\uDCE1",
  category: "\uD83D\uDCCA",
};

export default function GrowthPatternsPage() {
  const [patterns, setPatterns] = useState<GrowthPattern[]>([]);
  const [benchmarks, setBenchmarks] = useState<Benchmark[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/growth/patterns").then((r) => r.json()),
      fetch("/api/growth/benchmarks").then((r) => r.json()),
    ])
      .then(([pData, bData]) => {
        setPatterns(pData.patterns ?? []);
        setBenchmarks(bData.categories ?? []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
      {/* Terminal Header */}
      <div style={{ background: "#0A0A0C", padding: "8px 12px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "2px solid #2A2A30" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ width: 10, height: 10, background: "#F97316", display: "inline-block" }} />
          <span style={{ width: 10, height: 10, background: "#FACC15", display: "inline-block" }} />
          <span style={{ width: 10, height: 10, background: "#39FF14", display: "inline-block" }} />
        </div>
        <span className="font-pixel" style={{ fontSize: 8, color: "#555", letterSpacing: 2 }}>VIBEXFORGE://GROWTH-INTEL v1.0</span>
      </div>

      <div className="rpgui-container framed" style={{ padding: 20, minHeight: "70vh", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, background: "repeating-linear-gradient(0deg, transparent 0, transparent 2px, rgba(0,0,0,0.08) 2px, rgba(0,0,0,0.08) 4px)", pointerEvents: "none", zIndex: 1 }} />

        <div style={{ position: "relative", zIndex: 2 }}>
          <motion.div initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} className="font-pixel" style={{ fontSize: 14, color: "#FACC15", marginBottom: 6 }}>
            {"> Growth Intelligence"}
          </motion.div>
          <div className="font-retro" style={{ fontSize: 12, color: "#888", marginBottom: 20 }}>
            {"Growth patterns extracted from real launch data. This data is the VibeX moat."}
          </div>

          {loading && <div className="font-pixel" style={{ fontSize: 8, color: "#555", textAlign: "center", padding: 40 }}>LOADING INTELLIGENCE...</div>}

          {!loading && (
            <>
              {/* Growth Patterns */}
              <div className="font-pixel" style={{ fontSize: 10, color: "#FACC15", marginBottom: 10 }}>
                {"Verified Growth Patterns"} ({patterns.length})
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 10, marginBottom: 24 }}>
                {patterns.map((p, i) => {
                  const color = TYPE_COLORS[p.pattern_type] ?? "#888";
                  const emoji = TYPE_EMOJI[p.pattern_type] ?? "\uD83D\uDCCA";
                  return (
                    <motion.div
                      key={p.pattern_name}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.04 }}
                      className="retro-card l-corner"
                      style={{ padding: 14, border: `1px solid ${color}30` }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                        <span className="font-pixel" style={{ fontSize: 6, color: "#0D0D0D", background: color, padding: "0 6px" }}>
                          {emoji} {p.pattern_type.toUpperCase()}
                        </span>
                        <span className="font-pixel" style={{ fontSize: 7, color: "#39FF14" }}>
                          +{p.avg_impact}% impact
                        </span>
                      </div>

                      <div className="font-retro" style={{ fontSize: 12, color: "#E8E8EC", lineHeight: 1.5, marginBottom: 8 }}>
                        {p.description}
                      </div>

                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span className="font-pixel" style={{ fontSize: 7, color: "#888" }}>
                          {p.evidence_count} projects
                        </span>
                        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                          <span className="font-pixel" style={{ fontSize: 7, color: "#888" }}>confidence</span>
                          <div style={{ width: 40, height: 4, background: "#1A1A1E" }}>
                            <div style={{ width: `${p.confidence * 100}%`, height: "100%", background: p.confidence > 0.8 ? "#39FF14" : p.confidence > 0.6 ? "#FACC15" : "#F97316" }} />
                          </div>
                          <span className="font-pixel" style={{ fontSize: 7, color: "#888" }}>{Math.round(p.confidence * 100)}%</span>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* Category Benchmarks */}
              <div className="font-pixel" style={{ fontSize: 10, color: "#06B6D4", marginBottom: 10 }}>
                {"Category Benchmarks"}
              </div>

              <div className="retro-card" style={{ padding: 12 }}>
                {/* Header */}
                <div style={{ display: "flex", gap: 4, padding: "4px 8px", borderBottom: "1px solid #2A2A30", marginBottom: 4 }}>
                  <span className="font-pixel" style={{ fontSize: 7, color: "#555", flex: 1 }}>CATEGORY</span>
                  <span className="font-pixel" style={{ fontSize: 7, color: "#555", width: 50, textAlign: "right" }}>D1 Views</span>
                  <span className="font-pixel" style={{ fontSize: 7, color: "#555", width: 50, textAlign: "right" }}>D7 Views</span>
                  <span className="font-pixel" style={{ fontSize: 7, color: "#555", width: 45, textAlign: "right" }}>Upvotes</span>
                  <span className="font-pixel" style={{ fontSize: 7, color: "#555", width: 40, textAlign: "right" }}>CVR%</span>
                  <span className="font-pixel" style={{ fontSize: 7, color: "#555", width: 35, textAlign: "right" }}>#</span>
                </div>

                {benchmarks.map((b) => (
                  <div key={b.category} style={{ display: "flex", gap: 4, padding: "5px 8px", borderBottom: "1px solid #1A1A1E", alignItems: "center" }}>
                    <span className="font-pixel" style={{ fontSize: 8, color: "#9D00FF", flex: 1 }}>{b.category}</span>
                    <span className="font-pixel" style={{ fontSize: 8, color: "#39FF14", width: 50, textAlign: "right" }}>{b.avgDay1Views}</span>
                    <span className="font-pixel" style={{ fontSize: 8, color: "#39FF14", width: 50, textAlign: "right" }}>{b.avgDay7Views}</span>
                    <span className="font-pixel" style={{ fontSize: 8, color: "#FACC15", width: 45, textAlign: "right" }}>{b.avgUpvotes}</span>
                    <span className="font-pixel" style={{ fontSize: 8, color: "#06B6D4", width: 40, textAlign: "right" }}>{b.avgConversion}%</span>
                    <span className="font-pixel" style={{ fontSize: 7, color: "#555", width: 35, textAlign: "right" }}>{b.projectCount}</span>
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
