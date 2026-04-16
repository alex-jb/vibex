"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useLang } from "@/lib/i18n";

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
  const { t } = useLang();
  return (
    <div
      className="relative mx-auto overflow-hidden border-2 mt-4 sm:mt-7 h-[400px] sm:h-[480px] md:h-[560px] lg:h-[620px]"
      style={{
        maxWidth: 1440,
        background:
          "linear-gradient(180deg, #0a0519 0%, #1a0a3a 35%, #3d0a4a 65%, #1e0a2e 100%)",
        borderColor: "var(--border-metal)",
      }}
    >
      {/* Full-bleed Gemini-generated pixel landscape background. Replaces
          420 lines of hand-coded SVG shapes (stars, moon, clouds, mountains,
          grass, flowers, pine trees) with a single rich pixel art scene.
          Foreground mascot + butterfly + title overlay on top via z-index. */}
      <Image
        src="/generated/hero-bg.png"
        alt=""
        aria-hidden="true"
        fill
        priority
        sizes="(max-width: 1440px) 100vw, 1440px"
        className="object-cover z-[1]"
        style={{ imageRendering: "pixelated" }}
      />
      {/* Animated moon glow — overlay on top of the image moon position
          (upper right ~80% x / 22% y) so it breathes subtly. */}
      <motion.div
        aria-hidden="true"
        className="absolute pointer-events-none z-[2]"
        style={{
          right: "11%",
          top: "18%",
          width: 180,
          height: 180,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(250,204,21,0.3) 0%, rgba(250,204,21,0.1) 40%, transparent 70%)",
          filter: "blur(12px)",
        }}
        animate={{ opacity: [0.6, 1, 0.6] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      />

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

      {/* CRT mascot with animated bob — hidden on small viewports to free room for copy */}
      <motion.div
        className="absolute z-[8] hidden md:block"
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

      {/* Butterfly — hidden on small viewports */}
      <motion.div
        className="absolute z-[9] hidden md:block"
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
        className="relative z-[5] text-center mx-auto px-4 pt-8 sm:pt-12 md:pt-14 lg:pt-[60px]"
        style={{ maxWidth: 820 }}
      >
        <div
          className="font-ui text-[9px] sm:text-[10px] md:text-[11px]"
          style={{
            color: "var(--neon-green)",
            letterSpacing: 3,
            textShadow: "0 0 4px rgba(57,255,20,0.9), 0 2px 0 #000",
            marginBottom: 14,
          }}
        >
          {t("hq.eyebrow.brand")} ·{" "}
          <b style={{ color: "var(--neon-yellow)", fontWeight: "normal" }}>
            {t("hq.eyebrow.welcome")}, @{userName.toUpperCase()}
          </b>{" "}
          · {newEvolutionsToday} {t("hq.eyebrow.newEvolutions")}
        </div>

        <h1
          className="font-pixel font-pixel-hero text-[24px] sm:text-[34px] md:text-[42px] lg:text-[52px] mb-2 sm:mb-2.5"
          style={{
            color: "#FFFCEB",
            letterSpacing: 4,
            lineHeight: 1.3,
            textShadow:
              "-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000, 2px 2px 0 #000, 3px 3px 0 #000, 4px 4px 0 #000, 5px 5px 0 #000, 6px 6px 0 #1a0a3a, 0 0 32px rgba(157,0,255,0.55)",
          }}
        >
          {t("hq.title.line1")}
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
            {t("hq.title.line2")}
          </span>
        </h1>

        <div
          className="font-retro text-[15px] sm:text-[18px] md:text-[20px] lg:text-[22px] mb-5 sm:mb-7 md:mb-[34px]"
          style={{
            color: "rgba(232,232,236,0.85)",
            textShadow: "0 2px 0 rgba(0,0,0,0.8)",
          }}
        >
          {t("hq.subtitle")}
        </div>

        <Link href="/launch">
          <motion.button
            type="button"
            className="inline-flex items-center gap-2.5 font-ui uppercase cursor-pointer text-[12px] sm:text-[14px] md:text-[16px] px-6 py-3 sm:px-8 sm:py-4 md:px-9 md:py-[18px]"
            style={{
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
            {t("hq.cta.forge")}
          </motion.button>
        </Link>
      </div>
    </div>
  );
}
