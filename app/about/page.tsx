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
          <span style={{ width: 10, height: 10, background: "#F97316", display: "inline-block" }} />
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
          The agent stack
        </h2>
        <p style={{ color: "#8888A0", fontSize: 14, lineHeight: 1.8, marginBottom: 16 }}>
          VibeXForge runs on top of <strong style={{ color: "#FFE27D" }}>Solo Founder OS</strong> — eight open-source Python agents that handle the boring 80% of launching: pre-push diff review, daily morning brief, real-time PH alerts, monthly bill audit, EN/ZH content sync, customer pain scanning, cold-email drafting, multi-platform marketing.
        </p>
        <p style={{ color: "#8888A0", fontSize: 14, lineHeight: 1.8, marginBottom: 16 }}>
          Each is its own pip-installable package with a Claude Desktop MCP server. All MIT-licensed. Total cost to run them all: ~$3.70/month in Anthropic API.
        </p>
        <ul style={{ color: "#8888A0", fontSize: 13, lineHeight: 1.8, marginBottom: 24, paddingLeft: 20, listStyle: "disc" }}>
          <li><a href="https://github.com/alex-jb/solo-founder-os" target="_blank" rel="noopener noreferrer" style={{ color: "#FFE27D" }}>solo-founder-os</a> — shared base library</li>
          <li><a href="https://github.com/alex-jb/build-quality-agent" target="_blank" rel="noopener noreferrer" style={{ color: "#FFE27D" }}>build-quality-agent</a> — pre-push Claude review hook</li>
          <li><a href="https://github.com/alex-jb/funnel-analytics-agent" target="_blank" rel="noopener noreferrer" style={{ color: "#FFE27D" }}>funnel-analytics-agent</a> — daily brief + real-time alerts</li>
          <li><a href="https://github.com/alex-jb/customer-discovery-agent" target="_blank" rel="noopener noreferrer" style={{ color: "#FFE27D" }}>customer-discovery-agent</a> — Reddit pain scanning + clustering</li>
          <li><a href="https://github.com/alex-jb/vc-outreach-agent" target="_blank" rel="noopener noreferrer" style={{ color: "#FFE27D" }}>vc-outreach-agent</a> — investor cold-email drafter</li>
          <li><a href="https://github.com/alex-jb/cost-audit-agent" target="_blank" rel="noopener noreferrer" style={{ color: "#FFE27D" }}>cost-audit-agent</a> — monthly bill audit + waste finder</li>
          <li><a href="https://github.com/alex-jb/bilingual-content-sync-agent" target="_blank" rel="noopener noreferrer" style={{ color: "#FFE27D" }}>bilingual-content-sync-agent</a> — EN/ZH i18n translator</li>
          <li><a href="https://github.com/alex-jb/orallexa-marketing-agent" target="_blank" rel="noopener noreferrer" style={{ color: "#FFE27D" }}>marketing-agent</a> — multi-platform post drafts</li>
        </ul>

        <h2 className="font-pixel" style={{ fontSize: 12, color: "#39FF14", marginBottom: 16 }}>
          Sister project — Orallexa
        </h2>
        <p style={{ color: "#8888A0", fontSize: 14, lineHeight: 1.8, marginBottom: 16 }}>
          Same author, completely different problem space.{" "}
          <a href="https://orallexa-ui.vercel.app/?ref=vibex" target="_blank" rel="noopener noreferrer" style={{ color: "#FFE27D" }}>Orallexa</a>{" "}
          is a self-tuning multi-agent AI trading system: 4 analyst personas debate, 10 ML models vote, walk-forward Sharpe 1.41 OOS on RSI INTC. If VibeX is "where AI projects evolve," Orallexa is "where AI trading decisions evolve."{" "}
          <a href="https://orallexa-ui.vercel.app/leaderboard?ref=vibex" target="_blank" rel="noopener noreferrer" style={{ color: "#FFE27D" }}>Public OOS Sharpe leaderboard →</a>
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
