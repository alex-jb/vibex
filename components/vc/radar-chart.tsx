"use client";

import { motion } from "framer-motion";

interface VCRadarProps {
  data: {
    growthRate: number;
    userRetention: number;
    aiInnovation: number;
    marketTiming: number;
    teamSignal: number;
    revenuePotential: number;
  };
  size?: number;
  className?: string;
}

const AXES = [
  { key: "growthRate", label: "GRW", color: "#39FF14" },
  { key: "userRetention", label: "RET", color: "#06B6D4" },
  { key: "aiInnovation", label: "AI", color: "#9D00FF" },
  { key: "marketTiming", label: "MKT", color: "#FACC15" },
  { key: "teamSignal", label: "TME", color: "#EC4899" },
  { key: "revenuePotential", label: "REV", color: "#FF4500" },
] as const;

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

export function VCRadarChart({ data, size = 240, className = "" }: VCRadarProps) {
  const cx = size / 2;
  const cy = size / 2;
  const maxR = size * 0.36;
  const labelR = size * 0.48;
  const step = 360 / 6;

  const rings = [0.25, 0.5, 0.75, 1.0];

  const points = AXES.map((axis, i) => {
    const angle = step * i;
    const value = (data[axis.key as keyof typeof data] ?? 0) / 100;
    const r = maxR * Math.min(value, 1);
    return polarToCartesian(cx, cy, r, angle);
  });

  const dataPath =
    points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ") + " Z";

  return (
    <div className={`relative ${className}`} style={{ width: size, height: size }}>
      <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size} className="overflow-visible">
        {rings.map((scale) => {
          const ringPoints = Array.from({ length: 6 }, (_, i) =>
            polarToCartesian(cx, cy, maxR * scale, step * i)
          );
          const d = ringPoints.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ") + " Z";
          return (
            <path key={scale} d={d} fill="none" stroke="oklch(1 0 0 / 8%)" strokeWidth={1} strokeDasharray={scale < 1 ? "2 3" : "0"} />
          );
        })}

        {AXES.map((_, i) => {
          const end = polarToCartesian(cx, cy, maxR, step * i);
          return <line key={i} x1={cx} y1={cy} x2={end.x} y2={end.y} stroke="oklch(1 0 0 / 6%)" strokeWidth={1} />;
        })}

        <motion.path
          d={dataPath}
          fill="oklch(0.6 0.15 140 / 15%)"
          stroke="#39FF14"
          strokeWidth={2}
          initial={{ opacity: 0, scale: 0.3 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          style={{ transformOrigin: `${cx}px ${cy}px` }}
        />

        {points.map((p, i) => (
          <motion.circle
            key={i}
            cx={p.x}
            cy={p.y}
            r={3}
            fill={AXES[i].color}
            stroke="oklch(0.1 0 0)"
            strokeWidth={1}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 * i }}
          />
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
            <span className="font-pixel text-[7px] uppercase" style={{ color: axis.color }}>
              {axis.label}
            </span>
            <span className="font-pixel text-[8px] text-foreground">
              {data[axis.key as keyof typeof data] ?? 0}
            </span>
          </div>
        );
      })}
    </div>
  );
}
