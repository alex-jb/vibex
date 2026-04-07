"use client";

import { useState } from "react";
import { useLang } from "@/lib/i18n";
import { motion } from "framer-motion";

/* ─── Endpoint Data ─── */
interface Endpoint {
  method: "GET" | "POST" | "GET/POST";
  path: string;
  desc: string;
  reqBody?: string;
  resBody?: string;
}

interface EndpointGroup {
  label: string;
  endpoints: Endpoint[];
}

const API_GROUPS: EndpointGroup[] = [
  {
    label: "Agent API",
    endpoints: [
      {
        method: "POST",
        path: "/api/agents/run",
        desc: "运行 Agent",
        reqBody: '{\n  "agentId": "agent_abc123",\n  "input": { "prompt": "分析这段代码" },\n  "config": { "maxTokens": 4096 }\n}',
        resBody: '{\n  "runId": "run_xyz789",\n  "status": "completed",\n  "output": "代码分析结果...",\n  "tokens": 1247,\n  "latencyMs": 3200\n}',
      },
      {
        method: "POST",
        path: "/api/agents/stream",
        desc: "流式运行 Agent (SSE)",
        reqBody: '{\n  "agentId": "agent_abc123",\n  "input": { "prompt": "生成一篇文章" },\n  "stream": true\n}',
        resBody: 'event: step\ndata: {"type":"thinking","content":"分析需求..."}\n\nevent: step\ndata: {"type":"response","content":"文章内容..."}\n\nevent: done\ndata: {"runId":"run_xyz789","tokens":2048}',
      },
    ],
  },
  {
    label: "Workflow API",
    endpoints: [
      {
        method: "POST",
        path: "/api/workflows/run",
        desc: "运行工作流",
        reqBody: '{\n  "workflowId": "wf_001",\n  "input": { "url": "https://example.com" },\n  "config": { "timeout": 30000 }\n}',
        resBody: '{\n  "runId": "wfr_456",\n  "status": "completed",\n  "steps": [\n    { "agentId": "agent_1", "output": "..." },\n    { "agentId": "agent_2", "output": "..." }\n  ]\n}',
      },
    ],
  },
  {
    label: "AI API",
    endpoints: [
      {
        method: "POST",
        path: "/api/ai/review",
        desc: "AI 项目评审",
        reqBody: '{\n  "projectId": "proj_123",\n  "aspects": ["code", "ux", "market"]\n}',
        resBody: '{\n  "score": 87,\n  "strengths": ["创新性高"],\n  "weaknesses": ["文档不足"],\n  "suggestions": ["添加使用示例"]\n}',
      },
      {
        method: "POST",
        path: "/api/ai/evaluate-idea",
        desc: "AI 创意评估",
        reqBody: '{\n  "title": "AI 翻译助手",\n  "description": "基于 LLM 的实时翻译工具"\n}',
        resBody: '{\n  "viability": 82,\n  "marketFit": 75,\n  "uniqueness": 60,\n  "competition": "中等"\n}',
      },
      {
        method: "POST",
        path: "/api/ai/battle-narrative",
        desc: "AI 战斗解说",
        reqBody: '{\n  "challengerTitle": "VibeTranslate",\n  "defenderTitle": "CodeMaster",\n  "rounds": [...],\n  "winner": "challenger"\n}',
        resBody: '{\n  "intro": "一场史诗对决...",\n  "roundNarratives": ["第一回合..."],\n  "conclusion": "最终胜者...",\n  "mvpComment": "MVP 评价..."\n}',
      },
      {
        method: "POST",
        path: "/api/ai/launch-assist",
        desc: "AI 发布助手 (流式)",
        reqBody: '{\n  "projectTitle": "MyApp",\n  "description": "...",\n  "stream": true\n}',
        resBody: 'event: suggestion\ndata: {"field":"tagline","value":"..."}\n\nevent: done\ndata: {"complete":true}',
      },
      {
        method: "POST",
        path: "/api/ai/share-summary",
        desc: "AI 分享文案",
        reqBody: '{\n  "projectId": "proj_123",\n  "platform": "twitter"\n}',
        resBody: '{\n  "summary": "发现一个超赞的 AI 项目...",\n  "hashtags": ["#vibecoding", "#AI"]\n}',
      },
      {
        method: "POST",
        path: "/api/ai/trend-analysis",
        desc: "AI 趋势分析",
        reqBody: '{\n  "category": "coding",\n  "timeRange": "7d"\n}',
        resBody: '{\n  "rising": ["Agent 框架"],\n  "saturated": ["Todo 应用"],\n  "opportunities": ["多模态工具"]\n}',
      },
    ],
  },
  {
    label: "Project API",
    endpoints: [
      {
        method: "POST",
        path: "/api/projects/[id]/upvote",
        desc: "项目点赞",
        reqBody: '{\n  "projectId": "proj_123"\n}',
        resBody: '{\n  "success": true,\n  "upvotes": 42\n}',
      },
    ],
  },
  {
    label: "Social API",
    endpoints: [
      {
        method: "GET/POST",
        path: "/api/comments",
        desc: "评论",
        reqBody: '{\n  "projectId": "proj_123",\n  "content": "很棒的项目！"\n}',
        resBody: '{\n  "comments": [\n    { "id": "c_1", "content": "...", "author": "user_1" }\n  ]\n}',
      },
      {
        method: "GET/POST",
        path: "/api/follows",
        desc: "关注",
        reqBody: '{\n  "targetUserId": "user_456"\n}',
        resBody: '{\n  "following": true,\n  "followerCount": 128\n}',
      },
      {
        method: "GET/POST",
        path: "/api/notifications",
        desc: "通知",
        reqBody: "{}",
        resBody: '{\n  "notifications": [\n    { "type": "upvote", "message": "...", "read": false }\n  ]\n}',
      },
      {
        method: "POST",
        path: "/api/ideas",
        desc: "提交创意",
        reqBody: '{\n  "title": "AI 代码评审",\n  "description": "自动化代码审查工具",\n  "category": "coding"\n}',
        resBody: '{\n  "id": "idea_789",\n  "status": "submitted",\n  "aiEvaluation": { "viability": 80 }\n}',
      },
      {
        method: "POST",
        path: "/api/battles",
        desc: "保存战斗",
        reqBody: '{\n  "challengerId": "proj_1",\n  "defenderId": "proj_2",\n  "result": { "winner": "proj_1", "rounds": [...] }\n}',
        resBody: '{\n  "battleId": "btl_001",\n  "saved": true\n}',
      },
    ],
  },
];

