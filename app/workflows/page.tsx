"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  Play,
  Plus,
  Trash2,
  GripVertical,
  Bot,
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
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

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

  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!wfName.trim()) {
      setMessage({ type: "error", text: "请输入工作流名称" });
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/workflows", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: wfName,
          description: wfDesc,
          steps: steps.map((s) => ({ agentId: s.agentId })),
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        setMessage({ type: "error", text: data.error || "保存失败" });
        return;
      }
      setMessage({ type: "success", text: `工作流「${wfName}」已保存！` });
    } catch {
      setMessage({ type: "error", text: "网络错误，请稍后再试" });
    } finally {
      setSaving(false);
    }
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
      setMessage({ type: "success", text: `测试完成: ${JSON.stringify(data).slice(0, 200)}` });
    } catch {
      setMessage({ type: "error", text: "测试运行失败，请稍后再试" });
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-16 px-4 sm:px-6">
      <div className="mx-auto max-w-5xl">
        {/* Terminal Header */}
        <div
          style={{
            background: "#0A0A0C",
            padding: "8px 12px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderBottom: "2px solid #2A2A30",
            marginBottom: 8,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ width: 10, height: 10, background: "#FF4500", display: "inline-block" }} />
            <span style={{ width: 10, height: 10, background: "#FACC15", display: "inline-block" }} />
            <span style={{ width: 10, height: 10, background: "#39FF14", display: "inline-block" }} />
          </div>
          <span className="font-pixel" style={{ fontSize: 8, color: "#555", letterSpacing: 2 }}>
            VIBEX://WORKFLOWS v1.0
          </span>
          <span className="font-pixel" style={{ fontSize: 7, color: "#333" }}>
            ━━━
          </span>
        </div>
        <div className="mb-8 text-center">
          <h1 className="font-pixel text-xl" style={{ color: "#39FF14", letterSpacing: 2 }}>
            {">"} VIBEX://WORKFLOWS
          </h1>
          <p className="text-sm text-muted-foreground mt-2">多智能体工作流引擎</p>
        </div>

        {/* Tabs - NES Buttons */}
        <div className="flex gap-2 mb-8 justify-center">
          {(["browse", "builder"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={tab === t ? "nes-btn is-primary" : "nes-btn"}
              style={{ fontSize: 10, padding: "6px 14px" }}
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
                  className="glass-card-strong rounded-xl p-5 flex flex-col gap-3 retro-border"
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

            {/* Pipeline - RPGUI framed */}
            <div className="rpgui-container framed" style={{ padding: 20 }}>
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
                        className="glass-card-strong rounded-xl p-4 w-full retro-border"
                      >
                        <div className="flex items-center gap-3 mb-3">
                          <GripVertical className="size-4 text-muted-foreground cursor-grab" />
                          <span className="font-pixel text-violet-400" style={{ fontSize: 9 }}>
                            STEP {String(idx + 1).padStart(2, "0")}
                          </span>
                          <div className="flex-1" />
                          {steps.length > 1 && (
                            <button
                              onClick={() => removeStep(step.id)}
                              aria-label={`Remove step ${idx + 1}`}
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

                      {/* Pixel Arrow Connector + Insert Button */}
                      {idx < steps.length - 1 && (
                        <div className="flex flex-col items-center py-1">
                          <div className="w-px h-4 bg-violet-500/30" />
                          <button
                            onClick={() => addStep(idx)}
                            aria-label={`Insert step after step ${idx + 1}`}
                            className="size-6 rounded-full border border-violet-500/30 bg-violet-500/10 flex items-center justify-center text-violet-400 hover:bg-violet-500/20 transition-colors"
                          >
                            <Plus className="size-3" />
                          </button>
                          <div className="w-px h-4 bg-violet-500/30" />
                          <span className="font-pixel text-violet-500/70" style={{ fontSize: 12 }}>&#9660;</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Add Step */}
            <div className="flex justify-center">
              <button
                onClick={() => addStep()}
                aria-label="Add new step"
                className="flex items-center gap-2 px-4 py-2 rounded-lg border border-dashed border-violet-500/30 text-violet-400 text-sm hover:bg-violet-500/10 transition-colors"
              >
                <Plus className="size-4" />
                添加步骤
              </button>
            </div>

            {/* Actions - NES Buttons */}
            <div className="flex gap-3 justify-center">
              <button onClick={handleSave} disabled={saving} className={`nes-btn is-primary${saving ? " is-disabled" : ""}`} style={{ fontSize: 10, padding: "6px 14px" }}>
                {saving ? "保存中..." : "保存工作流"}
              </button>
              <button onClick={() => setShowTestModal(true)} className="nes-btn is-warning" style={{ fontSize: 10, padding: "6px 14px" }}>
                测试运行
              </button>
            </div>
          </div>
        )}

        {/* Inline message banner */}
        {message && (
          <div
            className={`rpgui-container framed text-center ${message.type === "success" ? "" : ""}`}
            style={{ padding: 12, marginBottom: 8 }}
          >
            <p
              className={`font-pixel ${message.type === "success" ? "text-emerald-400" : "text-red-400"}`}
              style={{ fontSize: 11, textShadow: message.type === "success" ? "0 0 10px rgba(57,255,20,0.3)" : "0 0 10px rgba(255,0,0,0.3)" }}
            >
              {message.text}
            </p>
            <button
              onClick={() => setMessage(null)}
              className="font-pixel text-muted-foreground mt-2 hover:text-foreground transition-colors"
              style={{ fontSize: 8 }}
            >
              [dismiss]
            </button>
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
