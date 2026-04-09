import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";
import { projects } from "@/lib/mock-data";
import { generateQRMatrix } from "@/lib/qr";
import type { HeroStats } from "@/lib/types";

export const runtime = "edge";

const SITE_DOMAIN = "vibexforge.com";

// ═══════════════════════════════════════════════════════════════
// Design Tokens
// ═══════════════════════════════════════════════════════════════

const BORDER_OUTER = "#4a2080";
const BORDER_INNER = "#8b5cf6";
const BORDER_RIVET = "#c084fc";
const BG_DARK = "#0a0a0c";
const BG_PANEL = "#12101a";
const NEON_GREEN = "#39FF14";
const NEON_PURPLE = "#9D00FF";
const NEON_YELLOW = "#FACC15";
const NEON_CYAN = "#06B6D4";
const NEON_PINK = "#EC4899";
const NEON_ORANGE = "#FF4500";
const TEXT_DIM = "#71717a";
const TEXT_LIGHT = "#d4d4d8";

const CATEGORY_COLORS: Record<string, string> = {
  "AI Agent": BORDER_INNER, "AI Tool": NEON_GREEN, "AI Game": NEON_PINK,
  "AI Workflow": NEON_CYAN, "AI Utility": NEON_YELLOW,
  Experimental: NEON_ORANGE, Demo: "#a1a1aa",
};

const RARITY_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  Phoenix:  { label: "LEGENDARY", color: "#FFD700", bg: "rgba(255,215,0,0.15)" },
  Inferno:  { label: "EPIC",      color: "#c084fc", bg: "rgba(192,132,252,0.15)" },
  Flame:    { label: "RARE",      color: NEON_CYAN,  bg: "rgba(6,182,212,0.15)" },
  Spark:    { label: "COMMON",    color: "#a1a1aa",  bg: "rgba(161,161,170,0.1)" },
};

const CLASS_EMOJI: Record<string, string> = {
  Architect: "🏗️", Artisan: "⚒️", Enchanter: "✨", Alchemist: "🧪", Sentinel: "🛡️",
};

// ═══════════════════════════════════════════════════════════════
// Subcomponents
// ═══════════════════════════════════════════════════════════════

function QRPixelGrid({ modules, size: qrSize, pixelSize }: { modules: boolean[][]; size: number; pixelSize: number }) {
  const total = qrSize * pixelSize;
  return (
    <div style={{ display: "flex", flexWrap: "wrap", width: `${total}px`, height: `${total}px`, background: "white", padding: `${pixelSize * 2}px`, borderRadius: "4px" }}>
      {modules.flat().map((isDark, i) => (
        <div key={i} style={{ width: `${pixelSize}px`, height: `${pixelSize}px`, background: isDark ? BG_DARK : "white" }} />
      ))}
    </div>
  );
}

function PixelBar({ value, max, color, label, width = 200 }: { value: number; max: number; color: string; label: string; width?: number }) {
  const pct = Math.min(100, (value / max) * 100);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
      <span style={{ fontSize: "10px", color, fontWeight: "bold", width: "28px", textAlign: "right", fontFamily: "PressStart2P" }}>{label}</span>
      <div style={{ display: "flex", width: `${width}px`, height: "14px", background: "rgba(255,255,255,0.06)", border: "2px solid rgba(255,255,255,0.08)", overflow: "hidden" }}>
        <div style={{ width: `${pct}%`, height: "100%", background: `linear-gradient(90deg, ${color}, ${color}cc)` }} />
      </div>
      <span style={{ fontSize: "10px", color: TEXT_LIGHT, fontFamily: "PressStart2P" }}>{value}/{max}</span>
    </div>
  );
}

