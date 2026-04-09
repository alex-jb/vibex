"use client";

import { useState } from "react";
import { MessageSquare, Code2, Monitor, Play, Maximize2, Share2, Eye } from "lucide-react";
import { useLang } from "@/lib/i18n";
import { ChatDemo } from "./chat-demo";
import { SandboxDemo } from "./sandbox-demo";
import { PreviewDemo } from "./preview-demo";
import { EmbeddedDemo } from "./embedded-demo";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface PlayableDemoProps {
  demoType: "chat" | "sandbox" | "preview" | "embedded";
  demoUrl?: string;
  demoContent?: string;
  projectTitle: string;
  projectId: string;
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function getDemoIcon(demoType: PlayableDemoProps["demoType"]) {
  switch (demoType) {
    case "chat":
      return <MessageSquare className="size-4" />;
    case "sandbox":
      return <Code2 className="size-4" />;
    case "preview":
      return <Monitor className="size-4" />;
    case "embedded":
      return <Play className="size-4" />;
  }
}

function getDemoLabel(demoType: PlayableDemoProps["demoType"], t: (key: string) => string) {
  switch (demoType) {
    case "chat":
      return t("demo.liveChat");
    case "sandbox":
      return t("demo.codeSandbox");
    case "preview":
      return t("demo.appPreview");
    case "embedded":
      return t("demo.embeddedPlayer");
  }
}

/* ------------------------------------------------------------------ */
/*  Main PlayableDemo Component                                        */
/* ------------------------------------------------------------------ */

export default function PlayableDemo({
  demoType,
  demoUrl,
  projectTitle,
  projectId: _projectId, // reserved for future analytics tracking
}: PlayableDemoProps) {
  const { t } = useLang();
  const [playCount] = useState(() => Math.floor(Math.random() * 500) + 100);

  return (
    <div className="glass-card-strong border-glow overflow-hidden rounded-xl noise-bg min-h-[450px]">
      {/* Header bar */}
      <div className="flex items-center gap-3 border-b border-white/5 bg-white/[0.02] px-5 py-3.5">
        <span className="text-violet-400">{getDemoIcon(demoType)}</span>
        <span className="text-sm font-medium">{getDemoLabel(demoType, t)}</span>
        <div className="flex items-center gap-1.5 ml-2">
          <div className="size-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs font-medium text-emerald-400">{t("demo.live")}</span>
        </div>
        <div className="ml-auto">
          <button className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
            <Maximize2 className="size-3.5" />
            {t("demo.fullScreen")}
          </button>
        </div>
      </div>

      {/* Demo content */}
      {demoType === "chat" && <ChatDemo projectTitle={projectTitle} />}
      {demoType === "sandbox" && <SandboxDemo />}
      {demoType === "preview" && <PreviewDemo demoUrl={demoUrl} />}
      {demoType === "embedded" && <EmbeddedDemo demoUrl={demoUrl} />}

      {/* Footer */}
      <div className="flex items-center justify-between border-t border-white/5 px-5 py-3">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground/60">
          <Eye className="size-3.5" />
          <span>
            {playCount.toLocaleString()} {t("demo.plays")}
          </span>
        </div>
        <button className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
          <Share2 className="size-3.5" />
          {t("demo.share")}
        </button>
      </div>
    </div>
  );
}
