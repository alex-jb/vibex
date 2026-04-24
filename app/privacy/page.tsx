"use client";

import { useLang } from "@/lib/i18n";

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

export default function PrivacyPage() {
  const { t } = useLang();
  return (
    <div
      className="relative min-h-full overflow-hidden"
      style={{ background: C.BG, color: C.TEXT }}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 h-[360px] w-[520px] rounded-full"
        style={{ background: `radial-gradient(closest-side, ${C.FORGE}22, transparent 70%)` }}
      />

      <div className="relative max-w-3xl mx-auto px-4 sm:px-6 py-10">
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
          <span className="font-pixel" style={{ fontSize: 9, color: C.MUTED, letterSpacing: 3 }}>
            <span style={{ color: C.FORGE }}>▸</span> VIBEXFORGE://PRIVACY
          </span>
          <span className="font-pixel" style={{ fontSize: 7, color: C.BORDER }}>━━━</span>
        </div>

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
            Privacy Policy
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
            ▸ HOW WE HANDLE YOUR DATA
          </div>

          <div
            aria-hidden="true"
            style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24 }}
          >
            <div style={{ flex: 1, height: 1, background: `${C.FORGE}44` }} />
            <span style={{ fontSize: 14, color: C.FORGE }}>◉</span>
            <div style={{ flex: 1, height: 1, background: `${C.FORGE}44` }} />
          </div>

          <h2 className="font-pixel" style={{ fontSize: 12, color: C.GREEN, letterSpacing: 2, marginBottom: 14 }}>
            ▸ {t("privacy.dataCollection")}
          </h2>
          <p className="font-retro" style={{ color: C.TEXT, fontSize: 18, lineHeight: 1.7, marginBottom: 28 }}>
            We collect the following data: account information (username, email), project data (code, descriptions, configuration), and usage data (page views, feature usage frequency). We do not collect unnecessary personal information.
          </p>

          <h2 className="font-pixel" style={{ fontSize: 12, color: C.GREEN, letterSpacing: 2, marginBottom: 14 }}>
            ✦ {t("privacy.dataUsage")}
          </h2>
          <p className="font-retro" style={{ color: C.TEXT, fontSize: 18, lineHeight: 1.7, marginBottom: 28 }}>
            Collected data is used to: provide and improve VibeXForge services, generate leaderboards and statistics, optimize AI feature experiences, and send service-related notifications. We will never sell your data to third parties.
          </p>

          {/* EXTERNAL ALLIES accent block — neon-green bordered box around third-party services */}
          <div
            style={{
              marginBottom: 28,
              padding: "16px 18px",
              border: `2px solid ${C.GREEN}`,
              background: `${C.GREEN}0A`,
              boxShadow: `0 0 16px ${C.GREEN}22`,
            }}
          >
            <div
              className="font-pixel"
              style={{
                fontSize: 10,
                color: C.GREEN,
                letterSpacing: 3,
                marginBottom: 10,
              }}
            >
              ◆ EXTERNAL ALLIES
            </div>
            <p className="font-retro" style={{ color: C.TEXT, fontSize: 17, lineHeight: 1.65 }}>
              {t("privacy.thirdParty")}: VibeXForge uses the following third-party services — <strong style={{ color: C.CREAM }}>Supabase</strong> (database and authentication), <strong style={{ color: C.CREAM }}>Anthropic Claude API</strong> (AI features), and <strong style={{ color: C.CREAM }}>Vercel</strong> (hosting and deployment). Each of these services has its own privacy policy.
            </p>
          </div>

          <h2 className="font-pixel" style={{ fontSize: 12, color: C.GREEN, letterSpacing: 2, marginBottom: 14 }}>
            ⬢ {t("privacy.contact")}
          </h2>
          <p className="font-retro" style={{ color: C.TEXT, fontSize: 18, lineHeight: 1.7, marginBottom: 28 }}>
            For privacy-related questions, please contact us via GitHub Issues or email the project maintainer.
          </p>

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
            <span className="font-pixel" style={{ fontSize: 8, color: C.DIM, letterSpacing: 3 }}>
              {t("privacy.lastUpdated")}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
