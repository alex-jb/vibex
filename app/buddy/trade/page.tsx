"use client";

import { useState } from "react";
import { motion } from "framer-motion";

interface TradeListing {
  id: string;
  buddy_name: string;
  buddy_type_id: string;
  buddy_level: number;
  price_xp: number;
  seller_name: string;
  rarity: string;
  created_at: string;
}

const RARITY_COLORS: Record<string, string> = {
  common: "#888",
  uncommon: "#39FF14",
  rare: "#06B6D4",
  epic: "#9D00FF",
  legendary: "#FACC15",
};

const BUDDY_EMOJIS: Record<string, string> = {
  "pixel-fox": "\uD83E\uDD8A",
  "glitch-cat": "\uD83D\uDC31",
  "retro-dragon": "\uD83D\uDC09",
  "cyber-owl": "\uD83E\uDD89",
  "data-slime": "\uD83E\uDDA0",
};

// Mock listings
const MOCK_LISTINGS: TradeListing[] = [
  { id: "t1", buddy_name: "PixelFox", buddy_type_id: "pixel-fox", buddy_level: 8, price_xp: 500, seller_name: "PixelMaster", rarity: "common", created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() },
  { id: "t2", buddy_name: "GlitchCat", buddy_type_id: "glitch-cat", buddy_level: 12, price_xp: 1200, seller_name: "NeonHacker", rarity: "uncommon", created_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString() },
  { id: "t3", buddy_name: "RetroDragon", buddy_type_id: "retro-dragon", buddy_level: 18, price_xp: 5000, seller_name: "RetroQueen", rarity: "epic", created_at: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString() },
  { id: "t4", buddy_name: "CyberOwl", buddy_type_id: "cyber-owl", buddy_level: 6, price_xp: 300, seller_name: "AITrainer", rarity: "common", created_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString() },
  { id: "t5", buddy_name: "DataSlime", buddy_type_id: "data-slime", buddy_level: 25, price_xp: 8000, seller_name: "CodeWizard", rarity: "legendary", created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() },
];

export default function BuddyTradePage() {
  const [listings] = useState<TradeListing[]>(MOCK_LISTINGS);
  const [filter, setFilter] = useState<string>("all");

  const filtered = filter === "all" ? listings : listings.filter((l) => l.rarity === filter);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
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
          VIBEX://BUDDY-TRADE v1.0
        </span>
      </div>

      <div
        className="rpgui-container framed"
        style={{ minHeight: "70vh", padding: 20, position: "relative", overflow: "hidden" }}
      >
        {/* Scanline */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "repeating-linear-gradient(0deg, transparent 0, transparent 2px, rgba(0,0,0,0.08) 2px, rgba(0,0,0,0.08) 4px)",
            pointerEvents: "none",
            zIndex: 1,
          }}
        />

        <div style={{ position: "relative", zIndex: 2 }}>
          {/* Title */}
          <motion.div
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            className="font-pixel"
            style={{ fontSize: 14, color: "#FACC15", textShadow: "0 0 12px #FACC1540", marginBottom: 16 }}
          >
            {"> Buddy Trade Market"}
          </motion.div>

          {/* Rarity filter */}
          <div style={{ display: "flex", gap: 6, marginBottom: 16, flexWrap: "wrap" }}>
            {["all", "common", "uncommon", "rare", "epic", "legendary"].map((r) => (
              <button
                key={r}
                className={`nes-btn ${filter === r ? "is-primary" : ""}`}
                onClick={() => setFilter(r)}
                style={{ fontSize: 7, padding: "3px 10px" }}
              >
                {r === "all" ? "All" : r.toUpperCase()}
              </button>
            ))}
          </div>

          {/* Listings grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 12 }}>
            {filtered.map((listing) => {
              const color = RARITY_COLORS[listing.rarity] ?? "#888";
              const emoji = BUDDY_EMOJIS[listing.buddy_type_id] ?? "\u2B50";
              return (
                <motion.div
                  key={listing.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="retro-card l-corner"
                  style={{
                    padding: 16,
                    border: `2px solid ${color}40`,
                    background: `${color}08`,
                  }}
                >
                  {/* Buddy display */}
                  <div style={{ textAlign: "center", marginBottom: 10 }}>
                    <div style={{ fontSize: 32, marginBottom: 4 }}>{emoji}</div>
                    <div className="font-pixel" style={{ fontSize: 10, color }}>
                      {listing.buddy_name}
                    </div>
                    <div className="font-pixel" style={{ fontSize: 7, color: "#888" }}>
                      Lv.{listing.buddy_level}
                    </div>
                  </div>

                  {/* Rarity badge */}
                  <div style={{ textAlign: "center", marginBottom: 8 }}>
                    <span
                      className="font-pixel"
                      style={{
                        fontSize: 6,
                        color: "#0D0D0D",
                        background: color,
                        padding: "1px 8px",
                      }}
                    >
                      {listing.rarity.toUpperCase()}
                    </span>
                  </div>

                  {/* Price + seller */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <div className="font-pixel" style={{ fontSize: 9, color: "#FACC15" }}>
                        {listing.price_xp.toLocaleString()} XP
                      </div>
                      <div className="font-pixel" style={{ fontSize: 6, color: "#666" }}>
                        by {listing.seller_name}
                      </div>
                    </div>
                    <button
                      className="nes-btn is-success"
                      style={{ fontSize: 7, padding: "3px 10px" }}
                    >
                      {"Buy"}
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {filtered.length === 0 && (
            <div className="font-pixel" style={{ fontSize: 10, color: "#555", textAlign: "center", padding: 40 }}>
              {"No Buddies of this rarity available for sale"}
            </div>
          )}

          {/* Terminal cursor */}
          <div style={{ marginTop: 24 }}>
            <span className="font-retro" style={{ color: "#FACC15", fontSize: 18 }}>{">"} </span>
            <span style={{ display: "inline-block", width: 8, height: 16, background: "#FACC15", animation: "blink-cursor 0.8s step-end infinite", verticalAlign: "middle" }} />
          </div>
        </div>
      </div>

      <style>{`@keyframes blink-cursor { 50% { opacity: 0; } }`}</style>
    </div>
  );
}
