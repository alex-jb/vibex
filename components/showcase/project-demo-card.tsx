"use client";

import { motion } from "framer-motion";
import { Heart, Eye, Play, GitFork } from "lucide-react";
import type { Project } from "@/lib/types";

interface ProjectDemoCardProps {
  project: Project;
  className?: string;
}

function formatCount(n: number): string {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return n.toString();
}

/**
 * "Front" face of the flip card.
 * Looks like a real project listing card — browser window chrome + stats.
 * This is what a project would look like BEFORE VibeX turns it into a hero card.
 */
export function ProjectDemoCard({ project, className = "" }: ProjectDemoCardProps) {
  return (
    <motion.div
      className={`retro-card l-corner relative overflow-hidden ${className}`}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      style={{
        background: "var(--bg-panel)",
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div className="l-corner-inner absolute inset-0 pointer-events-none" />

      {/* Fake browser chrome */}
      <div
        className="flex items-center gap-2 px-3 py-2 border-b"
        style={{ borderColor: "oklch(1 0 0 / 8%)", background: "rgba(0,0,0,0.3)" }}
      >
        <div className="flex gap-1.5">
          <div
            className="w-2 h-2"
            style={{ background: "var(--neon-orange)", border: "1px solid #000" }}
          />
          <div
            className="w-2 h-2"
            style={{ background: "var(--neon-yellow)", border: "1px solid #000" }}
          />
          <div
            className="w-2 h-2"
            style={{ background: "var(--neon-green)", border: "1px solid #000" }}
          />
        </div>
        <div
          className="flex-1 text-center font-pixel text-[6px] truncate"
          style={{ color: "#666" }}
        >
          {project.demoUrl || `${project.title.toLowerCase().replace(/\s+/g, "-")}.app`}
        </div>
      </div>

      {/* Category + badges row */}
      <div
        className="flex items-center justify-between px-3 py-1.5 border-b"
        style={{ borderColor: "oklch(1 0 0 / 6%)" }}
      >
        <span
          className="font-pixel text-[6px] uppercase tracking-wider px-1.5 py-0.5"
          style={{
            color: "var(--neon-cyan)",
            border: "1px solid var(--neon-cyan)",
            background: "rgba(6, 182, 212, 0.1)",
          }}
        >
          {project.category}
        </span>
        {project.featured && (
          <span
            className="font-pixel text-[6px] px-1.5 py-0.5"
            style={{
              color: "#000",
              background: "var(--neon-yellow)",
            }}
          >
            FEATURED
          </span>
        )}
      </div>

      {/* Project thumbnail placeholder — big emoji */}
      <div
        className="flex-1 flex items-center justify-center relative"
        style={{
          background:
            "radial-gradient(circle at 50% 50%, rgba(157,0,255,0.1), transparent 70%)",
          minHeight: 100,
        }}
      >
        <div
          className="text-5xl"
          style={{ filter: "drop-shadow(0 0 12px rgba(157,0,255,0.5))" }}
        >
          {"\u{1F916}"}
        </div>
      </div>

      {/* Title + tagline */}
      <div className="px-3 py-2">
        <h3
          className="font-pixel text-[10px] leading-tight truncate"
          style={{ color: "#FFF" }}
        >
          {project.title}
        </h3>
        <p
          className="font-retro text-xs mt-1 line-clamp-2 leading-tight"
          style={{ color: "#888" }}
        >
          {project.tagline}
        </p>
      </div>

      {/* Stats row */}
      <div
        className="grid grid-cols-4 gap-1 px-3 py-2 border-t font-pixel text-[7px]"
        style={{ borderColor: "oklch(1 0 0 / 8%)" }}
      >
        <div className="flex flex-col items-center gap-0.5">
          <Heart className="h-3 w-3" style={{ color: "var(--neon-pink)" }} />
          <span style={{ color: "#E8E8EC" }}>{formatCount(project.upvotes)}</span>
        </div>
        <div className="flex flex-col items-center gap-0.5">
          <Eye className="h-3 w-3" style={{ color: "var(--neon-cyan)" }} />
          <span style={{ color: "#E8E8EC" }}>{formatCount(project.views)}</span>
        </div>
        <div className="flex flex-col items-center gap-0.5">
          <Play className="h-3 w-3" style={{ color: "var(--neon-green)" }} />
          <span style={{ color: "#E8E8EC" }}>{formatCount(project.plays)}</span>
        </div>
        <div className="flex flex-col items-center gap-0.5">
          <GitFork className="h-3 w-3" style={{ color: "var(--neon-purple)" }} />
          <span style={{ color: "#E8E8EC" }}>{formatCount(project.remixCount)}</span>
        </div>
      </div>

      {/* Creator footer */}
      <div
        className="px-3 py-1.5 border-t text-center font-retro text-[10px]"
        style={{ borderColor: "oklch(1 0 0 / 8%)", color: "#666" }}
      >
        by <span style={{ color: "#E8E8EC" }}>{project.creatorName}</span>
      </div>
    </motion.div>
  );
}
