"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";

interface Creator {
  name: string;
  skills: string[];
  xp: number;
  launches: number;
  successRate: number;
  velocity: number;
  topCategory: string;
  connections: number;
}

interface SkillCount {
  skill: string;
  count: number;
}

const SKILL_COLORS: Record<string, string> = {
  AI: "#9D00FF", "Game Dev": "#FF4500", NLP: "#06B6D4", "Full-Stack": "#39FF14",
  Design: "#FF69B4", Security: "#FACC15", ML: "#06B6D4", React: "#61DAFB",
  Python: "#3776AB", "Pixel Art": "#FF6347", "AI Agent": "#9D00FF", "Fine-tuning": "#FACC15",
};

export default function CreatorGraphPage() {
  const [creators, setCreators] = useState<Creator[]>([]);
  const [topSkills, setTopSkills] = useState<SkillCount[]>([]);
  const [rising, setRising] = useState<Creator[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/creators/graph")
      .then((res) => res.json())
      .then((data) => {
        setCreators(data.creators ?? []);
        setTopSkills(data.topSkills ?? []);
        setRising(data.risingCreators ?? []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
      {/* Terminal Header */}
      <div style={{ background: "#0A0A0C", padding: "8px 12px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "2px solid #2A2A30" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ width: 10, height: 10, background: "#FF4500", display: "inline-block" }} />
          <span style={{ width: 10, height: 10, background: "#FACC15", display: "inline-block" }} />
          <span style={{ width: 10, height: 10, background: "#39FF14", display: "inline-block" }} />
        </div>
        <span className="font-pixel" style={{ fontSize: 8, color: "#555", letterSpacing: 2 }}>VIBEX://CREATOR-GRAPH v1.0</span>
      </div>

      <div className="rpgui-container framed" style={{ padding: 20, minHeight: "70vh", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, background: "repeating-linear-gradient(0deg, transparent 0, transparent 2px, rgba(0,0,0,0.08) 2px, rgba(0,0,0,0.08) 4px)", pointerEvents: "none", zIndex: 1 }} />

        <div style={{ position: "relative", zIndex: 2 }}>
          <motion.div initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} className="font-pixel" style={{ fontSize: 14, color: "#9D00FF", marginBottom: 16 }}>
            {"> Creator Graph"}
          </motion.div>

          {loading && <div className="font-pixel" style={{ fontSize: 8, color: "#555", textAlign: "center", padding: 40 }}>LOADING GRAPH...</div>}

          {!loading && (
            <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
              {/* Main: Creator cards */}
              <div style={{ flex: 1, minWidth: 300 }}>
                <div className="font-pixel" style={{ fontSize: 9, color: "#FACC15", marginBottom: 10 }}>
                  {"\uD83C\uDFC6 \u521B\u4F5C\u8005\u6392\u884C"}
                </div>
                {creators.map((c, i) => (
                  <motion.div
                    key={c.name}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="retro-card l-corner"
                    style={{ padding: 12, marginBottom: 8 }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                      <div>
                        <span className="font-pixel" style={{ fontSize: 10, color: "#9D00FF" }}>#{i + 1} {c.name}</span>
                        <span className="font-pixel" style={{ fontSize: 7, color: "#FACC15", marginLeft: 8 }}>{c.xp.toLocaleString()} XP</span>
                      </div>
                      <span className="font-pixel" style={{ fontSize: 7, color: "#06B6D4" }}>
                        {c.topCategory}
                      </span>
                    </div>

                    {/* Skills */}
                    <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginBottom: 6 }}>
                      {c.skills.map((s) => (
                        <span key={s} className="font-pixel" style={{ fontSize: 6, color: "#0D0D0D", background: SKILL_COLORS[s] ?? "#888", padding: "0 5px" }}>
                          {s}
                        </span>
                      ))}
                    </div>

                    {/* Stats row */}
                    <div style={{ display: "flex", gap: 12 }}>
                      <span className="font-pixel" style={{ fontSize: 7, color: "#39FF14" }}>{c.launches} launches</span>
                      <span className="font-pixel" style={{ fontSize: 7, color: "#FACC15" }}>{c.successRate}% success</span>
                      <span className="font-pixel" style={{ fontSize: 7, color: "#06B6D4" }}>{c.connections} connections</span>
                      <span className="font-pixel" style={{ fontSize: 7, color: c.velocity > 10 ? "#FF4500" : "#888" }}>
                        {c.velocity > 10 ? "\u2191" : ""}{c.velocity.toFixed(1)} velocity
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Sidebar */}
              <div style={{ width: 200, flexShrink: 0 }}>
                {/* Top Skills */}
                <div className="rpgui-container framed" style={{ padding: 12, marginBottom: 12 }}>
                  <div className="font-pixel" style={{ fontSize: 8, color: "#FACC15", marginBottom: 8 }}>
                    {"\uD83D\uDEE0\uFE0F \u70ED\u95E8\u6280\u80FD"}
                  </div>
                  {topSkills.map((s) => (
                    <div key={s.skill} style={{ display: "flex", justifyContent: "space-between", padding: "3px 0" }}>
                      <span className="font-pixel" style={{ fontSize: 7, color: SKILL_COLORS[s.skill] ?? "#888" }}>{s.skill}</span>
                      <span className="font-pixel" style={{ fontSize: 7, color: "#555" }}>{s.count}</span>
                    </div>
                  ))}
                </div>

                {/* Rising Creators */}
                <div className="rpgui-container framed" style={{ padding: 12 }}>
                  <div className="font-pixel" style={{ fontSize: 8, color: "#FF4500", marginBottom: 8 }}>
                    {"\uD83D\uDE80 \u4E0A\u5347\u6700\u5FEB"}
                  </div>
                  {rising.map((c) => (
                    <div key={c.name} style={{ padding: "4px 0", borderBottom: "1px solid #1A1A1E" }}>
                      <span className="font-pixel" style={{ fontSize: 8, color: "#E8E8EC" }}>{c.name}</span>
                      <span className="font-pixel" style={{ fontSize: 7, color: "#FF4500", marginLeft: 6 }}>
                        +{c.velocity.toFixed(1)}/mo
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
