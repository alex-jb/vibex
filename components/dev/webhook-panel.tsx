"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

/* ─── Constants ─── */
const WEBHOOK_EVENTS = [
  "project.created",
  "project.upvoted",
  "battle.completed",
  "agent.run",
  "comment.created",
  "idea.submitted",
] as const;

/* ─── Types ─── */
interface WebhookItem {
  id: string;
  url: string;
  events: string[];
  is_active: boolean;
  last_triggered_at: string | null;
  failure_count: number;
  created_at: string;
}

interface LogEntry {
  id: number;
  event: string;
  success: boolean;
  response_status: number | null;
  duration_ms: number | null;
  created_at: string;
}

/* ─── Mock Data ─── */
const MOCK_WEBHOOKS: WebhookItem[] = [
  {
    id: "wh-mock-001",
    url: "https://example.com/webhook/vibex",
    events: ["project.created", "project.upvoted"],
    is_active: true,
    last_triggered_at: new Date(Date.now() - 3600000).toISOString(),
    failure_count: 0,
    created_at: new Date(Date.now() - 86400000 * 7).toISOString(),
  },
  {
    id: "wh-mock-002",
    url: "https://myapp.dev/hooks/battles",
    events: ["battle.completed", "agent.run"],
    is_active: false,
    last_triggered_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    failure_count: 5,
    created_at: new Date(Date.now() - 86400000 * 14).toISOString(),
  },
];

const MOCK_LOGS: LogEntry[] = [
  { id: 1, event: "project.created", success: true, response_status: 200, duration_ms: 142, created_at: new Date(Date.now() - 3600000).toISOString() },
  { id: 2, event: "project.upvoted", success: true, response_status: 200, duration_ms: 98, created_at: new Date(Date.now() - 7200000).toISOString() },
  { id: 3, event: "battle.completed", success: false, response_status: 500, duration_ms: 3021, created_at: new Date(Date.now() - 14400000).toISOString() },
  { id: 4, event: "agent.run", success: true, response_status: 200, duration_ms: 210, created_at: new Date(Date.now() - 28800000).toISOString() },
  { id: 5, event: "project.created", success: false, response_status: null, duration_ms: 10001, created_at: new Date(Date.now() - 86400000).toISOString() },
];

/* ─── Helpers ─── */
function truncateUrl(url: string, max = 40): string {
  if (url.length <= max) return url;
  return url.slice(0, max - 3) + "...";
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

/* ─── Status Dot ─── */
function StatusDot({ success }: { success: boolean }) {
  return (
    <span
      style={{
        display: "inline-block",
        width: 8,
        height: 8,
        background: success ? "#39FF14" : "#FF4500",
        boxShadow: success ? "0 0 6px #39FF1480" : "0 0 6px #FF450080",
        flexShrink: 0,
      }}
    />
  );
}

/* ─── Webhook Card ─── */
function WebhookCard({
  webhook,
  onToggle,
  onTest,
  onDelete,
  testingId,
}: {
  webhook: WebhookItem;
  onToggle: (id: string, active: boolean) => void;
  onTest: (id: string) => void;
  onDelete: (id: string) => void;
  testingId: string | null;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        background: "#0A0A0C",
        border: `2px solid ${webhook.is_active ? "#39FF1430" : "#FF450030"}`,
        padding: 14,
        marginBottom: 8,
      }}
    >
      {/* Header row */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
        <span
          className="font-pixel"
          style={{
            fontSize: 7,
            color: "#0D0D0D",
            background: webhook.is_active ? "#39FF14" : "#FF4500",
            padding: "2px 6px",
          }}
        >
          {webhook.is_active ? "ACTIVE" : "DISABLED"}
        </span>
        <span className="font-mono" style={{ fontSize: 11, color: "#E8E8EC", flex: 1 }}>
          {truncateUrl(webhook.url)}
        </span>
        {webhook.failure_count > 0 && (
          <span className="font-pixel" style={{ fontSize: 7, color: "#FF4500" }}>
            FAIL:{webhook.failure_count}
          </span>
        )}
      </div>

      {/* Events */}
      <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginTop: 8 }}>
        {webhook.events.map((ev) => (
          <span
            key={ev}
            className="font-pixel"
            style={{
              fontSize: 6,
              color: "#06B6D4",
              background: "#06B6D410",
              border: "1px solid #06B6D430",
              padding: "2px 5px",
            }}
          >
            {ev}
          </span>
        ))}
      </div>

      {/* Meta + Actions */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
        {webhook.last_triggered_at && (
          <span className="font-pixel" style={{ fontSize: 6, color: "#8888A0" }}>
            Last: {timeAgo(webhook.last_triggered_at)}
          </span>
        )}
        <div style={{ flex: 1 }} />
        <button
          className="nes-btn is-primary"
          style={{ fontSize: 8, padding: "4px 8px" }}
          onClick={() => onToggle(webhook.id, !webhook.is_active)}
        >
          {webhook.is_active ? "Disable" : "Enable"}
        </button>
        <button
          className="nes-btn is-success"
          style={{ fontSize: 8, padding: "4px 8px" }}
          disabled={testingId === webhook.id}
          onClick={() => onTest(webhook.id)}
        >
          {testingId === webhook.id ? "Ping..." : "Test"}
        </button>
        <button
          className="nes-btn is-error"
          style={{ fontSize: 8, padding: "4px 8px" }}
          onClick={() => onDelete(webhook.id)}
        >
          Del
        </button>
      </div>
    </motion.div>
  );
}

