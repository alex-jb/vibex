"use client";

import { use, useState, useCallback } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Play,
  Bot,
  CheckCircle2,
  Circle,
  Loader2,
  XCircle,
  Clock,
  Zap,
  DollarSign,
  ArrowDown,
} from "lucide-react";
import { workflows } from "@/lib/mock-data/workflows";
import { agents } from "@/lib/mock-data/agents";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

type StepStatus = "pending" | "running" | "completed" | "failed";

interface StepState {
  stepId: string;
  status: StepStatus;
  input?: string;
  output?: string;
  durationMs?: number;
  tokens?: number;
}

const modelLabels: Record<string, string> = {
  "claude-haiku-4-5": "Haiku 4.5",
  "claude-sonnet-4-6": "Sonnet 4.6",
  "claude-opus-4-6": "Opus 4.6",
};

function StatusIcon({ status }: { status: StepStatus }) {
  switch (status) {
    case "pending":
      return <Circle className="size-5 text-zinc-500" />;
    case "running":
      return <Loader2 className="size-5 text-amber-400 animate-spin" />;
    case "completed":
      return <CheckCircle2 className="size-5 text-emerald-400" />;
    case "failed":
      return <XCircle className="size-5 text-red-400" />;
  }
}

function statusColor(status: StepStatus) {
  const map: Record<StepStatus, string> = {
    pending: "border-zinc-700/50",
    running: "border-amber-500/40 shadow-amber-500/10 shadow-lg",
    completed: "border-emerald-500/30",
    failed: "border-red-500/30",
  };
  return map[status];
}

