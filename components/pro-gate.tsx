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
            {"Unlock full launch packages, distribution strategies, competitive analysis, and investor pitch tools"}
          </div>
          <div className="font-pixel" style={{ fontSize: 14, color: "#FACC15", marginBottom: 12 }}>
            {PRICING.pro.priceLabel}<span style={{ fontSize: 8, color: "#888" }}>{PRICING.pro.period}</span>
          </div>

          {clicked ? (
            <div>
              <div className="font-pixel" style={{ fontSize: 9, color: "#39FF14", marginBottom: 8 }}>
                {"Your interest has been recorded!"}
              </div>
              <div className="font-retro" style={{ fontSize: 11, color: "#888" }}>
                Pro features coming soon. We will notify you.
              </div>
            </div>
          ) : (
            <button
              className="nes-btn is-warning"
              onClick={handleUnlock}
              style={{ fontSize: 9, padding: "6px 16px" }}
            >
              {"Unlock Pro Features"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
