"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  X,
  Copy,
  Check,
  AtSign,
  Share2,
  Link,
  Code,
  QrCode,
  Sparkles,
  MessageSquare,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ShareModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project: {
    id: string;
    title: string;
    tagline: string;
    category: string;
    creatorName: string;
  };
}

type Platform = "twitter" | "xiaohongshu" | "douyin";

const platforms: { key: Platform; label: string; icon: typeof AtSign }[] = [
  { key: "twitter", label: "Twitter/X", icon: AtSign },
  { key: "xiaohongshu", label: "\u5C0F\u7EA2\u4E66", icon: Sparkles },
  { key: "douyin", label: "\u6296\u97F3", icon: MessageSquare },
];

function generateSocialCopy(
  platform: Platform,
  project: ShareModalProps["project"]
): string {
  const { id, title, tagline, category } = project;
  const playUrl = `https://play.vibecode.hunt/p/${id}`;

  switch (platform) {
    case "twitter":
      return `Just discovered ${title} on @VibeCodeHunt \u2014 ${tagline} \uD83D\uDD25\n\nTry it yourself: ${playUrl}\n\n#VibeCoding #AI`;
    case "xiaohongshu":
      return `\u53D1\u73B0\u4E00\u4E2A\u8D85\u9177\u7684AI\u9879\u76EE\uFF01\u2728\n\n\u3010${title}\u3011\n${tagline}\n\n\u70B9\u51FB\u76F4\u63A5\u4F53\u9A8C\uD83D\uDC49 play.vibecode.hunt/p/${id}\n\n#AI\u521B\u4F5C #VibeCoding #${category}`;
    case "douyin":
      return `\u8FD9\u4E2AAI\u592A\u79BB\u8C31\u4E86\uD83D\uDE02 ${title} \u2014 ${tagline}\n\n\u94FE\u63A5\u5728\u4E3B\u9875 #AI #VibeCoding`;
  }
}

function CopyButton({
  text,
  label,
  variant = "ghost",
  size = "icon-xs",
  className = "",
}: {
  text: string;
  label?: string;
  variant?: "ghost" | "outline" | "secondary";
  size?: "icon-xs" | "xs" | "sm";
  className?: string;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(text);
    setCopied(true);
  }, [text]);

  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(timer);
  }, [copied]);

  return (
    <Button
      variant={variant}
      size={size}
      className={className}
      onClick={handleCopy}
    >
      {copied ? (
        <>
          <Check className="h-3 w-3 text-emerald-400" />
          {label !== undefined && (
            <span className="text-emerald-400">Copied!</span>
          )}
        </>
      ) : (
        <>
          <Copy className="h-3 w-3" />
          {label !== undefined && <span>{label}</span>}
        </>
      )}
    </Button>
  );
}

