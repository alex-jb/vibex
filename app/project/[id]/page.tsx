"use client";

import { use, useRef, useState, useMemo } from "react";
import Link from "next/link";
import { motion, useInView } from "framer-motion";
import {
  ArrowLeft,
  Eye,
  ChevronUp,
  Trophy,
  Share2,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  Star,
  Calendar,
  User,
} from "lucide-react";

import { useLang } from "@/lib/i18n";
import { projects } from "@/lib/mock-data";
import type { Project, AIReview } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import PlayableDemo from "@/components/playable-demo";
import { HudBars } from "@/components/rpg/hud-bars";
import { ExpBar } from "@/components/rpg/exp-bar";
import { AttributeRadar } from "@/components/rpg/attribute-radar";
import { ShareModal } from "@/components/share-modal";
import { GrowthRadar } from "@/components/project/growth-radar";
import { ForkTree } from "@/components/project/fork-tree";
import { EvolutionProgress } from "@/components/project/evolution-progress";
import { EvolutionBurst, useEvolutionDetector } from "@/components/rpg/evolution-burst";
import { SkillTree } from "@/components/rpg/skill-tree";
import { ClassIcon } from "@/components/rpg/class-icon";
import { EvolutionBadge } from "@/components/rpg/evolution-badge";
import { RareCandyButton } from "@/components/rpg/rare-candy-button";
import { RealtimeChat } from "@/components/realtime-chat";
import { Swords } from "lucide-react";

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const stagger = {
  visible: { transition: { staggerChildren: 0.1 } },
};