/* ─── Code Examples ─── */
const CODE_EXAMPLES = {
  typescript: `import { VibeX } from "@vibex/sdk";

const vx = new VibeX({ apiKey: "vx-pk-..." });

const result = await vx.agents.run({
  agentId: "agent_abc123",
  input: { prompt: "分析这段代码的质量" },
  config: { maxTokens: 4096 },
});

console.log(result.output);
// => "代码分析结果: 整体质量良好..."`,
  python: `from vibex import VibeX

vx = VibeX(api_key="vx-pk-...")

result = vx.agents.run(
    agent_id="agent_abc123",
    input={"prompt": "分析这段代码的质量"},
    config={"max_tokens": 4096},
)

print(result.output)
# => "代码分析结果: 整体质量良好..."`,
  curl: `curl -X POST https://vibex.app/api/agents/run \\
  -H "Authorization: Bearer vx-pk-..." \\
  -H "Content-Type: application/json" \\
  -d '{
    "agentId": "agent_abc123",
    "input": { "prompt": "分析这段代码的质量" },
    "config": { "maxTokens": 4096 }
  }'`,
};

/* ─── Method Badge Component ─── */
function MethodBadge({ method }: { method: string }) {
  const colors: Record<string, string> = {
    GET: "#39FF14",
    POST: "#06B6D4",
    "GET/POST": "#9D00FF",
  };
  return (
    <span
      className="font-pixel"
      style={{
        fontSize: 7,
        color: "#0D0D0D",
        background: colors[method] ?? "#888",
        padding: "2px 6px",
        letterSpacing: 1,
      }}
    >
      {method}
    </span>
  );
}

