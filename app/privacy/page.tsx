"use client";

import { useLang } from "@/lib/i18n";

export default function PrivacyPage() {
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
          {">"} VIBEX://PRIVACY
        </span>
        <span className="font-pixel" style={{ fontSize: 7, color: "#333" }}>━━━</span>
      </div>

      {/* Body */}
      <div className="rpgui-container framed" style={{ padding: 24 }}>
        <h2 className="font-pixel" style={{ fontSize: 12, color: "#39FF14", marginBottom: 16 }}>
          {t("privacy.dataCollection")}
        </h2>
        <p style={{ color: "#8888A0", fontSize: 14, lineHeight: 1.8, marginBottom: 24 }}>
          We collect the following data: account information (username, email), project data (code, descriptions, configuration), and usage data (page views, feature usage frequency). We do not collect unnecessary personal information.
        </p>

        <h2 className="font-pixel" style={{ fontSize: 12, color: "#39FF14", marginBottom: 16 }}>
          {t("privacy.dataUsage")}
        </h2>
        <p style={{ color: "#8888A0", fontSize: 14, lineHeight: 1.8, marginBottom: 24 }}>
          Collected data is used to: provide and improve platform services, generate leaderboards and statistics, optimize AI feature experiences, and send service-related notifications. We will never sell your data to third parties.
        </p>

        <h2 className="font-pixel" style={{ fontSize: 12, color: "#39FF14", marginBottom: 16 }}>
          {t("privacy.thirdParty")}
        </h2>
        <p style={{ color: "#8888A0", fontSize: 14, lineHeight: 1.8, marginBottom: 24 }}>
          This platform uses the following third-party services: Supabase (database and authentication), Anthropic Claude API (AI features), and Vercel (hosting and deployment). Each of these services has its own privacy policy.
        </p>

        <h2 className="font-pixel" style={{ fontSize: 12, color: "#39FF14", marginBottom: 16 }}>
          {t("privacy.contact")}
        </h2>
        <p style={{ color: "#8888A0", fontSize: 14, lineHeight: 1.8, marginBottom: 24 }}>
          For privacy-related questions, please contact us via GitHub Issues or email the project maintainer.
        </p>

        <p className="font-pixel" style={{ fontSize: 7, color: "#555", marginTop: 32 }}>
          {t("privacy.lastUpdated")}
        </p>
      </div>
    </div>
  );
}