/* ---------- Score Bar with gradient fills ---------- */
function ScoreBar({ label, value, index }: { label: string; value: number; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-40px" });

  const gradient =
    value > 80
      ? "from-violet-500 to-fuchsia-500"
      : value > 60
        ? "from-amber-500 to-orange-500"
        : "from-red-500 to-rose-500";

  return (
    <div ref={ref} className="space-y-1.5">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground capitalize">
          {label.replace(/([A-Z])/g, " $1").trim()}
        </span>
        <span className="font-semibold tabular-nums">{value}</span>
      </div>
      <div className="h-2 w-full rounded-full bg-white/5 overflow-hidden">
        <motion.div
          className={`h-2 rounded-full bg-gradient-to-r ${gradient}`}
          initial={{ width: 0 }}
          animate={isInView ? { width: `${value}%` } : { width: 0 }}
          transition={{ duration: 0.8, ease: "easeOut", delay: index * 0.1 }}
        />
      </div>
    </div>
  );
}

/* ---------- AI Review Panel ---------- */
function AIReviewPanel({ review }: { review: AIReview }) {
  const { t } = useLang();
  const metrics: {
    key: keyof Pick<AIReview, "originality" | "clarity" | "uxPotential" | "viralityPotential" | "investorCuriosity">;
    label: string;
  }[] = [
    { key: "originality", label: t("project.originality") },
    { key: "clarity", label: t("project.clarity") },
    { key: "uxPotential", label: t("project.uxPotential") },
    { key: "viralityPotential", label: t("project.viralityPotential") },
    { key: "investorCuriosity", label: t("project.investorCuriosity") },
  ];

  return (
    <motion.div
      variants={fadeIn}
      className="glass-card-strong border-glow rounded-2xl p-6"
    >
      {/* Header */}
      <div className="mb-6 flex items-center gap-2">
        <Sparkles className="size-5 text-violet-400" />
        <h3 className="text-lg font-semibold">{t("project.aiAnalysis")}</h3>
        <Badge className="ml-auto bg-violet-500/10 text-violet-400 border-violet-500/20 text-[10px]">
          {t("project.beta")}
        </Badge>
      </div>

      {/* Score bars */}
      <div className="space-y-4">
        {metrics.map((metric, i) => (
          <ScoreBar
            key={metric.key}
            label={metric.label}
            value={review[metric.key]}
            index={i}
          />
        ))}
      </div>

      <Separator className="my-6 bg-white/5" />

      {/* Strengths / Weaknesses / Suggestions */}
      <div className="space-y-5">
        <div>
          <h4 className="mb-3 flex items-center gap-1.5 text-sm font-medium text-emerald-400">
            <CheckCircle2 className="size-4" />
            {t("project.strengths")}
          </h4>
          <ul className="space-y-2">
            {review.strengths.map((s, i) => (
              <li
                key={i}
                className="flex gap-3 text-sm text-muted-foreground rounded-lg py-1.5"
              >
                <div className="mt-0.5 h-full w-0.5 shrink-0 rounded-full bg-emerald-500/50" />
                <span>{s}</span>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="mb-3 flex items-center gap-1.5 text-sm font-medium text-yellow-400">
            <AlertTriangle className="size-4" />
            {t("project.weaknesses")}
          </h4>
          <ul className="space-y-2">
            {review.weaknesses.map((w, i) => (
              <li
                key={i}
                className="flex gap-3 text-sm text-muted-foreground rounded-lg py-1.5"
              >
                <div className="mt-0.5 h-full w-0.5 shrink-0 rounded-full bg-yellow-500/50" />
                <span>{w}</span>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="mb-3 flex items-center gap-1.5 text-sm font-medium text-blue-400">
            <Lightbulb className="size-4" />
            {t("project.suggestions")}
          </h4>
          <ul className="space-y-2">
            {review.suggestions.map((s, i) => (
              <li
                key={i}
                className="flex gap-3 text-sm text-muted-foreground rounded-lg py-1.5"
              >
                <div className="mt-0.5 h-full w-0.5 shrink-0 rounded-full bg-blue-500/50" />
                <span>{s}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <Separator className="my-5 bg-white/5" />

      <p className="text-xs text-muted-foreground/40">
        {t("project.aiDisclaimer")}
      </p>
    </motion.div>
  );
}

/* ---------- Related Project Card ---------- */
function RelatedProjectCard({ project }: { project: Project }) {
  return (
    <Link href={`/project/${project.id}`}>
      <motion.div
        whileHover={{ y: -4, scale: 1.01 }}
        transition={{ duration: 0.2 }}
        className="glass-card rounded-xl p-5 transition-all hover:border-white/15 group"
      >
        <div className="flex items-start justify-between">
          <Badge
            variant="secondary"
            className="bg-white/5 border-white/10 text-muted-foreground text-[10px]"
          >
            {project.category}
          </Badge>
          <span className="text-xs font-mono font-bold text-muted-foreground">
            {project.score}
          </span>
        </div>
        <h4 className="mt-3 font-semibold group-hover:text-gradient-subtle">
          {project.title}
        </h4>
        <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
          {project.tagline}
        </p>
        <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground/60">
          <span className="flex items-center gap-1">
            <ChevronUp className="size-3" />
            {project.upvotes}
          </span>
          <span className="flex items-center gap-1">
            <Eye className="size-3" />
            {project.views.toLocaleString()}
          </span>
        </div>
      </motion.div>
    </Link>
  );
}

/* ---------- Main Page ---------- */
export default function ProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const project = projects.find((p) => p.id === id);
  const { t } = useLang();
  const [shareOpen, setShareOpen] = useState(false);
  const { burstStage, clearBurst } = useEvolutionDetector(project?.hero?.evolutionStage);

  const relatedProjects = useMemo(() => {
    if (!project) return [];
    return projects
      .filter((p) => p.id !== project.id)
      .sort(() => 0.5 - Math.random())
      .slice(0, 3);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (!project) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
        <h1 className="text-2xl font-bold">{t("project.notFound")}</h1>
        <p className="text-muted-foreground">
          {t("project.notFoundDesc")}
        </p>
        <Link href="/discover">
          <Button variant="outline">
            <ArrowLeft className="size-4" />
            {t("project.backToExplore")}
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={stagger}
      className="mx-auto max-w-7xl px-4 py-12 sm:px-6"
    >
      {/* ===== Hero Header ===== */}
      <motion.div variants={fadeIn} className="relative mb-12 overflow-hidden">
        {/* Gradient orbs */}
        <div className="pointer-events-none absolute -top-40 -left-40 h-72 w-72 rounded-full bg-violet-600/20 blur-[120px] animate-pulse-slow" />
        <div className="pointer-events-none absolute -top-20 right-10 h-56 w-56 rounded-full bg-fuchsia-600/15 blur-[100px] animate-pulse-slow" style={{ animationDelay: "2s" }} />

        <div className="relative space-y-5">
          {/* Breadcrumb nav */}
          <nav aria-label="Breadcrumb">
            <Link
              href="/discover"
              className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              <ArrowLeft className="size-4" />
              {t("project.backToExplore")}
            </Link>
          </nav>

          {/* Badges */}
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary" className="bg-white/5 border-white/10">
              {project.category}
            </Badge>
            {project.featured && (
              <Badge className="bg-amber-500/10 text-amber-400 border-amber-500/20">
                <Star className="size-3" />
                {t("project.featured")}
              </Badge>
            )}
          </div>

          {/* Title */}
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            {project.title}
          </h1>

          {/* Tagline */}
          <p className="text-xl text-muted-foreground max-w-2xl">
            {project.tagline}
          </p>

          {/* Creator + date + stats inline */}
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <User className="size-3.5" />
              <span className="font-medium text-foreground">{project.creatorName}</span>
            </span>
            <span className="flex items-center gap-1.5">
              <Calendar className="size-3.5" />
              <time dateTime={project.createdAt}>{project.createdAt}</time>
            </span>
            <div className="hidden sm:block h-4 w-px bg-white/10" />
            <span className="flex items-center gap-1.5">
              <Eye className="size-3.5" />
              {project.views.toLocaleString()} {t("project.views")}
            </span>
            <span className="flex items-center gap-1.5">
              <ChevronUp className="size-3.5 text-violet-400" />
              {project.upvotes.toLocaleString()} {t("project.upvotes")}
            </span>
            <span className="flex items-center gap-1.5">
              <Trophy className="size-3.5 text-amber-400" />
              {t("project.score")} {project.score}
            </span>
          </div>
        </div>
      </motion.div>

      {/* ===== Main Grid ===== */}
      <article className="grid grid-cols-1 gap-10 lg:grid-cols-3" itemScope itemType="https://schema.org/SoftwareApplication">
        {/* Left Column */}
        <div className="space-y-10 lg:col-span-2">
          {/* Demo Panel */}
          <motion.div variants={fadeIn}>
            <PlayableDemo
              demoType={project.demoType}
              demoUrl={project.demoUrl}
              demoContent={project.demoContent}
              projectTitle={project.title}
              projectId={project.id}
            />
          </motion.div>

          {/* Description */}
          <motion.div variants={fadeIn} className="space-y-3">
            <h2 className="text-xl font-semibold">{t("project.about")}</h2>
            <p className="leading-relaxed text-muted-foreground">
              {project.description}
            </p>
          </motion.div>

          {/* Tags */}
          <motion.div variants={fadeIn} className="flex flex-wrap gap-2">
            {project.tags.map((tag) => (
              <span
                key={tag}
                className="glass-card rounded-full px-3.5 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground hover:border-white/15"
              >
                {tag}
              </span>
            ))}
          </motion.div>

          {/* Fork Tree — Remix Guild */}
          <ForkTree project={project} allProjects={projects} />
        </div>

        {/* Right Column - Sidebar */}
        <div className="space-y-6">
          {/* Action Buttons */}
          <motion.div variants={fadeIn} className="flex gap-3">
            <Button className="flex-1 gap-2 bg-violet-600 hover:bg-violet-500 text-white" variant="default">
              <ChevronUp className="size-4" />
              {t("project.upvote")}
            </Button>
            <Button variant="outline" className="gap-2 border-white/10 hover:bg-white/5" onClick={() => setShareOpen(true)}>
              <Share2 className="size-4" />
              {t("project.share")}
            </Button>
          </motion.div>

          {/* Evolution Progress */}
          <motion.div variants={fadeIn} className="rpgui-container framed" style={{ padding: 16 }}>
            <EvolutionProgress project={project} />
          </motion.div>

          {/* Growth Radar */}
          <motion.div variants={fadeIn} className="rpgui-container framed" style={{ padding: 16 }}>
            <GrowthRadar project={project} size={180} />
          </motion.div>

          {/* RPG Hero Panel */}
          {project.hero && (
            <motion.div variants={fadeIn} className="rpgui-container framed space-y-4" style={{ padding: 16 }}>

              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Swords className="size-4 text-violet-400" />
                  <h3 className="font-pixel text-[9px] uppercase tracking-wider text-foreground">
                    {t("project.heroStats")}
                  </h3>
                </div>
                <EvolutionBadge stage={project.hero.evolutionStage} size="sm" />
              </div>

              {/* Class + Level */}
              <div className="flex items-center gap-3">
                <div
                  className="w-12 h-12 flex items-center justify-center retro-border sprite-float"
                  style={{
                    background: `oklch(0.15 0.02 280)`,
                  }}
                >
                  <ClassIcon heroClass={project.hero.heroClass} size={24} />
                </div>
                <div>
                  <ClassIcon heroClass={project.hero.heroClass} showLabel />
                  <ExpBar hero={project.hero} className="mt-1" />
                </div>
              </div>

              {/* HUD Bars */}
              <HudBars hero={project.hero} />

              {/* Attribute Radar */}
              <div className="flex justify-center pt-2">
                <AttributeRadar attributes={project.hero.attributes} size={200} />
              </div>

              {/* Skill Tree */}
              <div className="pt-2">
                <h4 className="font-pixel text-[7px] text-muted-foreground uppercase tracking-widest mb-3">
                  {t("project.skillTree")}
                </h4>
                <SkillTree skills={project.hero.skillTree} />
              </div>

              {/* Battle + Donate Actions */}
              <div className="flex items-center justify-between pt-2">
                <Link href={`/arena`}>
                  <button className="nes-btn is-error" style={{ fontSize: 9, padding: "6px 14px" }}>
                    <span className="rpgui-icon sword small" style={{ width: 14, height: 14, display: "inline-block", verticalAlign: "middle", marginRight: 4 }} />
                    {t("project.battle")}
                  </button>
                </Link>
                <RareCandyButton
                  projectTitle={project.title}
                  currentDonors={Math.floor(project.upvotes * 0.3)}
                />
              </div>
              <hr className="rpgui-hr" />
            </motion.div>
          )}

          {/* AI Review Panel */}
          <AIReviewPanel review={project.aiReview} />
        </div>
      </article>

      {/* ===== Comments ===== */}
      <motion.div variants={fadeIn} className="mt-16">
        <RealtimeChat projectId={project.id} />
      </motion.div>

      {/* ===== Related Projects ===== */}
      <motion.div variants={fadeIn} className="mt-20">
        <h2 className="text-2xl font-bold tracking-tight mb-6">{t("project.relatedProjects")}</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {relatedProjects.map((p) => (
            <RelatedProjectCard key={p.id} project={p} />
          ))}
        </div>
      </motion.div>

      {/* Share Modal */}
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

      {/* Evolution burst animation */}
      <EvolutionBurst stage={burstStage} onComplete={clearBurst} />
    </motion.div>
  );
}
