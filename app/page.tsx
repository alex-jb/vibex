"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { Rocket, ArrowRight } from "lucide-react";
import { projects } from "@/lib/mock-data";

// Lazy-load the showcase — it's heavy (Framer Motion animations, 3 cards, Game Boy
// SVG) and below the hero text. Splitting it out ~halves the landing initial chunk.
const GameBoyFrame = dynamic(
  () => import("@/components/showcase/game-boy-frame").then((m) => ({ default: m.GameBoyFrame })),
  { ssr: true, loading: () => <div style={{ minHeight: 420 }} /> },
);
const FlipCard = dynamic(
  () => import("@/components/showcase/flip-card").then((m) => ({ default: m.FlipCard })),
  { ssr: true },
);
const ProjectDemoCard = dynamic(
  () => import("@/components/showcase/project-demo-card").then((m) => ({ default: m.ProjectDemoCard })),
  { ssr: true },
);
const PetCard = dynamic(
  () => import("@/components/showcase/pet-card").then((m) => ({ default: m.PetCard })),
  { ssr: true },
);

const pixelEase = [0.22, 1, 0.36, 1] as const;

/* ═══════════════════════════════════════════════════════════════════════════
   LANDING PAGE — 16-bit arcade marquee + Game Boy showcase + LAUNCH inside.
   Aesthetic: pixel chromatic shadows, terminal subtitle with cursor,
   floating pixel particles, decorative viewport corner brackets.
   ═══════════════════════════════════════════════════════════════════════════ */

