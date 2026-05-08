"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Play, Plus, GitBranch, ArrowRight } from "lucide-react";
import { workflows } from "@/lib/mock-data/workflows";
import { agents } from "@/lib/mock-data/agents";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useLang } from "@/lib/i18n";

function getAgent(id: string) {
  return agents.find((a) => a.id === id);
}

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export default function WorkflowsPage() {
  const { t } = useLang();
  const [search, setSearch] = useState("");

  const filtered = workflows.filter(
    (wf) =>
      wf.name.toLowerCase().includes(search.toLowerCase()) ||
      wf.description.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <main
      className="min-h-screen bg-background pt-24 pb-20"
      style={{ position: "relative", overflow: "hidden" }}
    >
      {/* Scanline overlay */}
      <div
        className="scanline-overlay"
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          background:
            "repeating-linear-gradient(0deg, transparent 0, transparent 2px, rgba(0,0,0,0.08) 2px, rgba(0,0,0,0.08) 4px)",
          pointerEvents: "none",
          zIndex: 1,
        }}
      />

      <div
        className="mx-auto max-w-5xl px-4 sm:px-6 space-y-10"
        style={{ position: "relative", zIndex: 2 }}
      >
        {/* Hero */}
        <motion.section
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="text-center space-y-3"
        >
          <div
            className="font-pixel"
            style={{ fontSize: 10, color: "#555", letterSpacing: 2 }}
          >
            {">"} VIBEXFORGE://WORKFLOWS v1.0
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">
            {t("workflows.marketplace")}
          </h1>
          <p
            className="font-pixel text-muted-foreground max-w-lg mx-auto"
            style={{ fontSize: 10 }}
          >
            {t("workflows.subtitle")}
          </p>
        </motion.section>

        {/* Search + Create */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("workflows.searchPlaceholder")}
            className="flex-1 w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-violet-500/40"
          />
          <Link href="/discover?tab=workflows">
            <button
              className="nes-btn is-primary"
              style={{ fontSize: 10, padding: "8px 16px" }}
            >
              <span className="flex items-center gap-1.5">
                <Plus className="size-3.5" />
                {t("workflows.create")}
              </span>
            </button>
          </Link>
        </div>

        {/* Workflow Grid */}
        <div className="rpgui-container framed" style={{ padding: 20 }}>
          {filtered.length === 0 ? (
            <div className="text-center py-12">
              <p
                className="font-pixel text-muted-foreground"
                style={{ fontSize: 10 }}
              >
                {t("workflows.noResults")}
              </p>
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2">
              {filtered.map((wf, index) => {
                const agentNames = wf.steps
                  .map((s) => getAgent(s.agentId)?.name ?? "Unknown")
                  .join(" \u2192 ");

                return (
                  <motion.div
                    key={wf.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.08 }}
                    className="glass-card-strong rounded-xl p-5 flex flex-col gap-3 retro-border"
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <GitBranch className="size-4 text-violet-400 shrink-0" />
                          <h3 className="font-semibold text-foreground truncate">
                            {wf.name}
                          </h3>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                          {wf.description}
                        </p>
                      </div>
                      <Badge
                        variant="outline"
                        className="shrink-0 border-violet-500/30 text-violet-300"
                      >
                        {wf.steps.length} {t("workflows.steps")}
                      </Badge>
                    </div>

                    {/* Pipeline preview */}
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {wf.steps.map((step, si) => {
                        const agent = getAgent(step.agentId);
                        return (
                          <span key={step.id} className="flex items-center gap-1">
                            <span
                              className="font-pixel text-xs px-2 py-0.5 rounded bg-violet-500/10 text-violet-300 border border-violet-500/20"
                              style={{ fontSize: 9 }}
                            >
                              {agent?.name ?? "?"}
                            </span>
                            {si < wf.steps.length - 1 && (
                              <ArrowRight className="size-3 text-violet-500/50" />
                            )}
                          </span>
                        );
                      })}
                    </div>

                    {/* Agent chain (text) */}
                    <p className="text-xs text-muted-foreground font-mono truncate">
                      {agentNames}
                    </p>

                    {/* Run button */}
                    <Link href={`/workflows/${wf.id}`}>
                      <Button
                        size="sm"
                        className="font-pixel w-full border-0 hover:-translate-x-0.5 hover:-translate-y-0.5 transition-transform"
                        style={{
                          background: "#F97316",
                          border: "2px solid #FFE27D",
                          color: "#1A0F00",
                          boxShadow: "3px 3px 0 #000, inset 0 5px 0 rgba(255,255,255,0.12), inset 0 -5px 0 rgba(0,0,0,0.2)",
                          fontSize: 10,
                          letterSpacing: 2,
                        }}
                      >
                        <Play className="size-3.5 mr-1.5" />
                        {t("workflows.run")}
                      </Button>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
