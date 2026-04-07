"use client";

import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { useLang } from "@/lib/i18n";

interface PreviewDemoProps {
  demoUrl?: string;
}

export function PreviewDemo({ demoUrl }: PreviewDemoProps) {
  const { t } = useLang();
  if (demoUrl) {
    return (
      <div className="min-h-64 sm:min-h-80 md:min-h-[400px] p-4">
        <div className="overflow-hidden rounded-lg border border-white/10 bg-black/40 h-64 sm:h-80 md:h-[420px]">
          {/* macOS chrome */}
          <div className="flex items-center gap-2 border-b border-white/10 bg-white/[0.03] px-4 py-2.5">
            <div className="size-3 rounded-full bg-red-500/70" />
            <div className="size-3 rounded-full bg-yellow-500/70" />
            <div className="size-3 rounded-full bg-green-500/70" />
            <span className="ml-3 text-xs text-muted-foreground truncate">{demoUrl}</span>
          </div>
          <iframe
            src={demoUrl}
            className="w-full h-[calc(100%-36px)] border-0"
            sandbox="allow-scripts allow-same-origin"
            title="App preview"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-64 sm:min-h-80 md:min-h-[400px] p-4">
      <div className="overflow-hidden rounded-lg border border-white/10 bg-black/40 h-64 sm:h-80 md:h-[420px]">
        {/* macOS chrome */}
        <div className="flex items-center gap-2 border-b border-white/10 bg-white/[0.03] px-4 py-2.5">
          <div className="size-3 rounded-full bg-red-500/70" />
          <div className="size-3 rounded-full bg-yellow-500/70" />
          <div className="size-3 rounded-full bg-green-500/70" />
          <span className="ml-3 text-xs text-muted-foreground">app-preview</span>
          <Badge className="ml-auto bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[10px]">
            {t("demo.livePreview")}
          </Badge>
        </div>

        {/* Mock dashboard */}
        <div className="flex h-[calc(100%-36px)]">
          {/* Sidebar */}
          <div className="w-48 border-r border-white/5 bg-white/[0.02] p-3 space-y-3 shrink-0">
            <div className="h-6 w-24 rounded bg-white/5 animate-pulse" />
            <div className="space-y-2 mt-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className={`h-8 rounded-lg px-3 flex items-center gap-2 ${
                    i === 1 ? "bg-violet-600/20 border border-violet-500/20" : "bg-white/[0.02]"
                  }`}
                >
                  <div className={`size-3 rounded ${i === 1 ? "bg-violet-500/50" : "bg-white/10"}`} />
                  <div className={`h-2 rounded ${i === 1 ? "w-16 bg-violet-400/30" : "w-12 bg-white/5"}`} />
                </div>
              ))}
            </div>
          </div>

          {/* Main content */}
          <div className="flex-1 p-4 space-y-4 overflow-hidden">
            {/* Header row */}
            <div className="flex items-center justify-between">
              <div className="h-5 w-32 rounded bg-white/5 animate-pulse" />
              <div className="flex gap-2">
                <div className="h-7 w-16 rounded-md bg-violet-600/20 animate-pulse" />
                <div className="h-7 w-16 rounded-md bg-white/5 animate-pulse" />
              </div>
            </div>

            {/* Stats cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[
                { color: "violet", value: "2,847" },
                { color: "emerald", value: "94.2%" },
                { color: "amber", value: "1.2s" },
              ].map((stat, i) => (
                <div key={i} className="rounded-lg border border-white/5 bg-white/[0.02] p-3">
                  <div className="h-2 w-12 rounded bg-white/5 mb-2" />
                  <div
                    className={`text-lg font-bold ${
                      stat.color === "violet"
                        ? "text-violet-400"
                        : stat.color === "emerald"
                          ? "text-emerald-400"
                          : "text-amber-400"
                    }`}
                  >
                    {stat.value}
                  </div>
                </div>
              ))}
            </div>

            {/* Chart placeholder */}
            <div className="rounded-lg border border-white/5 bg-white/[0.02] p-4 flex-1">
              <div className="h-2 w-20 rounded bg-white/5 mb-4" />
              <div className="flex items-end gap-1.5 h-24">
                {[40, 65, 45, 80, 55, 70, 90, 60, 75, 85, 50, 95].map((h, i) => (
                  <motion.div
                    key={i}
                    initial={{ height: 0 }}
                    animate={{ height: `${h}%` }}
                    transition={{ duration: 0.6, delay: i * 0.05 }}
                    className="flex-1 rounded-t bg-gradient-to-t from-violet-600/40 to-violet-400/20"
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
