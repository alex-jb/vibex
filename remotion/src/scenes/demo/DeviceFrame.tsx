/**
 * DeviceFrame — macOS-style browser chrome around product content.
 *
 * Lifted from the Remotion SaaS Showcase pattern (GitHub Raazi305/
 * remotion-saas-showcase): traffic lights + URL bar + dark content
 * viewport. Wraps screen recordings or screenshot stills so the demo
 * reads as "real product in a real browser" rather than a bare frame.
 *
 * Usage:
 *   <DeviceFrame url="vibexforge.com/launch">
 *     <Video src={staticFile("recordings/R1.mp4")} />
 *   </DeviceFrame>
 */

import type { ReactNode } from "react";
import { COLORS } from "../../tokens";

type DeviceFrameProps = {
  url: string;
  children: ReactNode;
  /** Shrink factor 0-1. 1 = fills parent. 0.82 = tasteful margin. */
  scale?: number;
};

export const DeviceFrame = ({
  url,
  children,
  scale = 0.82,
}: DeviceFrameProps) => {
  const widthPct = Math.round(scale * 100);
  return (
    <div
      style={{
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        width: `${widthPct}%`,
        aspectRatio: "16 / 10",
        background: COLORS.BG_DEEP,
        borderRadius: 14,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        boxShadow:
          "0 60px 120px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(255,255,255,0.06)",
        border: `1px solid ${COLORS.BORDER}`,
      }}
    >
      {/* Titlebar */}
      <div
        style={{
          height: 40,
          flexShrink: 0,
          background: COLORS.BG_PANEL,
          display: "flex",
          alignItems: "center",
          padding: "0 16px",
          gap: 10,
          borderBottom: `1px solid ${COLORS.BORDER_HAIR}`,
        }}
      >
        <div
          style={{
            width: 12,
            height: 12,
            borderRadius: 6,
            background: "#ff5f57",
          }}
        />
        <div
          style={{
            width: 12,
            height: 12,
            borderRadius: 6,
            background: "#febc2e",
          }}
        />
        <div
          style={{
            width: 12,
            height: 12,
            borderRadius: 6,
            background: "#28c840",
          }}
        />
        <div
          style={{
            flex: 1,
            textAlign: "center",
            fontFamily: "ui-monospace, monospace",
            fontSize: 14,
            color: COLORS.TEXT_MUTED,
            letterSpacing: 0.3,
          }}
        >
          {url}
        </div>
        <div style={{ width: 46 }} /> {/* balance for centering */}
      </div>

      {/* Content viewport */}
      <div
        style={{
          flex: 1,
          position: "relative",
          background: "#000",
          overflow: "hidden",
        }}
      >
        {children}
      </div>
    </div>
  );
};
