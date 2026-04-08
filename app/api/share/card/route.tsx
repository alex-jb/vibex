import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";
import { projects } from "@/lib/mock-data";
import { generateQRMatrix } from "@/lib/qr";

export const runtime = "edge";

const SITE_DOMAIN = "vibexforge.com";

// Pixel border colors for the 16-bit aesthetic
const BORDER_OUTER = "#4a2080";
const BORDER_INNER = "#8b5cf6";
const BG_DARK = "#0a0a0c";
const BG_CARD = "#12101a";
const NEON_GREEN = "#39FF14";
const NEON_PURPLE = "#9D00FF";
const NEON_YELLOW = "#FACC15";
const NEON_CYAN = "#06B6D4";
const TEXT_DIM = "#71717a";

const CATEGORY_COLORS: Record<string, string> = {
  "AI Agent": "#8b5cf6",
  "AI Tool": NEON_GREEN,
  "AI Game": "#EC4899",
  "AI Workflow": NEON_CYAN,
  "AI Utility": NEON_YELLOW,
  Experimental: "#FF4500",
  Demo: "#a1a1aa",
};

function QRPixelGrid({
  modules,
  size,
  pixelSize,
}: {
  modules: boolean[][];
  size: number;
  pixelSize: number;
}) {
  const totalSize = size * pixelSize;
  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        width: `${totalSize}px`,
        height: `${totalSize}px`,
        background: "white",
        padding: `${pixelSize * 2}px`,
        borderRadius: "4px",
      }}
    >
      {modules.flat().map((isDark, i) => (
        <div
          key={i}
          style={{
            width: `${pixelSize}px`,
            height: `${pixelSize}px`,
            background: isDark ? "#0a0a0c" : "white",
          }}
        />
      ))}
    </div>
  );
}

