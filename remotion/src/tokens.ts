/**
 * Direction A palette — inlined from app/retro-game.css because Remotion
 * can't consume CSS vars at render time (same constraint as Satori for OG
 * images). Single source of truth for the video: touch this file, every
 * scene's colors move together.
 */

export const COLORS = {
  BG_DEEP: "#0D0D0D",
  BG_PANEL: "#111114",
  BG_CARD: "#161619",
  BORDER: "#3A3A42",
  BORDER_HAIR: "rgba(255,255,255,0.05)",
  TEXT: "#E8E8EC",
  TEXT_CREAM: "#FFFCEB",
  TEXT_MUTED: "#8B7AA0",
  TEXT_DIM: "#4A4050",
  NEON_GREEN: "#39FF14",
  NEON_ORANGE: "#FF4500",
  NEON_ORANGE_DIM: "#FF450040",
  NEON_PURPLE: "#9D00FF",
  NEON_YELLOW: "#FACC15",
  NEON_CYAN: "#06B6D4",
  NEON_PINK: "#EC4899",
  FORGE_CREAM: "#FFE27D",
  FORGE_DARK: "#1A0F00",
} as const;

export const STAGE_COLORS = {
  Seed: "#d4d4d8",
  Active: "#22c55e",
  Growing: "#06B6D4",
  Breakout: "#D946EF",
  Legend: "#EF4444",
  Myth: "#FF69B4",
} as const;

// Family names from @remotion/google-fonts (renamed to avoid digit-prefix).
// Keep the legacy Google-Fonts name in the fallback chain in case the
// bundled font fails to load.
export const FONT_PIXEL = "'Press Start TwoP', 'Press Start 2P', monospace";
export const FONT_RETRO = "'VTThreeTwoThree', 'VT323', monospace";
export const FONT_UI = "'Silkscreen', 'Press Start TwoP', monospace";