/* ─── Expandable Endpoint Row ─── */
function EndpointRow({ ep }: { ep: Endpoint }) {
  const [open, setOpen] = useState(false);

  return (
    <div style={{ borderBottom: "1px solid #2A2A30" }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "10px 12px",
          background: open ? "#111118" : "transparent",
          border: "none",
          cursor: "pointer",
          textAlign: "left",
          transition: "background 0.15s",
        }}
        onMouseEnter={(e) => {
          if (!open) e.currentTarget.style.background = "#0E0E14";
        }}
        onMouseLeave={(e) => {
          if (!open) e.currentTarget.style.background = "transparent";
        }}
      >
        <MethodBadge method={ep.method} />
        <span className="font-mono" style={{ fontSize: 13, color: "#E8E8EC", flex: 1 }}>
          {ep.path}
        </span>
        <span className="font-pixel" style={{ fontSize: 7, color: "#8888A0" }}>
          {ep.desc}
        </span>
        <span style={{ color: "#555", fontSize: 12, marginLeft: 4 }}>{open ? "▼" : "▶"}</span>
      </button>
      {open && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          style={{ overflow: "hidden" }}
        >
          <div style={{ padding: "0 12px 12px", display: "flex", gap: 12, flexWrap: "wrap" }}>
            {ep.reqBody && (
              <div style={{ flex: 1, minWidth: 260 }}>
                <span className="font-pixel" style={{ fontSize: 7, color: "#06B6D4", display: "block", marginBottom: 4 }}>
                  {">"} Request Body
                </span>
                <div
                  className="rpgui-container framed"
                  style={{
                    padding: 10,
                    position: "relative",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      background:
                        "repeating-linear-gradient(0deg, transparent 0, transparent 2px, rgba(0,0,0,0.06) 2px, rgba(0,0,0,0.06) 4px)",
                      pointerEvents: "none",
                    }}
                  />
                  <pre className="font-mono" style={{ fontSize: 11, color: "#39FF14", margin: 0, whiteSpace: "pre-wrap", position: "relative", zIndex: 1 }}>
                    {ep.reqBody}
                  </pre>
                </div>
              </div>
            )}
            {ep.resBody && (
              <div style={{ flex: 1, minWidth: 260 }}>
                <span className="font-pixel" style={{ fontSize: 7, color: "#FACC15", display: "block", marginBottom: 4 }}>
                  {">"} Response
                </span>
                <div
                  className="rpgui-container framed"
                  style={{
                    padding: 10,
                    position: "relative",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      background:
                        "repeating-linear-gradient(0deg, transparent 0, transparent 2px, rgba(0,0,0,0.06) 2px, rgba(0,0,0,0.06) 4px)",
                      pointerEvents: "none",
                    }}
                  />
                  <pre className="font-mono" style={{ fontSize: 11, color: "#FACC15", margin: 0, whiteSpace: "pre-wrap", position: "relative", zIndex: 1 }}>
                    {ep.resBody}
                  </pre>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
}

/* ─── Main Developer Platform Page ─── */
export default function DevelopersPage() {
  const { t } = useLang();
  const [codeTab, setCodeTab] = useState<"typescript" | "python" | "curl">("typescript");
  const [copiedKey, setCopiedKey] = useState(false);
  const [copiedSdk, setCopiedSdk] = useState<string | null>(null);

  const mockApiKey = "vx-pk-a3f8••••••••••••7b2e";

  const copyToClipboard = (text: string, id?: string) => {
    navigator.clipboard.writeText(text).then(() => {
      if (id) {
        setCopiedSdk(id);
        setTimeout(() => setCopiedSdk(null), 1500);
      } else {
        setCopiedKey(true);
        setTimeout(() => setCopiedKey(false), 1500);
      }
    });
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
      {/* ═══ Terminal Header ═══ */}
      <div
        style={{
          background: "#0A0A0C",
          padding: "8px 12px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: "2px solid #2A2A30",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ width: 10, height: 10, background: "#FF4500", display: "inline-block" }} />
          <span style={{ width: 10, height: 10, background: "#FACC15", display: "inline-block" }} />
          <span style={{ width: 10, height: 10, background: "#39FF14", display: "inline-block" }} />
        </div>
        <span className="font-pixel" style={{ fontSize: 8, color: "#555", letterSpacing: 2 }}>
          VIBEX://DEV-PORTAL v2.0
        </span>
        <span className="font-pixel" style={{ fontSize: 7, color: "#333" }}>
          ━━━
        </span>
      </div>

      {/* ═══ Main Terminal Body ═══ */}
      <div
        className="rpgui-container framed"
        style={{
          minHeight: "70vh",
          padding: 20,
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Scanline overlay */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "repeating-linear-gradient(0deg, transparent 0, transparent 2px, rgba(0,0,0,0.08) 2px, rgba(0,0,0,0.08) 4px)",
            pointerEvents: "none",
            zIndex: 1,
          }}
        />

        <div style={{ position: "relative", zIndex: 2 }}>
          {/* Title */}
          <motion.div initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}>
            <span className="font-pixel" style={{ fontSize: 7, color: "#555" }}>$ vibex --dev-portal</span>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <span
              className="font-pixel"
              style={{
                fontSize: 14,
                color: "#39FF14",
                textShadow: "0 0 20px rgba(57,255,20,0.3)",
              }}
            >
              {">"} {t("dev.title")}
            </span>
          </motion.div>

          <div style={{ height: 24 }} />

          {/* ═══ (a) API Overview ═══ */}
          <section>
            <span className="font-pixel" style={{ fontSize: 9, color: "#9D00FF" }}>
              {">"} API {t("dev.overview")}
            </span>
            <div
              className="grid grid-cols-1 md:grid-cols-3 gap-4"
              style={{ marginTop: 12 }}
            >
              {[
                {
                  icon: "🌐",
                  title: "REST API",
                  desc: t("dev.restDesc"),
                  color: "#39FF14",
                },
                {
                  icon: "⚡",
                  title: "Streaming",
                  desc: t("dev.streamDesc"),
                  color: "#06B6D4",
                },
                {
                  icon: "🔔",
                  title: "Webhooks",
                  desc: t("dev.webhookDesc"),
                  color: "#FACC15",
                },
              ].map((card) => (
                <div
                  key={card.title}
                  className="retro-border"
                  style={{
                    padding: 16,
                    background: "#0A0A0C",
                    border: `2px solid ${card.color}30`,
                  }}
                >
                  <div style={{ fontSize: 24, marginBottom: 8 }}>{card.icon}</div>
                  <div className="font-pixel" style={{ fontSize: 9, color: card.color, marginBottom: 6 }}>
                    {card.title}
                  </div>
                  <div className="font-pixel" style={{ fontSize: 7, color: "#8888A0", lineHeight: 1.6 }}>
                    {card.desc}
                  </div>
                </div>
              ))}
            </div>
          </section>

          <div style={{ height: 32 }} />

          {/* ═══ (c) API Endpoint Documentation ═══ */}
          <section>
            <span className="font-pixel" style={{ fontSize: 9, color: "#9D00FF" }}>
              {">"} API {t("dev.endpoints")}
            </span>
            <div style={{ marginTop: 12 }}>
              {API_GROUPS.map((group) => (
                <div key={group.label} style={{ marginBottom: 16 }}>
                  <div
                    className="font-pixel"
                    style={{
                      fontSize: 8,
                      color: "#06B6D4",
                      padding: "6px 10px",
                      background: "#06B6D408",
                      borderLeft: "3px solid #06B6D4",
                      marginBottom: 4,
                    }}
                  >
                    {group.label}
                  </div>
                  <div style={{ border: "1px solid #2A2A30" }}>
                    {group.endpoints.map((ep) => (
                      <EndpointRow key={ep.path + ep.method} ep={ep} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>

          <div style={{ height: 32 }} />

          {/* ═══ (d) API Key Management ═══ */}
          <section>
            <span className="font-pixel" style={{ fontSize: 9, color: "#9D00FF" }}>
              {">"} API Key {t("dev.management")}
            </span>
            <div
              className="rpgui-container framed"
              style={{ marginTop: 12, padding: 16 }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                <span className="font-pixel" style={{ fontSize: 7, color: "#8888A0" }}>
                  {t("dev.yourKey")}:
                </span>
                <span
                  className="font-mono"
                  style={{
                    fontSize: 13,
                    color: "#E8E8EC",
                    background: "#0A0A0C",
                    padding: "4px 10px",
                    border: "1px solid #2A2A30",
                    letterSpacing: 1,
                  }}
                >
                  {mockApiKey}
                </span>
                <button
                  className="nes-btn is-primary"
                  style={{ fontSize: 9, padding: "6px 12px" }}
                  onClick={() => copyToClipboard("vx-pk-a3f8xxxxxxxxxxxx7b2e")}
                >
                  {copiedKey ? "✓" : t("dev.copy")}
                </button>
                <div title="即将推出">
                  <button
                    className="nes-btn is-warning"
                    style={{ fontSize: 9, padding: "6px 12px", opacity: 0.5, cursor: "not-allowed" }}
                    disabled
                  >
                    {t("dev.regenerate")}
                  </button>
                </div>
                <button
                  className="nes-btn is-success"
                  style={{ fontSize: 9, padding: "6px 12px" }}
                >
                  {t("dev.createKey")}
                </button>
              </div>

              <div style={{ marginTop: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                  <span className="font-pixel" style={{ fontSize: 7, color: "#8888A0" }}>
                    {t("dev.requests")}: 1,247 / {t("dev.limit")} 10,000
                  </span>
                  <span className="font-pixel" style={{ fontSize: 7, color: "#39FF14" }}>
                    12.5%
                  </span>
                </div>
                <div
                  style={{
                    height: 14,
                    background: "#0A0A0C",
                    border: "2px solid #2A2A30",
                    position: "relative",
                    overflow: "hidden",
                  }}
                >
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: "12.5%" }}
                    transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                    style={{
                      height: "100%",
                      background: "#39FF14",
                      position: "relative",
                    }}
                  >
                    <div
                      style={{
                        position: "absolute",
                        inset: 0,
                        background:
                          "repeating-linear-gradient(90deg, transparent 0, transparent 5px, rgba(0,0,0,0.3) 5px, rgba(0,0,0,0.3) 7px)",
                      }}
                    />
                  </motion.div>
                </div>
              </div>
            </div>
          </section>

          <div style={{ height: 32 }} />

          {/* ═══ (e) SDK Downloads ═══ */}
          <section>
            <span className="font-pixel" style={{ fontSize: 9, color: "#9D00FF" }}>
              {">"} SDK {t("dev.download")}
            </span>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4" style={{ marginTop: 12 }}>
              {[
                { id: "ts", label: "TypeScript SDK", cmd: "npm install @vibex/sdk", color: "#06B6D4" },
                { id: "py", label: "Python SDK", cmd: "pip install vibex-sdk", color: "#FACC15" },
                {
                  id: "curl",
                  label: "cURL",
                  cmd: 'curl -H "Authorization: Bearer vx-pk-..." https://vibex.app/api/...',
                  color: "#39FF14",
                },
              ].map((sdk) => (
                <div
                  key={sdk.id}
                  className="retro-border"
                  style={{ padding: 16, background: "#0A0A0C", border: `2px solid ${sdk.color}30` }}
                >
                  <div className="font-pixel" style={{ fontSize: 8, color: sdk.color, marginBottom: 8 }}>
                    {sdk.label}
                  </div>
                  <div
                    style={{
                      background: "#050508",
                      border: "1px solid #2A2A30",
                      padding: "8px 10px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 8,
                      position: "relative",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        position: "absolute",
                        inset: 0,
                        background:
                          "repeating-linear-gradient(0deg, transparent 0, transparent 2px, rgba(0,0,0,0.06) 2px, rgba(0,0,0,0.06) 4px)",
                        pointerEvents: "none",
                      }}
                    />
                    <code className="font-mono" style={{ fontSize: 11, color: "#E8E8EC", position: "relative", zIndex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {sdk.cmd}
                    </code>
                    <button
                      className="nes-btn is-primary"
                      style={{ fontSize: 8, padding: "4px 8px", position: "relative", zIndex: 1, flexShrink: 0 }}
                      onClick={() => copyToClipboard(sdk.cmd, sdk.id)}
                    >
                      {copiedSdk === sdk.id ? "✓" : t("dev.copy")}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <div style={{ height: 32 }} />

          {/* ═══ (f) Code Examples ═══ */}
          <section>
            <span className="font-pixel" style={{ fontSize: 9, color: "#9D00FF" }}>
              {">"} {t("dev.codeExamples")}
            </span>
            <div style={{ marginTop: 12 }}>
              {/* Tabs */}
              <div style={{ display: "flex", gap: 4, marginBottom: 0 }}>
                {(["typescript", "python", "curl"] as const).map((tab) => (
                  <button
                    key={tab}
                    className={`nes-btn ${codeTab === tab ? "is-primary" : ""}`}
                    style={{ fontSize: 8, padding: "6px 14px" }}
                    onClick={() => setCodeTab(tab)}
                  >
                    {tab === "typescript" ? "TypeScript" : tab === "python" ? "Python" : "cURL"}
                  </button>
                ))}
              </div>
              <div
                className="rpgui-container framed"
                style={{
                  padding: 16,
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    background:
                      "repeating-linear-gradient(0deg, transparent 0, transparent 2px, rgba(0,0,0,0.06) 2px, rgba(0,0,0,0.06) 4px)",
                    pointerEvents: "none",
                  }}
                />
                <pre
                  className="font-mono"
                  style={{
                    fontSize: 12,
                    color: "#39FF14",
                    margin: 0,
                    whiteSpace: "pre-wrap",
                    lineHeight: 1.6,
                    position: "relative",
                    zIndex: 1,
                  }}
                >
                  {CODE_EXAMPLES[codeTab]}
                </pre>
              </div>
            </div>
          </section>

          <div style={{ height: 32 }} />

          {/* ═══ (g) Rate Limits ═══ */}
          <section>
            <span className="font-pixel" style={{ fontSize: 9, color: "#9D00FF" }}>
              {">"} {t("dev.rateLimits")}
            </span>
            <div
              className="rpgui-container framed-golden"
              style={{ marginTop: 12, padding: 16, overflowX: "auto" }}
            >
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr>
                    {[t("dev.plan"), t("dev.reqPerDay"), t("dev.tokensPerDay"), ""].map((h, i) => (
                      <th
                        key={i}
                        className="font-pixel"
                        style={{
                          fontSize: 7,
                          color: "#FACC15",
                          textAlign: "left",
                          padding: "8px 12px",
                          borderBottom: "2px solid #3A3A40",
                        }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    { plan: "Free", req: "100", tokens: "10K", btnClass: "" },
                    { plan: "Pro", req: "10,000", tokens: "1M", btnClass: "is-primary" },
                    { plan: "Enterprise", req: t("dev.unlimited"), tokens: t("dev.unlimited"), btnClass: "is-success" },
                  ].map((row) => (
                    <tr key={row.plan} style={{ borderBottom: "1px solid #2A2A30" }}>
                      <td className="font-pixel" style={{ fontSize: 8, color: "#E8E8EC", padding: "10px 12px" }}>
                        {row.plan}
                      </td>
                      <td className="font-mono" style={{ fontSize: 12, color: "#8888A0", padding: "10px 12px" }}>
                        {row.req}
                      </td>
                      <td className="font-mono" style={{ fontSize: 12, color: "#8888A0", padding: "10px 12px" }}>
                        {row.tokens}
                      </td>
                      <td style={{ padding: "10px 12px", textAlign: "right" }}>
                        {row.plan !== "Free" && (
                          <button
                            className={`nes-btn ${row.btnClass}`}
                            style={{ fontSize: 8, padding: "4px 12px" }}
                          >
                            {t("dev.upgrade")}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* ─── Terminal prompt ─── */}
          <div style={{ marginTop: 24 }}>
            <span className="font-retro" style={{ color: "#39FF14", fontSize: 18 }}>
              {">"}{" "}
            </span>
            <span
              style={{
                display: "inline-block",
                width: 8,
                height: 16,
                background: "#39FF14",
                animation: "blink-cursor 0.8s step-end infinite",
                verticalAlign: "middle",
              }}
            />
          </div>
        </div>
      </div>

      <style>{`
        @keyframes blink-cursor {
          50% { opacity: 0; }
        }
      `}</style>
    </div>
  );
}
