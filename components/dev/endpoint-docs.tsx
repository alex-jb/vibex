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
        desc: "Run Agent",
        reqBody: '{\n  "agentId": "agent_abc123",\n  "input": { "prompt": "Analyze this code" },\n  "config": { "maxTokens": 4096 }\n}',
        resBody: '{\n  "runId": "run_xyz789",\n  "status": "completed",\n  "output": "Code analysis result...",\n  "tokens": 1247,\n  "latencyMs": 3200\n}',
      },
      {
        method: "POST",
        path: "/api/agents/stream",
        desc: "Stream Agent (SSE)",
        reqBody: '{\n  "agentId": "agent_abc123",\n  "input": { "prompt": "Generate an article" },\n  "stream": true\n}',
        resBody: 'event: step\ndata: {"type":"thinking","content":"Analyzing requirements..."}\n\nevent: step\ndata: {"type":"response","content":"Article content..."}\n\nevent: done\ndata: {"runId":"run_xyz789","tokens":2048}',
      },
    ],
  },
  {
    label: "Workflow API",
    endpoints: [
      {
        method: "POST",
        path: "/api/workflows/run",
        desc: "Run Workflow",
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
        desc: "AI Project Review",
        reqBody: '{\n  "projectId": "proj_123",\n  "aspects": ["code", "ux", "market"]\n}',
        resBody: '{\n  "score": 87,\n  "strengths": ["Highly innovative"],\n  "weaknesses": ["Insufficient documentation"],\n  "suggestions": ["Add usage examples"]\n}',
      },
      {
        method: "POST",
        path: "/api/ai/evaluate-idea",
        desc: "AI Idea Evaluation",
        reqBody: '{\n  "title": "AI Translation Assistant",\n  "description": "Real-time translation tool powered by LLM"\n}',
        resBody: '{\n  "viability": 82,\n  "marketFit": 75,\n  "uniqueness": 60,\n  "competition": "moderate"\n}',
      },
      {
        method: "POST",
        path: "/api/ai/battle-narrative",
        desc: "AI Battle Narrative",
        reqBody: '{\n  "challengerTitle": "VibeTranslate",\n  "defenderTitle": "CodeMaster",\n  "rounds": [...],\n  "winner": "challenger"\n}',
        resBody: '{\n  "intro": "An epic showdown...",\n  "roundNarratives": ["Round one..."],\n  "conclusion": "The final victor...",\n  "mvpComment": "MVP commentary..."\n}',
      },
      {
        method: "POST",
        path: "/api/ai/launch-assist",
        desc: "AI Launch Assist (streaming)",
        reqBody: '{\n  "projectTitle": "MyApp",\n  "description": "...",\n  "stream": true\n}',
        resBody: 'event: suggestion\ndata: {"field":"tagline","value":"..."}\n\nevent: done\ndata: {"complete":true}',
      },
      {
        method: "POST",
        path: "/api/ai/share-summary",
        desc: "AI Share Copy",
        reqBody: '{\n  "projectId": "proj_123",\n  "platform": "twitter"\n}',
        resBody: '{\n  "summary": "Discovered an amazing AI project...",\n  "hashtags": ["#vibecoding", "#AI"]\n}',
      },
      {
        method: "POST",
        path: "/api/ai/trend-analysis",
        desc: "AI Trend Analysis",
        reqBody: '{\n  "category": "coding",\n  "timeRange": "7d"\n}',
        resBody: '{\n  "rising": ["Agent frameworks"],\n  "saturated": ["Todo apps"],\n  "opportunities": ["Multimodal tools"]\n}',
      },
    ],
  },
  {
    label: "Project API",
    endpoints: [
      {
        method: "POST",
        path: "/api/projects/[id]/upvote",
        desc: "Upvote Project",
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
        desc: "Comments",
        reqBody: '{\n  "projectId": "proj_123",\n  "content": "Great project!"\n}',
        resBody: '{\n  "comments": [\n    { "id": "c_1", "content": "...", "author": "user_1" }\n  ]\n}',
      },
      {
        method: "GET/POST",
        path: "/api/follows",
        desc: "Follow",
        reqBody: '{\n  "targetUserId": "user_456"\n}',
        resBody: '{\n  "following": true,\n  "followerCount": 128\n}',
      },
      {
        method: "GET/POST",
        path: "/api/notifications",
        desc: "Notifications",
        reqBody: "{}",
        resBody: '{\n  "notifications": [\n    { "type": "upvote", "message": "...", "read": false }\n  ]\n}',
      },
      {
        method: "POST",
        path: "/api/ideas",
        desc: "Submit Idea",
        reqBody: '{\n  "title": "AI Code Review",\n  "description": "Automated code review tool",\n  "category": "coding"\n}',
        resBody: '{\n  "id": "idea_789",\n  "status": "submitted",\n  "aiEvaluation": { "viability": 80 }\n}',
      },
      {
        method: "POST",
        path: "/api/battles",
        desc: "Save Battle",
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
