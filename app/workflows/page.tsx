"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  Play,
  Plus,
  Trash2,
  GripVertical,
  ArrowDown,
  Bot,
  Save,
  Zap,
  Workflow,
} from "lucide-react";
import { workflows } from "@/lib/mock-data/workflows";
import { agents } from "@/lib/mock-data/agents";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const modelLabels: Record<string, string> = {
  "claude-haiku-4-5": "Haiku 4.5",
  "claude-sonnet-4-6": "Sonnet 4.6",
  "claude-opus-4-6": "Opus 4.6",
};

function getAgent(id: string) {
  return agents.find((a) => a.id === id);
}

type Tab = "browse" | "builder";

interface BuilderStep {
  id: string;
  agentId: string;
}

export default function WorkflowsPage() {
  const [tab, setTab] = useState<Tab>("browse");
  const [steps, setSteps] = useState<BuilderStep[]>([
    { id: crypto.randomUUID(), agentId: agents[0].id },
  ]);
  const [wfName, setWfName] = useState("");
  const [wfDesc, setWfDesc] = useState("");
  const [showTestModal, setShowTestModal] = useState(false);
  const [testInput, setTestInput] = useState("");

  const addStep = (afterIndex?: number) => {
    const newStep: BuilderStep = { id: crypto.randomUUID(), agentId: agents[0].id };
    setSteps((prev) => {
      const next = [...prev];
      const idx = afterIndex !== undefined ? afterIndex + 1 : next.length;
      next.splice(idx, 0, newStep);
      return next;
    });
  };

  const removeStep = (id: string) => {
    setSteps((prev) => prev.filter((s) => s.id !== id));
  };

  const updateAgent = (stepId: string, agentId: string) => {
    setSteps((prev) =>
      prev.map((s) => (s.id === stepId ? { ...s, agentId } : s))
    );
  };

  const handleSave = () => {
    if (!wfName.trim()) {
      alert("请输入工作流名称");
      return;
    }
    alert(`工作流「${wfName}」已保存（${steps.length} 个步骤）`);
  };

  const handleTestRun = async () => {
    setShowTestModal(false);
    try {
      const res = await fetch("/api/workflows/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: wfName,
          steps: steps.map((s) => s.agentId),
          input: testInput,
        }),
      });
      const data = await res.json();
      alert(`测试完成: ${JSON.stringify(data).slice(0, 200)}`);
    } catch {
      alert("测试运行失败，请稍后再试");
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-16 px-4 sm:px-6">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-violet-500/20 bg-violet-500/10 px-4 py-1.5 text-sm text-violet-300 mb-4">
            <Workflow className="size-4" />
            多智能体工作流
          </div>
          <h1 className="text-3xl font-bold">
            工作流<span className="text-gradient-subtle">引擎</span>
          </h1>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 justify-center">
          {(["browse", "builder"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors ${
                tab === t
                  ? "bg-violet-600 text-white"
                  : "bg-white/5 text-muted-foreground hover:text-foreground hover:bg-white/10"
              }`}
            >
              {t === "browse" ? "工作流市场" : "创建工作流"}
            </button>
          ))}
        </div>

        {/* Browse Tab */}
        {tab === "browse" && (
          <div className="grid gap-4 sm:grid-cols-2">
            {workflows.map((wf) => {
              const agentNames = wf.steps
                .map((s) => getAgent(s.agentId)?.name ?? "Unknown")
                .join(" → ");
              return (
                <motion.div
                  key={wf.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="glass-card-strong rounded-xl p-5 flex flex-col gap-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="font-semibold text-foreground truncate">{wf.name}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                        {wf.description}
                      </p>
                    </div>
                    <Badge variant="outline" className="shrink-0 border-violet-500/30 text-violet-300">
                      {wf.steps.length} 步骤
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground font-mono truncate">
                    {agentNames}
                  </p>
                  <Link href={`/workflows/${wf.id}`}>
                    <Button size="sm" className="w-full bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white hover:from-violet-500 hover:to-fuchsia-500">
                      <Play className="size-3.5 mr-1.5" />
                      运行
                    </Button>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Builder Tab */}
        {tab === "builder" && (
          <div className="space-y-6">
            {/* Name + Description */}
            <div className="glass-card-strong rounded-xl p-5 space-y-4">
              <input
                value={wfName}
                onChange={(e) => setWfName(e.target.value)}
                placeholder="工作流名称"
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-violet-500/40"
              />
              <textarea
                value={wfDesc}
                onChange={(e) => setWfDesc(e.target.value)}
                placeholder="工作流描述（可选）"
                rows={2}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-violet-500/40 resize-none"
              />
            </div>

            {/* Pipeline */}
            <div className="flex flex-col items-center gap-0">
              {steps.map((step, idx) => {
                const agent = getAgent(step.agentId);
                return (
                  <div key={step.id} className="flex flex-col items-center w-full max-w-lg">
                    {/* Step Card */}
                    <motion.div
                      layout
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="glass-card-strong rounded-xl p-4 w-full"
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <GripVertical className="size-4 text-muted-foreground cursor-grab" />
                        <span className="text-xs font-mono text-violet-400">
                          Step {idx + 1}
                        </span>
                        <div className="flex-1" />
                        {steps.length > 1 && (
                          <button
                            onClick={() => removeStep(step.id)}
                            className="text-red-400/70 hover:text-red-400 transition-colors"
                          >
                            <Trash2 className="size-4" />
                          </button>
                        )}
                      </div>
                      <select
                        value={step.agentId}
                        onChange={(e) => updateAgent(step.id, e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-violet-500/40 mb-3"
                      >
                        {agents.map((a) => (
                          <option key={a.id} value={a.id} className="bg-zinc-900">
                            {a.name}
                          </option>
                        ))}
                      </select>
                      {agent && (
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Bot className="size-3.5 text-violet-400" />
                          <span className="truncate">{agent.description.slice(0, 80)}...</span>
                          <Badge variant="outline" className="shrink-0 text-[10px] border-violet-500/30 text-violet-300">
                            {modelLabels[agent.model] ?? agent.model}
                          </Badge>
                        </div>
                      )}
                    </motion.div>

                    {/* Connector + Insert Button */}
                    {idx < steps.length - 1 && (
                      <div className="flex flex-col items-center py-1">
                        <div className="w-px h-4 bg-violet-500/30" />
                        <button
                          onClick={() => addStep(idx)}
                          className="size-6 rounded-full border border-violet-500/30 bg-violet-500/10 flex items-center justify-center text-violet-400 hover:bg-violet-500/20 transition-colors"
                        >
                          <Plus className="size-3" />
                        </button>
                        <div className="w-px h-4 bg-violet-500/30" />
                        <ArrowDown className="size-3.5 text-violet-500/50" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Add Step */}
            <div className="flex justify-center">
              <button
                onClick={() => addStep()}
                className="flex items-center gap-2 px-4 py-2 rounded-lg border border-dashed border-violet-500/30 text-violet-400 text-sm hover:bg-violet-500/10 transition-colors"
              >
                <Plus className="size-4" />
                添加步骤
              </button>
            </div>

            {/* Actions */}
            <div className="flex gap-3 justify-center">
              <Button onClick={handleSave} className="bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white">
                <Save className="size-4 mr-1.5" />
                保存工作流
              </Button>
              <Button variant="outline" onClick={() => setShowTestModal(true)} className="border-violet-500/30 text-violet-300 hover:bg-violet-500/10">
                <Zap className="size-4 mr-1.5" />
                测试运行
              </Button>
            </div>
          </div>
        )}

        {/* Test Run Modal */}
        {showTestModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setShowTestModal(false)}>
            <div className="glass-card-strong rounded-xl p-6 w-full max-w-md mx-4 space-y-4" onClick={(e) => e.stopPropagation()}>
              <h3 className="text-lg font-semibold">测试运行</h3>
              <textarea
                value={testInput}
                onChange={(e) => setTestInput(e.target.value)}
                placeholder="输入测试内容..."
                rows={4}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-violet-500/40 resize-none"
              />
              <div className="flex gap-3 justify-end">
                <Button variant="outline" onClick={() => setShowTestModal(false)} className="border-white/10">
                  取消
                </Button>
                <Button onClick={handleTestRun} className="bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white">
                  <Play className="size-3.5 mr-1.5" />
                  运行
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
