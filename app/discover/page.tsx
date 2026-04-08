"use client";

import { Suspense } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Compass } from "lucide-react";
import { ProjectsTab } from "@/components/discover/projects-tab";
import { AgentsTab } from "@/components/discover/agents-tab";
import { WorkflowsTab } from "@/components/discover/workflows-tab";
import { useLang } from "@/lib/i18n";

type Tab = "projects" | "agents" | "workflows";

const tabs: { key: Tab; i18nKey: string }[] = [
  { key: "projects", i18nKey: "discover.tabProjects" },
  { key: "agents", i18nKey: "discover.tabAgents" },
  { key: "workflows", i18nKey: "discover.tabWorkflows" },
];

function DiscoverContent() {
  const { t } = useLang();
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

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
      {/* Background gradient orb */}
      <div className="pointer-events-none absolute -top-32 left-1/2 -translate-x-1/2 h-[480px] w-[480px] rounded-full bg-violet-600/8 blur-[120px]" />

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

      {/* Tab Switcher */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="flex gap-2 mb-10 justify-center"
      >
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setTab(tab.key)}
            className={
              activeTab === tab.key ? "nes-btn is-primary" : "nes-btn"
            }
            style={{ fontSize: 10, padding: "6px 16px" }}
          >
            {t(tab.i18nKey as Parameters<typeof t>[0])}
          </button>
        ))}
      </motion.div>

      {/* Tab Content */}
      {activeTab === "projects" && <ProjectsTab />}
      {activeTab === "agents" && <AgentsTab />}
      {activeTab === "workflows" && <WorkflowsTab />}
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
