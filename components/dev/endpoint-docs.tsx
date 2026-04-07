"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useLang } from "@/lib/i18n";

/* ─── Types ─── */
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

/* ─── Data ─── */
export const API_GROUPS: EndpointGroup[] = [
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

/* ─── Method Badge ─── */
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
        aria-expanded={open}
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
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} style={{ overflow: "hidden" }}>
          <div style={{ padding: "0 12px 12px", display: "flex", gap: 12, flexWrap: "wrap" }}>
            {ep.reqBody && (
              <div style={{ flex: 1, minWidth: 260 }}>
                <span className="font-pixel" style={{ fontSize: 7, color: "#06B6D4", display: "block", marginBottom: 4 }}>
                  {">"} Request Body
                </span>
                <div className="rpgui-container framed" style={{ padding: 10, position: "relative", overflow: "hidden" }}>
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      background: "repeating-linear-gradient(0deg, transparent 0, transparent 2px, rgba(0,0,0,0.06) 2px, rgba(0,0,0,0.06) 4px)",
                      pointerEvents: "none",
                    }}
                  />
                  <div className="overflow-x-auto">
                    <pre className="font-mono" style={{ fontSize: 11, color: "#39FF14", margin: 0, whiteSpace: "pre-wrap", position: "relative", zIndex: 1 }}>
                      {ep.reqBody}
                    </pre>
                  </div>
                </div>
              </div>
            )}
            {ep.resBody && (
              <div style={{ flex: 1, minWidth: 260 }}>
                <span className="font-pixel" style={{ fontSize: 7, color: "#FACC15", display: "block", marginBottom: 4 }}>
                  {">"} Response
                </span>
                <div className="rpgui-container framed" style={{ padding: 10, position: "relative", overflow: "hidden" }}>
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      background: "repeating-linear-gradient(0deg, transparent 0, transparent 2px, rgba(0,0,0,0.06) 2px, rgba(0,0,0,0.06) 4px)",
                      pointerEvents: "none",
                    }}
                  />
                  <div className="overflow-x-auto">
                    <pre className="font-mono" style={{ fontSize: 11, color: "#FACC15", margin: 0, whiteSpace: "pre-wrap", position: "relative", zIndex: 1 }}>
                      {ep.resBody}
                    </pre>
                  </div>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
}

/* ─── Main EndpointDocs Component ─── */
export function EndpointDocs() {
  const { t } = useLang();

  return (
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
  );
}
