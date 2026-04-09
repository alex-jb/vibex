"use client";

import dynamic from "next/dynamic";
import { useLang } from "@/lib/i18n";

const AnalyticsPage = dynamic(() => import("@/app/analytics/page"), {
  ssr: false,
  loading: () => (
    <div style={{ padding: 24, textAlign: "center" }}>
      <span
        className="font-pixel"
        style={{ fontSize: 10, color: "#555", letterSpacing: 2 }}
      >
        {"> LOADING ANALYTICS..."}
      </span>
    </div>
  ),
});

export function AnalyticsTab() {
  const { t } = useLang();
  return (
    <div>
      <p
        className="font-pixel"
        style={{
          fontSize: 10,
          color: "rgba(255,255,255,0.45)",
          textAlign: "center",
          marginBottom: 8,
          letterSpacing: 1,
        }}
      >
        {t("insights.analyticsDisclaimer")}
      </p>
      <AnalyticsPage />
    </div>
  );
}
