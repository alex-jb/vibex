"use client";

import { useLang } from "@/lib/i18n";

// Direction A palette constants (inlined; retro-game.css has the CSS vars)
const C = {
  BG: "#0D0D0D",
  PANEL: "#111114",
  BORDER: "#3A3A42",
  TEXT: "#E8E8EC",
  MUTED: "#8B7AA0",
  DIM: "#8A7B9A",
  FORGE: "#FF4500",
  CREAM: "#FFE27D",
  GREEN: "#39FF14",
};

export default function TermsPage() {
  const { t } = useLang();
  return (
    <div
      className="relative min-h-full overflow-hidden"
      style={{ background: C.BG, color: C.TEXT }}
    >
      {/* Forge ember glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 h-[360px] w-[520px] rounded-full"
        style={{ background: `radial-gradient(closest-side, ${C.FORGE}22, transparent 70%)` }}
      />

      <div className="relative max-w-3xl mx-auto px-4 sm:px-6 py-10">
        {/* L-corners */}
        {[
          { top: 0, left: 0, borderTop: `3px solid ${C.FORGE}`, borderLeft: `3px solid ${C.FORGE}` },
          { top: 0, right: 0, borderTop: `3px solid ${C.FORGE}`, borderRight: `3px solid ${C.FORGE}` },
          { bottom: 0, left: 0, borderBottom: `3px solid ${C.FORGE}`, borderLeft: `3px solid ${C.FORGE}` },
          { bottom: 0, right: 0, borderBottom: `3px solid ${C.FORGE}`, borderRight: `3px solid ${C.FORGE}` },
        ].map((s, i) => (
          <div
            key={i}
            aria-hidden="true"
            className="pointer-events-none absolute"
            style={{ width: 24, height: 24, ...s }}
          />
        ))}

        {/* Terminal header */}
        <div
          style={{
            background: C.PANEL,
            padding: "10px 14px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderBottom: `2px solid ${C.BORDER}`,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ width: 10, height: 10, background: "#FF5F57", display: "inline-block" }} />
            <span style={{ width: 10, height: 10, background: "#FEBC2E", display: "inline-block" }} />
            <span style={{ width: 10, height: 10, background: "#28C840", display: "inline-block" }} />
          </div>
          <span
            className="font-pixel"
            style={{ fontSize: 9, color: C.MUTED, letterSpacing: 3 }}
          >
            <span style={{ color: C.FORGE }}>▸</span> VIBEXFORGE://TERMS
          </span>
          <span className="font-pixel" style={{ fontSize: 7, color: C.BORDER }}>━━━</span>
        </div>

        {/* Body */}
        <div
          style={{
            background: C.PANEL,
            padding: "32px 28px",
            border: `1px solid ${C.BORDER}`,
            borderTop: "none",
          }}
        >
          <h1
            className="font-pixel"
            style={{
              fontSize: 20,
              color: C.CREAM,
              letterSpacing: 3,
              marginBottom: 8,
              textShadow: `2px 2px 0 #000, 0 0 12px ${C.FORGE}44`,
            }}
          >
            {t("terms.title")}
          </h1>
          <div
            className="font-pixel"
            style={{
              fontSize: 9,
              color: C.FORGE,
              letterSpacing: 3,
              marginBottom: 28,
            }}
          >
            ▸ TERMS OF SERVICE
          </div>

          {/* Divider */}
          <div
            aria-hidden="true"
            style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24 }}
          >
            <div style={{ flex: 1, height: 1, background: `${C.FORGE}44` }} />
            <span style={{ fontSize: 14, color: C.FORGE }}>◉</span>
            <div style={{ flex: 1, height: 1, background: `${C.FORGE}44` }} />
          </div>

          <h2
            className="font-pixel"
            style={{ fontSize: 12, color: C.GREEN, letterSpacing: 2, marginBottom: 14 }}
          >
            ▸ {t("terms.title")}
          </h2>
          <p
            className="font-retro"
            style={{ color: C.TEXT, fontSize: 18, lineHeight: 1.7, marginBottom: 28 }}
          >
            Welcome to the VibeXForge platform. By using this platform, you agree to abide by the following terms. You may not use this platform for any unlawful activity or to harm the rights of others. We reserve the right to modify these terms of service at any time.
          </p>

          <h2
            className="font-pixel"
            style={{ fontSize: 12, color: C.GREEN, letterSpacing: 2, marginBottom: 14 }}
          >
            ✦ {t("terms.ip")}
          </h2>
          <p
            className="font-retro"
            style={{ color: C.TEXT, fontSize: 18, lineHeight: 1.7, marginBottom: 28 }}
          >
            The VibeXForge platform is released under a source-available license. Projects created by users on the platform remain the property of their creators, but the platform reserves the right to display and promote publicly published content.
          </p>

          <h2
            className="font-pixel"
            style={{ fontSize: 12, color: C.GREEN, letterSpacing: 2, marginBottom: 14 }}
          >
            ⬢ {t("terms.disclaimer")}
          </h2>
          <p
            className="font-retro"
            style={{ color: C.TEXT, fontSize: 18, lineHeight: 1.7, marginBottom: 28 }}
          >
            The AI features on this platform (including the battle system, project evaluation, etc.) are for entertainment and reference only and do not constitute professional advice. AI-generated content may contain inaccuracies, and users should exercise their own judgment.
          </p>

          {/* Footer stamp — dashed border with green pulse */}
          <div
            style={{
              marginTop: 40,
              padding: "12px 16px",
              borderTop: `1px dashed ${C.BORDER}`,
              display: "flex",
              alignItems: "center",
              gap: 10,
            }}
          >
            <span
              aria-hidden="true"
              className="inline-block"
              style={{
                width: 6,
                height: 6,
                background: C.GREEN,
                boxShadow: `0 0 6px ${C.GREEN}`,
                animation: "pulse 2s ease-in-out infinite",
              }}
            />
            <span
              className="font-pixel"
              style={{ fontSize: 8, color: C.DIM, letterSpacing: 3 }}
            >
              {t("terms.lastUpdated")}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
