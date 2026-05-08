"use client";

import { motion } from "framer-motion";
import type { Project } from "@/lib/types";

interface GrowthRadarProps {
  project: Project;
  size?: number;
  className?: string;
}

const AXES = [
  { key: "plays", label: "PLY", color: "#39FF14" },
  { key: "shareRate", label: "SHR", color: "#06B6D4" },
  { key: "remixCount", label: "RMX", color: "#9D00FF" },
  { key: "upvotes", label: "UPV", color: "#FACC15" },
  { key: "avgStay", label: "RET", color: "#EC4899" },
  { key: "aiScore", label: "AI", color: "#F97316" },
] as const;

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

/**
 * Normalize raw metrics to 0-100 scale for radar display.
 */
function normalizeMetrics(project: Project): Record<string, number> {
  const bs = project.behaviorScore;
  return {
    plays: Math.min(100, Math.round((bs.plays / 10000) * 100)),
    shareRate: Math.min(100, Math.round(bs.shareRate * 500)),
    remixCount: Math.min(100, Math.round((bs.remixCount / 20) * 100)),
    upvotes: Math.min(100, Math.round((project.upvotes / 1000) * 100)),
    avgStay: Math.min(100, Math.round((bs.avgStaySeconds / 180) * 100)),
    aiScore: bs.aiScore,
  };
}

export function GrowthRadar({ project, size = 180, className = "" }: GrowthRadarProps) {
  const metrics = normalizeMetrics(project);
  const cx = size / 2;
  const cy = size / 2;
  const maxR = size * 0.36;
  const labelR = size * 0.48;
  const step = 360 / 6;

  const rings = [0.25, 0.5, 0.75, 1.0];

  const points = AXES.map((axis, i) => {
    const angle = step * i;
    const value = (metrics[axis.key] ?? 0) / 100;
    return polarToCartesian(cx, cy, maxR * Math.min(value, 1), angle);
  });

  const dataPath =
    points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ") + " Z";

  return (
    <div className={className}>
      <span className="font-pixel text-[7px] uppercase tracking-widest text-emerald-400 block mb-2">
        Growth Radar
      </span>
      <div className="relative" style={{ width: size, height: size, margin: "0 auto" }}>
        <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size} className="overflow-visible">
          {rings.map((scale) => {
            const ringPoints = Array.from({ length: 6 }, (_, i) =>
              polarToCartesian(cx, cy, maxR * scale, step * i)
            );
            const d = ringPoints.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ") + " Z";
            return <path key={scale} d={d} fill="none" stroke="oklch(1 0 0 / 8%)" strokeWidth={1} strokeDasharray={scale < 1 ? "2 3" : "0"} />;
          })}

          {AXES.map((_, i) => {
            const end = polarToCartesian(cx, cy, maxR, step * i);
            return <line key={i} x1={cx} y1={cy} x2={end.x} y2={end.y} stroke="oklch(1 0 0 / 6%)" strokeWidth={1} />;
          })}

          <motion.path
            d={dataPath}
            fill="oklch(0.6 0.15 140 / 12%)"
            stroke="#39FF14"
            strokeWidth={1.5}
            initial={{ opacity: 0, scale: 0.3 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            style={{ transformOrigin: `${cx}px ${cy}px` }}
          />

          {points.map((p, i) => (
            <circle key={i} cx={p.x} cy={p.y} r={2.5} fill={AXES[i].color} stroke="oklch(0.1 0 0)" strokeWidth={1} />
          ))}
        </svg>

        {AXES.map((axis, i) => {
          const pos = polarToCartesian(cx, cy, labelR, step * i);
          return (
            <div
              key={axis.key}
              className="absolute flex flex-col items-center"
              style={{ left: pos.x, top: pos.y, transform: "translate(-50%, -50%)" }}
            >
              <span className="font-pixel text-[6px] uppercase" style={{ color: axis.color }}>
                {axis.label}
              </span>
              <span className="font-pixel text-[7px] text-foreground">
                {metrics[axis.key]}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
