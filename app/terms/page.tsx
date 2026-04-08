"use client";

import { useLang } from "@/lib/i18n";

export default function TermsPage() {
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
          {">"} VIBEX://TERMS
        </span>
        <span className="font-pixel" style={{ fontSize: 7, color: "#333" }}>━━━</span>
      </div>

      {/* Body */}
      <div className="rpgui-container framed" style={{ padding: 24 }}>
        <h2 className="font-pixel" style={{ fontSize: 12, color: "#39FF14", marginBottom: 16 }}>
          {t("terms.title")}
        </h2>
        <p style={{ color: "#8888A0", fontSize: 14, lineHeight: 1.8, marginBottom: 24 }}>
          Welcome to the VibeX platform. By using this platform, you agree to abide by the following terms. You may not use this platform for any unlawful activity or to harm the rights of others. We reserve the right to modify these terms of service at any time.
        </p>

        <h2 className="font-pixel" style={{ fontSize: 12, color: "#39FF14", marginBottom: 16 }}>
          {t("terms.ip")}
        </h2>
        <p style={{ color: "#8888A0", fontSize: 14, lineHeight: 1.8, marginBottom: 24 }}>
          The VibeX platform is released under a source-available license. Projects created by users on the platform remain the property of their creators, but the platform reserves the right to display and promote publicly published content.
        </p>

        <h2 className="font-pixel" style={{ fontSize: 12, color: "#39FF14", marginBottom: 16 }}>
          {t("terms.disclaimer")}
        </h2>
        <p style={{ color: "#8888A0", fontSize: 14, lineHeight: 1.8, marginBottom: 24 }}>
          The AI features on this platform (including the battle system, project evaluation, etc.) are for entertainment and reference only and do not constitute professional advice. AI-generated content may contain inaccuracies, and users should exercise their own judgment.
        </p>

        <p className="font-pixel" style={{ fontSize: 7, color: "#555", marginTop: 32 }}>
          {t("terms.lastUpdated")}
        </p>
      </div>
    </div>
  );
}
