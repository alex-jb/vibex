"use client";

import { useState, useEffect, useCallback } from "react";
import { AdminNav } from "@/components/admin/admin-nav";

interface FlaggedPost {
  id: string;
  content: string;
  user_name: string;
  user_id: string;
  moderation_status: string;
  created_at: string;
}

interface Report {
  id: string;
  post_id: string;
  reason: string;
  status: string;
  created_at: string;
}

export default function AdminPage() {
  const [flaggedPosts, setFlaggedPosts] = useState<FlaggedPost[]>([]);
  const [pendingReports, setPendingReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLog, setActionLog] = useState<string[]>([]);

  const fetchQueue = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/moderation");
      if (res.ok) {
        const data = await res.json();
        setFlaggedPosts(data.flaggedPosts ?? []);
        setPendingReports(data.pendingReports ?? []);
      }
    } catch {} finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchQueue(); }, [fetchQueue]);

  const doAction = useCallback(async (action: string, payload: Record<string, unknown>) => {
    try {
      const res = await fetch("/api/admin/moderation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, ...payload }),
      });
      if (res.ok) {
        setActionLog((prev) => [`${new Date().toLocaleTimeString()} — ${action}: ${JSON.stringify(payload)}`, ...prev.slice(0, 19)]);
        fetchQueue();
      }
    } catch {}
  }, [fetchQueue]);

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <AdminNav current="/admin" />

      {/* Dashboard cards — quick links to other admin surfaces with at-a-glance count */}
      <div className="mb-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
        <a
          href="/admin/metrics"
          className="rounded-xl bg-zinc-900/60 p-4 ring-1 ring-zinc-800 hover:ring-orange-500/40 transition"
        >
          <div className="text-2xl">📊</div>
          <div className="mt-1 text-sm font-semibold text-zinc-200">Metrics</div>
          <div className="text-xs text-zinc-500">launch-day funnel</div>
        </a>
        <a
          href="/admin/score-leaderboard"
          className="rounded-xl bg-zinc-900/60 p-4 ring-1 ring-zinc-800 hover:ring-orange-500/40 transition"
        >
          <div className="text-2xl">🏆</div>
          <div className="mt-1 text-sm font-semibold text-zinc-200">Leaderboard</div>
          <div className="text-xs text-zinc-500">creator score + paid</div>
        </a>
        <a
          href="/admin/cracked-waitlist"
          className="rounded-xl bg-zinc-900/60 p-4 ring-1 ring-zinc-800 hover:ring-orange-500/40 transition"
        >
          <div className="text-2xl">🧠</div>
          <div className="mt-1 text-sm font-semibold text-zinc-200">Cracked Waitlist</div>
          <div className="text-xs text-zinc-500">phase 2 progress</div>
        </a>
        <a
          href="/admin/analytics"
          className="rounded-xl bg-zinc-900/60 p-4 ring-1 ring-zinc-800 hover:ring-orange-500/40 transition"
        >
          <div className="text-2xl">📈</div>
          <div className="mt-1 text-sm font-semibold text-zinc-200">Analytics</div>
          <div className="text-xs text-zinc-500">retention + events</div>
        </a>
      </div>

      {/* Terminal Header */}
      <div style={{ background: "#0A0A0C", padding: "8px 12px", display: "flex", alignItems: "center", gap: 8, borderBottom: "2px solid #2A2A30" }}>
        <span style={{ width: 10, height: 10, background: "#F97316", display: "inline-block" }} />
        <span style={{ width: 10, height: 10, background: "#FACC15", display: "inline-block" }} />
        <span style={{ width: 10, height: 10, background: "#39FF14", display: "inline-block" }} />
        <span className="font-pixel" style={{ fontSize: 8, color: "#555", letterSpacing: 2, marginLeft: 8 }}>
          VIBEXFORGE://ADMIN v1.0
        </span>
      </div>

      <div className="rpgui-container framed" style={{ padding: 20, minHeight: "70vh" }}>
        <div className="font-pixel" style={{ fontSize: 14, color: "#F97316", marginBottom: 16 }}>
          {"> Admin Panel"}
        </div>

        {loading && (
          <div className="font-pixel" style={{ fontSize: 8, color: "#555", textAlign: "center", padding: 40 }}>
            LOADING...
          </div>
        )}

        {!loading && (
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
            {/* Moderation Queue */}
            <div style={{ flex: 1, minWidth: 300 }}>
              <div className="font-pixel" style={{ fontSize: 10, color: "#FACC15", marginBottom: 10 }}>
                {"Moderation Queue"} ({flaggedPosts.length})
              </div>

              {flaggedPosts.length === 0 && (
                <div className="font-pixel" style={{ fontSize: 8, color: "#39FF14", padding: 16 }}>
                  {"No pending content"}
                </div>
              )}

              {flaggedPosts.map((post) => {
                const reports = pendingReports.filter((r) => r.post_id === post.id);
                return (
                  <div key={post.id} className="retro-card" style={{ padding: 12, marginBottom: 8, border: "1px solid #F9731640" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                      <span className="font-pixel" style={{ fontSize: 7, color: "#9D00FF" }}>{post.user_name}</span>
                      <span className="font-pixel" style={{ fontSize: 7, color: "#F97316" }}>{post.moderation_status.toUpperCase()}</span>
                    </div>
                    <div className="font-retro" style={{ fontSize: 12, color: "#E8E8EC", marginBottom: 8, maxHeight: 60, overflow: "hidden" }}>
                      {post.content}
                    </div>
                    {reports.length > 0 && (
                      <div className="font-pixel" style={{ fontSize: 7, color: "#888", marginBottom: 6 }}>
                        {reports.length} report(s): {reports.map((r) => r.reason).join(", ")}
                      </div>
                    )}
                    <div style={{ display: "flex", gap: 4 }}>
                      <button className="nes-btn is-success" onClick={() => doAction("approve", { postId: post.id })} style={{ fontSize: 7, padding: "2px 8px" }}>
                        {"Approve"}
                      </button>
                      <button className="nes-btn is-warning" onClick={() => doAction("hide", { postId: post.id })} style={{ fontSize: 7, padding: "2px 8px" }}>
                        {"Hide"}
                      </button>
                      <button className="nes-btn is-error" onClick={() => doAction("remove", { postId: post.id })} style={{ fontSize: 7, padding: "2px 8px" }}>
                        {"Delete"}
                      </button>
                      <button className="nes-btn is-error" onClick={() => doAction("ban", { targetUserId: post.user_id, banReason: "Content violation" })} style={{ fontSize: 7, padding: "2px 8px" }}>
                        {"Ban"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Action Log */}
            <div style={{ width: 250, flexShrink: 0 }}>
              <div className="font-pixel" style={{ fontSize: 10, color: "#39FF14", marginBottom: 10 }}>
                {"Action Log"}
              </div>
              <div style={{ background: "#0A0A0C", border: "1px solid #2A2A30", padding: 8, maxHeight: 400, overflow: "auto" }}>
                {actionLog.length === 0 && (
                  <div className="font-pixel" style={{ fontSize: 7, color: "#555" }}>
                    {"No actions yet"}
                  </div>
                )}
                {actionLog.map((log, i) => (
                  <div key={i} className="font-pixel" style={{ fontSize: 6, color: "#39FF14", marginBottom: 4, wordBreak: "break-all" }}>
                    {log}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
