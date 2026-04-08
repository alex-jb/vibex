"use client";

import { use, useState } from "react";
import { motion } from "framer-motion";
import { LevelBadge, xpToLevel } from "@/components/feed/level-badge";

interface UserProfile {
  id: string;
  name: string;
  bio: string;
  xp: number;
  posts: number;
  followers: number;
  following: number;
  buddies: { name: string; emoji: string; level: number; rarity: string }[];
  joinedAt: string;
}

// Mock profile
const MOCK_PROFILES: Record<string, UserProfile> = {
  u1: {
    id: "u1", name: "PixelMaster", bio: "16-bit game developer. Building the future of vibe coding.",
    xp: 2500, posts: 142, followers: 89, following: 34,
    buddies: [
      { name: "PixelFox", emoji: "\uD83E\uDD8A", level: 12, rarity: "common" },
      { name: "RetroDragon", emoji: "\uD83D\uDC09", level: 8, rarity: "epic" },
    ],
    joinedAt: "2026-01-15",
  },
  u2: {
    id: "u2", name: "CodeWizard", bio: "Full-stack wizard. React + AI = magic.",
    xp: 1800, posts: 98, followers: 67, following: 45,
    buddies: [
      { name: "GlitchCat", emoji: "\uD83D\uDC31", level: 15, rarity: "uncommon" },
    ],
    joinedAt: "2026-02-01",
  },
};

const RARITY_COLORS: Record<string, string> = {
  common: "#888", uncommon: "#39FF14", rare: "#06B6D4", epic: "#9D00FF", legendary: "#FACC15",
};

export default function PublicProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [activeTab, setActiveTab] = useState<"posts" | "buddies">("posts");

  const profile = MOCK_PROFILES[id] ?? {
    id, name: `User_${id.slice(0, 6)}`, bio: "A VibeX creator",
    xp: 0, posts: 0, followers: 0, following: 0, buddies: [], joinedAt: "2026-04-01",
  };

  const level = xpToLevel(profile.xp);

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6">
      {/* Terminal Header */}
      <div
        style={{
          background: "#0A0A0C",
          padding: "8px 12px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: "2px solid #2A2A30",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ width: 10, height: 10, background: "#FF4500", display: "inline-block" }} />
          <span style={{ width: 10, height: 10, background: "#FACC15", display: "inline-block" }} />
          <span style={{ width: 10, height: 10, background: "#39FF14", display: "inline-block" }} />
        </div>
        <span className="font-pixel" style={{ fontSize: 8, color: "#555", letterSpacing: 2 }}>
          VIBEX://PROFILE/{profile.name.toUpperCase()}
        </span>
      </div>

      <div
        className="rpgui-container framed"
        style={{ padding: 20, position: "relative", overflow: "hidden" }}
      >
        {/* Scanline */}
        <div
          style={{
            position: "absolute", inset: 0,
            background: "repeating-linear-gradient(0deg, transparent 0, transparent 2px, rgba(0,0,0,0.08) 2px, rgba(0,0,0,0.08) 4px)",
            pointerEvents: "none", zIndex: 1,
          }}
        />

        <div style={{ position: "relative", zIndex: 2 }}>
          {/* Profile header */}
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 20 }}
          >
            {/* Avatar */}
            <div
              style={{
                width: 64, height: 64,
                display: "flex", alignItems: "center", justifyContent: "center",
                background: "#9D00FF25", border: "3px solid #9D00FF60",
                fontSize: 28, fontFamily: "var(--font-pixel)",
              }}
            >
              {profile.name.slice(0, 2).toUpperCase()}
            </div>

            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span className="font-pixel" style={{ fontSize: 14, color: "#9D00FF" }}>
                  {profile.name}
                </span>
                <LevelBadge level={level} xp={profile.xp} />
              </div>
              <div className="font-retro" style={{ fontSize: 13, color: "#888", marginTop: 4 }}>
                {profile.bio}
              </div>
              <div className="font-pixel" style={{ fontSize: 7, color: "#555", marginTop: 4 }}>
                Joined {profile.joinedAt}
              </div>
            </div>
          </motion.div>

          {/* Stats row */}
          <div style={{ display: "flex", gap: 16, marginBottom: 20 }}>
            {[
              { label: "Posts", value: profile.posts, color: "#39FF14" },
              { label: "Followers", value: profile.followers, color: "#9D00FF" },
              { label: "Following", value: profile.following, color: "#06B6D4" },
              { label: "XP", value: profile.xp.toLocaleString(), color: "#FACC15" },
            ].map((stat) => (
              <div key={stat.label} className="retro-card" style={{ padding: "8px 16px", textAlign: "center" }}>
                <div className="font-pixel" style={{ fontSize: 12, color: stat.color }}>{stat.value}</div>
                <div className="font-pixel" style={{ fontSize: 7, color: "#888" }}>{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Tabs */}
          <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
            <button
              className={`nes-btn ${activeTab === "posts" ? "is-primary" : ""}`}
              onClick={() => setActiveTab("posts")}
              style={{ fontSize: 8, padding: "4px 12px" }}
            >
              {"Posts"}
            </button>
            <button
              className={`nes-btn ${activeTab === "buddies" ? "is-primary" : ""}`}
              onClick={() => setActiveTab("buddies")}
              style={{ fontSize: 8, padding: "4px 12px" }}
            >
              Buddies ({profile.buddies.length})
            </button>
          </div>

          {/* Content */}
          {activeTab === "posts" && (
            <div className="font-pixel" style={{ fontSize: 8, color: "#555", padding: 20, textAlign: "center" }}>
              {"Loading posts..."}
            </div>
          )}

          {activeTab === "buddies" && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 10 }}>
              {profile.buddies.length === 0 && (
                <div className="font-pixel" style={{ fontSize: 8, color: "#555", gridColumn: "1 / -1", textAlign: "center", padding: 20 }}>
                  {"No Buddies yet"}
                </div>
              )}
              {profile.buddies.map((buddy, i) => {
                const color = RARITY_COLORS[buddy.rarity] ?? "#888";
                return (
                  <div key={i} className="retro-card l-corner" style={{ padding: 12, textAlign: "center", border: `1px solid ${color}40` }}>
                    <div style={{ fontSize: 28, marginBottom: 4 }}>{buddy.emoji}</div>
                    <div className="font-pixel" style={{ fontSize: 8, color }}>{buddy.name}</div>
                    <div className="font-pixel" style={{ fontSize: 7, color: "#888" }}>Lv.{buddy.level}</div>
                    <span className="font-pixel" style={{ fontSize: 6, color: "#0D0D0D", background: color, padding: "0 5px" }}>
                      {buddy.rarity.toUpperCase()}
                    </span>
                  </div>
                );
              })}
            </div>
          )}

          {/* Terminal cursor */}
          <div style={{ marginTop: 24 }}>
            <span className="font-retro" style={{ color: "#9D00FF", fontSize: 18 }}>{">"} </span>
            <span style={{ display: "inline-block", width: 8, height: 16, background: "#9D00FF", animation: "blink-cursor 0.8s step-end infinite", verticalAlign: "middle" }} />
          </div>
        </div>
      </div>

      <style>{`@keyframes blink-cursor { 50% { opacity: 0; } }`}</style>
    </div>
  );
}
