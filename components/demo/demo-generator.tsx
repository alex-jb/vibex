"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, Download, Check, Loader2, AlertTriangle, RefreshCw, Link2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface DemoGeneratorProps {
  /** Called when GIF is generated — passes the URL */
  onGenerated: (gifUrl: string) => void;
  /** Optional project ID for storage naming */
  projectId?: string;
  className?: string;
}

type State = "idle" | "generating" | "done" | "error";

const STEPS = [
  "Launching browser...",
  "Loading page...",
  "Capturing frames...",
  "Scrolling through...",
  "Encoding GIF...",
  "Uploading...",
];

export function DemoGenerator({ onGenerated, projectId, className = "" }: DemoGeneratorProps) {
  const [url, setUrl] = useState("");
  const [state, setState] = useState<State>("idle");
  const [gifUrl, setGifUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState(0);
  const [meta, setMeta] = useState<{ frames: number; sizeKB: number } | null>(null);

  const handleGenerate = useCallback(async () => {
    if (!url.trim()) return;

    setState("generating");
    setError(null);
    setGifUrl(null);
    setStep(0);

    // Simulate step progression
    const stepInterval = setInterval(() => {
      setStep((s) => Math.min(s + 1, STEPS.length - 1));
    }, 3000);

    try {
      const res = await fetch("/api/demos/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim(), projectId }),
      });

      clearInterval(stepInterval);

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Generation failed");
      }

      const data = await res.json();
      setGifUrl(data.gifUrl);
      setMeta({ frames: data.frames, sizeKB: data.sizeKB });
      setState("done");
      onGenerated(data.gifUrl);
    } catch (err) {
      clearInterval(stepInterval);
      setError(err instanceof Error ? err.message : "Unknown error");
      setState("error");
    }
  }, [url, projectId, onGenerated]);

  const handleDownload = useCallback(() => {
    if (!gifUrl) return;
    const a = document.createElement("a");
    a.href = gifUrl;
    a.download = `vibex-demo-${projectId || "preview"}.gif`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }, [gifUrl, projectId]);

  return (
    <div className={`rpgui-container framed ${className}`} style={{ padding: 16 }}>
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <Camera className="size-4 text-emerald-400" />
        <span className="font-pixel text-[8px] uppercase tracking-widest text-emerald-400">
          Auto Demo Generator
        </span>
      </div>

      {/* URL Input */}
      <div className="flex gap-2 mb-4">
        <div className="relative flex-1">
          <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://your-project.com"
            disabled={state === "generating"}
            className="pl-10 h-10 bg-white/5 border-white/[0.08] font-mono text-sm"
          />
        </div>
        <Button
          onClick={handleGenerate}
          disabled={!url.trim() || state === "generating"}
          className="h-10 gap-2 bg-emerald-600 hover:bg-emerald-500 text-white shrink-0"
        >
          {state === "generating" ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Camera className="size-4" />
          )}
          {state === "generating" ? "Recording..." : "Generate"}
        </Button>
      </div>

      <AnimatePresence mode="wait">
        {/* Generating state */}
        {state === "generating" && (
          <motion.div
            key="generating"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="rounded-lg bg-white/[0.03] border border-white/[0.06] p-4"
          >
            {/* Progress steps */}
            <div className="space-y-2">
              {STEPS.map((label, i) => (
                <div key={i} className="flex items-center gap-2">
                  {i < step ? (
                    <Check className="size-3 text-emerald-400" />
                  ) : i === step ? (
                    <Loader2 className="size-3 animate-spin text-violet-400" />
                  ) : (
                    <div className="size-3 rounded-full bg-white/[0.06]" />
                  )}
                  <span className={`font-pixel text-[7px] ${i <= step ? "text-foreground" : "text-muted-foreground/40"}`}>
                    {label}
                  </span>
                </div>
              ))}
            </div>

            {/* Pixel progress bar */}
            <div className="mt-3 h-2 bg-white/[0.06] rounded overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500"
                initial={{ width: "0%" }}
                animate={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </motion.div>
        )}

        {/* Done state */}
        {state === "done" && gifUrl && (
          <motion.div
            key="done"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
          >
            {/* GIF Preview */}
            <div className="rounded-lg overflow-hidden border border-emerald-500/20 mb-3">
              <img
                src={gifUrl}
                alt="Generated demo"
                className="w-full aspect-video object-cover"
                style={{ imageRendering: "auto" }}
              />
            </div>

            {/* Meta + Actions */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                <span>{meta?.frames} frames</span>
                <span>{meta?.sizeKB} KB</span>
                <span className="text-emerald-400 font-bold">GIF</span>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-1.5 text-muted-foreground hover:text-foreground"
                  onClick={handleDownload}
                >
                  <Download className="size-3" />
                  Download
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-1.5 text-emerald-400 hover:text-emerald-300"
                  onClick={() => { setState("idle"); setGifUrl(null); }}
                >
                  <RefreshCw className="size-3" />
                  Redo
                </Button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Error state */}
        {state === "error" && (
          <motion.div
            key="error"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="rounded-lg bg-red-500/10 border border-red-500/20 p-4"
          >
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="size-4 text-red-400" />
              <span className="text-sm font-medium text-red-400">Generation Failed</span>
            </div>
            <p className="text-xs text-red-400/80 mb-3">{error}</p>
            <Button
              variant="ghost"
              size="sm"
              className="gap-1.5 text-red-400 hover:text-red-300"
              onClick={() => { setState("idle"); setError(null); }}
            >
              <RefreshCw className="size-3" />
              Try Again
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
