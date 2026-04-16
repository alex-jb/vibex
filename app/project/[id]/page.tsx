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
  Calendar,
  User,
} from "lucide-react";

import { useLang } from "@/lib/i18n";
import { useAuth } from "@/lib/auth";
import { useProjects } from "@/lib/use-data";
import type { AIReview } from "@/lib/types";
import { HeroCard } from "@/components/home/hero-card";
import { projectsToCards } from "@/components/home/hero-card-grid";
import { FeedbackPanel } from "@/components/launch-feedback/feedback-panel";
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
/* ---------- Main Page ---------- */
export default function ProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data: projects, loading: projectsLoading } = useProjects();
  const project = projects.find((p) => p.id === id);
  const { t } = useLang();
  const { user } = useAuth();
  const [shareOpen, setShareOpen] = useState(false);
  const { burstStage, clearBurst } = useEvolutionDetector(project?.hero?.evolutionStage);

  const relatedProjects = useMemo(() => {
    if (!project) return [];
    return projects
      .filter((p) => p.id !== project.id)
      .sort(() => 0.5 - Math.random())
      .slice(0, 3);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, projects]);

  if (!project) {
    // Still fetching — show a lightweight skeleton instead of the 404 flash.
    if (projectsLoading) {
      return (
        <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
          <div className="text-sm text-muted-foreground font-ui">LOADING HERO…</div>
        </div>
      );
    }
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
        <h1 className="text-2xl font-bold">{t("project.notFound")}</h1>
        <p className="text-muted-foreground">
          {t("project.notFoundDesc")}
        </p>
        <Link href="/home">
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
              href="/home"
              className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              <ArrowLeft className="size-4" />
              {t("project.backToExplore")}
            </Link>
          </nav>

          {/* Pixel eyebrow — matches /home HQ aesthetic. Shows the category
              and featured flag as a single machine-readout line. */}
          <div
            className="font-ui"
            style={{
              fontSize: 11,
              color: "var(--neon-green)",
              letterSpacing: 3,
              textShadow: "0 0 4px rgba(57,255,20,0.8)",
            }}
          >
            ▸ VIBEX://PROJECT ·{" "}
            <span style={{ color: "var(--neon-cyan)" }}>
              {project.category.toUpperCase()}
            </span>
            {project.featured && (
              <>
                {" · "}
                <span style={{ color: "var(--neon-yellow)" }}>★ FEATURED</span>
              </>
            )}
          </div>

          {/* Title — big pixel game-title treatment with the same yellow
              gradient used on /home HUNT TODAY'S LEGENDS. */}
          <h1
            className="font-pixel font-pixel-hero mt-2 text-[28px] sm:text-[38px] md:text-[48px]"
            style={{
              color: "#FFFCEB",
              letterSpacing: 3,
              lineHeight: 1.25,
              textShadow:
                "-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000, 3px 3px 0 #000, 4px 4px 0 #000, 5px 5px 0 #1a0a3a, 0 0 32px rgba(157,0,255,0.5)",
            }}
          >
            <span
              style={{
                background:
                  "linear-gradient(180deg, #FFE27D 0%, #FFD700 40%, #B8860B 100%)",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              {project.title}
            </span>
          </h1>

          {/* Tagline — font-retro to mirror the HQ hero subtitle rhythm. */}
          <p
            className="font-retro text-[17px] sm:text-[20px] md:text-[22px] mt-3 max-w-2xl"
            style={{
              color: "rgba(232,232,236,0.85)",
              textShadow: "0 2px 0 rgba(0,0,0,0.7)",
            }}
          >
            {project.tagline}
          </p>

          {/* Stats strip — font-ui pixel chrome so the numbers read like
              a game HUD rather than shadcn metadata. */}
          <div
            className="flex flex-wrap items-center gap-x-5 gap-y-2 mt-4 font-ui"
            style={{ fontSize: 10, letterSpacing: 1.5 }}
          >
            <span
              className="flex items-center gap-1.5"
              style={{ color: "var(--text-muted)" }}
            >
              <User className="size-3.5" />
              <b style={{ color: "var(--text)", fontWeight: "normal" }}>
                @{project.creatorName}
              </b>
            </span>
            <span
              className="flex items-center gap-1.5"
              style={{ color: "var(--text-muted)" }}
            >
              <Calendar className="size-3.5" />
              <time dateTime={project.createdAt}>{project.createdAt}</time>
            </span>
            <span
              className="flex items-center gap-1.5"
              style={{ color: "var(--text-muted)" }}
            >
              <Eye className="size-3.5" />
              <b style={{ color: "var(--text)", fontWeight: "normal" }}>
                {project.views.toLocaleString()}
              </b>{" "}
              VIEWS
            </span>
            <span
              className="flex items-center gap-1.5"
              style={{ color: "var(--text-muted)" }}
            >
              <ChevronUp className="size-3.5" style={{ color: "var(--neon-purple)" }} />
              <b style={{ color: "var(--neon-purple)", fontWeight: "normal" }}>
                {project.upvotes.toLocaleString()}
              </b>{" "}
              UPVOTES
            </span>
            <span
              className="flex items-center gap-1.5"
              style={{ color: "var(--text-muted)" }}
            >
              <Trophy
                className="size-3.5"
                style={{ color: "var(--neon-yellow)" }}
              />
              SCORE{" "}
              <b
                className="font-pixel"
                style={{
                  color: "var(--neon-yellow)",
                  fontWeight: "normal",
                  fontSize: 13,
                  textShadow: "0 0 8px rgba(250,204,21,0.6)",
                }}
              >
                {project.score}
              </b>
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

          {/* Launch Feedback Loop — owner-only in Phase 2, logged-in-only in Phase 1 */}
          {user && (
            <motion.div variants={fadeIn}>
              <FeedbackPanel projectId={project.id} />
            </motion.div>
          )}

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
        <div
          className="font-ui mb-4"
          style={{
            fontSize: 11,
            color: "var(--neon-green)",
            letterSpacing: 3,
            textShadow: "0 0 4px rgba(57,255,20,0.6)",
          }}
        >
          ▸ RELATED HEROES
        </div>
        <h2
          className="font-pixel font-pixel-hero mb-6 text-[20px] sm:text-[24px] md:text-[28px]"
          style={{
            color: "var(--text)",
            letterSpacing: 2,
            textShadow: "3px 3px 0 rgba(0,0,0,0.7)",
          }}
        >
          {t("project.relatedProjects")}
        </h2>
        <div className="grid grid-cols-1 gap-[22px] sm:grid-cols-2 lg:grid-cols-3">
          {projectsToCards(relatedProjects).map((card) => (
            <HeroCard key={card.id} data={card} />
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
