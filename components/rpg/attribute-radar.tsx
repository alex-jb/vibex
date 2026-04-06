"use client";

import { motion } from "framer-motion";
import type { HeroAttributes } from "@/lib/types";
import { ATTRIBUTE_LABELS } from "@/lib/rpg-utils";

interface AttributeRadarProps {
  attributes: HeroAttributes;
  size?: number;
  className?: string;
}

const ATTR_ORDER: (keyof HeroAttributes)[] = [
  "power",
  "resilience",
  "charisma",
  "wisdom",
  "agility",
  "stability",
];

const ATTR_COLORS: Record<keyof HeroAttributes, string> = {
  power: "#a855f7",
  resilience: "#22c55e",
  charisma: "#ec4899",
  wisdom: "#f59e0b",
  agility: "#06b6d4",
  stability: "#6366f1",
};

function polarToCartesian(
  cx: number,
  cy: number,
  r: number,
  angleDeg: number
) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

export function AttributeRadar({
  attributes,
  size = 220,
  className = "",
}: AttributeRadarProps) {
  const cx = size / 2;
  const cy = size / 2;
  const maxR = size * 0.38;
  const labelR = size * 0.48;
  const step = 360 / 6;

  // Grid rings
  const rings = [0.25, 0.5, 0.75, 1.0];

  // Data points
  const points = ATTR_ORDER.map((key, i) => {
    const angle = step * i;
    const value = attributes[key] / 100;
    const r = maxR * value;
    return polarToCartesian(cx, cy, r, angle);
  });

  const dataPath =
    points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ") +
    " Z";

  return (
    <div className={`relative ${className}`} style={{ width: size, height: size }}>
      <svg
        viewBox={`0 0 ${size} ${size}`}
        width={size}
        height={size}
        className="overflow-visible"
      >
        {/* Grid rings */}
        {rings.map((scale) => {
          const ringPoints = Array.from({ length: 6 }, (_, i) =>
            polarToCartesian(cx, cy, maxR * scale, step * i)
          );
          const d =
            ringPoints
              .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`)
              .join(" ") + " Z";
          return (
            <path
              key={scale}
              d={d}
              fill="none"
              stroke="oklch(1 0 0 / 8%)"
              strokeWidth={1}
              strokeDasharray={scale < 1 ? "2 3" : "0"}
            />
          );
        })}

        {/* Axis lines */}
        {ATTR_ORDER.map((_, i) => {
          const end = polarToCartesian(cx, cy, maxR, step * i);
          return (
            <line
              key={i}
              x1={cx}
              y1={cy}
              x2={end.x}
              y2={end.y}
              stroke="oklch(1 0 0 / 6%)"
              strokeWidth={1}
            />
          );
        })}

        {/* Data polygon */}
        <motion.path
          d={dataPath}
          fill="oklch(0.6 0.2 280 / 15%)"
          stroke="oklch(0.7 0.2 280)"
          strokeWidth={2}
          initial={{ opacity: 0, scale: 0.3 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          style={{ transformOrigin: `${cx}px ${cy}px` }}
        />

        {/* Data dots */}
        {points.map((p, i) => (
          <motion.circle
            key={i}
            cx={p.x}
            cy={p.y}
            r={3}
            fill={ATTR_COLORS[ATTR_ORDER[i]]}
            stroke="oklch(0.1 0 0)"
            strokeWidth={1}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.1 * i }}
          />
        ))}
      </svg>

      {/* Labels */}
      {ATTR_ORDER.map((key, i) => {
        const angle = step * i;
        const pos = polarToCartesian(cx, cy, labelR, angle);
        const config = ATTRIBUTE_LABELS[key];
        return (
          <div
            key={key}
            className="absolute flex flex-col items-center"
            style={{
              left: pos.x,
              top: pos.y,
              transform: "translate(-50%, -50%)",
            }}
          >
            <span
              className="font-pixel text-[7px] uppercase"
              style={{ color: ATTR_COLORS[key] }}
            >
              {config.label.slice(0, 3)}
            </span>
            <span className="font-pixel text-[8px] text-foreground">
              {attributes[key]}
            </span>
          </div>
        );
      })}
    </div>
  );
}