function CornerDecor({ position }: { position: "tl" | "tr" | "bl" | "br" }) {
  const s = 24;
  const isLeft = position === "tl" || position === "bl";
  const isTop = position === "tl" || position === "tr";
  return (
    <div style={{
      position: "absolute",
      [isTop ? "top" : "bottom"]: "10px",
      [isLeft ? "left" : "right"]: "10px",
      width: `${s}px`, height: `${s}px`, display: "flex",
    }}>
      {/* L-shaped corner */}
      <div style={{
        position: "absolute",
        [isTop ? "top" : "bottom"]: "0",
        [isLeft ? "left" : "right"]: "0",
        width: `${s}px`, height: "4px", background: BORDER_RIVET, display: "flex",
      }} />
      <div style={{
        position: "absolute",
        [isTop ? "top" : "bottom"]: "0",
        [isLeft ? "left" : "right"]: "0",
        width: "4px", height: `${s}px`, background: BORDER_RIVET, display: "flex",
      }} />
      {/* Rivet dot */}
      <div style={{
        position: "absolute",
        [isTop ? "top" : "bottom"]: "-2px",
        [isLeft ? "left" : "right"]: "-2px",
        width: "8px", height: "8px", borderRadius: "50%",
        background: `radial-gradient(circle, ${BORDER_RIVET}, ${BORDER_OUTER})`,
        display: "flex",
      }} />
    </div>
  );
}

function SkillTag({ name, icon }: { name: string; icon: string }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: "6px",
      padding: "4px 10px", background: "rgba(139,92,246,0.1)",
      border: "1px solid rgba(139,92,246,0.25)", borderRadius: "4px",
    }}>
      <span style={{ fontSize: "12px" }}>{icon}</span>
      <span style={{ fontSize: "9px", color: TEXT_LIGHT, fontFamily: "PressStart2P" }}>{name}</span>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// AI-generated one-liner (deterministic based on project data)
// ═══════════════════════════════════════════════════════════════

function generateCatchphrase(project: typeof projects[0]): string {
  const hero = project.hero;
  if (!hero) return `${project.title} — a rising star in the AI frontier.`;

  const level = hero.level;
  const cls = hero.heroClass;
  const score = project.score;

  if (score >= 90) return `This LV.${level} ${cls} has conquered 99% of all challengers! 🏆`;
  if (score >= 80) return `A formidable LV.${level} ${cls} — top 5% in the arena! ⚔️`;
  if (score >= 70) return `LV.${level} ${cls} on the rise — watch this hero evolve! 🚀`;
  return `A promising LV.${level} ${cls} begins their quest... ✨`;
}

