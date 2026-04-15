"use client";

import { motion } from "framer-motion";
import Link from "next/link";

/* ═══════════════════════════════════════════════════════════════════════════
   HQ Hero Banner — pixel night scene + big title + CTA + CRT mascot
   Approved via /design-consultation 2026-04-14, mockup iteration v6.
   Structure inspired by codedex.io homepage (pixel landscape + game title +
   get-started CTA) but in VibeX's dark-first night variant.
   ═══════════════════════════════════════════════════════════════════════════ */

type HqHeroBannerProps = {
  userName?: string;
  newEvolutionsToday?: number;
};

export function HqHeroBanner({
  userName = "creator",
  newEvolutionsToday = 3,
}: HqHeroBannerProps) {
  return (
    <div
      className="relative mx-auto overflow-hidden border-2"
      style={{
        maxWidth: 1440,
        height: 620,
        marginTop: 28,
        background:
          "linear-gradient(180deg, #0a0519 0%, #1a0a3a 35%, #3d0a4a 65%, #1e0a2e 100%)",
        borderColor: "var(--border-metal)",
      }}
    >
      {/* Full-bleed pixel night scene */}
      <svg
        viewBox="0 0 1440 620"
        preserveAspectRatio="xMidYMid slice"
        shapeRendering="crispEdges"
        className="absolute inset-0 w-full h-full z-[1]"
      >
        {/* stars */}
        {[
          [120, 40], [240, 68], [380, 30], [520, 52], [660, 78],
          [820, 36], [960, 60], [1100, 44], [1260, 72], [1360, 50],
          [80, 100], [200, 110], [320, 92], [440, 108], [600, 98],
          [740, 110], [860, 94], [1020, 108], [1180, 96], [1320, 112],
        ].map(([x, y], i) => (
          <rect key={i} x={x} y={y} width={3} height={3} fill="#FFF" />
        ))}

        {/* big pixel moon */}
        <rect x="1180" y="60" width="80" height="80" fill="#F5E6B8" />
        <rect x="1176" y="64" width="4" height="72" fill="#F5E6B8" />
        <rect x="1260" y="64" width="4" height="72" fill="#F5E6B8" />
        <rect x="1184" y="56" width="72" height="4" fill="#F5E6B8" />
        <rect x="1184" y="140" width="72" height="4" fill="#F5E6B8" />
        <rect x="1200" y="80" width="8" height="8" fill="#C9A65C" />
        <rect x="1220" y="100" width="12" height="12" fill="#C9A65C" />
        <rect x="1240" y="72" width="6" height="6" fill="#C9A65C" />

        {/* moon glow — animated breathe via Framer */}
        <motion.rect
          x="1150"
          y="30"
          width="140"
          height="140"
          fill="#FACC15"
          animate={{ opacity: [0.08, 0.18, 0.08] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* clouds layer A (slow drift) */}
        <motion.g
          fill="rgba(232,226,240,0.35)"
          animate={{ x: [0, 60, 0] }}
          transition={{ duration: 48, repeat: Infinity, ease: "easeInOut" }}
        >
          <rect x="80" y="130" width="100" height="14" />
          <rect x="90" y="120" width="80" height="10" />
          <rect x="100" y="112" width="40" height="8" />
          <rect x="520" y="92" width="120" height="14" />
          <rect x="534" y="82" width="90" height="10" />
          <rect x="548" y="74" width="56" height="8" />
          <rect x="960" y="150" width="110" height="14" />
          <rect x="974" y="140" width="82" height="10" />
          <rect x="988" y="132" width="48" height="8" />
        </motion.g>
        {/* clouds layer B (sparser, opposite direction) */}
        <motion.g
          fill="rgba(200,190,230,0.22)"
          animate={{ x: [0, -40, 0] }}
          transition={{ duration: 64, repeat: Infinity, ease: "easeInOut" }}
        >
          <rect x="300" y="170" width="70" height="10" />
          <rect x="310" y="162" width="52" height="8" />
          <rect x="820" y="210" width="80" height="10" />
          <rect x="830" y="202" width="62" height="8" />
          <rect x="1100" y="180" width="64" height="10" />
          <rect x="1108" y="172" width="48" height="8" />
        </motion.g>

        {/* 3 mountain ranges (lightest → darkest depth) */}
        <polygon
          points="0,340 80,260 160,310 240,240 340,290 440,220 540,280 640,240 720,310 820,230 920,270 1040,240 1140,290 1260,260 1380,310 1440,280 1440,420 0,420"
          fill="#4a1565"
          opacity="0.55"
        />
        <polygon
          points="0,360 80,260 160,320 240,220 340,280 440,200 540,270 640,230 720,300 820,210 920,260 1040,220 1140,280 1260,240 1380,300 1440,270 1440,440 0,440"
          fill="#2a0a4a"
        />
        <polygon
          points="0,440 100,340 200,420 300,320 420,380 540,300 680,380 800,320 920,400 1060,320 1200,380 1320,340 1440,400 1440,520 0,520"
          fill="#14052a"
        />

        {/* mountain highlights (neon pixel peaks) */}
        {[
          { x: 240, y: 220, c: "#9D00FF" },
          { x: 243, y: 223, c: "#9D00FF" },
          { x: 440, y: 200, c: "#C77DFF" },
          { x: 443, y: 203, c: "#9D00FF" },
          { x: 820, y: 210, c: "#C77DFF" },
          { x: 823, y: 213, c: "#9D00FF" },
          { x: 1040, y: 220, c: "#9D00FF" },
          { x: 300, y: 320, c: "#EC4899" },
          { x: 800, y: 320, c: "#EC4899" },
        ].map((p, i) => (
          <rect key={i} x={p.x} y={p.y} width={3} height={3} fill={p.c} />
        ))}

        {/* grass base */}
        <rect x="0" y="500" width="1440" height="120" fill="#050510" />
        <rect
          x="0"
          y="500"
          width="1440"
          height="4"
          fill="rgba(157,0,255,0.35)"
        />
        {/* grass blades */}
        <g fill="#39FF14">
          {Array.from({ length: 35 }).map((_, i) => {
            const x = 20 + i * 40;
            const y = 528 + (i % 3) * 4;
            const h = 4 + (i % 3) * 2;
            const op = 0.5 + (i % 3) * 0.1;
            return (
              <rect
                key={i}
                x={x}
                y={y}
                width={2}
                height={h}
                opacity={op}
              />
            );
          })}
        </g>
        {/* flowers */}
        <g>
          {[80, 240, 380, 560, 700, 820, 960, 1100, 1240, 1380].map((x, i) => (
            <rect
              key={i}
              x={x}
              y={544 + (i % 2) * 2}
              width={3}
              height={3}
              fill={i % 3 === 0 ? "#F472B6" : "#EC4899"}
            />
          ))}
          <rect x="320" y="545" width="3" height="3" fill="#FACC15" />
          <rect x="640" y="546" width="3" height="3" fill="#06B6D4" />
          <rect x="1040" y="545" width="3" height="3" fill="#FACC15" />
        </g>

        {/* foreground pine trees (2 swaying, 4 static) */}
        <motion.g
          style={{ transformOrigin: "140px 480px" }}
          animate={{ rotate: [-0.6, 0.6, -0.6] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        >
          <polygon
            points="140,460 110,400 170,400"
            fill="#0a2a0a"
            stroke="#39FF14"
            strokeWidth="2"
          />
          <polygon
            points="140,420 116,376 164,376"
            fill="#0a2a0a"
            stroke="#39FF14"
            strokeWidth="2"
          />
          <polygon
            points="140,386 120,356 160,356"
            fill="#0a2a0a"
            stroke="#39FF14"
            strokeWidth="2"
          />
          <rect x="136" y="460" width="8" height="12" fill="#1E4A1E" />
        </motion.g>
        <motion.g
          style={{ transformOrigin: "1320px 480px" }}
          animate={{ rotate: [0.6, -0.6, 0.6] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        >
          <polygon
            points="1320,460 1290,400 1350,400"
            fill="#0a2a0a"
            stroke="#39FF14"
            strokeWidth="2"
          />
          <polygon
            points="1320,420 1296,376 1344,376"
            fill="#0a2a0a"
            stroke="#39FF14"
            strokeWidth="2"
          />
          <polygon
            points="1320,386 1300,356 1340,356"
            fill="#0a2a0a"
            stroke="#39FF14"
            strokeWidth="2"
          />
          <rect x="1316" y="460" width="8" height="12" fill="#1E4A1E" />
        </motion.g>
        {/* 4 static background trees */}
        <polygon
          points="240,480 218,436 262,436"
          fill="#0a2a0a"
          stroke="#39FF14"
          strokeWidth="1.5"
        />
        <polygon
          points="240,446 222,414 258,414"
          fill="#0a2a0a"
          stroke="#39FF14"
          strokeWidth="1.5"
        />
        <rect x="236" y="480" width="8" height="10" fill="#1E4A1E" />
        <polygon
          points="1210,480 1188,436 1232,436"
          fill="#0a2a0a"
          stroke="#39FF14"
          strokeWidth="1.5"
        />
        <polygon
          points="1210,446 1192,414 1228,414"
          fill="#0a2a0a"
          stroke="#39FF14"
          strokeWidth="1.5"
        />
        <rect x="1206" y="480" width="8" height="10" fill="#1E4A1E" />
        <polygon
          points="380,478 366,450 394,450"
          fill="#0a2a0a"
          stroke="#39FF14"
          strokeWidth="1"
        />
        <rect x="378" y="478" width="4" height="8" fill="#1E4A1E" />
        <polygon
          points="1070,480 1056,452 1084,452"
          fill="#0a2a0a"
          stroke="#39FF14"
          strokeWidth="1"
        />
        <rect x="1068" y="480" width="4" height="8" fill="#1E4A1E" />
      </svg>

      {/* Scanlines over everything */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-[10]"
        style={{
          background:
            "repeating-linear-gradient(0deg, transparent 0, transparent 3px, rgba(0,0,0,0.18) 3px, rgba(0,0,0,0.18) 5px)",
        }}
      />

      {/* L-corner brackets */}
      {(["tl", "tr", "bl", "br"] as const).map((pos) => {
        const isTop = pos.startsWith("t");
        const isLeft = pos.endsWith("l");
        return (
          <div
            key={pos}
            aria-hidden="true"
            className="pointer-events-none absolute z-[12]"
            style={{
              [isTop ? "top" : "bottom"]: 14,
              [isLeft ? "left" : "right"]: 14,
              width: 22,
              height: 22,
              borderTop: isTop ? "2.5px solid var(--neon-orange)" : "none",
              borderBottom: !isTop ? "2.5px solid var(--neon-orange)" : "none",
              borderLeft: isLeft ? "2.5px solid var(--neon-orange)" : "none",
              borderRight: !isLeft ? "2.5px solid var(--neon-orange)" : "none",
            }}
          />
        );
      })}

      {/* CRT mascot with animated bob */}
      <motion.div
        className="absolute z-[8]"
        style={{
          bottom: 80,
          left: "22%",
          width: 110,
          height: 130,
          transformOrigin: "bottom center",
        }}
        animate={{ y: [0, -4, 0] }}
        transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
      >
        <svg viewBox="0 0 64 72" shapeRendering="crispEdges" className="w-full h-full">
          <rect x="20" y="0" width="2" height="6" fill="#8888A0" />
          <rect x="42" y="0" width="2" height="6" fill="#8888A0" />
          <rect x="16" y="-2" width="4" height="2" fill="#FACC15" />
          <rect x="44" y="-2" width="4" height="2" fill="#FACC15" />
          <rect x="4" y="8" width="56" height="48" fill="#2A2A30" />
          <rect x="4" y="8" width="56" height="2" fill="#4A4A52" />
          <rect x="4" y="8" width="2" height="48" fill="#4A4A52" />
          <rect x="10" y="14" width="44" height="32" fill="#0a2a14" />
          <rect x="10" y="14" width="44" height="2" fill="#39FF14" opacity="0.8" />
          <rect x="10" y="44" width="44" height="2" fill="#39FF14" opacity="0.6" />
          {[18, 22, 26, 30, 34, 38, 42].map((y, i) => (
            <rect
              key={i}
              x="12"
              y={y}
              width="40"
              height="1"
              fill="#39FF14"
              opacity={i % 2 === 0 ? 0.2 : 0.15}
            />
          ))}
          {/* face */}
          <rect x="22" y="24" width="4" height="4" fill="#39FF14" />
          <rect x="38" y="24" width="4" height="4" fill="#39FF14" />
          <rect x="22" y="36" width="4" height="2" fill="#39FF14" />
          <rect x="26" y="38" width="12" height="2" fill="#39FF14" />
          <rect x="38" y="36" width="4" height="2" fill="#39FF14" />
          {/* base */}
          <rect x="8" y="56" width="48" height="6" fill="#1A1A1E" />
          <rect x="14" y="62" width="36" height="4" fill="#2A2A30" />
          <rect x="50" y="50" width="2" height="2" fill="#EF4444" />
        </svg>
      </motion.div>

      {/* Butterfly */}
      <motion.div
        className="absolute z-[9]"
        style={{ bottom: 200, left: "28%", width: 28, height: 22 }}
        animate={{
          x: [0, 14, 20, 8, 0],
          y: [0, -8, 2, 6, 0],
          rotate: [-4, 4, -2, 3, -4],
        }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      >
        <svg viewBox="0 0 28 22" shapeRendering="crispEdges" className="w-full h-full">
          <rect x="13" y="8" width="2" height="8" fill="#2A2A30" />
          <rect x="11" y="5" width="1" height="2" fill="#2A2A30" />
          <rect x="16" y="5" width="1" height="2" fill="#2A2A30" />
          <rect x="7" y="4" width="6" height="2" fill="#EC4899" />
          <rect x="5" y="6" width="8" height="3" fill="#EC4899" />
          <rect x="3" y="8" width="10" height="2" fill="#9D00FF" />
          <rect x="5" y="10" width="8" height="2" fill="#9D00FF" />
          <rect x="15" y="4" width="6" height="2" fill="#EC4899" />
          <rect x="15" y="6" width="8" height="3" fill="#EC4899" />
          <rect x="15" y="8" width="10" height="2" fill="#9D00FF" />
          <rect x="15" y="10" width="8" height="2" fill="#9D00FF" />
          <rect x="7" y="12" width="6" height="2" fill="#9D00FF" />
          <rect x="9" y="14" width="4" height="2" fill="#EC4899" />
          <rect x="15" y="12" width="6" height="2" fill="#9D00FF" />
          <rect x="15" y="14" width="4" height="2" fill="#EC4899" />
          <rect x="6" y="7" width="1" height="1" fill="#FFF" />
          <rect x="20" y="7" width="1" height="1" fill="#FFF" />
        </svg>
      </motion.div>

      {/* Centered hero copy + CTA */}
      <div
        className="relative z-[5] text-center mx-auto"
        style={{ paddingTop: 60, maxWidth: 820 }}
      >
        <div
          className="font-ui"
          style={{
            fontSize: 11,
            color: "var(--neon-green)",
            letterSpacing: 3,
            textShadow: "0 0 4px rgba(57,255,20,0.9), 0 2px 0 #000",
            marginBottom: 14,
          }}
        >
          ▸ VIBEX://HQ ·{" "}
          <b style={{ color: "var(--neon-yellow)", fontWeight: "normal" }}>
            WELCOME BACK, @{userName.toUpperCase()}
          </b>{" "}
          · {newEvolutionsToday} NEW EVOLUTIONS
        </div>

        <h1
          className="font-pixel"
          style={{
            fontSize: 52,
            color: "#FFFCEB",
            letterSpacing: 4,
            lineHeight: 1.3,
            textShadow:
              "-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000, 2px 2px 0 #000, 3px 3px 0 #000, 4px 4px 0 #000, 5px 5px 0 #000, 6px 6px 0 #1a0a3a, 0 0 32px rgba(157,0,255,0.55)",
            marginBottom: 10,
          }}
        >
          HUNT TODAY&apos;S
          <br />
          <span
            style={{
              background:
                "linear-gradient(180deg, #FFE27D 0%, #FFD700 40%, #B8860B 100%)",
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              WebkitTextFillColor: "transparent",
              textShadow:
                "6px 6px 0 #1a0a3a, 0 0 32px rgba(250,204,21,0.7), 0 0 60px rgba(250,204,21,0.4)",
            }}
          >
            LEGENDS.
          </span>
        </h1>

        <div
          className="font-retro"
          style={{
            fontSize: 22,
            color: "rgba(232,232,236,0.85)",
            marginBottom: 34,
            textShadow: "0 2px 0 rgba(0,0,0,0.8)",
          }}
        >
          Every AI project is a collectible hero. Your daily expedition starts
          here.
        </div>

        <Link href="/launch">
          <motion.button
            type="button"
            className="inline-flex items-center gap-2.5 font-ui uppercase cursor-pointer"
            style={{
              fontSize: 16,
              padding: "18px 36px",
              background: "linear-gradient(180deg, var(--neon-yellow), #D97706)",
              color: "#1a0a3a",
              border: "3px solid #000",
              boxShadow:
                "6px 6px 0 #000, 0 0 28px rgba(250,204,21,0.5)",
              letterSpacing: 2.5,
            }}
            whileHover={{
              x: -2,
              y: -2,
              boxShadow:
                "8px 8px 0 #000, 0 0 36px rgba(250,204,21,0.75)",
            }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
          >
            ▶ FORGE YOUR HERO
          </motion.button>
        </Link>
      </div>
    </div>
  );
}
