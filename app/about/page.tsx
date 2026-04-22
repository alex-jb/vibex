"use client";

import Image from "next/image";
import { useLang } from "@/lib/i18n";

const STAGES = [
  { code: "SEED", color: "#d4d4d8" },
  { code: "ACTIVE", color: "#22c55e" },
  { code: "GROWING", color: "#06B6D4" },
  { code: "BREAKOUT", color: "#D946EF" },
  { code: "LEGEND", color: "#EF4444" },
  { code: "MYTH", color: "#FF69B4" },
] as const;

export default function AboutPage() {
  const { t } = useLang();
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6">
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
          {">"} VIBEXFORGE://ABOUT
        </span>
        <span className="font-pixel" style={{ fontSize: 7, color: "#333" }}>━━━</span>
      </div>

      {/* Body */}
      <div className="rpgui-container framed" style={{ padding: 24 }}>
        <h1 className="font-pixel" style={{ fontSize: 12, color: "#39FF14", marginBottom: 16 }}>
          {t("about.title")}
        </h1>
        <p style={{ color: "#8888A0", fontSize: 14, lineHeight: 1.8, marginBottom: 24 }}>
          VibeXForge is a 16-bit RPG-style AI creator economy platform. Here, AI projects become RPG heroes with stats, levels, and evolution systems. Creators can submit projects, battle in the arena, climb leaderboards, and forge their own AI legends.
        </p>

        <h2 className="font-pixel" style={{ fontSize: 12, color: "#39FF14", marginBottom: 16 }}>
          The Evolution Ladder
        </h2>
        <p style={{ color: "#8888A0", fontSize: 14, lineHeight: 1.8, marginBottom: 16 }}>
          Every project starts at <span style={{ color: "#d4d4d8" }}>SEED</span> and evolves through 6 tiers based on real traction (plays, upvotes, Claude-scored review). No 24-hour sprints, no vanity metrics — projects can level up forever, and regress if traction dies.
        </p>
        <div style={{ position: "relative", marginBottom: 8, borderRadius: 4, overflow: "hidden", border: "1px solid #2A2A30" }}>
          <Image
            src="/generated/evolution-ladder-v1.png"
            alt="Evolution ladder — SEED, ACTIVE, GROWING, BREAKOUT, LEGEND, MYTH"
            width={1536}
            height={1024}
            style={{ width: "100%", height: "auto", display: "block", imageRendering: "pixelated" }}
          />
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(6, 1fr)",
            gap: 4,
            marginBottom: 24,
          }}
        >
          {STAGES.map((s) => (
            <div
              key={s.code}
              className="font-pixel"
              style={{
                fontSize: 7,
                letterSpacing: 1,
                color: s.color,
                textAlign: "center",
                padding: "6px 2px",
              }}
            >
              {s.code}
            </div>
          ))}
        </div>

        <h2 className="font-pixel" style={{ fontSize: 12, color: "#39FF14", marginBottom: 16 }}>
          {t("about.techStack")}
        </h2>
        <ul style={{ color: "#8888A0", fontSize: 14, lineHeight: 2, marginBottom: 24, paddingLeft: 20 }}>
          <li>Next.js 16 + React 19</li>
          <li>Tailwind CSS 4</li>
          <li>Supabase (Database & Auth)</li>
          <li>Claude API (AI Features)</li>
          <li>Vercel (Hosting)</li>
        </ul>

        <h2 className="font-pixel" style={{ fontSize: 12, color: "#39FF14", marginBottom: 16 }}>
          {t("about.openSource")}
        </h2>
        <p style={{ color: "#8888A0", fontSize: 14, lineHeight: 1.8, marginBottom: 24 }}>
          VibeXForge is a source-available project. Feel free to browse the source code, file issues, and contribute on GitHub.
        </p>

        <h2 className="font-pixel" style={{ fontSize: 12, color: "#39FF14", marginBottom: 16 }}>
          {t("about.team")}
        </h2>
        <p style={{ color: "#8888A0", fontSize: 14, lineHeight: 1.8, marginBottom: 32 }}>
          Built by alex-jb
        </p>

        <a
          href="https://github.com/alex-jb/vibex"
          target="_blank"
          rel="noopener noreferrer"
          className="nes-btn is-primary"
          style={{ fontSize: 10, padding: "10px 20px" }}
        >
          GitHub
        </a>
      </div>
    </div>
  );
}
