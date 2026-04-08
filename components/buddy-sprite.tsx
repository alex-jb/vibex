"use client";

import { motion } from "framer-motion";

interface BuddySpriteProps {
  buddyTypeId: string;
  size?: "sm" | "md" | "lg" | "xl" | "xxl";
  animated?: boolean;
}

const SIZE_PX = { sm: 48, md: 80, lg: 128, xl: 192, xxl: 256 } as const;

const GRID = 16; // 16x16 pixel grid

// Transparent
const _ = "transparent";

// Color palettes per buddy (shorter aliases for readability)
const FOX = {
  d: "#CC4400", // dark orange
  o: "#FF6B35", // orange
  l: "#FFB088", // light peach
  w: "#FFFFFF", // white
  k: "#222222", // black (eye)
  t: "#FF9955", // tail highlight
  n: "#FF8844", // nose
  b: "#FFCC99", // belly
};

const SLIME = {
  d: "#1A8F0A", // dark green
  g: "#39FF14", // green
  l: "#66FF44", // light green
  b: "#88FF66", // bright
  w: "#FFFFFF", // white
  k: "#222222", // black
  s: "#228B22", // shadow
  p: "#44DD22", // mid green
};

const OWL = {
  d: "#4A2670", // dark purple
  p: "#6B3FA0", // purple
  l: "#9D00FF", // light purple
  b: "#BB44FF", // bright purple
  w: "#FFFFFF", // white
  k: "#222222", // black
  y: "#FACC15", // yellow beak
  t: "#8B6914", // talons/brown
  f: "#CC88FF", // feather highlight
};

const DRAGON = {
  d: "#CC3300", // dark red
  r: "#FF4500", // red
  o: "#FF6633", // orange
  y: "#FACC15", // yellow belly
  l: "#FF8844", // light
  w: "#FFFFFF", // white
  k: "#222222", // black
  f: "#FF2200", // fire
  h: "#FFAA00", // fire highlight
};

const PHOENIX = {
  d: "#CC9900", // dark gold
  g: "#FFD700", // gold
  l: "#FFFACD", // light gold
  w: "#FFFFFF", // white
  k: "#222222", // black
  r: "#FF6347", // red wing
  o: "#FFA500", // orange
  f: "#FFEE88", // flame tip
  c: "#FFCC44", // crown
};

/**
 * 16x16 pixel art grids — Pokemon-style detailed sprites.
 * Each buddy has a recognizable silhouette with shading and detail.
 */
