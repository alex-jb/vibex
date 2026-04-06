"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageSquare,
  Code2,
  Monitor,
  Play,
  Send,
  Maximize2,
  Share2,
  Eye,
  GitFork,
  Terminal,
  Pause,
  Bot,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLang } from "@/lib/i18n";

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

interface ChatMessage {
  role: "user" | "ai" | "system";
  text: string;
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

function getDemoLabel(demoType: PlayableDemoProps["demoType"], t: (key: any) => string) {
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

const CANNED_AI_RESPONSES = [
  "That's a great question! Based on the data I've analyzed, I can provide a detailed breakdown. Let me walk you through it step by step.",
  "I've processed your request and found some interesting patterns. Here's what stands out from the analysis...",
  "Absolutely! I can help with that. Let me generate a comprehensive response based on the latest information available.",
  "Interesting perspective! I've cross-referenced multiple sources and here's what I've found that might be useful.",
  "Great input! Processing now... I've identified several key insights that could be valuable for your use case.",
  "I appreciate the follow-up. Based on our conversation so far, here's my recommendation with supporting context.",
];

/* ------------------------------------------------------------------ */
/*  Chat Mode                                                          */
/* ------------------------------------------------------------------ */

function ChatDemo({ projectTitle }: { projectTitle: string }) {
  const { t } = useLang();
  const initialMessages: ChatMessage[] = [
    { role: "system", text: t("demo.welcome") },
    {
      role: "user",
      text: "Can you translate this with the right emotional tone?",
    },
    {
      role: "ai",
      text: "Absolutely. I detected a warm, conversational tone in your text. Here's the translation preserving that feeling...",
    },
    {
      role: "user",
      text: "That's exactly the nuance I needed. Can you do formal Japanese next?",
    },
    {
      role: "ai",
      text: "Of course! Switching to keigo (formal Japanese). The translation maintains respect markers while preserving your intent.",
    },
  ];

  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed || isTyping) return;

    const userMsg: ChatMessage = { role: "user", text: trimmed };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    setTimeout(() => {
      const response =
        CANNED_AI_RESPONSES[
          Math.floor(Math.random() * CANNED_AI_RESPONSES.length)
        ];
      const aiMsg: ChatMessage = { role: "ai", text: response };
      setMessages((prev) => [...prev, aiMsg]);
      setIsTyping(false);
    }, 1000);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full min-h-[400px] bg-black/20">
      {/* Chat header */}
      <div className="flex items-center gap-3 border-b border-white/5 px-5 py-3">
        <div className="flex size-8 items-center justify-center rounded-full bg-violet-600/20">
          <Bot className="size-4 text-violet-400" />
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-medium">{projectTitle}</span>
          <div className="flex items-center gap-1.5">
            <div className="size-1.5 rounded-full bg-emerald-400" />
            <span className="text-[10px] text-emerald-400">{t("demo.online")}</span>
          </div>
        </div>
        <Badge className="ml-auto bg-violet-500/10 text-violet-400 border-violet-500/20 text-[10px]">
          {t("demo.poweredByAI")}
        </Badge>
      </div>

      {/* Messages */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-5 space-y-3 max-h-[320px]"
      >
        {messages.map((msg, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className={`flex ${
              msg.role === "user"
                ? "justify-end"
                : msg.role === "system"
                  ? "justify-center"
                  : "justify-start"
            }`}
          >
            {msg.role === "system" ? (
              <div className="rounded-full bg-white/5 px-4 py-2 text-xs text-muted-foreground/60">
                {msg.text}
              </div>
            ) : (
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                  msg.role === "user"
                    ? "bg-violet-600/30 text-violet-100 border border-violet-500/20"
                    : "bg-white/5 text-foreground border border-white/5"
                }`}
              >
                {msg.text}
              </div>
            )}
          </motion.div>
        ))}

        {/* Typing indicator */}
        <AnimatePresence>
          {isTyping && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex justify-start"
            >
              <div className="bg-white/5 border border-white/5 rounded-2xl px-4 py-3 flex items-center gap-1.5">
                <div
                  className="size-2 rounded-full bg-violet-400 animate-bounce"
                  style={{ animationDelay: "0ms" }}
                />
                <div
                  className="size-2 rounded-full bg-violet-400 animate-bounce"
                  style={{ animationDelay: "150ms" }}
                />
                <div
                  className="size-2 rounded-full bg-violet-400 animate-bounce"
                  style={{ animationDelay: "300ms" }}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Input */}
      <div className="border-t border-white/5 p-4">
        <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t("demo.typeMessage")}
            className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground/60 outline-none"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isTyping}
            className="flex size-8 items-center justify-center rounded-lg bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white transition-opacity hover:opacity-90 disabled:opacity-40"
          >
            <Send className="size-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Sandbox Mode                                                       */
/* ------------------------------------------------------------------ */

function SandboxDemo() {
  const { t } = useLang();
  const [isRunning, setIsRunning] = useState(false);
  const [output, setOutput] = useState<string | null>(null);

  const lines = [
    {
      num: 1,
      tokens: [
        { text: "import", color: "text-blue-400" },
        { text: " openai", color: "text-foreground" },
      ],
    },
    {
      num: 2,
      tokens: [
        { text: "from", color: "text-blue-400" },
        { text: " openai ", color: "text-foreground" },
        { text: "import", color: "text-blue-400" },
        { text: " OpenAI", color: "text-orange-400" },
      ],
    },
    { num: 3, tokens: [{ text: "", color: "" }] },
    {
      num: 4,
      tokens: [
        { text: "client", color: "text-foreground" },
        { text: " = ", color: "text-muted-foreground" },
        { text: "OpenAI", color: "text-orange-400" },
        { text: "()", color: "text-muted-foreground" },
      ],
    },
    { num: 5, tokens: [{ text: "", color: "" }] },
    {
      num: 6,
      tokens: [
        { text: "def", color: "text-blue-400" },
        { text: " generate_greeting", color: "text-orange-400" },
        { text: "(name: ", color: "text-foreground" },
        { text: "str", color: "text-blue-400" },
        { text: ") -> ", color: "text-foreground" },
        { text: "str", color: "text-blue-400" },
        { text: ":", color: "text-muted-foreground" },
      ],
    },
    {
      num: 7,
      tokens: [
        { text: '    """', color: "text-green-400" },
        { text: "Generate an AI greeting.", color: "text-green-400" },
        { text: '"""', color: "text-green-400" },
      ],
    },
    {
      num: 8,
      tokens: [
        { text: "    response", color: "text-foreground" },
        { text: " = ", color: "text-muted-foreground" },
        { text: "client", color: "text-foreground" },
        { text: ".", color: "text-muted-foreground" },
        { text: "chat", color: "text-foreground" },
        { text: ".", color: "text-muted-foreground" },
        { text: "completions", color: "text-foreground" },
        { text: ".", color: "text-muted-foreground" },
        { text: "create", color: "text-orange-400" },
        { text: "(", color: "text-muted-foreground" },
      ],
    },
    {
      num: 9,
      tokens: [
        { text: "        model", color: "text-foreground" },
        { text: "=", color: "text-muted-foreground" },
        { text: '"gpt-4"', color: "text-green-400" },
        { text: ",", color: "text-muted-foreground" },
      ],
    },
    {
      num: 10,
      tokens: [
        { text: "        messages", color: "text-foreground" },
        { text: "=[{", color: "text-muted-foreground" },
      ],
    },
    {
      num: 11,
      tokens: [
        { text: '            "role"', color: "text-green-400" },
        { text: ": ", color: "text-muted-foreground" },
        { text: '"user"', color: "text-green-400" },
        { text: ",", color: "text-muted-foreground" },
      ],
    },
    {
      num: 12,
      tokens: [
        { text: '            "content"', color: "text-green-400" },
        { text: ": ", color: "text-muted-foreground" },
        { text: "f", color: "text-foreground" },
        { text: '"Say hello to {name}!"', color: "text-green-400" },
      ],
    },
    {
      num: 13,
      tokens: [
        { text: "        }]", color: "text-muted-foreground" },
      ],
    },
    {
      num: 14,
      tokens: [
        { text: "    )", color: "text-muted-foreground" },
      ],
    },
    {
      num: 15,
      tokens: [
        { text: "    return", color: "text-blue-400" },
        { text: " response", color: "text-foreground" },
        { text: ".", color: "text-muted-foreground" },
        { text: "choices", color: "text-foreground" },
        { text: "[", color: "text-muted-foreground" },
        { text: "0", color: "text-orange-400" },
        { text: "].", color: "text-muted-foreground" },
        { text: "message", color: "text-foreground" },
        { text: ".", color: "text-muted-foreground" },
        { text: "content", color: "text-foreground" },
      ],
    },
    { num: 16, tokens: [{ text: "", color: "" }] },
    {
      num: 17,
      tokens: [
        { text: "print", color: "text-orange-400" },
        { text: "(", color: "text-muted-foreground" },
        { text: "generate_greeting", color: "text-orange-400" },
        { text: "(", color: "text-muted-foreground" },
        { text: '"World"', color: "text-green-400" },
        { text: "))", color: "text-muted-foreground" },
      ],
    },
  ];

  const handleRun = () => {
    setIsRunning(true);
    setOutput(null);
    setTimeout(() => {
      setOutput("Hello from AI! It's wonderful to meet you, World!");
      setIsRunning(false);
    }, 2000);
  };

  return (
    <div className="flex flex-col h-full min-h-[400px]">
      <div className="flex-1 overflow-hidden rounded-lg border border-white/10 bg-black/60 m-4 mb-2">
        {/* Title bar */}
        <div className="flex items-center gap-2 border-b border-white/10 bg-white/[0.03] px-4 py-2.5">
          <div className="size-3 rounded-full bg-red-500/70" />
          <div className="size-3 rounded-full bg-yellow-500/70" />
          <div className="size-3 rounded-full bg-green-500/70" />
          <span className="ml-3 text-xs text-muted-foreground font-mono">
            main.py
          </span>
        </div>
        {/* Code */}
        <div className="overflow-x-auto p-4 max-h-[280px] overflow-y-auto">
          {lines.map((line) => (
            <div
              key={line.num}
              className="flex gap-4 text-xs leading-6 font-mono"
            >
              <span className="w-5 text-right text-muted-foreground/40 select-none shrink-0">
                {line.num}
              </span>
              <span>
                {line.tokens.map((token, ti) => (
                  <span key={ti} className={token.color}>
                    {token.text}
                  </span>
                ))}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Terminal output */}
      <div className="mx-4 mb-2 rounded-lg border border-white/10 bg-black/80 p-3">
        <div className="flex items-center gap-2 mb-2">
          <Terminal className="size-3.5 text-emerald-400" />
          <span className="text-xs font-mono text-emerald-400">{t("demo.terminal")}</span>
        </div>
        <div className="text-xs font-mono text-muted-foreground min-h-[24px]">
          {isRunning ? (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-amber-400"
            >
              {`> ${t("demo.running")}`}
            </motion.span>
          ) : output ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <span className="text-muted-foreground/60">{"> "}</span>
              <span className="text-emerald-300">{t("demo.output")}: {output}</span>
            </motion.div>
          ) : (
            <span className="text-muted-foreground/40">
              {">"} {t("demo.readyToRun")}
            </span>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 px-4 pb-4">
        <Button
          onClick={handleRun}
          disabled={isRunning}
          className="gap-2 bg-emerald-600 hover:bg-emerald-500 text-white"
          size="sm"
        >
          <Play className="size-3.5" />
          {isRunning ? t("demo.running") : t("demo.run")}
        </Button>
        <Link href="/launch">
          <Button
            variant="outline"
            size="sm"
            className="gap-2 border-white/10 hover:bg-white/5"
          >
            <GitFork className="size-3.5" />
            {t("demo.fork")}
          </Button>
        </Link>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Preview Mode                                                       */
/* ------------------------------------------------------------------ */

function PreviewDemo({ demoUrl }: { demoUrl?: string }) {
  const { t } = useLang();
  if (demoUrl) {
    return (
      <div className="min-h-[400px] p-4">
        <div className="overflow-hidden rounded-lg border border-white/10 bg-black/40 h-[420px]">
          {/* macOS chrome */}
          <div className="flex items-center gap-2 border-b border-white/10 bg-white/[0.03] px-4 py-2.5">
            <div className="size-3 rounded-full bg-red-500/70" />
            <div className="size-3 rounded-full bg-yellow-500/70" />
            <div className="size-3 rounded-full bg-green-500/70" />
            <span className="ml-3 text-xs text-muted-foreground truncate">
              {demoUrl}
            </span>
          </div>
          <iframe
            src={demoUrl}
            className="w-full h-[380px] border-0"
            sandbox="allow-scripts allow-same-origin"
            title="App preview"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[400px] p-4">
      <div className="overflow-hidden rounded-lg border border-white/10 bg-black/40 h-[420px]">
        {/* macOS chrome */}
        <div className="flex items-center gap-2 border-b border-white/10 bg-white/[0.03] px-4 py-2.5">
          <div className="size-3 rounded-full bg-red-500/70" />
          <div className="size-3 rounded-full bg-yellow-500/70" />
          <div className="size-3 rounded-full bg-green-500/70" />
          <span className="ml-3 text-xs text-muted-foreground">
            app-preview
          </span>
          <Badge className="ml-auto bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[10px]">
            {t("demo.livePreview")}
          </Badge>
        </div>

        {/* Mock dashboard */}
        <div className="flex h-[380px]">
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
                  <div
                    className={`size-3 rounded ${i === 1 ? "bg-violet-500/50" : "bg-white/10"}`}
                  />
                  <div
                    className={`h-2 rounded ${i === 1 ? "w-16 bg-violet-400/30" : "w-12 bg-white/5"}`}
                  />
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
            <div className="grid grid-cols-3 gap-3">
              {[
                { color: "violet", value: "2,847" },
                { color: "emerald", value: "94.2%" },
                { color: "amber", value: "1.2s" },
              ].map((stat, i) => (
                <div
                  key={i}
                  className="rounded-lg border border-white/5 bg-white/[0.02] p-3"
                >
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
                {[40, 65, 45, 80, 55, 70, 90, 60, 75, 85, 50, 95].map(
                  (h, i) => (
                    <motion.div
                      key={i}
                      initial={{ height: 0 }}
                      animate={{ height: `${h}%` }}
                      transition={{ duration: 0.6, delay: i * 0.05 }}
                      className="flex-1 rounded-t bg-gradient-to-t from-violet-600/40 to-violet-400/20"
                    />
                  )
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Embedded Mode                                                      */
/* ------------------------------------------------------------------ */

function EmbeddedDemo({ demoUrl }: { demoUrl?: string }) {
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

  if (demoUrl) {
    return (
      <div className="min-h-[400px]">
        <iframe
          src={demoUrl}
          className="w-full h-[450px] border-0"
          sandbox="allow-scripts allow-same-origin"
          title="Embedded player"
        />
      </div>
    );
  }

  return (
    <div className="relative flex flex-col items-center justify-center min-h-[400px] bg-black/20">
      {/* Background visual when playing */}
      <AnimatePresence>
        {isPlaying && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-violet-900/20 via-black/40 to-fuchsia-900/20" />
            {/* Animated particles */}
            {Array.from({ length: 8 }).map((_, i) => (
              <motion.div
                key={i}
                className="absolute size-2 rounded-full bg-violet-400/30"
                initial={{
                  x: `${20 + i * 10}%`,
                  y: "100%",
                  opacity: 0,
                }}
                animate={{
                  y: "-10%",
                  opacity: [0, 0.8, 0],
                }}
                transition={{
                  duration: 3 + i * 0.5,
                  repeat: Infinity,
                  delay: i * 0.4,
                  ease: "easeOut",
                }}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Play / Pause button */}
      <div className="relative z-10 flex flex-col items-center gap-5 py-16">
        {isLoading ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center gap-4"
          >
            <div className="relative flex size-28 items-center justify-center">
              <div className="absolute inset-0 rounded-full border-2 border-violet-500/30 border-t-violet-400 animate-spin" />
              <Play className="size-10 text-violet-400 ml-1" />
            </div>
            <span className="text-sm text-muted-foreground animate-pulse">
              {t("demo.loadingExperience")}
            </span>
          </motion.div>
        ) : (
          <button onClick={handlePlay} className="group relative">
            {/* Ripple rings */}
            {!isPlaying && (
              <>
                <div
                  className="absolute inset-0 rounded-full bg-pink-500/10 animate-ping"
                  style={{ animationDuration: "2.5s" }}
                />
                <div
                  className="absolute -inset-3 rounded-full bg-pink-500/5 animate-ping"
                  style={{
                    animationDuration: "3s",
                    animationDelay: "0.5s",
                  }}
                />
              </>
            )}
            <div className="relative flex size-28 items-center justify-center rounded-full bg-gradient-to-br from-pink-500/20 to-orange-500/20 ring-1 ring-white/10 transition-transform group-hover:scale-105">
              {isPlaying ? (
                <Pause className="size-12 text-pink-400" />
              ) : (
                <Play className="size-12 text-pink-400 ml-1" />
              )}
            </div>
          </button>
        )}

        {!isLoading && (
          <span className="text-sm text-muted-foreground">
            {isPlaying ? t("demo.playing") : t("demo.clickToPlay")}
          </span>
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

/* ------------------------------------------------------------------ */
/*  Main PlayableDemo Component                                        */
/* ------------------------------------------------------------------ */

export default function PlayableDemo({
  demoType,
  demoUrl,
  projectTitle,
  projectId,
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
          <span>{playCount.toLocaleString()} {t("demo.plays")}</span>
        </div>
        <button className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
          <Share2 className="size-3.5" />
          {t("demo.share")}
        </button>
      </div>
    </div>
  );
}
