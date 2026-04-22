"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  Eye, ChevronUp, Play, Share2,
  ArrowLeft, BarChart3, Zap, Star,
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useLang } from "@/lib/i18n";
import { useProjects } from "@/lib/use-data";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

const fadeIn = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

function StatCard({ label, value, icon: Icon, color, change }: {
  label: string; value: string | number; icon: typeof Eye; color: string; change?: number;
}) {
  return (
    <div className="rpgui-container framed" style={{ padding: 12 }}>
      <div className="flex items-center gap-2 mb-1">
        <Icon className="size-3.5" style={{ color }} />
        <span className="font-pixel text-[7px] uppercase tracking-wider text-muted-foreground/60">{label}</span>
      </div>
      <div className="flex items-end gap-2">
        <span className="text-2xl font-bold" style={{ color }}>
          {typeof value === "number" ? value.toLocaleString() : value}
        </span>
        {change !== undefined && (
          <span className={`text-xs font-bold mb-1 ${change >= 0 ? "text-emerald-400" : "text-red-400"}`}>
            {change >= 0 ? "+" : ""}{change}%
          </span>
        )}
      </div>
    </div>
  );
}

function MiniBarChart({ data, color, height = 60 }: { data: number[]; color: string; height?: number }) {
  const max = Math.max(...data, 1);
  const barWidth = 100 / data.length;

  return (
    <svg viewBox={`0 0 100 ${height}`} className="w-full" style={{ height }}>
      {data.map((v, i) => {
        const h = (v / max) * (height - 4);
        return (
          <rect
            key={i}
            x={i * barWidth + 1}
            y={height - h}
            width={barWidth - 2}
            height={h}
            fill={color}
            opacity={0.7 + (i / data.length) * 0.3}
            rx={1}
          />
        );
      })}
    </svg>
  );
}

function ProjectRow({ project }: { project: { id: string; title: string; score: number; views: number; upvotes: number; plays: number; shares: number; category: string } }) {
  return (
    <Link
      href={`/project/${project.id}`}
      className="group flex items-center gap-4 py-3 px-3 rounded-lg transition-colors hover:bg-white/[0.03]"
    >
      <div className="flex-1 min-w-0">
        <span className="text-sm font-semibold truncate group-hover:text-violet-400 transition-colors">
          {project.title}
        </span>
        <div className="flex items-center gap-3 mt-0.5 text-[11px] text-muted-foreground/60">
          <span><Eye className="inline size-3" /> {project.views.toLocaleString()}</span>
          <span><ChevronUp className="inline size-3" /> {project.upvotes}</span>
          <span><Play className="inline size-3" /> {project.plays}</span>
        </div>
      </div>
      <Badge variant="secondary" className="text-[10px] bg-white/5 border-white/10 shrink-0">
        {project.category}
      </Badge>
      <span className="font-mono text-sm font-bold text-amber-400 shrink-0">
        {project.score}
      </span>
    </Link>
  );
}