const SPRITE_DATA: Record<string, string[][]> = {
  "pixel-fox": (() => {
    const { d, o, l, w, k, t, n, b } = FOX;
    return [
      [_,_,_,o,o,_,_,_,_,_,_,o,o,_,_,_],
      [_,_,o,l,o,o,_,_,_,_,o,l,o,_,_,_],
      [_,_,o,l,l,o,_,_,_,_,o,l,o,_,_,_],
      [_,_,o,l,l,o,o,o,o,o,o,l,o,_,_,_],
      [_,_,_,o,l,l,l,l,l,l,l,o,_,_,_,_],
      [_,_,_,o,l,w,k,l,l,w,k,o,_,_,_,_],
      [_,_,_,o,l,l,l,n,l,l,l,o,_,_,_,_],
      [_,_,_,_,o,l,b,b,b,l,o,_,_,_,_,_],
      [_,_,_,o,o,b,b,b,b,b,o,o,_,_,_,_],
      [_,_,o,o,b,b,b,b,b,b,b,o,o,_,_,_],
      [_,_,o,l,b,b,b,b,b,b,b,l,o,_,_,_],
      [_,_,o,l,l,b,b,b,b,b,l,l,o,_,_,_],
      [_,_,_,o,o,l,l,l,l,l,o,o,_,_,_,_],
      [_,_,o,d,_,o,_,_,_,o,_,d,o,t,_,_],
      [_,_,d,_,_,d,_,_,_,d,_,_,o,t,o,_],
      [_,_,_,_,_,_,_,_,_,_,_,_,_,o,_,_],
    ];
  })(),

  "neon-slime": (() => {
    const { d, g, l, b, w, k, s, p } = SLIME;
    return [
      [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
      [_,_,_,_,_,_,g,g,g,g,_,_,_,_,_,_],
      [_,_,_,_,g,g,l,l,l,l,g,g,_,_,_,_],
      [_,_,_,g,l,l,b,b,b,b,l,l,g,_,_,_],
      [_,_,g,l,b,b,b,b,b,b,b,b,l,g,_,_],
      [_,_,g,l,b,w,w,b,b,w,w,b,l,g,_,_],
      [_,_,g,l,b,w,k,b,b,w,k,b,l,g,_,_],
      [_,_,g,l,b,b,b,b,b,b,b,b,l,g,_,_],
      [_,g,p,l,b,b,b,p,p,b,b,b,l,p,g,_],
      [_,g,p,l,b,b,b,b,b,b,b,b,l,p,g,_],
      [_,_,g,l,l,b,b,b,b,b,b,l,l,g,_,_],
      [_,_,g,p,l,l,l,b,b,l,l,l,p,g,_,_],
      [_,_,_,g,p,l,l,l,l,l,l,p,g,_,_,_],
      [_,_,_,_,g,g,p,p,p,p,g,g,_,_,_,_],
      [_,_,_,_,_,s,d,d,d,d,s,_,_,_,_,_],
      [_,_,_,_,_,_,s,s,s,s,_,_,_,_,_,_],
    ];
  })(),

  "byte-owl": (() => {
    const { d, p, l, b, w, k, y, t, f } = OWL;
    return [
      [_,_,_,p,p,_,_,_,_,_,_,p,p,_,_,_],
      [_,_,p,l,l,p,_,_,_,_,p,l,l,p,_,_],
      [_,p,l,f,l,l,p,p,p,p,l,f,l,l,p,_],
      [_,p,l,l,l,l,l,l,l,l,l,l,l,l,p,_],
      [_,p,l,w,w,l,l,l,l,l,l,w,w,l,p,_],
      [_,p,l,w,k,w,l,l,l,l,w,k,w,l,p,_],
      [_,p,l,l,w,l,l,y,y,l,l,w,l,l,p,_],
      [_,_,p,l,l,l,y,y,y,y,l,l,l,p,_,_],
      [_,_,p,l,l,l,l,l,l,l,l,l,l,p,_,_],
      [_,_,_,p,b,l,l,l,l,l,l,b,p,_,_,_],
      [_,_,t,p,p,b,l,l,l,l,b,p,p,t,_,_],
      [_,_,_,t,p,p,p,l,l,p,p,p,t,_,_,_],
      [_,_,_,_,t,p,p,p,p,p,p,t,_,_,_,_],
      [_,_,_,_,t,t,d,d,d,d,t,t,_,_,_,_],
      [_,_,_,t,t,_,_,_,_,_,_,t,t,_,_,_],
      [_,_,_,d,_,_,_,_,_,_,_,_,d,_,_,_],
    ];
  })(),

  "code-dragon": (() => {
    const { d, r, o, y, l, w, k, f, h } = DRAGON;
    return [
      [_,_,_,_,r,r,_,_,_,_,r,r,_,_,_,_],
      [_,_,_,r,o,o,r,_,_,r,o,o,r,_,_,_],
      [_,_,_,r,o,l,o,r,r,o,l,o,r,_,_,_],
      [_,_,_,_,r,o,o,o,o,o,o,r,_,_,_,_],
      [_,_,_,r,o,w,k,o,o,w,k,o,r,_,_,_],
      [_,_,_,r,o,o,o,o,o,o,o,o,r,_,_,_],
      [_,_,_,r,o,o,r,r,r,r,o,o,r,_,_,_],
      [_,_,r,o,o,y,y,y,y,y,y,o,o,r,_,_],
      [_,r,o,o,y,y,y,y,y,y,y,y,o,o,r,_],
      [_,r,o,y,y,y,y,y,y,y,y,y,y,o,r,_],
      [r,o,o,y,y,y,y,y,y,y,y,y,y,o,o,r],
      [_,r,o,o,y,y,y,y,y,y,y,y,o,o,r,_],
      [_,_,r,o,o,o,y,y,y,y,o,o,o,r,_,_],
      [_,_,_,r,d,_,r,r,r,r,_,d,r,_,_,_],
      [_,_,d,_,_,_,d,_,_,d,_,_,_,d,_,_],
      [_,_,_,_,_,_,_,_,_,_,_,_,_,_,f,h],
    ];
  })(),

  "crystal-phoenix": (() => {
    const { d, g, l, w, k, r, o, f, c } = PHOENIX;
    return [
      [_,_,_,_,_,_,_,c,_,_,_,_,_,_,_,_],
      [_,_,_,_,_,_,c,f,c,_,_,_,_,_,_,_],
      [_,_,_,_,_,c,g,f,g,c,_,_,_,_,_,_],
      [_,_,_,_,g,g,l,l,l,g,g,_,_,_,_,_],
      [_,_,_,g,l,l,l,l,l,l,l,g,_,_,_,_],
      [_,_,g,l,l,w,k,l,l,w,k,l,g,_,_,_],
      [_,_,g,l,l,l,l,g,g,l,l,l,g,_,_,_],
      [_,r,g,l,l,l,l,l,l,l,l,l,g,r,_,_],
      [r,o,g,l,l,l,l,l,l,l,l,l,g,o,r,_],
      [r,o,o,g,l,l,l,l,l,l,l,g,o,o,r,_],
      [_,r,o,g,g,l,l,l,l,l,g,g,o,r,_,_],
      [_,_,r,o,g,g,g,l,g,g,g,o,r,_,_,_],
      [_,_,_,r,o,g,g,g,g,g,o,r,_,_,_,_],
      [_,_,_,_,r,g,d,d,d,g,r,_,_,_,_,_],
      [_,_,_,g,g,_,_,_,_,_,g,g,_,_,_,_],
      [_,_,_,d,_,_,_,_,_,_,_,d,_,_,_,_],
    ];
  })(),
  // ── Wave 2: New Buddies ──

  "aqua-turtle": (() => {
    const d = "#005F8A", b = "#00BFFF", l = "#66D9FF", s = "#008FBF", w = "#FFFFFF", k = "#222222", g = "#228B5A", sh = "#004466";
    return [
      [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
      [_,_,_,_,_,g,g,g,g,g,g,_,_,_,_,_],
      [_,_,_,_,g,g,d,d,d,d,g,g,_,_,_,_],
      [_,_,_,g,d,d,g,d,d,g,d,d,g,_,_,_],
      [_,_,_,g,d,g,g,d,d,g,g,d,g,_,_,_],
      [_,_,b,l,g,d,d,d,d,d,d,g,l,b,_,_],
      [_,b,l,l,l,g,g,g,g,g,g,l,l,l,b,_],
      [_,b,l,w,k,l,l,l,l,l,l,w,k,l,b,_],
      [_,b,l,l,l,l,l,l,l,l,l,l,l,l,b,_],
      [_,_,b,l,l,l,l,s,l,l,l,l,l,b,_,_],
      [_,_,b,l,l,l,l,l,l,l,l,l,l,b,_,_],
      [_,_,_,b,l,l,l,l,l,l,l,l,b,_,_,_],
      [_,_,_,_,b,b,l,l,l,l,b,b,_,_,_,_],
      [_,_,_,b,sh,_,b,b,b,b,_,sh,b,_,_,_],
      [_,_,b,_,_,_,sh,_,_,sh,_,_,_,b,_,_],
      [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
    ];
  })(),

  "frost-cat": (() => {
    const d = "#4488AA", c = "#88DDFF", l = "#BBEEFF", w = "#FFFFFF", k = "#222222", p = "#FFAACC", n = "#FF88AA", s = "#6699BB";
    return [
      [_,_,_,c,c,_,_,_,_,_,_,c,c,_,_,_],
      [_,_,c,l,l,c,_,_,_,_,c,l,l,c,_,_],
      [_,_,c,l,w,l,c,_,_,c,l,w,l,c,_,_],
      [_,_,_,c,l,l,l,c,c,l,l,l,c,_,_,_],
      [_,_,_,c,l,l,l,l,l,l,l,l,c,_,_,_],
      [_,_,_,c,l,w,k,l,l,w,k,l,c,_,_,_],
      [_,_,_,c,l,l,l,p,p,l,l,l,c,_,_,_],
      [_,_,_,_,c,l,l,l,l,l,l,c,_,_,_,_],
      [_,_,_,c,l,l,l,l,l,l,l,l,c,_,_,_],
      [_,_,c,l,l,l,l,l,l,l,l,l,l,c,_,_],
      [_,_,c,l,w,l,l,l,l,l,l,w,l,c,_,_],
      [_,_,c,l,l,l,l,l,l,l,l,l,l,c,_,_],
      [_,_,_,c,c,l,l,l,l,l,l,c,c,_,_,_],
      [_,_,c,s,_,c,_,_,_,c,_,s,c,_,_,_],
      [_,_,s,_,_,s,_,_,_,s,_,_,s,_,_,_],
      [_,_,_,_,_,_,_,c,c,_,_,_,_,_,_,_],
    ];
  })(),

  "shadow-bat": (() => {
    const d = "#2D1B4E", p = "#8B5CF6", l = "#A78BFA", b = "#C4B5FD", w = "#FFFFFF", k = "#222222", r = "#FF4444", s = "#1a1030";
    return [
      [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
      [p,_,_,_,_,_,_,_,_,_,_,_,_,_,_,p],
      [p,p,_,_,_,_,_,_,_,_,_,_,_,_,p,p],
      [d,p,p,_,_,_,p,p,p,p,_,_,_,p,p,d],
      [_,d,p,p,_,p,l,l,l,l,p,_,p,p,d,_],
      [_,_,d,p,p,l,l,l,l,l,l,p,p,d,_,_],
      [_,_,_,p,l,w,r,l,l,w,r,l,p,_,_,_],
      [_,_,_,p,l,l,l,l,l,l,l,l,p,_,_,_],
      [_,_,_,p,l,l,l,p,p,l,l,l,p,_,_,_],
      [_,_,_,_,p,l,l,l,l,l,l,p,_,_,_,_],
      [_,_,_,_,_,p,l,l,l,l,p,_,_,_,_,_],
      [_,_,_,_,_,p,p,l,l,p,p,_,_,_,_,_],
      [_,_,_,_,_,_,p,p,p,p,_,_,_,_,_,_],
      [_,_,_,_,_,_,d,s,s,d,_,_,_,_,_,_],
      [_,_,_,_,_,_,_,d,d,_,_,_,_,_,_,_],
      [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
    ];
  })(),

  "volt-rabbit": (() => {
    const d = "#CC9900", y = "#FFE033", l = "#FFF177", w = "#FFFFFF", k = "#222222", p = "#FFAAAA", o = "#FFB800", s = "#AA7700";
    return [
      [_,_,_,_,y,y,_,_,_,_,y,y,_,_,_,_],
      [_,_,_,y,l,l,y,_,_,y,l,l,y,_,_,_],
      [_,_,_,y,l,l,l,y,y,l,l,l,y,_,_,_],
      [_,_,_,y,l,l,l,y,y,l,l,l,y,_,_,_],
      [_,_,_,_,y,l,l,l,l,l,l,y,_,_,_,_],
      [_,_,_,_,y,l,l,l,l,l,l,y,_,_,_,_],
      [_,_,_,y,l,w,k,l,l,w,k,l,y,_,_,_],
      [_,_,_,y,l,l,l,p,p,l,l,l,y,_,_,_],
      [_,_,_,_,y,l,l,l,l,l,l,y,_,_,_,_],
      [_,_,_,y,l,l,l,l,l,l,l,l,y,_,_,_],
      [_,_,y,l,l,l,l,l,l,l,l,l,l,y,_,_],
      [_,_,y,l,l,o,l,l,l,l,o,l,l,y,_,_],
      [_,_,_,y,y,l,l,l,l,l,l,y,y,_,_,_],
      [_,_,_,y,s,_,y,_,_,y,_,s,y,_,_,_],
      [_,_,_,s,_,_,s,_,_,s,_,_,s,_,_,_],
      [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
    ];
  })(),

  "terra-golem": (() => {
    const d = "#8B6914", b = "#CD853F", l = "#DEB887", g = "#A0A0A0", w = "#E0E0E0", k = "#222222", r = "#FF6633", s = "#6B4400";
    return [
      [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
      [_,_,_,_,_,b,b,b,b,b,b,_,_,_,_,_],
      [_,_,_,_,b,l,l,l,l,l,l,b,_,_,_,_],
      [_,_,_,b,l,l,g,l,l,g,l,l,b,_,_,_],
      [_,_,_,b,l,w,k,l,l,w,k,l,b,_,_,_],
      [_,_,_,b,l,l,l,l,l,l,l,l,b,_,_,_],
      [_,_,_,b,l,l,l,d,d,l,l,l,b,_,_,_],
      [_,_,b,b,l,l,l,l,l,l,l,l,b,b,_,_],
      [_,b,d,b,b,l,l,l,l,l,l,b,b,d,b,_],
      [_,b,d,d,b,b,l,l,l,l,b,b,d,d,b,_],
      [_,_,b,d,d,b,b,b,b,b,b,d,d,b,_,_],
      [_,_,_,b,d,d,b,r,r,b,d,d,b,_,_,_],
      [_,_,_,_,b,d,d,d,d,d,d,b,_,_,_,_],
      [_,_,_,b,s,_,b,b,b,b,_,s,b,_,_,_],
      [_,_,b,s,_,_,_,s,s,_,_,_,s,b,_,_],
      [_,_,s,_,_,_,_,_,_,_,_,_,_,s,_,_],
    ];
  })(),

  "stellar-jellyfish": (() => {
    const d = "#AA2266", p = "#FF69B4", l = "#FFB3D9", b = "#FFCCE5", w = "#FFFFFF", k = "#222222", c = "#CC44FF", s = "#FF44AA", g = "#FF99CC";
    return [
      [_,_,_,_,_,_,_,c,_,_,_,_,_,_,_,_],
      [_,_,_,_,_,c,c,w,c,c,_,_,_,_,_,_],
      [_,_,_,_,c,l,l,l,l,l,c,_,_,_,_,_],
      [_,_,_,c,l,b,b,b,b,b,l,c,_,_,_,_],
      [_,_,c,l,b,b,b,b,b,b,b,l,c,_,_,_],
      [_,_,c,l,b,w,k,b,b,w,k,l,c,_,_,_],
      [_,_,c,l,b,b,b,b,b,b,b,l,c,_,_,_],
      [_,_,c,l,b,b,g,g,g,b,b,l,c,_,_,_],
      [_,_,_,c,l,b,b,b,b,b,l,c,_,_,_,_],
      [_,_,_,_,c,l,l,l,l,l,c,_,_,_,_,_],
      [_,_,_,_,c,p,c,p,c,p,c,_,_,_,_,_],
      [_,_,_,p,_,p,_,p,_,p,_,p,_,_,_,_],
      [_,_,p,_,_,p,_,p,_,p,_,_,p,_,_,_],
      [_,p,_,_,_,_,p,_,p,_,_,_,_,p,_,_],
      [_,_,_,_,_,_,p,_,p,_,_,_,_,_,_,_],
      [_,_,_,_,_,_,s,_,s,_,_,_,_,_,_,_],
    ];
  })(),
};

/** Fallback sprite */
const FALLBACK_SPRITE: string[][] = Array.from({ length: GRID }, () =>
  Array.from({ length: GRID }, () => "#555555")
);

export function BuddySprite({ buddyTypeId, size = "md", animated = false }: BuddySpriteProps) {
  const grid = SPRITE_DATA[buddyTypeId] ?? FALLBACK_SPRITE;
  const totalPx = SIZE_PX[size];
  const cellPx = totalPx / GRID;

  const inner = (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(${GRID}, 1fr)`,
        width: totalPx,
        height: totalPx,
        imageRendering: "pixelated",
      }}
    >
      {grid.flat().map((color, i) => (
        <div
          key={i}
          style={{
            width: cellPx,
            height: cellPx,
            backgroundColor: color,
          }}
        />
      ))}
    </div>
  );

  if (animated) {
    return (
      <motion.div
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        style={{ width: totalPx, height: totalPx, lineHeight: 0 }}
      >
        {inner}
      </motion.div>
    );
  }

  return (
    <div style={{ width: totalPx, height: totalPx, lineHeight: 0 }}>
      {inner}
    </div>
  );
}
