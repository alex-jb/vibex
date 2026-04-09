"use client";

import { useEffect, useCallback, useRef } from "react";
import { supabase } from "./supabase";
import { useAuth } from "./auth";

interface RealtimeNotification {
  id: string;
  type: string;
  title: string;
  body?: string;
  actor_name?: string;
  link?: string;
  created_at: string;
}

type NotificationHandler = (notification: RealtimeNotification) => void;

/**
 * Subscribe to real-time notification inserts for the current user.
 * Calls `onNotification` whenever a new row is inserted into the notifications table.
 */
export function useRealtimeNotifications(onNotification: NotificationHandler) {
  const { user } = useAuth();
  const handlerRef = useRef(onNotification);
  handlerRef.current = onNotification;

  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel(`notifications-${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          const row = payload.new as Record<string, unknown>;
          handlerRef.current({
            id: row.id as string,
            type: row.type as string,
            title: row.title as string,
            body: row.body as string | undefined,
            actor_name: row.actor_name as string | undefined,
            link: row.link as string | undefined,
            created_at: row.created_at as string,
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);
}

/**
 * Hook that auto-refetches notification count on realtime changes.
 */
export function useUnreadCount(): { count: number; refresh: () => void } {
  const { user } = useAuth();
  const countRef = useRef(0);
  const setCount = useCallback((n: number) => { countRef.current = n; }, []);

  const refresh = useCallback(async () => {
    if (!user) return;
    try {
      const res = await fetch("/api/notifications");
      if (!res.ok) return;
      const data = await res.json();
      const unread = (data.notifications ?? []).filter((n: { read: boolean }) => !n.read).length;
      setCount(unread);
    } catch {
      // ignore
    }
  }, [user, setCount]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { count: countRef.current, refresh };
}
