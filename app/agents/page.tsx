"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  Play,
  GitFork,
  Bot,
  CheckCircle,
  TrendingUp,
  ThumbsUp,
  Cpu,
  Wrench,
} from "lucide-react";
import { agents } from "@/lib/mock-data/agents";
import type { AgentCategory } from "@/lib/agent-types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLang } from "@/lib/i18n";

const categoryFilters: { key: AgentCategory | "all"; label: string; zhLabel: string }[] = [
  { key: "all", label: "All", zhLabel: "全部" },
  { key: "coding", label: "Coding", zhLabel: "编程" },
  { key: "research", label: "Research", zhLabel: "研究" },
  { key: "creative", label: "Creative", zhLabel: "创作" },
  { key: "automation", label: "Automation", zhLabel: "自动化" },
  { key: "assistant", label: "Assistant", zhLabel: "助手" },
  { key: "trading", label: "Trading", zhLabel: "交易" },
  { key: "education", label: "Education", zhLabel: "教育" },
];

const modelLabels: Record<string, string> = {
  "claude-haiku-4-5": "Haiku 4.5",
  "claude-sonnet-4-6": "Sonnet 4.6",
  "claude-opus-4-6": "Opus 4.6",
};

function formatNumber(n: number): string {
  if (n >= 10000) return `${(n / 1000).toFixed(0)}k`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return n.toString();
}

function AgentCard({
  agent,
  size = "normal",
}: {
  agent: (typeof agents)[number];
  size?: "featured" | "normal";
}) {
  const { lang, t } = useLang();
  const router = useRouter();
  const isFeatured = size === "featured";

  return (
    <Link href={`/agents/${agent.id}`}>
      <motion.div
        whileHover={{ y: -2, scale: 1.01 }}
        transition={{ duration: 0.2 }}
        className={`glass-card-strong group relative overflow-hidden rounded-xl retro-border p-5 transition-all hover:border-violet-500/30 hover:shadow-lg hover:shadow-violet-500/5 ${
          isFeatured ? "md:col-span-1" : ""
        }`}
      >
        {/* Category badge */}
        <div className="mb-3 flex items-center justify-between">
          <Badge
            variant="outline"
            className="border-violet-500/30 bg-violet-500/10 text-violet-400 text-[10px] uppercase tracking-wider"
          >
            {lang === "zh"
              ? categoryFilters.find((c) => c.key === agent.category)?.zhLabel
              : agent.category}
          </Badge>
          <span className="inline-flex items-center gap-1 rounded-full bg-fuchsia-500/10 px-2 py-0.5 text-[10px] font-medium text-fuchsia-400">
            <Cpu className="size-2.5" />
            {modelLabels[agent.model] ?? agent.model}
          </span>
        </div>

        {/* Name + description */}
        <h3
          className={`font-bold tracking-tight text-foreground group-hover:text-violet-300 transition-colors ${
            isFeatured ? "text-lg" : "text-base"
          }`}
        >
          {agent.name}
        </h3>
        <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground line-clamp-2">
          {agent.description}
        </p>

        {/* Tools */}
        <div className="mt-3 flex flex-wrap gap-1.5">
          {agent.tools.map((tool) => (
            <span
              key={tool}
              className="inline-flex items-center gap-1 rounded bg-white/5 px-1.5 py-0.5 text-[10px] text-muted-foreground"
            >
              <Wrench className="size-2.5" />
              {tool}
            </span>
          ))}
        </div>

        {/* Stats row */}
        <div className="mt-4 flex items-center gap-4 text-muted-foreground">
          <span className="flex items-center gap-1 font-pixel text-[7px]">
            <Play className="size-3 text-emerald-400" />
            {formatNumber(agent.runs)}
          </span>
          <span className="flex items-center gap-1 font-pixel text-[7px]">
            <CheckCircle className="size-3 text-sky-400" />
            {agent.successRate}%
          </span>
          <span className="flex items-center gap-1 font-pixel text-[7px]">
            <ThumbsUp className="size-3 text-amber-400" />
            {formatNumber(agent.upvotes)}
          </span>
        </div>

        {/* Footer: creator + actions */}
        <div className="mt-4 flex items-center justify-between border-t border-white/[0.04] pt-3">
          <span className="text-[11px] text-muted-foreground">
            {agent.creatorName}
          </span>
          <div className="flex items-center gap-2">
            <button
              className="nes-btn"
              style={{ fontSize: 9, padding: "4px 12px" }}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                router.push(`/agents/builder?fork=${agent.id}`);
              }}
            >
              <GitFork className="mr-1 inline size-3" />
              {t("agentPage.fork")}
            </button>
            <button
              className="nes-btn is-success"
              style={{ fontSize: 9, padding: "4px 12px" }}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                router.push(`/agents/${agent.id}`);
              }}
            >
              <Play className="mr-1 inline size-3" />
              {t("agentPage.run")}
            </button>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}

