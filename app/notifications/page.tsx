"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import { useLang } from "@/lib/i18n";

/**
 * /notifications — Q4 — creator's notification inbox.
 *
 * Reads from `notifications` table (schema from #122-124). Each row
 * targets one auth.uid via user_id. RLS lets the user read their own.
 *
 * Filters: All / Unread / Read.
 * Actions: mark single read, mark all read, dismiss.
 * Realtime: subscribes to inserts so new notifications animate in.
 */

type Notification = {
  id: string;
  user_id: string;
  type: string;
  title: string;
  body: string | null;
  link: string | null;
  read: boolean;
  actor_name: string | null;
  actor_avatar: string | null;
  project_id: string | null;
  action_text: string | null;
  target_url: string | null;
  created_at: string;
};

type Filter = "all" | "unread" | "read";

const TYPE_ICON: Record<string, string> = {
  upvote: "▲",
  follow: "★",
  comment: "💬",
  drafts_ready: "✨",
  stage_evolution: "⬢",
  mention: "@",
};

function relTime(iso: string, lang: "en" | "zh"): string {
  const diff = Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 1000));
  if (diff < 60) return lang === "zh" ? "刚刚" : "just now";
  if (diff < 3600)
    return lang === "zh" ? `${Math.floor(diff / 60)}分钟前` : `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400)
    return lang === "zh" ? `${Math.floor(diff / 3600)}小时前` : `${Math.floor(diff / 3600)}h ago`;
  return lang === "zh" ? `${Math.floor(diff / 86400)}天前` : `${Math.floor(diff / 86400)}d ago`;
}

export default function NotificationsPage() {
  const { user, loading: authLoading } = useAuth();
  const { lang } = useLang();
  const [notifs, setNotifs] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>("all");

  const load = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(100);
    setNotifs((data || []) as Notification[]);
  }, [user]);

  useEffect(() => {
    if (authLoading) return;
    (async () => {
      await load();
      setLoading(false);
    })();
    if (!user) return;
    const channel = supabase
      .channel(`notifs-${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${user.id}`,
        },
        () => load(),
      )
      .subscribe();
    return () => {
      channel.unsubscribe();
    };
  }, [authLoading, user, load]);

  const markRead = async (id: string) => {
    setNotifs((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    await supabase.from("notifications").update({ read: true }).eq("id", id);
  };

  const markAllRead = async () => {
    if (!user) return;
    const unreadIds = notifs.filter((n) => !n.read).map((n) => n.id);
    if (unreadIds.length === 0) return;
    setNotifs((prev) => prev.map((n) => ({ ...n, read: true })));
    await supabase
      .from("notifications")
      .update({ read: true })
      .in("id", unreadIds);
  };

  const counts = {
    all: notifs.length,
    unread: notifs.filter((n) => !n.read).length,
    read: notifs.filter((n) => n.read).length,
  };

  const visible =
    filter === "unread"
      ? notifs.filter((n) => !n.read)
      : filter === "read"
        ? notifs.filter((n) => n.read)
        : notifs;

  if (authLoading || loading) {
    return (
      <main className="min-h-screen bg-[var(--bg-deep)] p-8">
        <p className="text-foreground/60 max-w-3xl mx-auto">
          {lang === "zh" ? "加载中..." : "Loading..."}
        </p>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="min-h-screen bg-[var(--bg-deep)] p-8">
        <div className="max-w-md mx-auto mt-20 text-center">
          <p className="text-foreground/70 mb-4">
            {lang === "zh"
              ? "登录后查看通知。"
              : "Sign in to view notifications."}
          </p>
          <Link
            href="/login"
            className="inline-block px-6 py-3 rounded bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium"
          >
            {lang === "zh" ? "登录" : "Sign in"}
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[var(--bg-deep)] px-4 sm:px-8 py-10">
      <div className="max-w-3xl mx-auto">
        <header className="mb-6">
          <p className="font-pixel text-[10px] uppercase tracking-wider text-violet-400/70 mb-2">
            ▸ {lang === "zh" ? "通知中心" : "NOTIFICATIONS"}
          </p>
          <div className="flex items-center justify-between flex-wrap gap-3">
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
              {lang === "zh"
                ? `通知(${counts.unread} 未读)`
                : `Notifications (${counts.unread} unread)`}
            </h1>
            {counts.unread > 0 && (
              <button
                onClick={markAllRead}
                className="px-3 py-1.5 rounded text-xs border border-white/10 hover:bg-white/5 text-foreground/70"
              >
                {lang === "zh" ? "全部标记已读" : "Mark all read"}
              </button>
            )}
          </div>
        </header>

        <div className="flex items-center gap-1 flex-wrap mb-4">
          {(["all", "unread", "read"] as Filter[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3.5 py-1.5 text-xs rounded-md font-medium transition-colors ${
                filter === f
                  ? "bg-violet-600 text-white"
                  : "border border-white/10 hover:bg-white/5 text-foreground/70"
              }`}
            >
              {lang === "zh"
                ? { all: "全部", unread: "未读", read: "已读" }[f]
                : { all: "All", unread: "Unread", read: "Read" }[f]}{" "}
              ({counts[f]})
            </button>
          ))}
        </div>

        {visible.length === 0 ? (
          <div className="rounded-xl border border-dashed border-white/[0.1] bg-white/[0.02] p-10 text-center">
            <p className="text-foreground/60">
              {filter === "unread"
                ? lang === "zh"
                  ? "没有未读通知。"
                  : "No unread notifications."
                : lang === "zh"
                  ? "还没有通知。当有人 upvote 你的项目、follow 你、或者你的草稿生成完成,通知会出现在这里。"
                  : "No notifications yet. When someone upvotes your project, follows you, or your drafts finish generating, they'll show up here."}
            </p>
          </div>
        ) : (
          <ul className="space-y-2">
            {visible.map((n) => (
              <li
                key={n.id}
                className={`rounded-lg border p-4 transition-colors ${
                  n.read
                    ? "border-white/[0.06] bg-white/[0.01]"
                    : "border-violet-500/20 bg-violet-500/[0.04]"
                }`}
              >
                <div className="flex items-start gap-3">
                  <span
                    className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm ${
                      n.read
                        ? "bg-white/5 text-foreground/50"
                        : "bg-violet-500/15 text-violet-300"
                    }`}
                  >
                    {TYPE_ICON[n.type] || "•"}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2 flex-wrap">
                      <p
                        className={`text-sm ${
                          n.read ? "text-foreground/70" : "text-foreground font-medium"
                        }`}
                      >
                        {n.title}
                      </p>
                      <span className="text-[11px] text-foreground/40 font-mono">
                        {relTime(n.created_at, lang)}
                      </span>
                    </div>
                    {n.body && (
                      <p className="text-foreground/60 text-sm mt-1 leading-relaxed">
                        {n.body}
                      </p>
                    )}
                    <div className="flex items-center gap-3 mt-2">
                      {n.target_url || n.link ? (
                        <Link
                          href={n.target_url || n.link || "#"}
                          onClick={() => !n.read && markRead(n.id)}
                          className="text-xs text-violet-300 hover:underline"
                        >
                          {n.action_text ||
                            (lang === "zh" ? "查看 →" : "View →")}
                        </Link>
                      ) : null}
                      {!n.read && (
                        <button
                          onClick={() => markRead(n.id)}
                          className="text-xs text-foreground/40 hover:text-foreground/70"
                        >
                          {lang === "zh" ? "标记已读" : "Mark read"}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
