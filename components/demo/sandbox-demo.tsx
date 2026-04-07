"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Play, GitFork, Terminal } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useLang } from "@/lib/i18n";

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
    tokens: [{ text: "        }]", color: "text-muted-foreground" }],
  },
  {
    num: 14,
    tokens: [{ text: "    )", color: "text-muted-foreground" }],
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

export function SandboxDemo() {
  const { t } = useLang();
  const [isRunning, setIsRunning] = useState(false);
  const [output, setOutput] = useState<string | null>(null);

  const handleRun = () => {
    setIsRunning(true);
    setOutput(null);
    setTimeout(() => {
      setOutput("Hello from AI! It's wonderful to meet you, World!");
      setIsRunning(false);
    }, 2000);
  };

  return (
    <div className="flex flex-col h-full min-h-64 sm:min-h-80 md:min-h-[400px]">
      <div className="flex-1 overflow-hidden rounded-lg border border-white/10 bg-black/60 m-4 mb-2">
        {/* Title bar */}
        <div className="flex items-center gap-2 border-b border-white/10 bg-white/[0.03] px-4 py-2.5">
          <div className="size-3 rounded-full bg-red-500/70" />
          <div className="size-3 rounded-full bg-yellow-500/70" />
          <div className="size-3 rounded-full bg-green-500/70" />
          <span className="ml-3 text-xs text-muted-foreground font-mono">main.py</span>
        </div>
        {/* Code */}
        <div className="overflow-x-auto p-4 max-h-[280px] overflow-y-auto">
          {lines.map((line) => (
            <div key={line.num} className="flex gap-4 text-xs leading-6 font-mono">
              <span className="w-5 text-right text-muted-foreground/40 select-none shrink-0">{line.num}</span>
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
            <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-amber-400">
              {`> ${t("demo.running")}`}
            </motion.span>
          ) : output ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <span className="text-muted-foreground/60">{"> "}</span>
              <span className="text-emerald-300">
                {t("demo.output")}: {output}
              </span>
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
        <Button onClick={handleRun} disabled={isRunning} className="gap-2 bg-emerald-600 hover:bg-emerald-500 text-white" size="sm">
          <Play className="size-3.5" />
          {isRunning ? t("demo.running") : t("demo.run")}
        </Button>
        <Link href="/launch">
          <Button variant="outline" size="sm" className="gap-2 border-white/10 hover:bg-white/5">
            <GitFork className="size-3.5" />
            {t("demo.fork")}
          </Button>
        </Link>
      </div>
    </div>
  );
}
