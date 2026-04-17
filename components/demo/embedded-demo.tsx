"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, ExternalLink } from "lucide-react";
import { useLang } from "@/lib/i18n";
import { canEmbedInIframe, getHostname } from "./embed-utils";

interface EmbeddedDemoProps {
  demoUrl?: string;
}

export function EmbeddedDemo({ demoUrl }: EmbeddedDemoProps) {
  const { t } = useLang();
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          setIsPlaying(false);
          return 0;
        }
        return prev + 0.5;
      });
    }, 100);
    return () => clearInterval(interval);
  }, [isPlaying]);

  const handlePlay = () => {
    if (isPlaying) {
      setIsPlaying(false);
      return;
    }
    setIsLoading(true);
    setProgress(0);
    setTimeout(() => {
      setIsLoading(false);
      setIsPlaying(true);
    }, 1500);
  };

  if (demoUrl && canEmbedInIframe(demoUrl)) {
    return (
      <div className="min-h-64 sm:min-h-80 md:min-h-[400px]">
        <iframe
          src={demoUrl}
          className="w-full h-[450px] border-0"
          sandbox="allow-scripts allow-same-origin"
          title="Embedded player"
        />
      </div>
    );
  }

  if (demoUrl) {
    const host = getHostname(demoUrl);
    return (
      <div className="flex min-h-64 sm:min-h-80 md:min-h-[400px] flex-col items-center justify-center gap-3 p-6 text-center">
        <p className="font-pixel text-[10px] tracking-wide" style={{ color: "var(--text-muted)" }}>
          {host.toUpperCase()} · {t("demo.externalSite")}
        </p>
        <a
          href={demoUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.04] px-4 py-2 text-sm transition-colors hover:border-[var(--neon-yellow)] hover:text-[var(--neon-yellow)]"
          style={{ color: "var(--text)" }}
        >
          <ExternalLink className="size-4" />
          {t("demo.visitSite")}
        </a>
        <p className="max-w-sm text-xs" style={{ color: "var(--text-muted)" }}>
          {t("demo.embedBlocked")}
        </p>
      </div>
    );
  }

  return (
    <div className="relative flex flex-col items-center justify-center min-h-64 sm:min-h-80 md:min-h-[400px] bg-black/20">
      {/* Background visual when playing */}
      <AnimatePresence>
        {isPlaying && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-violet-900/20 via-black/40 to-fuchsia-900/20" />
            {/* Animated particles */}
            {Array.from({ length: 8 }).map((_, i) => (
              <motion.div
                key={i}
                className="absolute size-2 rounded-full bg-violet-400/30"
                initial={{ x: `${20 + i * 10}%`, y: "100%", opacity: 0 }}
                animate={{ y: "-10%", opacity: [0, 0.8, 0] }}
                transition={{ duration: 3 + i * 0.5, repeat: Infinity, delay: i * 0.4, ease: "easeOut" }}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Play / Pause button */}
      <div className="relative z-10 flex flex-col items-center gap-5 py-16">
        {isLoading ? (
          <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center gap-4">
            <div className="relative flex size-20 sm:size-24 md:size-28 items-center justify-center">
              <div className="absolute inset-0 rounded-full border-2 border-violet-500/30 border-t-violet-400 animate-spin" />
              <Play className="size-10 text-violet-400 ml-1" />
            </div>
            <span className="text-sm text-muted-foreground animate-pulse">{t("demo.loadingExperience")}</span>
          </motion.div>
        ) : (
          <button onClick={handlePlay} className="group relative">
            {/* Ripple rings */}
            {!isPlaying && (
              <>
                <div className="absolute inset-0 rounded-full bg-pink-500/10 animate-ping" style={{ animationDuration: "2.5s" }} />
                <div
                  className="absolute -inset-3 rounded-full bg-pink-500/5 animate-ping"
                  style={{ animationDuration: "3s", animationDelay: "0.5s" }}
                />
              </>
            )}
            <div className="relative flex size-20 sm:size-24 md:size-28 items-center justify-center rounded-full bg-gradient-to-br from-pink-500/20 to-orange-500/20 ring-1 ring-white/10 transition-transform group-hover:scale-105">
              {isPlaying ? <Pause className="size-12 text-pink-400" /> : <Play className="size-12 text-pink-400 ml-1" />}
            </div>
          </button>
        )}

        {!isLoading && (
          <span className="text-sm text-muted-foreground">{isPlaying ? t("demo.playing") : t("demo.clickToPlay")}</span>
        )}
      </div>

      {/* Progress bar */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/5">
        <motion.div
          className="h-full bg-gradient-to-r from-pink-500 to-orange-500"
          style={{ width: `${progress}%` }}
          transition={{ duration: 0.1 }}
        />
      </div>
    </div>
  );
}