export default function WorkflowDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const workflow = workflows.find((w) => w.id === id);

  const [input, setInput] = useState("");
  const [running, setRunning] = useState(false);
  const [stepStates, setStepStates] = useState<StepState[]>([]);
  const [stats, setStats] = useState<{ tokens: number; timeMs: number; cost: number } | null>(null);

  const runWorkflow = useCallback(async () => {
    if (!workflow || !input.trim()) return;
    setRunning(true);
    setStats(null);

    const initial: StepState[] = workflow.steps.map((s) => ({
      stepId: s.id,
      status: "pending" as const,
    }));
    setStepStates(initial);

    let totalTokens = 0;
    let totalTime = 0;
    let prevOutput = input;

    for (let i = 0; i < workflow.steps.length; i++) {
      const step = workflow.steps[i];
      setStepStates((prev) =>
        prev.map((ss) =>
          ss.stepId === step.id ? { ...ss, status: "running", input: prevOutput } : ss
        )
      );

      try {
        const res = await fetch("/api/workflows/run", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            workflowId: workflow.id,
            stepId: step.id,
            agentId: step.agentId,
            input: prevOutput,
          }),
        });
        const data = await res.json();
        const tokens = data.tokens ?? Math.floor(Math.random() * 800 + 200);
        const duration = data.durationMs ?? Math.floor(Math.random() * 3000 + 1000);
        const output = data.output ?? `[Step ${i + 1} output for "${prevOutput.slice(0, 40)}..."]`;
        totalTokens += tokens;
        totalTime += duration;
        prevOutput = typeof output === "string" ? output : JSON.stringify(output);

        setStepStates((prev) =>
          prev.map((ss) =>
            ss.stepId === step.id
              ? { ...ss, status: "completed", output: prevOutput, durationMs: duration, tokens }
              : ss
          )
        );
      } catch {
        setStepStates((prev) =>
          prev.map((ss) =>
            ss.stepId === step.id ? { ...ss, status: "failed", output: "执行失败" } : ss
          )
        );
        break;
      }
    }

    setStats({ tokens: totalTokens, timeMs: totalTime, cost: totalTokens * 0.000015 });
    setRunning(false);
  }, [workflow, input]);

  if (!workflow) {
    return (
      <div className="min-h-screen pt-24 pb-16 px-4 flex flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground">工作流未找到</p>
        <Link href="/workflows">
          <Button variant="outline"><ArrowLeft className="size-4 mr-1.5" />返回</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-16 px-4 sm:px-6">
      <div className="mx-auto max-w-3xl">
        {/* Back */}
        <Link href="/workflows" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
          <ArrowLeft className="size-4" />
          返回工作流
        </Link>

        {/* Header */}
        <div className="glass-card-strong rounded-xl p-6 mb-6">
          <h1 className="text-2xl font-bold mb-2">{workflow.name}</h1>
          <p className="text-muted-foreground text-sm mb-4">{workflow.description}</p>
          <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono">
            {workflow.steps.map((s, i) => {
              const agent = agents.find((a) => a.id === s.agentId);
              return (
                <span key={s.id} className="flex items-center gap-1">
                  {i > 0 && <span className="text-violet-500">→</span>}
                  <span>{agent?.name ?? "Unknown"}</span>
                </span>
              );
            })}
          </div>
        </div>

        {/* Input */}
        <div className="glass-card-strong rounded-xl p-5 mb-6 space-y-3">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="输入工作流的初始内容..."
            rows={3}
            disabled={running}
            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-violet-500/40 resize-none disabled:opacity-50"
          />
          <Button
            onClick={runWorkflow}
            disabled={running || !input.trim()}
            className="w-full bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white hover:from-violet-500 hover:to-fuchsia-500 disabled:opacity-50"
          >
            {running ? <Loader2 className="size-4 mr-1.5 animate-spin" /> : <Play className="size-4 mr-1.5" />}
            {running ? "运行中..." : "运行工作流"}
          </Button>
        </div>

        {/* Pipeline Progress */}
        {stepStates.length > 0 && (
          <div className="flex flex-col items-center gap-0 mb-6">
            {workflow.steps.map((step, idx) => {
              const agent = agents.find((a) => a.id === step.agentId);
              const state = stepStates.find((ss) => ss.stepId === step.id);
              const status = state?.status ?? "pending";

              return (
                <div key={step.id} className="flex flex-col items-center w-full max-w-lg">
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className={`w-full glass-card-strong rounded-xl p-4 border ${statusColor(status)}`}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <StatusIcon status={status} />
                      <span className="text-xs font-mono text-violet-400">Step {idx + 1}</span>
                      <div className="flex-1" />
                      {agent && (
                        <Badge variant="outline" className="text-[10px] border-violet-500/30 text-violet-300">
                          {modelLabels[agent.model] ?? agent.model}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Bot className="size-4 text-violet-400 shrink-0" />
                      <span className="font-medium">{agent?.name ?? "Unknown"}</span>
                    </div>
                    {state?.input && (
                      <div className="mt-2 text-xs text-muted-foreground">
                        <span className="text-zinc-500">输入:</span>{" "}
                        <span className="line-clamp-2">{state.input.slice(0, 150)}</span>
                      </div>
                    )}
                    {state?.output && status !== "running" && (
                      <div className="mt-1.5 text-xs text-foreground/80">
                        <span className="text-zinc-500">输出:</span>{" "}
                        <span className="line-clamp-3">{state.output.slice(0, 200)}</span>
                      </div>
                    )}
                    {state?.durationMs && (
                      <div className="mt-2 flex gap-3 text-[10px] text-muted-foreground">
                        <span>{state.tokens} tokens</span>
                        <span>{(state.durationMs / 1000).toFixed(1)}s</span>
                      </div>
                    )}
                  </motion.div>

                  {idx < workflow.steps.length - 1 && (
                    <div className="flex flex-col items-center py-1">
                      <div className="w-px h-5 bg-violet-500/30" />
                      <ArrowDown className="size-3.5 text-violet-500/50" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Stats */}
        {stats && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card-strong rounded-xl p-5 flex items-center justify-around text-center"
          >
            <div>
              <Zap className="size-4 text-amber-400 mx-auto mb-1" />
              <p className="text-lg font-bold">{stats.tokens.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">Tokens</p>
            </div>
            <div>
              <Clock className="size-4 text-violet-400 mx-auto mb-1" />
              <p className="text-lg font-bold">{(stats.timeMs / 1000).toFixed(1)}s</p>
              <p className="text-xs text-muted-foreground">耗时</p>
            </div>
            <div>
              <DollarSign className="size-4 text-emerald-400 mx-auto mb-1" />
              <p className="text-lg font-bold">${stats.cost.toFixed(4)}</p>
              <p className="text-xs text-muted-foreground">预估费用</p>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
