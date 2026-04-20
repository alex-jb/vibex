"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  ArrowLeft,
  Bot,
  Play,
  Save,
  Rocket,
  Check,
  Terminal,
  Brain,
  Wrench,
  MessageSquare,
  Zap,
  Loader2,
  Cpu,
} from "lucide-react";
import { BUILTIN_TOOLS } from "@/lib/agent-tools";
import type { AgentCategory, AgentStep } from "@/lib/agent-types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useLang } from "@/lib/i18n";

// ── Constants ──────────────────────────────────────────────────

const CATEGORY_KEYS: AgentCategory[] = [
  "coding", "research", "creative", "automation", "assistant", "trading", "education",
];

const MODELS = [
  { id: "claude-haiku-4-5" as const, label: "Haiku 4.5", subKey: "builder.fastLow" as const, price: "$1/$5" },
  { id: "claude-sonnet-4-6" as const, label: "Sonnet 4.6", subKey: "builder.balanced" as const, price: "$3/$15" },
  { id: "claude-opus-4-6" as const, label: "Opus 4.6", subKey: "builder.powerful" as const, price: "$5/$25" },
];

const PROMPT_TEMPLATES: { label: string; prompt: string }[] = [
  {
    label: "Code Review Expert",
    prompt:
      "You are a senior code review expert. Analyze submitted code, identify bugs, security vulnerabilities, performance issues, and best-practice violations. Classify by severity and provide actionable fix suggestions.",
  },
  {
    label: "Research Assistant",
    prompt:
      "You are a deep research assistant. Analyze a given topic from multiple angles, cross-verify facts, and generate a structured research report with citations.",
  },
  {
    label: "Creative Writer",
    prompt:
      "You are a professional creative writer. Based on the user's topic, style, and tone requirements, produce high-quality articles, stories, or marketing copy. Focus on rhythm and expressiveness.",
  },
  {
    label: "Data Analyst",
    prompt:
      "You are a data analyst. Parse user-provided data, discover patterns and trends, generate visualization suggestions and conclusions. Explain complex data insights in clear, concise language.",
  },
];

// ── Helpers ────────────────────────────────────────────────────

function stepIcon(type: string) {
  switch (type) {
    case "thinking": return <Brain className="size-3.5 text-violet-400" />;
    case "tool_call": return <Wrench className="size-3.5 text-amber-400" />;
    case "tool_result": return <Terminal className="size-3.5 text-emerald-400" />;
    case "response": return <MessageSquare className="size-3.5 text-cyan-400" />;
    default: return <Zap className="size-3.5" />;
  }
}

// ── Page ───────────────────────────────────────────────────────