/* ─── Add Webhook Form ─── */
function AddWebhookForm({ onAdd, onCancel }: { onAdd: (url: string, events: string[]) => void; onCancel: () => void }) {
  const [url, setUrl] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);

  const toggleEvent = (ev: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(ev)) next.delete(ev);
      else next.add(ev);
      return next;
    });
  };

  const handleSubmit = () => {
    if (!url.trim()) { setError("URL is required"); return; }
    try {
      const u = new URL(url);
      if (u.protocol !== "https:" && u.protocol !== "http:") throw new Error();
    } catch {
      setError("Enter a valid HTTP(S) URL"); return;
    }
    if (selected.size === 0) { setError("Select at least one event"); return; }
    setError(null);
    onAdd(url.trim(), Array.from(selected));
  };

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      style={{
        background: "#0A0A0C",
        border: "2px solid #9D00FF30",
        padding: 14,
        marginBottom: 12,
        overflow: "hidden",
      }}
    >
      <span className="font-pixel" style={{ fontSize: 8, color: "#9D00FF" }}>
        {">"} NEW WEBHOOK
      </span>

      {/* URL input */}
      <div style={{ marginTop: 10 }}>
        <label className="font-pixel" style={{ fontSize: 7, color: "#8888A0", display: "block", marginBottom: 4 }}>
          Endpoint URL
        </label>
        <input
          type="url"
          placeholder="https://your-app.com/webhook"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="font-mono"
          style={{
            width: "100%",
            fontSize: 12,
            color: "#E8E8EC",
            background: "#050508",
            border: "2px solid #2A2A30",
            padding: "8px 10px",
            outline: "none",
          }}
        />
      </div>

      {/* Event checkboxes */}
      <div style={{ marginTop: 10 }}>
        <label className="font-pixel" style={{ fontSize: 7, color: "#8888A0", display: "block", marginBottom: 6 }}>
          Events
        </label>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 4 }}>
          {WEBHOOK_EVENTS.map((ev) => (
            <button
              key={ev}
              onClick={() => toggleEvent(ev)}
              className="font-pixel"
              style={{
                fontSize: 7,
                textAlign: "left",
                padding: "4px 8px",
                color: selected.has(ev) ? "#39FF14" : "#8888A0",
                background: selected.has(ev) ? "#39FF1410" : "transparent",
                border: `1px solid ${selected.has(ev) ? "#39FF1440" : "#2A2A30"}`,
                cursor: "pointer",
              }}
            >
              {selected.has(ev) ? "[x]" : "[ ]"} {ev}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="font-pixel" style={{ fontSize: 7, color: "#FF4500", marginTop: 8 }}>
          ERR: {error}
        </div>
      )}

      {/* Form actions */}
      <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
        <button className="nes-btn is-success" style={{ fontSize: 8, padding: "6px 12px" }} onClick={handleSubmit}>
          Create
        </button>
        <button className="nes-btn" style={{ fontSize: 8, padding: "6px 12px" }} onClick={onCancel}>
          Cancel
        </button>
      </div>
    </motion.div>
  );
}