export default function CreatorDashboardPage() {
  const { lang } = useLang();
  const { user } = useAuth();
  const { data: allProjects } = useProjects();

  // Filter to creator's projects (demo: show all for demo user)
  const myProjects = useMemo(() => {
    if (!user) return [];
    return allProjects.filter((p) => p.creatorId === "c1" || p.creatorName === "VibeX Trainer");
  }, [allProjects, user]);

  // Compute aggregated stats
  const stats = useMemo(() => {
    const totalViews = myProjects.reduce((s, p) => s + p.views, 0);
    const totalUpvotes = myProjects.reduce((s, p) => s + p.upvotes, 0);
    const totalPlays = myProjects.reduce((s, p) => s + p.plays, 0);
    const totalShares = myProjects.reduce((s, p) => s + p.shares, 0);
    const avgScore = myProjects.length > 0
      ? Math.round(myProjects.reduce((s, p) => s + p.score, 0) / myProjects.length)
      : 0;
    return { totalViews, totalUpvotes, totalPlays, totalShares, avgScore };
  }, [myProjects]);

  // Simulated weekly trend data (in production, from /api/data/analytics)
  const weeklyViews = useMemo(() => {
    const base = stats.totalViews / 5 + 100;
    return [0.8, 1.1, 0.9, 1.3, 1.0, 0.7, 1.2].map(m => Math.floor(base * m));
  }, [stats.totalViews]);

  const weeklyUpvotes = useMemo(() => {
    const base = stats.totalUpvotes / 5 + 10;
    return [0.9, 1.2, 0.8, 1.1, 1.3, 0.6, 1.0].map(m => Math.floor(base * m));
  }, [stats.totalUpvotes]);

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center">
        <div className="rpgui-container framed" style={{ padding: 40 }}>
          <span className="font-pixel text-[10px] text-muted-foreground">
            {lang === "zh" ? "请先登录查看你的数据面板" : "Log in to view your creator dashboard"}
          </span>
          <Link href="/login" className="block mt-4">
            <Button className="bg-violet-600 hover:bg-violet-500 text-white">
              {lang === "zh" ? "登录" : "Log In"}
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.08 } } }}
      className="max-w-5xl mx-auto px-4 sm:px-6 py-12"
    >
      {/* Header */}
      <motion.div variants={fadeIn} className="mb-8">
        <Link href="/profile" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4">
          <ArrowLeft className="size-4" />
          {lang === "zh" ? "返回个人资料" : "Back to Profile"}
        </Link>
        <div className="flex items-center gap-3">
          <BarChart3 className="size-5 text-violet-400" />
          <h1 className="text-3xl font-bold tracking-tight">
            {lang === "zh" ? "创作者" : "Creator"}{" "}
            <span className="text-gradient">{lang === "zh" ? "数据面板" : "Dashboard"}</span>
          </h1>
        </div>
        <p className="mt-2 text-sm text-muted-foreground">
          {lang === "zh"
            ? `你有 ${myProjects.length} 个项目，平均分数 ${stats.avgScore}`
            : `You have ${myProjects.length} projects with an average score of ${stats.avgScore}`}
        </p>
      </motion.div>

      {/* Stats Grid */}
      <motion.div variants={fadeIn} className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-8">
        <StatCard label={lang === "zh" ? "总浏览" : "Views"} value={stats.totalViews} icon={Eye} color="#39FF14" change={12} />
        <StatCard label={lang === "zh" ? "总点赞" : "Upvotes"} value={stats.totalUpvotes} icon={ChevronUp} color="#8b5cf6" change={8} />
        <StatCard label={lang === "zh" ? "总播放" : "Plays"} value={stats.totalPlays} icon={Play} color="#06B6D4" change={15} />
        <StatCard label={lang === "zh" ? "总分享" : "Shares"} value={stats.totalShares} icon={Share2} color="#EC4899" change={22} />
        <StatCard label={lang === "zh" ? "平均分" : "Avg Score"} value={stats.avgScore} icon={Star} color="#FACC15" />
      </motion.div>

      {/* Charts Row */}
      <motion.div variants={fadeIn} className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        <div className="rpgui-container framed" style={{ padding: 16 }}>
          <span className="font-pixel text-[8px] uppercase tracking-widest text-emerald-400 block mb-3">
            {lang === "zh" ? "本周浏览趋势" : "WEEKLY VIEWS"}
          </span>
          <MiniBarChart data={weeklyViews} color="#39FF14" />
        </div>
        <div className="rpgui-container framed" style={{ padding: 16 }}>
          <span className="font-pixel text-[8px] uppercase tracking-widest text-violet-400 block mb-3">
            {lang === "zh" ? "本周点赞趋势" : "WEEKLY UPVOTES"}
          </span>
          <MiniBarChart data={weeklyUpvotes} color="#8b5cf6" />
        </div>
      </motion.div>

      <Separator className="my-6 bg-white/[0.06]" />

      {/* Project Performance Table */}
      <motion.div variants={fadeIn}>
        <div className="rpgui-container framed" style={{ padding: 16 }}>
          <div className="flex items-center justify-between mb-4">
            <span className="font-pixel text-[8px] uppercase tracking-widest text-violet-400">
              {lang === "zh" ? "项目表现" : "PROJECT PERFORMANCE"}
            </span>
            <Badge variant="secondary" className="text-[9px] bg-white/5 border-white/10">
              {myProjects.length} {lang === "zh" ? "个项目" : "projects"}
            </Badge>
          </div>
          <div className="divide-y divide-white/[0.04]">
            {myProjects.length > 0 ? (
              myProjects.sort((a, b) => b.score - a.score).map((p) => (
                <ProjectRow key={p.id} project={p} />
              ))
            ) : (
              <div className="py-8 text-center text-sm text-muted-foreground">
                {lang === "zh" ? "还没有项目，去发布你的第一个！" : "No projects yet. Launch your first one!"}
                <Link href="/launch" className="block mt-3">
                  <Button size="sm" className="bg-violet-600 hover:bg-violet-500 text-white gap-2">
                    <Zap className="size-3" />
                    {lang === "zh" ? "发布项目" : "Launch Project"}
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
