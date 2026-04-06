"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, SlidersHorizontal, Sparkles, Filter, LayoutGrid, Swords } from "lucide-react";
import { projects, categories } from "@/lib/mock-data";
import type { ProjectCategory } from "@/lib/types";
import { ProjectCard } from "@/components/project-card";
import { HeroCard } from "@/components/rpg/hero-card";
import { SectionHeader } from "@/components/section-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import {
  ArrowUpRight,
  Eye,
  ChevronUp,
  Star,
} from "lucide-react";
import { useLang } from "@/lib/i18n";

function formatNumber(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return n.toString();
}

export default function ExplorePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [viewMode, setViewMode] = useState<"card" | "hero">("card");
  const { t } = useLang();

  const filteredProjects = projects.filter((project) => {
    const matchesCategory =
      selectedCategory === "All" || project.category === selectedCategory;
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      query === "" ||
      project.title.toLowerCase().includes(query) ||
      project.tagline.toLowerCase().includes(query);
    return matchesCategory && matchesSearch;
  });

  const editorsPick = filteredProjects.find((p) => p.featured);
  const restProjects = editorsPick
    ? filteredProjects.filter((p) => p.id !== editorsPick.id)
    : filteredProjects;

  return (
    <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-16">
      {/* Background gradient orb */}
      <div className="pointer-events-none absolute -top-32 left-1/2 -translate-x-1/2 h-[480px] w-[480px] rounded-full bg-violet-600/8 blur-[120px]" />

      {/* Page Hero */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative text-center mb-12"
      >
        <div className="inline-flex items-center gap-2 rounded-full border border-violet-500/20 bg-violet-500/10 px-4 py-1.5 mb-5">
          <Sparkles className="size-3.5 text-violet-400" />
          <span className="text-xs font-medium text-violet-400 tracking-wide">
            {t("explore.badge")}
          </span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">
          {t("explore.title")}{" "}
          <span className="text-gradient">{t("explore.titleHighlight")}</span>
        </h1>
        <p className="mt-3 text-muted-foreground max-w-lg mx-auto text-sm leading-relaxed">
          {t("explore.description")}
        </p>
      </motion.div>

      {/* Search Bar */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="relative glass-card-strong rounded-xl p-1"
      >
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-violet-400" />
          <Input
            placeholder={t("explore.searchPlaceholder")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-12 pl-12 pr-4 bg-transparent border-0 text-base placeholder:text-muted-foreground/50 focus-visible:ring-0 focus-visible:border-0"
          />
        </div>
      </motion.div>

      {/* Category Pills */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.15 }}
        className="mt-6 flex gap-2 overflow-x-auto pb-2 scrollbar-hide"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
              selectedCategory === category
                ? "bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-lg shadow-violet-500/20 glow-soft"
                : "bg-white/5 border border-white/[0.08] text-muted-foreground hover:bg-white/10 hover:text-foreground"
            }`}
          >
            {category}
          </button>
        ))}
      </motion.div>

      {/* Result Info Row */}
      <div className="mt-8 flex items-center justify-between">
        <p className="text-sm text-muted-foreground/70">
          {t("explore.showing")}{" "}
          <span className="text-foreground font-medium">
            {filteredProjects.length}
          </span>{" "}
          {filteredProjects.length !== 1 ? t("explore.projects") : t("explore.project")}
        </p>
        <div className="flex items-center gap-3">
          {/* View toggle */}
          <div className="flex items-center gap-1 retro-border p-0.5">
            <button
              onClick={() => setViewMode("card")}
              className={`px-2 py-1 text-[10px] font-pixel transition-colors ${
                viewMode === "card"
                  ? "bg-violet-500/20 text-violet-400"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <LayoutGrid className="size-3.5" />
            </button>
            <button
              onClick={() => setViewMode("hero")}
              className={`px-2 py-1 text-[10px] font-pixel transition-colors ${
                viewMode === "hero"
                  ? "bg-violet-500/20 text-violet-400"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Swords className="size-3.5" />
            </button>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground/50">
            <SlidersHorizontal className="size-3" />
            <span>{t("explore.sortedByRelevance")}</span>
          </div>
        </div>
      </div>

      {/* Results Grid */}
      {filteredProjects.length > 0 ? (
        <motion.div
          layout
          className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          <AnimatePresence mode="popLayout">
            {/* Editor's Pick - Featured Card */}
            {editorsPick && (
              <motion.div
                key={`pick-${editorsPick.id}`}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                className="lg:col-span-2 border-glow rounded-xl"
              >
                <Link href={`/project/${editorsPick.id}`} className="group block">
                  <div className="noise-bg relative overflow-hidden rounded-xl border border-white/[0.08] glass-card-strong transition-all duration-300 group-hover:border-white/15 group-hover:shadow-[0_8px_40px_-12px_rgba(139,92,246,0.2)]">
                    <div className="flex flex-col md:flex-row">
                      {/* Left - Visual Area */}
                      <div className="relative flex-1 flex items-center justify-center bg-gradient-to-br from-violet-600/15 via-fuchsia-600/10 to-transparent min-h-[200px] md:min-h-[260px]">
                        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
                        <div className="absolute inset-0 bg-gradient-to-br from-white/[0.03] via-transparent to-black/20" />
                        <div
                          className="absolute inset-0 opacity-[0.03]"
                          style={{
                            backgroundImage:
                              "radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)",
                            backgroundSize: "24px 24px",
                          }}
                        />
                        {/* Badge */}
                        <div className="absolute top-4 left-4 z-10">
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-600 px-3 py-1 text-[11px] font-semibold tracking-wide text-white shadow-lg shadow-violet-500/25">
                            <Star className="size-3 fill-current" />
                            {t("explore.editorsPick")}
                          </span>
                        </div>
                        {/* Score */}
                        <div className="relative z-10 flex flex-col items-center gap-2">
                          <div className="flex items-center justify-center size-16 rounded-2xl border border-white/10 bg-white/[0.06] backdrop-blur-md">
                            <span className="text-2xl font-bold text-gradient">{editorsPick.score}</span>
                          </div>
                          <span className="text-[10px] font-medium uppercase tracking-widest text-white/40">
                            {t("explore.aiScore")}
                          </span>
                        </div>
                      </div>

                      {/* Right - Content */}
                      <div className="flex-1 p-6 md:p-8 flex flex-col justify-center">
                        <Badge
                          variant="outline"
                          className="w-fit mb-3 text-[10px] bg-violet-500/10 text-violet-400 border-violet-500/20"
                        >
                          {editorsPick.category}
                        </Badge>
                        <h3 className="text-xl md:text-2xl font-bold tracking-tight transition-colors duration-200 group-hover:text-violet-400">
                          {editorsPick.title}
                        </h3>
                        <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                          {editorsPick.tagline}
                        </p>
                        <p className="mt-3 text-xs text-muted-foreground/60 leading-relaxed line-clamp-3">
                          {editorsPick.description}
                        </p>

                        {/* Meta */}
                        <div className="mt-5 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="flex size-6 items-center justify-center rounded-full bg-violet-500/20 text-[9px] font-bold text-violet-300">
                              {editorsPick.creatorName
                                .split(" ")
                                .map((w) => w[0])
                                .join("")
                                .toUpperCase()
                                .slice(0, 2)}
                            </div>
                            <span className="text-xs text-muted-foreground">
                              {editorsPick.creatorName}
                            </span>
                          </div>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground/60">
                            <span className="flex items-center gap-1">
                              <Eye className="size-3" />
                              {formatNumber(editorsPick.views)}
                            </span>
                            <span className="flex items-center gap-1">
                              <ChevronUp className="size-3" />
                              {formatNumber(editorsPick.upvotes)}
                            </span>
                            <ArrowUpRight className="size-4 text-muted-foreground opacity-0 transition-all duration-200 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            )}

            {/* Rest of projects */}
            {restProjects.map((project) => (
              <motion.div
                key={project.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
              >
                {viewMode === "hero" ? (
                  <Link href={`/project/${project.id}`}>
                    <HeroCard project={project} className="h-full" />
                  </Link>
                ) : (
                  <ProjectCard project={project} />
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mt-16 flex flex-col items-center justify-center text-center"
        >
          <div className="relative mb-6">
            <div className="absolute inset-0 rounded-full bg-violet-600/20 blur-xl" />
            <div className="relative flex size-16 items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.04]">
              <Search className="size-7 text-violet-400/60" />
            </div>
          </div>
          <h3 className="text-lg font-semibold text-foreground/80">
            {t("explore.noResults")}
          </h3>
          <p className="mt-2 text-sm text-muted-foreground/50 max-w-xs leading-relaxed">
            {t("explore.noResultsDesc")}
          </p>
          <Button
            variant="outline"
            size="sm"
            className="mt-5 border-white/10 hover:bg-white/5"
            onClick={() => {
              setSearchQuery("");
              setSelectedCategory("All");
            }}
          >
            {t("explore.clearFilters")}
          </Button>
        </motion.div>
      )}
    </div>
  );
}
