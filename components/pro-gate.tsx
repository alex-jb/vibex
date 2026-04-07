"use client";

import { useState, useCallback } from "react";
import { PRICING } from "@/lib/pricing";

interface ProGateProps {
  featureName: string;
  children: React.ReactNode;
  blurPreview?: boolean;
}

/**
 * Pro feature gate. Shows blurred preview + upgrade CTA for Pro features.
 * Tracks click interest for business validation.
 */
export function ProGate({ featureName, children, blurPreview = true }: ProGateProps) {
  const [clicked, setClicked] = useState(false);

  const handleUnlock = useCallback(async () => {
    setClicked(true);

    // Track Pro interest (for business validation)
    try {
      await fetch("/api/pro/interest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ feature: featureName, timestamp: new Date().toISOString() }),
      });
    } catch {
      // silent tracking
    }
  }, [featureName]);

  return (
    <div style={{ position: "relative" }}>
      {/* Blurred content preview */}
      <div
        style={{
          filter: blurPreview ? "blur(6px)" : "none",
          pointerEvents: "none",
          userSelect: "none",
          opacity: 0.6,
        }}
      >
        {children}
      </div>

      {/* Overlay CTA */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "rgba(13, 13, 16, 0.7)",
          backdropFilter: "blur(2px)",
          zIndex: 5,
        }}
      >
        <div className="rpgui-container framed" style={{ padding: 20, textAlign: "center", maxWidth: 300 }}>
          <div style={{ fontSize: 24, marginBottom: 8 }}>{"\uD83D\uDD12"}</div>
          <div className="font-pixel" style={{ fontSize: 10, color: "#FACC15", marginBottom: 8 }}>
            PRO FEATURE
          </div>
          <div className="font-retro" style={{ fontSize: 12, color: "#E8E8EC", marginBottom: 12, lineHeight: 1.5 }}>
            {"\u89E3\u9501\u5B8C\u6574\u53D1\u5E03\u5305\u3001\u5206\u53D1\u7B56\u7565\u3001\u7ADE\u54C1\u5206\u6790\u3001\u6295\u8D44\u4EBA Pitch"}
          </div>
          <div className="font-pixel" style={{ fontSize: 14, color: "#FACC15", marginBottom: 12 }}>
            {PRICING.pro.priceLabel}<span style={{ fontSize: 8, color: "#888" }}>{PRICING.pro.period}</span>
          </div>

          {clicked ? (
            <div>
              <div className="font-pixel" style={{ fontSize: 9, color: "#39FF14", marginBottom: 8 }}>
                {"\u2714 \u5DF2\u8BB0\u5F55\u4F60\u7684\u5174\u8DA3\uFF01"}
              </div>
              <div className="font-retro" style={{ fontSize: 11, color: "#888" }}>
                Pro \u529F\u80FD\u5373\u5C06\u4E0A\u7EBF\uFF0C\u6211\u4EEC\u4F1A\u901A\u77E5\u4F60\u3002
              </div>
            </div>
          ) : (
            <button
              className="nes-btn is-warning"
              onClick={handleUnlock}
              style={{ fontSize: 9, padding: "6px 16px" }}
            >
              {"\u89E3\u9501 Pro \u529F\u80FD"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