export default function AgentsPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const { lang } = useLang();

  const filtered =
    selectedCategory === "all"
      ? agents
      : agents.filter((a) => a.category === selectedCategory);

  const featuredAgents = agents.filter((a) => a.featured).slice(0, 3);

  return (
    <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6">
      {/* Background gradient orb */}
      <div className="pointer-events-none absolute -top-32 left-1/2 -translate-x-1/2 h-[480px] w-[480px] rounded-full bg-violet-600/8 blur-[120px]" />

      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative mb-12 text-center"
      >
        <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-violet-500/20 bg-violet-500/10 px-4 py-1.5">
          <Bot className="size-3.5 text-violet-400" />
          <span className="text-xs font-medium tracking-wide text-violet-400">
            Agent Marketplace
          </span>
        </div>
        <h1 className="font-pixel text-[12px] tracking-widest text-emerald-400 mb-3" style={{ textShadow: "0 0 10px rgba(57,255,20,0.3)" }}>
          {"> VIBEX://AGENT-MARKET"}
        </h1>
        <h2 className="text-4xl font-bold tracking-tight sm:text-5xl">
          Agent{" "}
          <span className="text-gradient">Marketplace</span>
        </h2>
        <p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-muted-foreground">
          发现、运行和部署 AI Agent。每个 Agent 都是一个可执行的 AI 工作流。
        </p>
      </motion.div>

      {/* Category filter pills */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="mb-10 flex flex-wrap items-center justify-center gap-2"
      >
        {categoryFilters.map((cat) => {
          const isActive = selectedCategory === cat.key;
          return (
            <button
              key={cat.key}
              onClick={() => setSelectedCategory(cat.key)}
              className={`font-pixel text-[8px] px-3.5 py-1.5 transition-all retro-border ${
                isActive
                  ? "border-violet-500/40 bg-violet-500/20 text-violet-300"
                  : "border-white/[0.06] bg-white/[0.03] text-muted-foreground hover:border-white/10 hover:text-foreground"
              }`}
            >
              {lang === "zh" ? cat.zhLabel : cat.label}
            </button>
          );
        })}
      </motion.div>

      {/* Featured agents */}
      {selectedCategory === "all" && featuredAgents.length > 0 && (
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
          className="mb-12"
        >
          <div className="mb-5 flex items-center gap-2">
            <TrendingUp className="size-4 text-amber-400" />
            <h2 className="text-sm font-semibold tracking-wide text-foreground uppercase">
              {lang === "zh" ? "精选 Agent" : "Featured Agents"}
            </h2>
          </div>
          <div className="rpgui-container framed" style={{ padding: 16 }}>
            <div className="grid gap-4 md:grid-cols-3">
              {featuredAgents.map((agent) => (
                <AgentCard key={agent.id} agent={agent} size="featured" />
              ))}
            </div>
          </div>
        </motion.section>
      )}

      {/* All agents grid */}
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        <div className="mb-5 flex items-center gap-2">
          <Sparkles className="size-4 text-violet-400" />
          <h2 className="text-sm font-semibold tracking-wide text-foreground uppercase">
            {lang === "zh" ? "全部 Agent" : "All Agents"}
            <span className="ml-2 text-xs font-normal text-muted-foreground">
              ({filtered.length})
            </span>
          </h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((agent) => (
            <AgentCard key={agent.id} agent={agent} />
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="py-20 text-center text-sm text-muted-foreground">
            {lang === "zh"
              ? "该分类暂无 Agent"
              : "No agents found in this category"}
          </div>
        )}
      </motion.section>
    </div>
  );
}