export default function AgentBuilderPage() {
  const { lang, t } = useLang();
  const zh = lang === "zh";

  // Form state
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<AgentCategory>("coding");
  const [tags, setTags] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [model, setModel] = useState<(typeof MODELS)[number]["id"]>("claude-sonnet-4-6");
  const [temperature, setTemperature] = useState(0.7);
  const [maxTokens, setMaxTokens] = useState(4000);
  const [systemPrompt, setSystemPrompt] = useState("");
  const [selectedTools, setSelectedTools] = useState<string[]>([]);

  // Test panel state
  const [showTest, setShowTest] = useState(false);
  const [testInput, setTestInput] = useState("");
  const [testRunning, setTestRunning] = useState(false);
  const [testSteps, setTestSteps] = useState<AgentStep[]>([]);

  const canPublish = name.trim().length > 0 && systemPrompt.trim().length > 0;

  const toggleTool = (id: string) => {
    setSelectedTools((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id],
    );
  };

  const handleTest = async () => {
    if (!testInput.trim() || testRunning) return;
    setTestRunning(true);
    setTestSteps([]);
    try {
      const res = await fetch("/api/agents/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tempConfig: { name, systemPrompt, model, temperature, maxTokens, tools: selectedTools },
          input: testInput.trim(),
        }),
      });
      const data = await res.json();
      setTestSteps(
        data.steps ?? [{
          id: "error", type: "response" as const,
          content: `${t("agents.error")}: ${data.error ?? t("agents.unknownError")}`,
          tokens: 0, durationMs: 0, timestamp: new Date().toISOString(),
        }],
      );
    } catch {
      setTestSteps([{
        id: "error", type: "response" as const,
        content: t("agents.execFailed"),
        tokens: 0, durationMs: 0, timestamp: new Date().toISOString(),
      }]);
    }
    setTestRunning(false);
  };

  const modelMeta = MODELS.find((m) => m.id === model)!;

  return (
    <div className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6">
      {/* Background */}
      <div className="pointer-events-none absolute -top-32 left-1/2 -translate-x-1/2 h-[480px] w-[480px] rounded-full bg-violet-600/8 blur-[120px]" />

      {/* Back link */}
      <Link href="/discover?tab=agents" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-8">
        <ArrowLeft className="size-4" />
        {t("agents.backToMarket")}
      </Link>

      {/* Title */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
        <div className="flex items-center gap-3 mb-2">
          <div
            className="size-10 flex items-center justify-center"
            style={{
              background: "linear-gradient(135deg, #FF4500 0%, #B8380B 100%)",
              border: "2px solid #FFE27D",
              boxShadow: "2px 2px 0 #000",
            }}
          >
            <Bot className="size-5" style={{ color: "#1A0F00" }} />
          </div>
          <h1 className="font-pixel text-[12px] tracking-widest text-emerald-400" style={{ textShadow: "0 0 10px rgba(57,255,20,0.3)" }}>
            {"> AGENT-BUILDER v1.0"}
          </h1>
        </div>
        <p className="text-sm text-muted-foreground">
          {t("builder.subtitle")}
        </p>
      </motion.div>

      {/* 2-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* ── LEFT: Builder Form ── */}
        <div className="lg:col-span-3 space-y-6">

          {/* a) Basic Info */}
          <section className="glass-card-strong rounded-xl p-6 border border-white/[0.06]">
            <h3 className="font-pixel text-[9px] uppercase tracking-widest text-muted-foreground mb-4">
              {t("builder.basicInfo")}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Agent {t("builder.name")}</label>
                <input value={name} onChange={(e) => setName(e.target.value)}
                  placeholder={t("builder.namePlaceholder")}
                  className="w-full rounded-lg border border-white/[0.08] bg-white/5 px-3 py-2 text-sm outline-none focus:border-violet-500/40" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">{t("builder.desc")}</label>
                <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3}
                  placeholder={t("builder.descPlaceholder")}
                  className="w-full rounded-lg border border-white/[0.08] bg-white/5 px-3 py-2 text-sm outline-none focus:border-violet-500/40 resize-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">{t("builder.category")}</label>
                  <select value={category} onChange={(e) => setCategory(e.target.value as AgentCategory)}
                    className="w-full rounded-lg border border-white/[0.08] bg-white/5 px-3 py-2 text-sm outline-none focus:border-violet-500/40">
                    {CATEGORY_KEYS.map((key) => (
                      <option key={key} value={key}>{t(`agents.${key}`)}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">{t("builder.tags")}</label>
                  <input value={tags} onChange={(e) => setTags(e.target.value)}
                    placeholder={t("builder.tagsSeparator")}
                    className="w-full rounded-lg border border-white/[0.08] bg-white/5 px-3 py-2 text-sm outline-none focus:border-violet-500/40" />
                </div>
              </div>
              <label className="flex items-center gap-3 cursor-pointer">
                <div className={`relative w-10 h-5 rounded-full transition-colors ${isPublic ? "bg-violet-500" : "bg-white/10"}`}
                  onClick={() => setIsPublic(!isPublic)}>
                  <div className={`absolute top-0.5 size-4 rounded-full bg-white transition-transform ${isPublic ? "translate-x-5" : "translate-x-0.5"}`} />
                </div>
                <span className="text-sm">{t("builder.public")}</span>
              </label>
            </div>
          </section>

          {/* b) Model Config */}
          <section className="glass-card-strong rounded-xl p-6 border border-white/[0.06]">
            <h3 className="font-pixel text-[9px] uppercase tracking-widest text-muted-foreground mb-4">
              {t("builder.modelConfig")}
            </h3>
            <div className="grid grid-cols-3 gap-3 mb-5">
              {MODELS.map((m) => (
                <button key={m.id} onClick={() => setModel(m.id)}
                  className={`rounded-xl border p-3 text-left transition-all ${
                    model === m.id
                      ? "retro-border border-violet-500/50 bg-violet-500/10 shadow-md shadow-violet-500/10"
                      : "border-white/[0.06] bg-white/[0.02] hover:border-white/10"
                  }`}>
                  <div className="flex items-center gap-1.5 mb-1">
                    <Cpu className="size-3.5 text-violet-400" />
                    <span className="text-sm font-semibold">{m.label}</span>
                  </div>
                  <p className="text-[10px] text-muted-foreground">{t(m.subKey)}</p>
                  <p className="text-[10px] text-violet-400 mt-1">{m.price}</p>
                </button>
              ))}
            </div>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs text-muted-foreground mb-1">
                  <span>Temperature</span><span>{temperature}</span>
                </div>
                <input type="range" min={0} max={1} step={0.1} value={temperature}
                  onChange={(e) => setTemperature(Number(e.target.value))}
                  aria-label="Temperature"
                  className="w-full accent-violet-500" />
              </div>
              <div>
                <div className="flex justify-between text-xs text-muted-foreground mb-1">
                  <span>Max Tokens</span><span>{maxTokens}</span>
                </div>
                <input type="range" min={1000} max={16000} step={1000} value={maxTokens}
                  onChange={(e) => setMaxTokens(Number(e.target.value))}
                  aria-label="Max Tokens"
                  className="w-full accent-violet-500" />
              </div>
            </div>
          </section>

          {/* c) System Prompt */}
          <section className="glass-card-strong rounded-xl p-6 border border-white/[0.06]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-pixel text-[9px] uppercase tracking-widest text-muted-foreground">
                System Prompt
              </h3>
              <select
                onChange={(e) => { if (e.target.value) setSystemPrompt(e.target.value); }}
                value=""
                className="rounded-lg border border-white/[0.08] bg-white/5 px-2 py-1 text-xs outline-none">
                <option value="">{t("builder.templates")}</option>
                {PROMPT_TEMPLATES.map((t) => (
                  <option key={t.label} value={t.prompt}>{t.label}</option>
                ))}
              </select>
            </div>
            <Textarea value={systemPrompt} onChange={(e) => setSystemPrompt(e.target.value)}
              rows={8} placeholder={t("builder.promptPlaceholder")}
              className="bg-white/5 border-white/[0.08] mb-2" />
            <p className="text-right text-[10px] text-muted-foreground">{systemPrompt.length} {t("builder.chars")}</p>
          </section>

          {/* d) Tool Selection */}
          <section className="glass-card-strong rounded-xl p-6 border border-white/[0.06]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-pixel text-[9px] uppercase tracking-widest text-muted-foreground">
                {t("builder.tools")}
              </h3>
              <span className="text-xs text-muted-foreground">
                {`${selectedTools.length}/${BUILTIN_TOOLS.length} ${t("builder.selectedTools")}`}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {BUILTIN_TOOLS.map((tool) => {
                const selected = selectedTools.includes(tool.id);
                return (
                  <button key={tool.id} onClick={() => toggleTool(tool.id)}
                    aria-label={`${selected ? "Deselect" : "Select"} ${tool.name}`}
                    aria-pressed={selected}
                    className={`relative rounded-xl border p-3 text-left transition-all ${
                      selected
                        ? "retro-border border-emerald-500/50 bg-emerald-500/10"
                        : "border-white/[0.06] bg-white/[0.02] hover:border-white/10"
                    }`}>
                    {selected && (
                      <div className="absolute top-2 right-2 font-pixel text-[7px] bg-emerald-500 text-white px-1.5 py-0.5" style={{ imageRendering: "pixelated" }}>
                        <Check className="size-2.5 inline text-white mr-0.5" />ON
                      </div>
                    )}
                    <div className="flex items-center gap-2 mb-1">
                      <Wrench className="size-3.5 text-violet-400" />
                      <span className="text-sm font-medium">{tool.name}</span>
                    </div>
                    <p className="text-[10px] text-muted-foreground line-clamp-2">{tool.description}</p>
                  </button>
                );
              })}
            </div>
          </section>

          {/* e) Actions */}
          <div className="flex flex-wrap gap-3">
            <button onClick={() => setShowTest(!showTest)}
              className="nes-btn is-warning" style={{ fontSize: 10, padding: "8px 16px" }}>
              <Play className="size-4 inline mr-1" />{t("builder.testAgent")}
            </button>
            <button className="nes-btn" style={{ fontSize: 10, padding: "8px 16px" }}>
              <Save className="size-4 inline mr-1" />{t("builder.saveDraft")}
            </button>
            <button disabled={!canPublish}
              className={`nes-btn ${canPublish ? "is-success" : "is-disabled"}`} style={{ fontSize: 10, padding: "8px 16px" }}>
              <Rocket className="size-4 inline mr-1" />{t("builder.publish")}
            </button>
          </div>
        </div>

        {/* ── RIGHT: Preview + Test ── */}
        <div className="lg:col-span-2 space-y-6">

          {/* Agent Preview Card */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="rpgui-container framed-golden" style={{ padding: 20 }}>
            <h3 className="font-pixel text-[9px] uppercase tracking-widest text-muted-foreground mb-4">
              {t("builder.previewCard")}
            </h3>
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5">
              <div className="flex items-center justify-between mb-3">
                <Badge variant="outline" className="border-violet-500/30 bg-violet-500/10 text-violet-400 text-[10px] uppercase tracking-wider">
                  {t(`agents.${category}`)}
                </Badge>
                <span className="inline-flex items-center gap-1 rounded-full bg-fuchsia-500/10 px-2 py-0.5 text-[10px] font-medium text-fuchsia-400">
                  <Cpu className="size-2.5" />
                  {modelMeta.label}
                </span>
              </div>
              <h4 className="text-lg font-bold text-foreground">
                {name || t("builder.untitled")}
              </h4>
              <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground line-clamp-2">
                {description || t("builder.noDesc")}
              </p>
              {selectedTools.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {selectedTools.map((tid) => (
                    <span key={tid} className="inline-flex items-center gap-1 rounded bg-white/5 px-1.5 py-0.5 text-[10px] text-muted-foreground">
                      <Wrench className="size-2.5" />{tid}
                    </span>
                  ))}
                </div>
              )}
              {tags.trim() && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {tags.split(",").map((t) => t.trim()).filter(Boolean).map((t) => (
                    <Badge key={t} variant="outline" className="text-[10px]">{t}</Badge>
                  ))}
                </div>
              )}
              <div className="mt-4 flex items-center gap-4 text-[11px] text-muted-foreground">
                <span className="flex items-center gap-1"><Play className="size-3 text-emerald-400" />0</span>
                <span className="flex items-center gap-1">-- {t("builder.success")}</span>
              </div>
            </div>
          </motion.div>

          {/* Test Panel */}
          <AnimatePresence>
            {showTest && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden">
                <div className="glass-card-strong rounded-xl p-6 border border-white/[0.06]">
                  <h3 className="font-pixel text-[9px] uppercase tracking-widest text-muted-foreground mb-4">
                    {t("builder.testPanel")}
                  </h3>
                  <Textarea value={testInput} onChange={(e) => setTestInput(e.target.value)}
                    rows={3} placeholder={t("builder.testPlaceholder")}
                    className="bg-white/5 border-white/[0.08] mb-3" />
                  <Button onClick={handleTest} disabled={!testInput.trim() || testRunning}
                    className="font-pixel gap-2 border-0 mb-4 hover:-translate-x-0.5 hover:-translate-y-0.5 transition-transform disabled:hover:translate-x-0 disabled:hover:translate-y-0"
                    style={{
                      background: "#FF4500",
                      border: "2px solid #FFE27D",
                      color: "#1A0F00",
                      boxShadow: "3px 3px 0 #000, inset 0 6px 0 rgba(255,255,255,0.12), inset 0 -6px 0 rgba(0,0,0,0.2)",
                      fontSize: 11,
                      letterSpacing: 2,
                    }}>
                    {testRunning ? <Loader2 className="size-4 animate-spin" /> : <Play className="size-4" />}
                    {testRunning ? t("agents.running") : t("agents.run")}
                  </Button>

                  {(testSteps.length > 0 || testRunning) && (
                    <div className="rpgui-container framed" style={{ padding: 12, minHeight: 120 }}>
                      <div className="flex items-center gap-2 mb-3">
                        <Terminal className="size-4 text-emerald-400" />
                        <span className="font-pixel text-[9px] text-emerald-400 uppercase tracking-wider">
                          {t("builder.executionLog")}
                        </span>
                      </div>
                      <div className="space-y-2 font-mono text-sm">
                        {testSteps.map((step, i) => (
                          <motion.div key={step.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.05 }} className="flex items-start gap-2">
                            <span className="mt-1 shrink-0">{stepIcon(step.type)}</span>
                            <div className="flex-1 min-w-0">
                              {step.toolName && (
                                <span className="text-amber-400 text-xs mr-2">[{step.toolName}]</span>
                              )}
                              <span className="text-muted-foreground whitespace-pre-wrap break-words">{step.content}</span>
                              {step.durationMs > 0 && (
                                <span className="text-muted-foreground/40 text-xs ml-2">{step.durationMs}ms</span>
                              )}
                            </div>
                          </motion.div>
                        ))}
                        {testRunning && (
                          <div className="flex items-center gap-2 text-violet-400">
                            <Loader2 className="size-3.5 animate-spin" />
                            <span className="text-xs">{t("agents.thinking")}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
