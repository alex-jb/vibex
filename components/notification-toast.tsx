"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Bell } from "lucide-react";
import { useRealtimeNotifications } from "@/lib/use-realtime-notifications";

interface ToastItem {
  id: string;
  type: string;
  title: string;
  body?: string;
  actor_name?: string;
  link?: string;
}

const TYPE_ICONS: Record<string, string> = {
  upvote: "\uD83D\uDC4D",
  comment: "\uD83D\uDCAC",
  reply: "\u21A9\uFE0F",
  follow: "\uD83D\uDC64",
  battle: "\u2694\uFE0F",
  mention: "@",
  reaction: "\uD83D\uDD25",
  system: "\uD83D\uDCE2",
};

export function NotificationToastProvider() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const handleNotification = useCallback((notification: ToastItem) => {
    setToasts((prev) => [notification, ...prev].slice(0, 3)); // max 3 visible

    // Auto-dismiss after 5 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== notification.id));
    }, 5000);
  }, []);

  useRealtimeNotifications(handleNotification);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <div className="fixed top-16 right-4 z-[60] flex flex-col gap-2 w-80 pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, x: 80, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 80, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="pointer-events-auto"
          >
            <div className="glass-card-strong rounded-xl border border-white/[0.08] shadow-xl p-3 flex items-start gap-3">
              <div className="flex items-center justify-center size-8 rounded-lg bg-violet-500/10 border border-violet-500/20 shrink-0">
                <span className="text-sm">
                  {TYPE_ICONS[toast.type] ?? <Bell className="size-3.5 text-violet-400" />}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground leading-snug">
                  {toast.actor_name && (
                    <span className="text-violet-400">{toast.actor_name} </span>
                  )}
                  {toast.title}
                </p>
                {toast.body && (
                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                    {toast.body}
                  </p>
                )}
              </div>
              <button
                onClick={() => dismiss(toast.id)}
                className="shrink-0 text-muted-foreground/40 hover:text-foreground transition-colors"
              >
                <X className="size-3.5" />
              </button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
