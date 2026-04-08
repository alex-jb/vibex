"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useLang } from "@/lib/i18n";

interface Notification {
  id: string;
  type: "upvote" | "comment" | "reply" | "follow" | "battle" | "system" | "mention" | "reaction" | "challenge" | "ranking" | "streak";
  actor_name: string;
  action_text: string;
  target_url?: string;
  read: boolean;
  created_at: string;
}

const TYPE_ICONS: Record<Notification["type"], string> = {
  upvote: "\uD83D\uDC4D",
  comment: "\uD83D\uDCAC",
  reply: "\u21A9\uFE0F",
  follow: "\uD83D\uDC64",
  battle: "\u2694\uFE0F",
  system: "\uD83D\uDCE2",
  mention: "@",
  reaction: "\uD83D\uDD25",
  challenge: "\u2694\uFE0F",
  ranking: "\uD83C\uDFC6",
  streak: "\uD83D\uDD25",
};

const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: "mock-1",
    type: "upvote",
    actor_name: "PixelCoder",
    action_text: "upvoted your project \"AI Dungeon Master\"",
    target_url: "/projects/1",
    read: false,
    created_at: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
  },
  {
    id: "mock-2",
    type: "battle",
    actor_name: "System",
    action_text: "Your project won a battle and gained 120 EXP!",
    target_url: "/arena",
    read: false,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
  },
  {
    id: "mock-3",
    type: "comment",
    actor_name: "RetroHacker",
    action_text: "commented on your project",
    target_url: "/projects/1",
    read: true,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
  },
];

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d`;
  return `${Math.floor(days / 30)}mo`;
}

export function NotificationBell() {
  const { t } = useLang();
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const fetchNotifications = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await fetch("/api/notifications");
      if (!res.ok) throw new Error("fetch failed");
      const data = await res.json();
      setNotifications(data.notifications ?? []);
    } catch {
      // Fallback to mock data when API fails or Supabase not configured
      setNotifications(MOCK_NOTIFICATIONS);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) fetchNotifications();
  }, [user, fetchNotifications]);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  const markAllRead = async () => {
    if (!user) return;
    try {
      await fetch("/api/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "markAllRead" }),
      });
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch {
      // Silent fail
    }
  };

  const markRead = async (id: string) => {
    if (!user) return;
    try {
      await fetch("/api/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "markRead", ids: [id] }),
      });
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
      );
    } catch {
      // Silent fail
    }
  };

  if (!user) return null;

  return (
    <div className="relative" ref={panelRef}>
      {/* Bell button */}
      <button
        aria-label="Notifications"
        aria-expanded={open}
        onClick={() => {
          setOpen((v) => !v);
          if (!open) fetchNotifications();
        }}
        className="relative flex items-center justify-center size-9 rounded-full transition-all hover:ring-2 hover:ring-violet-500/30 text-muted-foreground hover:text-foreground"
      >
        <Bell className="size-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center min-w-[16px] h-4 px-1 rounded-full bg-red-500 text-[10px] font-bold text-white leading-none">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {open && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 top-full mt-2 z-50 w-[calc(100vw-2rem)] sm:w-80 max-w-80 glass-card-strong rounded-xl border border-white/[0.08] shadow-xl overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06]">
                <span className="text-sm font-medium">{t("notif.title")}</span>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllRead}
                    className="text-xs text-violet-400 hover:text-violet-300 transition-colors"
                  >
                    {t("notif.markAllRead")}
                  </button>
                )}
              </div>

              {/* List */}
              <div className="max-h-64 sm:max-h-80 overflow-y-auto">
                {loading && notifications.length === 0 ? (
                  <div className="px-4 py-8 text-center text-sm text-muted-foreground">
                    {t("notif.loading")}
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="px-4 py-8 text-center text-sm text-muted-foreground">
                    {t("notif.empty")}
                  </div>
                ) : (
                  notifications.map((n) => (
                    <NotificationItem
                      key={n.id}
                      notification={n}
                      onRead={markRead}
                      onClose={() => setOpen(false)}
                    />
                  ))
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

function NotificationItem({
  notification: n,
  onRead,
  onClose,
}: {
  notification: Notification;
  onRead: (id: string) => void;
  onClose: () => void;
}) {
  const icon = TYPE_ICONS[n.type] ?? "\uD83D\uDCE2";

  const handleClick = () => {
    if (!n.read) onRead(n.id);
    onClose();
  };

  const Wrapper = n.target_url ? "a" : "div";
  const wrapperProps = n.target_url
    ? { href: n.target_url, onClick: handleClick }
    : { onClick: handleClick };

  return (
    <Wrapper
      {...wrapperProps}
      className={`flex items-start gap-3 px-4 py-3 cursor-pointer transition-colors hover:bg-white/5 ${
        n.read ? "opacity-60" : ""
      }`}
    >
      <span className="text-base mt-0.5 shrink-0">{icon}</span>
      <div className="flex-1 min-w-0">
        <p className="text-sm leading-snug">
          <span className="font-medium text-foreground">{n.actor_name}</span>{" "}
          <span className="text-muted-foreground">{n.action_text}</span>
        </p>
        <p className="text-xs text-muted-foreground mt-0.5">
          {timeAgo(n.created_at)}
        </p>
      </div>
      {!n.read && (
        <span className="mt-1.5 size-2 rounded-full bg-violet-500 shrink-0" />
      )}
    </Wrapper>
  );
}