function ScoreBar({
  score,
  label,
  color,
}: {
  score: number;
  label: string;
  color: string;
}) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
      <span
        style={{
          fontSize: "14px",
          color: TEXT_DIM,
          width: "60px",
          textAlign: "right",
        }}
      >
        {label}
      </span>
      <div
        style={{
          display: "flex",
          width: "120px",
          height: "12px",
          background: "rgba(255,255,255,0.06)",
          borderRadius: "2px",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${score}%`,
            height: "100%",
            background: color,
            borderRadius: "2px",
          }}
        />
      </div>
      <span style={{ fontSize: "14px", color, fontWeight: "bold" }}>
        {score}
      </span>
    </div>
  );
}

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const id = url.searchParams.get("id");
  const sizeParam = url.searchParams.get("size") || "square";

  if (!id) {
    return new Response("Missing id parameter", { status: 400 });
  }

  const project = projects.find((p) => p.id === id);
  if (!project) {
    return new Response("Project not found", { status: 404 });
  }

  const isWide = sizeParam === "wide";
  const width = isWide ? 1200 : 1080;
  const height = isWide ? 675 : 1080;

  const projectUrl = `https://${SITE_DOMAIN}/project/${project.id}`;
  const qr = await generateQRMatrix(projectUrl);
  const qrPixelSize = isWide ? 3 : 4;

  const categoryColor = CATEGORY_COLORS[project.category] || NEON_PURPLE;

  // Load the pixel font from Google Fonts (works in edge runtime)
  let fontData: ArrayBuffer | undefined;
  try {
    const fontRes = await fetch(
      "https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap"
    );
    // Fetch the actual font file URL from CSS
    const css = await fontRes.text();
    const fontUrlMatch = css.match(/src:\s*url\(([^)]+)\)/);
    if (fontUrlMatch?.[1]) {
      fontData = await fetch(fontUrlMatch[1]).then((res) => res.arrayBuffer());
    }
  } catch {
    // Font loading may fail — fallback to sans-serif
  }

  const fonts = fontData
    ? [{ name: "PressStart2P", data: fontData, style: "normal" as const }]
    : [];

  const fontFamily = fontData ? "PressStart2P" : "sans-serif";

  return new ImageResponse(
    (
      <div
        style={{
          width: `${width}px`,
          height: `${height}px`,
          display: "flex",
          background: BG_DARK,
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Pixel border — outer */}
        <div
          style={{
            position: "absolute",
            inset: "0",
            display: "flex",
            border: `6px solid ${BORDER_OUTER}`,
          }}
        >
          {/* Pixel border — inner */}
          <div
            style={{
              position: "absolute",
              inset: "6px",
              display: "flex",
              border: `3px solid ${BORDER_INNER}`,
            }}
          />
        </div>

        {/* Scanline overlay effect */}
        <div
          style={{
            position: "absolute",
            inset: "0",
            display: "flex",
            background:
              "repeating-linear-gradient(transparent 0px, transparent 2px, rgba(0,0,0,0.05) 2px, rgba(0,0,0,0.05) 4px)",
            pointerEvents: "none",
          }}
        />

        {/* Content container */}
        <div
          style={{
            display: "flex",
            flexDirection: isWide ? "row" : "column",
            width: "100%",
            height: "100%",
            padding: isWide ? "40px 48px" : "48px 40px",
          }}
        >
          {/* Main content area */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              flex: "1",
              justifyContent: "center",
              gap: isWide ? "16px" : "24px",
            }}
          >
            {/* VibeX branding + category */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "36px",
                  height: "36px",
                  background: `linear-gradient(135deg, ${BORDER_INNER}, #d946ef)`,
                  borderRadius: "8px",
                  fontSize: "18px",
                  fontWeight: "bold",
                  color: "white",
                  fontFamily,
                }}
              >
                V
              </div>
              <span
                style={{
                  fontSize: "20px",
                  fontWeight: "bold",
                  color: BORDER_INNER,
                  fontFamily,
                }}
              >
                VibeX
              </span>
              <span style={{ fontSize: "14px", color: TEXT_DIM }}>|</span>
              <span
                style={{
                  fontSize: "14px",
                  color: categoryColor,
                  fontWeight: "bold",
                  fontFamily,
                  padding: "2px 10px",
                  background: `${categoryColor}20`,
                  borderRadius: "4px",
                  border: `1px solid ${categoryColor}40`,
                }}
              >
                {project.category}
              </span>
            </div>

            {/* Project title */}
            <h1
              style={{
                fontSize: isWide ? "36px" : "42px",
                fontWeight: "bold",
                color: "white",
                fontFamily,
                margin: "0",
                lineHeight: "1.2",
                maxWidth: isWide ? "640px" : "100%",
              }}
            >
              {project.title}
            </h1>

            {/* Tagline */}
            <p
              style={{
                fontSize: isWide ? "18px" : "20px",
                color: "#a1a1aa",
                margin: "0",
                lineHeight: "1.5",
                maxWidth: isWide ? "580px" : "100%",
              }}
            >
              {project.tagline}
            </p>

            {/* Stats row */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "20px",
                marginTop: "8px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <span style={{ fontSize: "24px", color: NEON_YELLOW }}>
                  ★
                </span>
                <span
                  style={{
                    fontSize: "28px",
                    fontWeight: "bold",
                    color: NEON_YELLOW,
                    fontFamily,
                  }}
                >
                  {project.score}
                </span>
              </div>
              <span style={{ fontSize: "14px", color: TEXT_DIM }}>|</span>
              <span style={{ fontSize: "16px", color: TEXT_DIM }}>
                {project.upvotes.toLocaleString()} upvotes
              </span>
              <span style={{ fontSize: "14px", color: TEXT_DIM }}>|</span>
              <span style={{ fontSize: "16px", color: TEXT_DIM }}>
                {project.views.toLocaleString()} views
              </span>
            </div>

            {/* AI Score bars (only in square mode) */}
            {!isWide && project.aiReview && (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "8px",
                  marginTop: "12px",
                  padding: "16px",
                  background: `${BG_CARD}`,
                  borderRadius: "8px",
                  border: "1px solid rgba(139, 92, 246, 0.2)",
                }}
              >
                <span
                  style={{
                    fontSize: "12px",
                    color: BORDER_INNER,
                    fontWeight: "bold",
                    fontFamily,
                    textTransform: "uppercase",
                    letterSpacing: "2px",
                    marginBottom: "4px",
                  }}
                >
                  AI Review
                </span>
                <ScoreBar
                  score={project.aiReview.originality}
                  label="ORI"
                  color={NEON_GREEN}
                />
                <ScoreBar
                  score={project.aiReview.clarity}
                  label="CLR"
                  color={NEON_CYAN}
                />
                <ScoreBar
                  score={project.aiReview.uxPotential}
                  label="UX"
                  color={NEON_YELLOW}
                />
                <ScoreBar
                  score={project.aiReview.viralityPotential}
                  label="VRL"
                  color="#EC4899"
                />
              </div>
            )}

            {/* Creator */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                marginTop: isWide ? "8px" : "auto",
              }}
            >
              <div
                style={{
                  width: "28px",
                  height: "28px",
                  borderRadius: "6px",
                  background: `linear-gradient(135deg, ${BORDER_INNER}, ${NEON_CYAN})`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "14px",
                  color: "white",
                  fontWeight: "bold",
                }}
              >
                {project.creatorName.charAt(0)}
              </div>
              <span style={{ fontSize: "16px", color: "#d4d4d8", fontFamily }}>
                {project.creatorName}
              </span>
            </div>
          </div>

          {/* Right column: QR code + branding footer */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: isWide ? "flex-end" : "center",
              justifyContent: isWide ? "center" : "flex-start",
              gap: "12px",
              marginTop: isWide ? "0" : "24px",
            }}
          >
            <QRPixelGrid
              modules={qr.modules}
              size={qr.size}
              pixelSize={qrPixelSize}
            />
            <span
              style={{
                fontSize: "11px",
                color: TEXT_DIM,
                fontFamily,
                textAlign: "center",
              }}
            >
              Scan to view on {SITE_DOMAIN}
            </span>
          </div>
        </div>

        {/* Bottom bar */}
        <div
          style={{
            position: "absolute",
            bottom: "0",
            left: "0",
            right: "0",
            height: "40px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: `linear-gradient(90deg, ${BORDER_OUTER}, ${BORDER_INNER}, ${BORDER_OUTER})`,
            gap: "8px",
          }}
        >
          <span
            style={{
              fontSize: "12px",
              color: "white",
              fontWeight: "bold",
              fontFamily,
              letterSpacing: "2px",
            }}
          >
            VIBEX
          </span>
          <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.5)" }}>
            |
          </span>
          <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.7)" }}>
            AI-Native Launch Platform
          </span>
          <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.5)" }}>
            |
          </span>
          <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.7)" }}>
            {SITE_DOMAIN}
          </span>
        </div>
      </div>
    ),
    {
      width,
      height,
      fonts,
    }
  );
}