// ═══════════════════════════════════════════════════════════════
// Main Route
// ═══════════════════════════════════════════════════════════════

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const id = url.searchParams.get("id");
  const sizeParam = url.searchParams.get("size") || "hero"; // "hero" (3:4), "square" (1:1), "wide" (16:9)

  if (!id) return new Response("Missing id parameter", { status: 400 });

  const project = projects.find((p) => p.id === id);
  if (!project) return new Response("Project not found", { status: 404 });

  const dimensions: Record<string, { w: number; h: number }> = {
    hero:   { w: 810, h: 1080 },  // 3:4 — Xiaohongshu / mobile optimal
    square: { w: 1080, h: 1080 }, // 1:1 — Instagram
    wide:   { w: 1200, h: 675 },  // 16:9 — Twitter
  };
  const { w: width, h: height } = dimensions[sizeParam] || dimensions.hero;
  const isHero = sizeParam === "hero";
  const isWide = sizeParam === "wide";

  const projectUrl = `https://${SITE_DOMAIN}/project/${project.id}`;
  const qr = await generateQRMatrix(projectUrl);

  const categoryColor = CATEGORY_COLORS[project.category] || NEON_PURPLE;
  const hero: HeroStats | undefined = project.hero;
  const rarity = RARITY_CONFIG[hero?.evolutionStage || "Spark"] || RARITY_CONFIG.Spark;
  const classEmoji = CLASS_EMOJI[hero?.heroClass || ""] || "⚔️";
  const catchphrase = generateCatchphrase(project);

  // Load pixel font
  let fontData: ArrayBuffer | undefined;
  try {
    const fontRes = await fetch("https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap");
    const css = await fontRes.text();
    const match = css.match(/src:\s*url\(([^)]+)\)/);
    if (match?.[1]) fontData = await fetch(match[1]).then((r) => r.arrayBuffer());
  } catch { /* fallback */ }

  const fonts = fontData ? [{ name: "PressStart2P", data: fontData, style: "normal" as const }] : [];
  const ff = fontData ? "PressStart2P" : "monospace";

  return new ImageResponse(
    (
      <div style={{ width: `${width}px`, height: `${height}px`, display: "flex", background: BG_DARK, position: "relative", overflow: "hidden" }}>

        {/* ═══ Scanline overlay ═══ */}
        <div style={{ position: "absolute", inset: "0", display: "flex", background: "repeating-linear-gradient(transparent 0px, transparent 2px, rgba(0,0,0,0.04) 2px, rgba(0,0,0,0.04) 4px)", pointerEvents: "none" }} />

        {/* ═══ Outer border — thick RPGUI metal frame ═══ */}
        <div style={{ position: "absolute", inset: "0", display: "flex", border: `8px solid ${BORDER_OUTER}` }}>
          <div style={{ position: "absolute", inset: "8px", display: "flex", border: `4px solid ${BORDER_INNER}` }} />
        </div>

        {/* ═══ L-shaped corner decorations with rivets ═══ */}
        <CornerDecor position="tl" />
        <CornerDecor position="tr" />
        <CornerDecor position="bl" />
        <CornerDecor position="br" />

        {/* ═══ Content ═══ */}
        <div style={{ display: "flex", flexDirection: "column", width: "100%", height: "100%", padding: isWide ? "36px 44px" : "36px 32px" }}>

          {/* ─── Top row: Creator ID + Rarity ─── */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: isHero ? "20px" : "12px" }}>
            {/* Creator */}
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div style={{
                width: "36px", height: "36px", borderRadius: "6px",
                background: `linear-gradient(135deg, ${BORDER_INNER}, ${NEON_CYAN})`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "16px", color: "white", fontWeight: "bold",
                border: `2px solid ${BORDER_RIVET}`,
                imageRendering: "pixelated",
              }}>
                {project.creatorName.charAt(0)}
              </div>
              <div style={{ display: "flex", flexDirection: "column" }}>
                <span style={{ fontSize: "11px", color: TEXT_LIGHT, fontFamily: ff }}>{project.creatorName}</span>
                <span style={{ fontSize: "8px", color: TEXT_DIM, fontFamily: ff }}>
                  {classEmoji} {hero?.heroClass || "Creator"}
                </span>
              </div>
            </div>

            {/* Rarity badge */}
            <div style={{
              display: "flex", alignItems: "center", gap: "4px",
              padding: "4px 12px", borderRadius: "4px",
              background: rarity.bg, border: `2px solid ${rarity.color}40`,
            }}>
              <span style={{ fontSize: "9px", fontFamily: ff, color: rarity.color, fontWeight: "bold", letterSpacing: "2px" }}>
                {rarity.label}
              </span>
            </div>
          </div>

          {/* ─── Sprite area: Large emoji + level ─── */}
          {isHero && (
            <div style={{
              display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
              flex: "0 0 auto", minHeight: "200px", marginBottom: "16px",
              background: `radial-gradient(ellipse at center, ${categoryColor}15 0%, transparent 70%)`,
              borderRadius: "8px",
            }}>
              <span style={{ fontSize: "80px", marginBottom: "8px" }}>{classEmoji}</span>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ fontSize: "10px", fontFamily: ff, color: NEON_YELLOW, letterSpacing: "3px" }}>
                  LV.{hero?.level || 1}
                </span>
                <span style={{ fontSize: "10px", color: TEXT_DIM }}>|</span>
                <span style={{ fontSize: "10px", fontFamily: ff, color: categoryColor }}>
                  {project.category}
                </span>
              </div>
            </div>
          )}

          {/* ─── Title + Tagline ─── */}
          <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "16px" }}>
            <span style={{ fontSize: isWide ? "28px" : isHero ? "24px" : "32px", fontWeight: "bold", color: "white", fontFamily: ff, lineHeight: "1.3" }}>
              {project.title}
            </span>
            <span style={{ fontSize: isWide ? "14px" : "13px", color: "#a1a1aa", lineHeight: "1.6" }}>
              {project.tagline}
            </span>
          </div>

          {/* ─── HP / EXP Bars ─── */}
          {hero && (
            <div style={{ display: "flex", flexDirection: "column", gap: "6px", padding: "12px", background: BG_PANEL, border: `2px solid ${BORDER_INNER}30`, borderRadius: "6px", marginBottom: "12px" }}>
              <PixelBar value={hero.hp} max={hero.maxHp} color={NEON_GREEN} label="HP" width={isWide ? 280 : 180} />
              <PixelBar value={hero.mp} max={hero.maxMp} color={NEON_CYAN} label="MP" width={isWide ? 280 : 180} />
              <PixelBar value={hero.exp} max={hero.expToNextLevel} color={NEON_PURPLE} label="EXP" width={isWide ? 280 : 180} />
            </div>
          )}

          {/* ─── Skill Tags (Moves) ─── */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "12px" }}>
            {project.tags.slice(0, 3).map((tag, i) => (
              <SkillTag key={i} name={tag} icon={["⚡", "🔮", "🎯"][i] || "⚡"} />
            ))}
          </div>

          {/* ─── Stats row ─── */}
          <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: isHero ? "12px" : "8px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
              <span style={{ fontSize: "18px", color: NEON_YELLOW }}>★</span>
              <span style={{ fontSize: "16px", fontWeight: "bold", color: NEON_YELLOW, fontFamily: ff }}>{project.score}</span>
            </div>
            <span style={{ fontSize: "11px", color: TEXT_DIM }}>{project.upvotes.toLocaleString()} upvotes</span>
            <span style={{ fontSize: "11px", color: TEXT_DIM }}>{project.plays.toLocaleString()} plays</span>
          </div>

          {/* ─── AI Catchphrase ─── */}
          <div style={{
            display: "flex", padding: "10px 14px", marginBottom: isHero ? "auto" : "8px",
            background: "rgba(250,204,21,0.06)", border: "1px solid rgba(250,204,21,0.15)", borderRadius: "6px",
          }}>
            <span style={{ fontSize: "10px", color: NEON_YELLOW, fontFamily: ff, lineHeight: "1.8" }}>
              {catchphrase}
            </span>
          </div>

          {/* ─── Bottom: QR + branding ─── */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginTop: isHero ? "0" : "auto" }}>
            {/* Branding */}
            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <div style={{
                  width: "28px", height: "28px", borderRadius: "6px",
                  background: `linear-gradient(135deg, ${BORDER_INNER}, #d946ef)`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "14px", color: "white", fontWeight: "bold", fontFamily: ff,
                }}>V</div>
                <span style={{ fontSize: "14px", fontWeight: "bold", color: BORDER_INNER, fontFamily: ff }}>VibeX</span>
              </div>
              <span style={{ fontSize: "8px", color: TEXT_DIM, fontFamily: ff }}>{SITE_DOMAIN}</span>
            </div>

            {/* QR Code */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}>
              <QRPixelGrid modules={qr.modules} size={qr.size} pixelSize={isWide ? 2 : 3} />
              <span style={{ fontSize: "7px", color: TEXT_DIM, fontFamily: ff }}>SCAN TO VIEW</span>
            </div>
          </div>
        </div>

        {/* ═══ Bottom gradient bar ═══ */}
        <div style={{
          position: "absolute", bottom: "0", left: "0", right: "0", height: "4px", display: "flex",
          background: `linear-gradient(90deg, ${NEON_GREEN}, ${NEON_CYAN}, ${BORDER_INNER}, ${NEON_PINK}, ${NEON_YELLOW})`,
        }} />
      </div>
    ),
    { width, height, fonts }
  );
}