/* ─── Main Panel ─── */
export function WebhookPanel() {
  const [webhooks, setWebhooks] = useState<WebhookItem[]>(MOCK_WEBHOOKS);
  const [logs] = useState<LogEntry[]>(MOCK_LOGS);
  const [showForm, setShowForm] = useState(false);
  const [testingId, setTestingId] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<{ id: string; ok: boolean; ms: number } | null>(null);

  const handleToggle = useCallback((id: string, active: boolean) => {
    setWebhooks((prev) =>
      prev.map((w) => (w.id === id ? { ...w, is_active: active, failure_count: active ? 0 : w.failure_count } : w)),
    );
    /* In production: PATCH /api/webhooks/[id] { is_active } */
  }, []);

  const handleDelete = useCallback((id: string) => {
    setWebhooks((prev) => prev.filter((w) => w.id !== id));
    /* In production: DELETE /api/webhooks/[id] */
  }, []);

  const handleAdd = useCallback((url: string, events: string[]) => {
    const newWh: WebhookItem = {
      id: `wh-${Date.now()}`,
      url,
      events,
      is_active: true,
      last_triggered_at: null,
      failure_count: 0,
      created_at: new Date().toISOString(),
    };
    setWebhooks((prev) => [newWh, ...prev]);
    setShowForm(false);
    /* In production: POST /api/webhooks { url, events } */
  }, []);

  const handleTest = useCallback(async (id: string) => {
    setTestingId(id);
    setTestResult(null);
    /* Mock test — in production: POST /api/webhooks/test { webhookId } */
    await new Promise((r) => setTimeout(r, 800 + Math.random() * 600));
    const ok = Math.random() > 0.3;
    const ms = Math.floor(80 + Math.random() * 300);
    setTestResult({ id, ok, ms });
    setTestingId(null);
  }, []);

  return (
    <section>
      <span className="font-pixel" style={{ fontSize: 9, color: "#9D00FF" }}>
        {">"} Webhook Management
      </span>

      <div className="rpgui-container framed" style={{ marginTop: 12, padding: 16 }}>
        {/* Section header + add button */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
          <span className="font-pixel" style={{ fontSize: 8, color: "#FACC15" }}>
            Registered Webhooks ({webhooks.length})
          </span>
          <button
            className="nes-btn is-warning"
            style={{ fontSize: 8, padding: "5px 10px" }}
            onClick={() => setShowForm((p) => !p)}
          >
            {showForm ? "Cancel" : "+ Add Webhook"}
          </button>
        </div>

        {/* Add form */}
        <AnimatePresence>
          {showForm && <AddWebhookForm onAdd={handleAdd} onCancel={() => setShowForm(false)} />}
        </AnimatePresence>

        {/* Test result toast */}
        <AnimatePresence>
          {testResult && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="font-pixel"
              style={{
                fontSize: 7,
                padding: "6px 10px",
                marginBottom: 8,
                color: testResult.ok ? "#39FF14" : "#FF4500",
                background: testResult.ok ? "#39FF1410" : "#FF450010",
                border: `1px solid ${testResult.ok ? "#39FF1430" : "#FF450030"}`,
              }}
            >
              {testResult.ok ? `PING OK — ${testResult.ms}ms` : `PING FAIL — ${testResult.ms}ms`}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Webhook list */}
        {webhooks.length === 0 ? (
          <div className="font-pixel" style={{ fontSize: 7, color: "#555", textAlign: "center", padding: 20 }}>
            No webhooks registered. Click &quot;+ Add Webhook&quot; to begin.
          </div>
        ) : (
          webhooks.map((wh) => (
            <WebhookCard
              key={wh.id}
              webhook={wh}
              onToggle={handleToggle}
              onTest={handleTest}
              onDelete={handleDelete}
              testingId={testingId}
            />
          ))
        )}

        {/* Delivery Logs */}
        <div style={{ marginTop: 16 }}>
          <span className="font-pixel" style={{ fontSize: 8, color: "#06B6D4", display: "block", marginBottom: 8 }}>
            {">"} Recent Deliveries
          </span>
          <div
            style={{
              background: "#050508",
              border: "2px solid #2A2A30",
              padding: 10,
            }}
          >
            {/* Log header */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "20px 1fr 60px 60px 80px",
                gap: 6,
                marginBottom: 6,
              }}
            >
              {["", "Event", "Status", "Time", "When"].map((h) => (
                <span key={h} className="font-pixel" style={{ fontSize: 6, color: "#555" }}>
                  {h}
                </span>
              ))}
            </div>
            {/* Log rows */}
            {logs.map((log) => (
              <div
                key={log.id}
                style={{
                  display: "grid",
                  gridTemplateColumns: "20px 1fr 60px 60px 80px",
                  gap: 6,
                  alignItems: "center",
                  padding: "3px 0",
                  borderTop: "1px solid #1A1A20",
                }}
              >
                <StatusDot success={log.success} />
                <span className="font-pixel" style={{ fontSize: 7, color: "#E8E8EC" }}>
                  {log.event}
                </span>
                <span className="font-pixel" style={{ fontSize: 7, color: log.success ? "#39FF14" : "#FF4500" }}>
                  {log.response_status ?? "ERR"}
                </span>
                <span className="font-pixel" style={{ fontSize: 7, color: "#8888A0" }}>
                  {log.duration_ms}ms
                </span>
                <span className="font-pixel" style={{ fontSize: 6, color: "#555" }}>
                  {timeAgo(log.created_at)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Event types reference */}
        <div style={{ marginTop: 12 }}>
          <span className="font-pixel" style={{ fontSize: 7, color: "#555" }}>
            Supported events: {WEBHOOK_EVENTS.join(", ")}
          </span>
        </div>
      </div>
    </section>
  );
}
