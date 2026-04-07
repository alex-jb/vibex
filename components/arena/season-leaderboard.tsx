"use client";

import { useState, useEffect } from "react";

interface LeaderboardEntry {
  rank: number;
  project_name: string;
  creator_name: string;
  wins: number;
  losses: number;
  draws: number;
  rating: number;
}

interface Season {
  id: string;
  name: string;
  status: string;
}

export function SeasonLeaderboard() {
  const [season, setSeason] = useState<Season | null>(null);
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/arena/leaderboard")
      .then((res) => res.json())
      .then((data) => {
        setSeason(data.season ?? null);
        setEntries(data.leaderboard ?? []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const rankColors: Record<number, string> = {
    1: "#FACC15",
    2: "#C0C0C0",
    3: "#CD7F32",
  };

  return (
    <div className="rpgui-container framed" style={{ padding: 16, marginTop: 20 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <div className="font-pixel" style={{ fontSize: 10, color: "#FACC15" }}>
          {"\uD83C\uDFC6 \u8D5B\u5B63\u6392\u884C\u699C"}
        </div>
        {season && (
          <div className="font-pixel" style={{ fontSize: 7, color: "#9D00FF" }}>
            {season.name} [{season.status.toUpperCase()}]
          </div>
        )}
      </div>

      {loading && (
        <div className="font-pixel" style={{ fontSize: 8, color: "#555", textAlign: "center", padding: 20 }}>
          LOADING RANKINGS...
        </div>
      )}

      {!loading && entries.length === 0 && (
        <div className="font-pixel" style={{ fontSize: 8, color: "#555", textAlign: "center", padding: 20 }}>
          {"\u6682\u65E0\u6392\u540D\u6570\u636E"}
        </div>
      )}

      {!loading && entries.length > 0 && (
        <div>
          {/* Table header */}
          <div style={{ display: "flex", gap: 4, padding: "4px 8px", borderBottom: "1px solid #2A2A30", marginBottom: 4 }}>
            <span className="font-pixel" style={{ fontSize: 7, color: "#555", width: 30 }}>#</span>
            <span className="font-pixel" style={{ fontSize: 7, color: "#555", flex: 1 }}>PROJECT</span>
            <span className="font-pixel" style={{ fontSize: 7, color: "#555", width: 50, textAlign: "center" }}>W/L/D</span>
            <span className="font-pixel" style={{ fontSize: 7, color: "#555", width: 45, textAlign: "right" }}>RATING</span>
          </div>

          {entries.map((entry, i) => {
            const rank = entry.rank ?? i + 1;
            const color = rankColors[rank] ?? "#E8E8EC";
            return (
              <div
                key={i}
                className="retro-card"
                style={{
                  display: "flex",
                  gap: 4,
                  padding: "6px 8px",
                  marginBottom: 2,
                  alignItems: "center",
                  background: rank <= 3 ? `${color}08` : undefined,
                }}
              >
                <span className="font-pixel" style={{ fontSize: 9, color, width: 30, fontWeight: rank <= 3 ? 700 : 400 }}>
                  {rank <= 3 ? ["", "\uD83E\uDD47", "\uD83E\uDD48", "\uD83E\uDD49"][rank] : rank}
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="font-pixel" style={{ fontSize: 8, color }}>
                    {entry.project_name}
                  </div>
                  <div className="font-pixel" style={{ fontSize: 6, color: "#666" }}>
                    by {entry.creator_name}
                  </div>
                </div>
                <span className="font-pixel" style={{ fontSize: 7, color: "#39FF14", width: 50, textAlign: "center" }}>
                  {entry.wins}/{entry.losses}/{entry.draws}
                </span>
                <span className="font-pixel" style={{ fontSize: 8, color: "#06B6D4", width: 45, textAlign: "right" }}>
                  {entry.rating}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
