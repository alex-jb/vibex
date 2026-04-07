"use client";

import { motion } from "framer-motion";

interface BuddySpriteProps {
  buddyTypeId: string;
  size?: "sm" | "md" | "lg";
  animated?: boolean;
}

const SIZE_PX = { sm: 32, md: 64, lg: 96 } as const;

// Transparent placeholder
const T = "transparent";

/**
 * 8x8 pixel art grids for each buddy type.
 * Each row is 8 color strings; transparent = empty pixel.
 */
const SPRITE_DATA: Record<string, string[][]> = {
  "pixel-fox": [
    [T,       "#FF6B35", T,       T,       T,       "#FF6B35", T,       T      ],
    ["#FF6B35","#FFB088","#FF6B35",T,       "#FF6B35","#FFB088","#FF6B35",T      ],
    ["#FF6B35","#FFB088","#FF6B35","#FF6B35","#FF6B35","#FFB088","#FF6B35",T      ],
    [T,       "#FF6B35","#FFFFFF","#222222","#FF6B35","#FFFFFF","#222222",T      ],
    [T,       "#FF6B35","#FF6B35","#FF6B35","#FF6B35","#FF6B35","#FF6B35",T      ],
    [T,       T,       "#FFB088","#FFB088","#FFB088","#FFB088",T,       T      ],
    [T,       "#FF6B35","#FF6B35",T,       T,       "#FF6B35","#FF6B35",T      ],
    [T,       "#CC5522",T,       T,       T,       T,       "#CC5522",T      ],
  ],
  "neon-slime": [
    [T,       T,       T,       T,       T,       T,       T,       T      ],
    [T,       T,       "#39FF14","#39FF14","#39FF14","#39FF14",T,       T      ],
    [T,       "#39FF14","#66FF44","#66FF44","#66FF44","#66FF44","#39FF14",T      ],
    [T,       "#39FF14","#FFFFFF","#222222","#66FF44","#FFFFFF","#222222",T      ],
    [T,       "#39FF14","#66FF44","#66FF44","#66FF44","#66FF44","#39FF14",T      ],
    [T,       "#39FF14","#66FF44","#39FF14","#39FF14","#66FF44","#39FF14",T      ],
    [T,       T,       "#39FF14","#39FF14","#39FF14","#39FF14",T,       T      ],
    [T,       T,       T,       "#228B22","#228B22",T,       T,       T      ],
  ],
  "byte-owl": [
    [T,       "#6B3FA0","#6B3FA0",T,       T,       "#6B3FA0","#6B3FA0",T      ],
    [T,       "#6B3FA0","#9D00FF","#9D00FF","#9D00FF","#9D00FF","#6B3FA0",T      ],
    ["#6B3FA0","#9D00FF","#FFFFFF","#222222","#9D00FF","#FFFFFF","#222222","#6B3FA0"],
    ["#6B3FA0","#9D00FF","#9D00FF","#FACC15","#FACC15","#9D00FF","#9D00FF","#6B3FA0"],
    [T,       "#8B6914","#9D00FF","#9D00FF","#9D00FF","#9D00FF","#8B6914",T      ],
    [T,       T,       "#8B6914","#6B3FA0","#6B3FA0","#8B6914",T,       T      ],
    [T,       T,       "#8B6914","#8B6914","#8B6914","#8B6914",T,       T      ],
    [T,       T,       "#6B3FA0",T,       T,       "#6B3FA0",T,       T      ],
  ],
  "code-dragon": [
    [T,       T,       "#FF4500",T,       T,       "#FF4500",T,       T      ],
    [T,       "#FF4500","#FF6633","#FF4500","#FF4500","#FF6633","#FF4500",T      ],
    [T,       "#FF4500","#FFFFFF","#222222","#FF4500","#FFFFFF","#222222",T      ],
    [T,       "#FF4500","#FF6633","#FF6633","#FF6633","#FF6633","#FF4500",T      ],
    ["#FF4500","#FF6633","#FACC15","#FF6633","#FF6633","#FACC15","#FF6633","#FF4500"],
    [T,       "#FF4500","#FF6633","#FF6633","#FF6633","#FF6633","#FF4500",T      ],
    [T,       T,       "#FF4500","#FF4500","#FF4500","#FF4500",T,       T      ],
    [T,       "#CC3300",T,       T,       T,       T,       "#CC3300",T      ],
  ],
  "crystal-phoenix": [
    [T,       T,       T,       "#FFD700",T,       T,       T,       T      ],
    [T,       T,       "#FFD700","#FFFACD","#FFD700",T,       T,       T      ],
    [T,       "#FFD700","#FFFACD","#FFFFFF","#FFFACD","#FFD700",T,       T      ],
    ["#FF6347","#FFD700","#FFFFFF","#222222","#FFD700","#FFFFFF","#222222","#FF6347"],
    [T,       "#FFD700","#FFFACD","#FFD700","#FFD700","#FFFACD","#FFD700",T      ],
    ["#FF6347","#FFA500","#FFD700","#FFFACD","#FFFACD","#FFD700","#FFA500","#FF6347"],
    [T,       T,       "#FFD700","#FFD700","#FFD700","#FFD700",T,       T      ],
    [T,       "#FFD700",T,       T,       T,       T,       "#FFD700",T      ],
  ],
};

/** Fallback sprite (question mark shape) for unknown buddy types */
const FALLBACK_SPRITE: string[][] = Array.from({ length: 8 }, () =>
  Array.from({ length: 8 }, () => "#555555")
);

export function BuddySprite({ buddyTypeId, size = "md", animated = false }: BuddySpriteProps) {
  const grid = SPRITE_DATA[buddyTypeId] ?? FALLBACK_SPRITE;
  const totalPx = SIZE_PX[size];
  const cellPx = totalPx / 8;

  const inner = (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(8, 1fr)",
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
        animate={{ y: [0, -4, 0] }}
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