export default function LandingPage() {
  // Pick AgentForge (id "2") — best stats, viral, featured
  const showcaseProject = projects.find((p) => p.id === "2") || projects[0];
  const router = useRouter();

  // SPACE key launches the app (desktop users can just press space)
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.code === "Space" && e.target === document.body) {
        e.preventDefault();
        router.push("/home");
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [router]);

  // Real social proof — derived from mock-data.
  // Gate: only show the bar when numbers are impressive enough. Showing
  // "2 CREATORS SHIPPED" is worse than showing nothing — once real DB data
  // lands these thresholds become trivially met.
  const totalCreators = new Set(projects.map((p) => p.creatorName)).size;
  const viralThisWeek = projects.filter((p) => p.featured).length;
  const showSocialProof = totalCreators >= 10;

  return (
    <div
      className="relative min-h-screen overflow-hidden flex items-center justify-center"
      style={{ background: "var(--bg-deep)" }}
    >
      {/* ═══ ATMOSPHERIC LAYERS ═══ */}

      {/* Pixel grid texture */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(157,0,255,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(157,0,255,0.4) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
          maskImage:
            "radial-gradient(ellipse at center, black 30%, transparent 80%)",
          WebkitMaskImage:
            "radial-gradient(ellipse at center, black 30%, transparent 80%)",
        }}
      />

      {/* Background orbs */}
      <div className="pointer-events-none absolute -top-40 left-1/4 h-[500px] w-[500px] rounded-full bg-violet-600/12 blur-[140px]" />
      <div className="pointer-events-none absolute top-1/3 right-1/4 h-[400px] w-[400px] rounded-full bg-fuchsia-600/8 blur-[120px]" />
      <div className="pointer-events-none absolute bottom-0 left-1/3 h-[300px] w-[300px] rounded-full bg-cyan-500/6 blur-[100px]" />

      {/* Floating pixel particles */}
      {[
        { left: "8%", top: "18%", delay: 0, color: "#9D00FF" },
        { left: "12%", top: "62%", delay: 1.5, color: "#39FF14" },
        { left: "85%", top: "22%", delay: 2.8, color: "#06B6D4" },
        { left: "92%", top: "70%", delay: 0.6, color: "#EC4899" },
        { left: "20%", top: "85%", delay: 3.2, color: "#FACC15" },
        { left: "78%", top: "12%", delay: 1.8, color: "#FF4500" },
      ].map((p, i) => (
        <motion.div
          key={i}
          aria-hidden="true"
          className="pointer-events-none absolute hidden md:block"
          style={{
            left: p.left,
            top: p.top,
            width: 4,
            height: 4,
            background: p.color,
            boxShadow: `0 0 12px ${p.color}, 0 0 4px ${p.color}`,
          }}
          animate={{
            y: [0, -16, 0],
            opacity: [0.3, 1, 0.3],
          }}
          transition={{
            duration: 3.5,
            delay: p.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}

      {/* Viewport corner brackets — decorative L-shapes */}
      {(["tl", "tr", "bl", "br"] as const).map((pos) => {
        const isTop = pos.startsWith("t");
        const isLeft = pos.endsWith("l");
        return (
          <div
            key={pos}
            aria-hidden="true"
            className="pointer-events-none absolute hidden sm:block"
            style={{
              [isTop ? "top" : "bottom"]: 16,
              [isLeft ? "left" : "right"]: 16,
              width: 28,
              height: 28,
            }}
          >
            <div
              style={{
                position: "absolute",
                [isTop ? "top" : "bottom"]: 0,
                [isLeft ? "left" : "right"]: 0,
                width: 28,
                height: 3,
                background: "var(--neon-purple)",
                boxShadow: "0 0 8px rgba(157,0,255,0.6)",
              }}
            />
            <div
              style={{
                position: "absolute",
                [isTop ? "top" : "bottom"]: 0,
                [isLeft ? "left" : "right"]: 0,
                width: 3,
                height: 28,
                background: "var(--neon-purple)",
                boxShadow: "0 0 8px rgba(157,0,255,0.6)",
              }}
            />
          </div>
        );
      })}

      {/* ═══ MAIN CONTENT ═══ */}
      <div className="relative z-10 w-full max-w-6xl mx-auto px-4 sm:px-6 py-8 flex flex-col items-center">
        {/* ─── HERO TEXT ─── */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: pixelEase }}
          className="text-center mb-8 sm:mb-10 max-w-4xl"
        >
          {/* Eyebrow tag */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="inline-flex items-center gap-2 mb-5 sm:mb-6 px-3 py-1.5"
            style={{
              border: "2px solid var(--neon-purple)",
              background: "rgba(157,0,255,0.08)",
              boxShadow: "3px 3px 0 #000, 0 0 16px rgba(157,0,255,0.25)",
            }}
          >
            <span
              className="inline-block"
              style={{
                width: 6,
                height: 6,
                background: "#39FF14",
                boxShadow: "0 0 6px #39FF14",
                animation: "pulse 1.5s ease-in-out infinite",
              }}
            />
            <span
              className="font-pixel"
              style={{
                fontSize: 8,
                letterSpacing: 3,
                color: "#E9BDFF",
              }}
            >
              VIBEX // NOW IN BETA
            </span>
          </motion.div>

          {/* Title — pixel chromatic shadow */}
          <h1
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-5 sm:mb-6"
            style={{
              fontFamily: "var(--font-pixel), monospace",
              color: "#FFF",
              lineHeight: 1.25,
              textShadow:
                "3px 3px 0 rgba(157,0,255,0.7), -2px -2px 0 rgba(6,182,212,0.5), 0 0 36px rgba(157,0,255,0.35)",
            }}
          >
            Turn your AI project
            <br className="hidden sm:inline" />{" "}
            into a{" "}
            <span
              className="relative inline-block"
              style={{
                color: "var(--neon-green)",
                textShadow:
                  "3px 3px 0 rgba(0,0,0,0.6), 0 0 32px rgba(57,255,20,0.6)",
              }}
            >
              viral collectible
              {/* Underline accent */}
              <span
                aria-hidden="true"
                className="absolute left-0 right-0 -bottom-1"
                style={{
                  height: 4,
                  background:
                    "linear-gradient(90deg, transparent, var(--neon-green), transparent)",
                  boxShadow: "0 0 12px rgba(57,255,20,0.7)",
                }}
              />
            </span>
          </h1>

          {/* Subtitle — terminal prompt style */}
          <div
            className="inline-flex items-center gap-2 px-4 py-2.5"
            style={{
              background: "rgba(0,0,0,0.5)",
              border: "1px solid rgba(157,0,255,0.3)",
              boxShadow: "inset 0 0 12px rgba(157,0,255,0.1)",
            }}
          >
            <span
              className="font-pixel"
              style={{
                fontSize: 9,
                color: "var(--neon-green)",
                textShadow: "0 0 6px rgba(57,255,20,0.6)",
              }}
            >
              {">"}
            </span>
            <span
              className="font-retro text-sm sm:text-base md:text-lg"
              style={{
                color: "#E8E8EC",
                letterSpacing: 0.5,
              }}
            >
              generate_a_card{" "}
              <span style={{ color: "var(--neon-purple)" }}>→</span>{" "}
              share_it{" "}
              <span style={{ color: "var(--neon-purple)" }}>→</span>{" "}
              grow_your_project
            </span>
            <span
              aria-hidden="true"
              className="inline-block"
              style={{
                width: 8,
                height: 14,
                background: "var(--neon-green)",
                marginLeft: 2,
                animation: "pulse 1s steps(2) infinite",
              }}
            />
          </div>
        </motion.div>

        {/* ─── GAME BOY SHOWCASE ─── */}
        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.3, ease: pixelEase }}
          className="w-full"
        >
          <GameBoyFrame
            cta={
              <Link href="/home">
                <motion.button
                  type="button"
                  aria-label="Launch VibeX — enter the full app (or press SPACE)"
                  className="group flex items-center gap-2 px-6 py-4 font-pixel text-xs tracking-wider transition-transform hover:scale-110 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-violet-500/50"
                  style={{
                    background:
                      "linear-gradient(135deg, var(--neon-purple), #C026D3)",
                    border: "3px solid #FFF",
                    color: "#FFF",
                    minHeight: "52px",
                    cursor: "pointer",
                  }}
                  animate={{
                    boxShadow: [
                      "4px 4px 0 #000, 0 0 20px rgba(157,0,255,0.5)",
                      "4px 4px 0 #000, 0 0 40px rgba(157,0,255,0.9)",
                      "4px 4px 0 #000, 0 0 20px rgba(157,0,255,0.5)",
                    ],
                  }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                >
                  <Rocket className="h-5 w-5" />
                  LAUNCH
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </motion.button>
              </Link>
            }
          >
            <FlipCard
              autoFlipInterval={4000}
              front={
                <div
                  style={{
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "10px",
                  }}
                >
                  <div
                    style={{
                      width: "62%",
                      maxWidth: 240,
                      height: "96%",
                      maxHeight: 300,
                    }}
                  >
                    <ProjectDemoCard project={showcaseProject} />
                  </div>
                </div>
              }
              back={
                <div
                  style={{
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "10px",
                  }}
                >
                  <div
                    style={{
                      width: "62%",
                      maxWidth: 240,
                      height: "96%",
                      maxHeight: 300,
                    }}
                  >
                    <PetCard project={showcaseProject} />
                  </div>
                </div>
              }
            />
          </GameBoyFrame>
        </motion.div>

        {/* ─── SOCIAL PROOF + KEYBOARD HINT ─── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.9 }}
          className="mt-6 sm:mt-8 flex flex-col items-center gap-3"
        >
          {/* Social proof bar — only when numbers are credible */}
          {showSocialProof && (
            <div
              className="inline-flex items-center gap-3 px-4 py-2"
              style={{
                background: "rgba(0,0,0,0.5)",
                border: "1px solid rgba(57,255,20,0.3)",
                boxShadow: "inset 0 0 10px rgba(57,255,20,0.08)",
              }}
            >
              <span
                aria-hidden="true"
                className="inline-block"
                style={{
                  width: 6,
                  height: 6,
                  background: "#39FF14",
                  boxShadow: "0 0 8px #39FF14",
                  animation: "pulse 1.5s ease-in-out infinite",
                }}
              />
              <span
                className="font-pixel"
                style={{
                  fontSize: 10,
                  letterSpacing: 1.5,
                  color: "#E8E8EC",
                }}
              >
                <span style={{ color: "var(--neon-green)" }}>{totalCreators.toLocaleString()}</span>{" "}
                CREATORS SHIPPED
                {" · "}
                <span style={{ color: "var(--neon-yellow)" }}>{viralThisWeek}</span>{" "}
                VIRAL CARDS
              </span>
            </div>
          )}

          {/* Keyboard hint */}
          <span
            className="font-pixel text-center block"
            style={{
              fontSize: 7,
              letterSpacing: 3,
              color: "rgba(157,0,255,0.7)",
              textShadow: "0 0 6px rgba(157,0,255,0.4)",
            }}
          >
            ▸ PRESS{" "}
            <kbd
              className="inline-block px-1.5 py-0.5 mx-0.5"
              style={{
                background: "rgba(157,0,255,0.15)",
                border: "1px solid rgba(157,0,255,0.6)",
                color: "#E9BDFF",
                fontSize: 7,
              }}
            >
              SPACE
            </kbd>{" "}
            OR CLICK LAUNCH ◂
          </span>
        </motion.div>
      </div>
    </div>
  );
}
