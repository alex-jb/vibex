"use client";

import { Suspense, useState } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Compass, Folder, Bot, GitBranch, Search } from "lucide-react";
import { ProjectsTab } from "@/components/discover/projects-tab";
import { AgentsTab } from "@/components/discover/agents-tab";
import { WorkflowsTab } from "@/components/discover/workflows-tab";
import { useLang } from "@/lib/i18n";

type Tab = "projects" | "agents" | "workflows";

const tabs: {
  key: Tab;
  i18nKey: string;
  icon: typeof Folder;
  count: number;
}[] = [
  { key: "projects", i18nKey: "discover.tabProjects", icon: Folder, count: 12 },
  { key: "agents", i18nKey: "discover.tabAgents", icon: Bot, count: 8 },
  { key: "workflows", i18nKey: "discover.tabWorkflows", icon: GitBranch, count: 5 },
];

function DiscoverContent() {
  const { t } = useLang();
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [search, setSearch] = useState("");

  const rawTab = searchParams.get("tab");
  const activeTab: Tab =
    rawTab === "agents" || rawTab === "workflows" ? rawTab : "projects";

  function setTab(newTab: Tab) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", newTab);
    router.replace(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-16">
      {/* Scanline overlay */}
      <div
        className="pointer-events-none fixed inset-0 z-50"
        style={{
          background:
            "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.03) 2px, rgba(0,0,0,0.03) 4px)",
        }}
      />

      {/* Background gradient orb */}
      <div className="pointer-events-none absolute -top-32 left-1/2 -translate-x-1/2 h-[480px] w-[480px] rounded-full bg-violet-600/8 blur-[120px]" />

      {/* Terminal header bar */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative mb-6"
      >
        <div
          className="rounded-t-lg px-4 py-2 flex items-center gap-2"
          style={{
            background: "rgba(30,30,40,0.85)",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          <span
            className="inline-block w-3 h-3 rounded-full"
            style={{ background: "#FF5F56" }}
          />
          <span
            className="inline-block w-3 h-3 rounded-full"
            style={{ background: "#FFBD2E" }}
          />
          <span
            className="inline-block w-3 h-3 rounded-full"
            style={{ background: "#27C93F" }}
          />
          <span
            className="ml-3 text-xs tracking-widest"
            style={{
              fontFamily: "var(--font-pixel), monospace",
              color: "#39FF14",
              textShadow: "0 0 8px rgba(57,255,20,0.4)",
            }}
          >
            VIBEX://DISCOVER v2.0
          </span>
        </div>
      </motion.div>

      {/* Page Hero */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative text-center mb-10"
      >
        <div className="inline-flex items-center gap-2 rounded-full border border-violet-500/20 bg-violet-500/10 px-4 py-1.5 mb-5">
          <Compass className="size-3.5 text-violet-400" />
          <span className="text-xs font-medium text-violet-400 tracking-wide">
            {t("discover.badge")}
          </span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">
          {t("discover.title")}{" "}
          <span className="text-gradient">{t("discover.titleHighlight")}</span>
        </h1>
        <p className="mt-3 text-muted-foreground max-w-lg mx-auto text-sm leading-relaxed">
          {t("discover.description")}
        </p>
      </motion.div>

      {/* Search Bar */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.05 }}
        className="relative max-w-md mx-auto mb-8"
      >
        <div
          className="retro-border flex items-center gap-2 px-3 py-2 rounded-md"
          style={{
            background: "rgba(20,20,30,0.7)",
            border: "2px solid rgba(139,92,246,0.3)",
          }}
        >
          <Search className="size-4 text-violet-400 shrink-0" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search projects, agents, workflows..."
            className="w-full bg-transparent text-sm text-white placeholder-white/30 outline-none"
            style={{ fontFamily: "var(--font-pixel), monospace" }}
          />
        </div>
      </motion.div>

      {/* Tab Switcher */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="flex gap-3 mb-10 justify-center flex-wrap"
      >
        {tabs.map((tab) => {
          const isActive = activeTab === tab.key;
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              onClick={() => setTab(tab.key)}
              className="glass-card-strong relative flex items-center gap-2 px-5 py-3 rounded-lg transition-all duration-200"
              style={{
                fontFamily: "var(--font-pixel), monospace",
                fontSize: 11,
                background: isActive
                  ? "rgba(139,92,246,0.15)"
                  : "rgba(30,30,40,0.6)",
                border: isActive
                  ? "1px solid rgba(139,92,246,0.4)"
                  : "1px solid rgba(255,255,255,0.06)",
                color: isActive ? "#c4b5fd" : "rgba(255,255,255,0.5)",
                boxShadow: isActive
                  ? "0 4px 20px rgba(139,92,246,0.15), inset 0 -2px 0 rgba(139,92,246,0.6)"
                  : "none",
                cursor: "pointer",
              }}
            >
              <Icon
                className="size-4"
                style={{
                  color: isActive ? "#a78bfa" : "rgba(255,255,255,0.4)",
                }}
              />
              <span>{t(tab.i18nKey as Parameters<typeof t>[0])}</span>
              <span
                className="ml-1 inline-flex items-center justify-center rounded-full text-[9px] leading-none"
                style={{
                  fontFamily: "var(--font-pixel), monospace",
                  background: isActive
                    ? "rgba(139,92,246,0.3)"
                    : "rgba(255,255,255,0.08)",
                  color: isActive ? "#c4b5fd" : "rgba(255,255,255,0.4)",
                  padding: "3px 7px",
                  minWidth: 20,
                }}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </motion.div>

      {/* Tab Content with RPG frame and animation */}
      <div className="rpgui-container framed" style={{ padding: "1.5rem" }}>
        <AnimatePresence mode="wait">
          {activeTab === "projects" && (
            <motion.div
              key="projects"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25 }}
            >
              <ProjectsTab />
            </motion.div>
          )}
          {activeTab === "agents" && (
            <motion.div
              key="agents"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25 }}
            >
              <AgentsTab />
            </motion.div>
          )}
          {activeTab === "workflows" && (
            <motion.div
              key="workflows"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25 }}
            >
              <WorkflowsTab />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default function DiscoverPage() {
  return (
    <Suspense>
      <DiscoverContent />
    </Suspense>
  );
}
