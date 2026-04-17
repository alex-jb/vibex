"use client";

import { useLang } from "@/lib/i18n";

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
          {">"} VIBEX://ABOUT
        </span>
        <span className="font-pixel" style={{ fontSize: 7, color: "#333" }}>━━━</span>
      </div>

      {/* Body */}
      <div className="rpgui-container framed" style={{ padding: 24 }}>
        <h1 className="font-pixel" style={{ fontSize: 12, color: "#39FF14", marginBottom: 16 }}>
          {t("about.title")}
        </h1>
        <p style={{ color: "#8888A0", fontSize: 14, lineHeight: 1.8, marginBottom: 24 }}>
          VibeX is a 16-bit RPG-style AI creator economy platform. Here, AI projects become RPG heroes with stats, levels, and evolution systems. Creators can submit projects, battle in the arena, climb leaderboards, and forge their own AI legends.
        </p>

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
          VibeX is a source-available project. Feel free to browse the source code, file issues, and contribute on GitHub.
        </p>

        <h2 className="font-pixel" style={{ fontSize: 12, color: "#39FF14", marginBottom: 16 }}>
          {t("about.team")}
        </h2>
        <p style={{ color: "#8888A0", fontSize: 14, lineHeight: 1.8, marginBottom: 32 }}>
          Built by Orallexa
        </p>

        <a
          href="https://github.com/orallexa/vibecode-hunt"
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
