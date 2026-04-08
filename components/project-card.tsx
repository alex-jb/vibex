"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowUpRight,
  ChevronUp,
  MessageSquare,
  Code,
  Monitor,
  Play,
  GitFork,
  Zap,
  Share2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useLang } from "@/lib/i18n";
import type { Project } from "@/lib/types";
import { ShareModal } from "@/components/share-modal";

const categoryColors: Record<string, string> = {
  "AI Agent": "bg-blue-500/10 text-blue-400 border-blue-500/20",
  "AI Tool": "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  "AI Game": "bg-orange-500/10 text-orange-400 border-orange-500/20",
  "AI Workflow": "bg-purple-500/10 text-purple-400 border-purple-500/20",
  "AI Utility": "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
  Experimental: "bg-pink-500/10 text-pink-400 border-pink-500/20",
  Demo: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
};

const demoIcons: Record<string, typeof MessageSquare> = {
  chat: MessageSquare,
  sandbox: Code,
  preview: Monitor,
  embedded: Play,
};

const demoLabels: Record<string, string> = {
  chat: "Chat Demo",
  sandbox: "Sandbox",
  preview: "Preview",
  embedded: "Embedded",
};

function formatNumber(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return n.toString();
}

function getGradient(id: string): string {
  const gradients = [
    "from-violet-600/20 via-fuchsia-600/10 to-transparent",
    "from-blue-600/20 via-cyan-600/10 to-transparent",
    "from-emerald-600/20 via-teal-600/10 to-transparent",
    "from-orange-600/20 via-amber-600/10 to-transparent",
    "from-pink-600/20 via-rose-600/10 to-transparent",
    "from-indigo-600/20 via-purple-600/10 to-transparent",
  ];
  const index = parseInt(id, 10) % gradients.length;
  return gradients[index];
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function getAvatarColor(name: string): string {
  const colors = [
    "bg-violet-500/30 text-violet-300",
    "bg-blue-500/30 text-blue-300",
    "bg-emerald-500/30 text-emerald-300",
    "bg-orange-500/30 text-orange-300",
    "bg-pink-500/30 text-pink-300",
    "bg-cyan-500/30 text-cyan-300",
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

const CATEGORY_I18N: Record<string, string> = {
  "AI Agent": "cat.aiAgent", "AI Tool": "cat.aiTool", "AI Game": "cat.aiGame",
  "AI Workflow": "cat.aiWorkflow", "AI Utility": "cat.aiUtility",
  "Experimental": "cat.experimental", "Demo": "cat.demo",
};

export function ProjectCard({ project }: { project: Project }) {
  const { t } = useLang();
  const [shareOpen, setShareOpen] = useState(false);
  const DemoIcon = demoIcons[project.demoType] ?? Monitor;

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      <Link href={`/project/${project.id}`} className="group block">
        <article className="noise-bg relative overflow-hidden rounded-xl border border-white/[0.06] glass-card-strong transition-all duration-300 group-hover:border-white/15 group-hover:shadow-[0_8px_40px_-12px_rgba(139,92,246,0.15)]">
          {/* Thumbnail Area */}
          <div
            className={`relative flex h-44 items-center justify-center bg-gradient-to-br ${getGradient(project.id)} overflow-hidden`}
          >
            {/* Layered depth gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-br from-white/[0.03] via-transparent to-black/20" />

            {/* Subtle grid pattern overlay */}
            <div
              className="absolute inset-0 opacity-[0.04]"
              style={{
                backgroundImage:
                  "radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)",
                backgroundSize: "24px 24px",
              }}
            />

            {/* Demo type pill in center */}
            <div className="relative z-10 flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-3.5 py-1.5 backdrop-blur-md">
              <DemoIcon className="h-3.5 w-3.5 text-white/60" />
              <span className="text-[11px] font-medium uppercase tracking-wider text-white/50">
                {demoLabels[project.demoType] ?? project.demoType}
              </span>
            </div>

            {/* Featured / Viral badges */}
            {(project.featured || project.viralBoosted) && (
              <div className="absolute top-3 left-3 z-10 flex gap-1.5">
                {project.featured && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-600 px-2.5 py-0.5 text-[10px] font-semibold tracking-wide text-white shadow-lg shadow-violet-500/20">
                    {t("cat.featured")}
                  </span>
                )}
                {project.viralBoosted && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-rose-600 to-orange-600 px-2 py-0.5 text-[10px] font-semibold text-white">
                    <Zap className="h-2.5 w-2.5" />
                    {t("cat.viral")}
                  </span>
                )}
              </div>
            )}

            {/* Category badge */}
            <div className="absolute top-3 right-3 z-10">
              <Badge
                variant="outline"
                className={`text-[10px] backdrop-blur-sm ${categoryColors[project.category] ?? ""}`}
              >
                {CATEGORY_I18N[project.category] ? t(CATEGORY_I18N[project.category] as Parameters<typeof t>[0]) : project.category}
              </Badge>
            </div>
          </div>

          {/* Content */}
          <div className="p-5">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <h3 className="truncate text-base font-semibold transition-colors duration-200 group-hover:text-violet-400">
                  {project.title}
                </h3>
                {project.parentTitle && (
                  <p className="mt-0.5 flex items-center gap-1 text-[10px] text-fuchsia-400/70">
                    <GitFork className="h-2.5 w-2.5" />
                    Remixed from {project.parentTitle}
                  </p>
                )}
                <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
                  {project.tagline}
                </p>
              </div>
              <ArrowUpRight className="h-4 w-4 flex-shrink-0 text-muted-foreground opacity-0 transition-all duration-200 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </div>

            {/* Bottom row */}
            <div className="mt-4 flex items-center justify-between">
              {/* Creator avatar + name */}
              <div className="flex items-center gap-2">
                <div
                  className={`flex h-5 w-5 items-center justify-center rounded-full text-[8px] font-bold ${getAvatarColor(project.creatorName)}`}
                >
                  {getInitials(project.creatorName)}
                </div>
                <span className="text-xs text-muted-foreground">
                  {project.creatorName}
                </span>
              </div>

              {/* Stats + Share */}
              <div className="flex items-center gap-2.5 text-[11px] text-muted-foreground/60">
                <span className="flex items-center gap-0.5" title="Plays">
                  <Play className="h-2.5 w-2.5" />
                  {formatNumber(project.plays ?? 0)}
                </span>
                <span className="flex items-center gap-0.5" title="Upvotes" aria-label={`${formatNumber(project.upvotes)} upvotes`}>
                  <ChevronUp className="h-2.5 w-2.5" />
                  {formatNumber(project.upvotes)}
                </span>
                {(project.remixCount ?? 0) > 0 && (
                  <span className="flex items-center gap-0.5" title="Remixes">
                    <GitFork className="h-2.5 w-2.5" />
                    {project.remixCount}
                  </span>
                )}
                <button
                  title="Share"
                  aria-label={`Share ${project.title}`}
                  className="flex items-center gap-0.5 text-muted-foreground/60 hover:text-violet-400 transition-colors"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setShareOpen(true);
                  }}
                >
                  <Share2 className="h-2.5 w-2.5" />
                </button>
              </div>
            </div>
          </div>
        </article>
      </Link>

      <ShareModal
        open={shareOpen}
        onOpenChange={setShareOpen}
        project={{
          id: project.id,
          title: project.title,
          tagline: project.tagline,
          category: project.category,
          creatorName: project.creatorName,
        }}
      />
    </motion.div>
  );
}
