"use client";

import { use, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Play,
  GitFork,
  ChevronUp,
  Loader2,
  Terminal,
  Wrench,
  Brain,
  MessageSquare,
  Clock,
  Zap,
  ChevronDown,
  Bot,
} from "lucide-react";
import { agents } from "@/lib/mock-data/agents";
import { BUILTIN_TOOLS } from "@/lib/agent-tools";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import type { AgentStep } from "@/lib/agent-types";

const categoryLabels: Record<string, string> = {
  coding: "编程",
  research: "研究",
  creative: "创意",
  automation: "自动化",
  assistant: "助手",
  trading: "交易",
  education: "教育",
  other: "其他",
};

export default function AgentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const agent = agents.find((a) => a.id === id);

  const [input, setInput] = useState("");
  const [running, setRunning] = useState(false);
  const [steps, setSteps] = useState<AgentStep[]>([]);
  const [showPrompt, setShowPrompt] = useState(false);

  if (!agent) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
        <h1 className="text-2xl font-bold">Agent 未找到</h1>
        <Link href="/agents">
          <Button variant="outline"><ArrowLeft className="size-4 mr-2" />返回市场</Button>
        </Link>
      </div>
    );
  }

  const toolsUsed = agent.tools
    .map((tid) => BUILTIN_TOOLS.find((t) => t.id === tid))
    .filter(Boolean);

  const handleRun = async () => {
    if (!input.trim() || running) return;
    setRunning(true);
    setSteps([]);

    try {
      const res = await fetch("/api/agents/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agentId: agent.id, input: input.trim() }),
      });
      const data = await res.json();
      if (data.steps) {
        setSteps(data.steps);
      } else if (data.error) {
        setSteps([{
          id: "error",
          type: "response",
          content: `错误: ${data.error}`,
          tokens: 0,
          durationMs: 0,
          timestamp: new Date().toISOString(),
        }]);
      }
    } catch {
      setSteps([{
        id: "error",
        type: "response",
        content: "执行失败，请检查 API 配置",
        tokens: 0,
        durationMs: 0,
        timestamp: new Date().toISOString(),
      }]);
    }
    setRunning(false);
  };

  const stepIcon = (type: string) => {
    switch (type) {
      case "thinking": return <Brain className="size-3.5 text-violet-400" />;
      case "tool_call": return <Wrench className="size-3.5 text-amber-400" />;
      case "tool_result": return <Terminal className="size-3.5 text-emerald-400" />;
      case "response": return <MessageSquare className="size-3.5 text-cyan-400" />;
      default: return <Zap className="size-3.5" />;
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
      {/* Back */}
      <Link href="/agents" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-8">
        <ArrowLeft className="size-4" />
        返回 Agent 市场
      </Link>

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
        <div className="flex items-start gap-4">
          <div className="size-14 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center shadow-lg shadow-violet-500/25">
            <Bot className="size-7 text-white" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-3xl font-bold">{agent.name}</h1>
              <Badge className="bg-violet-500/10 text-violet-400 border-violet-500/20">
                {categoryLabels[agent.category] || agent.category}
              </Badge>
            </div>
            <p className="text-muted-foreground">{agent.description}</p>
            <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
              <span>by <strong className="text-foreground">{agent.creatorName}</strong></span>
              <span className="flex items-center gap-1"><Play className="size-3" />{agent.runs.toLocaleString()} 次运行</span>
              <span className="flex items-center gap-1"><ChevronUp className="size-3 text-violet-400" />{agent.upvotes}</span>
              <span className="flex items-center gap-1"><Clock className="size-3" />~{(agent.avgLatencyMs / 1000).toFixed(1)}s</span>
              <Badge variant="outline" className="text-[10px]">{agent.model}</Badge>
            </div>
          </div>
          <Button variant="outline" className="gap-2 border-white/10">
            <GitFork className="size-4" />
            复刻
          </Button>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Run Panel */}
        <div className="lg:col-span-2 space-y-6">
          {/* Input */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="glass-card-strong rounded-xl p-6 border border-white/[0.06]">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Terminal className="size-4 text-violet-400" />
              运行 Agent
            </h3>
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="输入你的请求..."
              rows={4}
              className="bg-white/5 border-white/[0.08] mb-3"
            />
            <Button
              onClick={handleRun}
              disabled={!input.trim() || running}
              className="gap-2 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white"
            >
              {running ? <Loader2 className="size-4 animate-spin" /> : <Play className="size-4" />}
              {running ? "执行中..." : "运行"}
            </Button>
          </motion.div>

          {/* Execution Steps */}
          <AnimatePresence>
            {(steps.length > 0 || running) && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="rpgui-container framed"
                style={{ padding: 16, minHeight: 200 }}
              >
                <div className="flex items-center gap-2 mb-4">
                  <Terminal className="size-4 text-emerald-400" />
                  <span className="font-pixel text-[9px] text-emerald-400 uppercase tracking-wider">执行日志</span>
                </div>
                <div className="space-y-2 font-mono text-sm">
                  {steps.map((step, i) => (
                    <motion.div
                      key={step.id}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="flex items-start gap-2"
                    >
                      <span className="mt-1 shrink-0">{stepIcon(step.type)}</span>
                      <div className="flex-1 min-w-0">
                        {step.toolName && (
                          <span className="text-amber-400 text-xs mr-2">[{step.toolName}]</span>
                        )}
                        <span className="text-muted-foreground whitespace-pre-wrap break-words">
                          {step.content}
                        </span>
                        {step.durationMs > 0 && (
                          <span className="text-muted-foreground/40 text-xs ml-2">{step.durationMs}ms</span>
                        )}
                      </div>
                    </motion.div>
                  ))}
                  {running && (
                    <div className="flex items-center gap-2 text-violet-400">
                      <Loader2 className="size-3.5 animate-spin" />
                      <span className="text-xs">思考中...</span>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right: Config Panel */}
        <div className="space-y-4">
          {/* Tools */}
          <div className="glass-card rounded-xl p-5 border border-white/[0.06]">
            <h4 className="font-pixel text-[8px] text-muted-foreground uppercase tracking-widest mb-3">工具</h4>
            <div className="space-y-2">
              {toolsUsed.map((tool) => (
                <div key={tool!.id} className="flex items-center gap-2 text-sm">
                  <Wrench className="size-3.5 text-violet-400" />
                  <span>{tool!.name}</span>
                </div>
              ))}
              {toolsUsed.length === 0 && (
                <span className="text-xs text-muted-foreground">无工具</span>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="glass-card rounded-xl p-5 border border-white/[0.06]">
            <h4 className="font-pixel text-[8px] text-muted-foreground uppercase tracking-widest mb-3">统计</h4>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "总运行", value: agent.runs.toLocaleString() },
                { label: "成功率", value: `${agent.successRate}%` },
                { label: "平均延迟", value: `${(agent.avgLatencyMs / 1000).toFixed(1)}s` },
                { label: "复刻数", value: String(agent.forks) },
              ].map((s) => (
                <div key={s.label} className="bg-white/[0.03] rounded px-3 py-2">
                  <span className="text-[10px] text-muted-foreground">{s.label}</span>
                  <p className="font-semibold text-sm">{s.value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* System Prompt (collapsible) */}
          <div className="glass-card rounded-xl border border-white/[0.06] overflow-hidden">
            <button
              onClick={() => setShowPrompt(!showPrompt)}
              className="w-full flex items-center justify-between p-5 text-left hover:bg-white/[0.02] transition-colors"
            >
              <span className="font-pixel text-[8px] text-muted-foreground uppercase tracking-widest">System Prompt</span>
              <ChevronDown className={`size-4 text-muted-foreground transition-transform ${showPrompt ? "rotate-180" : ""}`} />
            </button>
            <AnimatePresence>
              {showPrompt && (
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: "auto" }}
                  exit={{ height: 0 }}
                  className="overflow-hidden"
                >
                  <pre className="px-5 pb-5 text-xs text-muted-foreground whitespace-pre-wrap leading-relaxed">
                    {agent.systemPrompt}
                  </pre>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-1.5">
            {agent.tags.map((tag) => (
              <Badge key={tag} variant="outline" className="text-[10px]">{tag}</Badge>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