export function ShareModal({ open, onOpenChange, project }: ShareModalProps) {
  const [activePlatform, setActivePlatform] = useState<Platform>("twitter");

  const playUrl = `https://play.vibecode.hunt/p/${project.id}`;
  const embedCode = `<iframe src="https://play.vibecode.hunt/embed/${project.id}" width="100%" height="500" style="border:none;border-radius:12px" />`;

  // Close on Escape
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onOpenChange(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onOpenChange]);

  // Lock body scroll when open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const socialCopy = generateSocialCopy(activePlatform, project);

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            onClick={() => onOpenChange(false)}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <div
              className="pointer-events-auto relative w-full max-w-lg noise-bg glass-card-strong rounded-2xl border border-white/10 shadow-[0_24px_80px_-16px_rgba(139,92,246,0.2)] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Decorative top gradient */}
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-violet-500/50 to-transparent" />

              <div className="max-h-[85vh] overflow-y-auto scrollbar-hide p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-600/20 to-fuchsia-600/20 border border-white/[0.06]">
                      <Share2 className="h-4 w-4 text-violet-400" />
                    </div>
                    <div>
                      <h2 className="text-base font-semibold">
                        Share{" "}
                        <span className="text-gradient">{project.title}</span>
                      </h2>
                      <p className="text-xs text-muted-foreground">
                        by {project.creatorName}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    onClick={() => onOpenChange(false)}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                {/* Playable Link */}
                <div className="glass-card-strong rounded-xl p-4 mb-4">
                  <div className="flex items-center gap-2 mb-2.5">
                    <Link className="h-3.5 w-3.5 text-violet-400" />
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Playable Link
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 rounded-lg bg-white/[0.04] border border-white/[0.06] px-3 py-2 font-mono text-sm text-foreground truncate">
                      {playUrl}
                    </div>
                    <CopyButton
                      text={playUrl}
                      label="Copy"
                      variant="secondary"
                      size="sm"
                      className="shrink-0 bg-gradient-to-r from-violet-600/80 to-fuchsia-600/80 text-white border-0 hover:from-violet-600 hover:to-fuchsia-600"
                    />
                  </div>
                </div>

                <Separator className="my-4 bg-white/[0.06]" />

                {/* AI-Generated Social Copy */}
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles className="h-3.5 w-3.5 text-fuchsia-400" />
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Social Copy
                    </span>
                    <Badge
                      variant="secondary"
                      className="text-[9px] bg-gradient-to-r from-violet-600/20 to-fuchsia-600/20 text-violet-300 border-violet-500/20"
                    >
                      AI Generated
                    </Badge>
                  </div>

                  {/* Platform Tabs */}
                  <div className="flex gap-1.5 mb-3">
                    {platforms.map(({ key, label, icon: Icon }) => {
                      const isActive = activePlatform === key;
                      return (
                        <button
                          key={key}
                          onClick={() => setActivePlatform(key)}
                          className={`
                            flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-all duration-200
                            ${
                              isActive
                                ? "bg-gradient-to-r from-violet-600/80 to-fuchsia-600/80 text-white shadow-lg shadow-violet-500/15"
                                : "bg-white/[0.04] text-muted-foreground hover:bg-white/[0.08] hover:text-foreground border border-white/[0.06]"
                            }
                          `}
                        >
                          <Icon className="h-3 w-3" />
                          {label}
                        </button>
                      );
                    })}
                  </div>

                  {/* Social Copy Content */}
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activePlatform}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: 0.15 }}
                      className="relative rounded-xl bg-white/[0.03] border border-white/[0.06] p-3.5"
                    >
                      <pre className="whitespace-pre-wrap text-sm leading-relaxed text-foreground/90 font-sans">
                        {socialCopy}
                      </pre>
                      <div className="mt-3 flex justify-end">
                        <CopyButton
                          text={socialCopy}
                          label="Copy"
                          variant="ghost"
                          size="xs"
                          className="text-muted-foreground hover:text-foreground"
                        />
                      </div>
                    </motion.div>
                  </AnimatePresence>
                </div>

                <Separator className="my-4 bg-white/[0.06]" />

                {/* Embed Code */}
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Code className="h-3.5 w-3.5 text-cyan-400" />
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Embed Code
                    </span>
                  </div>
                  <div className="relative rounded-xl bg-white/[0.03] border border-white/[0.06] p-3.5">
                    <pre className="whitespace-pre-wrap text-xs leading-relaxed text-muted-foreground font-mono break-all">
                      {embedCode}
                    </pre>
                    <div className="mt-3 flex justify-end">
                      <CopyButton
                        text={embedCode}
                        label="Copy"
                        variant="ghost"
                        size="xs"
                        className="text-muted-foreground hover:text-foreground"
                      />
                    </div>
                  </div>
                </div>

                <Separator className="my-4 bg-white/[0.06]" />

                {/* QR Code Placeholder */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <QrCode className="h-3.5 w-3.5 text-amber-400" />
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      QR Code
                    </span>
                  </div>
                  <div className="flex items-center justify-center rounded-xl bg-white/[0.03] border border-white/[0.06] border-dashed p-8">
                    <div className="flex flex-col items-center gap-2.5 text-muted-foreground/50">
                      <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-white/[0.04] border border-white/[0.06]">
                        <QrCode className="h-8 w-8" />
                      </div>
                      <span className="text-xs font-medium">
                        QR Code Coming Soon
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
