"use client";

import { useEffect, useId, useState, useCallback } from "react";
import { supabase } from "./supabase";
import {
  getProjectLeaderboard,
  type LeaderboardPeriod,
  type LeaderboardEntry,
} from "./leaderboard";

/**
 * Hook to subscribe to real-time changes on a table
 */
export function useRealtimeTable<T>(
  table: string,
  _filter?: string,
): { data: T[]; loading: boolean } {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initial fetch
    const query = supabase.from(table).select("*");
    // Note: filter would need to be applied here
    query.then(({ data: initialData }) => {
      if (initialData) setData(initialData as T[]);
      setLoading(false);
    });

    // Subscribe to changes
    const channel = supabase
      .channel(`${table}-changes`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table },
        (payload) => {
          if (payload.eventType === "INSERT") {
            setData((prev) => [payload.new as T, ...prev]);
          } else if (payload.eventType === "UPDATE") {
            setData((prev) =>
              prev.map((item) =>
                (item as Record<string, unknown>).id === (payload.new as Record<string, unknown>).id ? (payload.new as T) : item
              )
            );
          } else if (payload.eventType === "DELETE") {
            setData((prev) =>
              prev.filter((item) => (item as Record<string, unknown>).id !== (payload.old as Record<string, unknown>).id)
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [table]);

  return { data, loading };
}

/**
 * Hook for real-time upvote count
 */
export function useRealtimeUpvotes(projectId: string): number | null {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    // Initial fetch
    supabase
      .from("projects")
      .select("upvotes")
      .eq("id", projectId)
      .single()
      .then(({ data }) => {
        if (data) setCount(data.upvotes);
      });

    // Subscribe
    const channel = supabase
      .channel(`upvotes-${projectId}`)
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "projects", filter: `id=eq.${projectId}` },
        (payload) => {
          setCount((payload.new as Record<string, unknown>).upvotes as number);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [projectId]);

  return count;
}

/**
 * Hook for real-time leaderboard updates.
 * Subscribes to projects table; re-fetches and re-sorts rankings
 * whenever score or upvotes change.
 */
export function useRealtimeLeaderboard(
  period: LeaderboardPeriod,
  limit = 10,
): { entries: LeaderboardEntry[]; loading: boolean; connected: boolean } {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [connected, setConnected] = useState(false);
  const hookId = useId();

  const fetchLeaderboard = useCallback(async () => {
    const data = await getProjectLeaderboard(period, limit);
    setEntries(data);
    setLoading(false);
  }, [period, limit]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void fetchLeaderboard();

    // Subscribe to project score/upvote changes.
    // Channel name is per-hook-instance via useId() so every mount gets a
    // fresh channel. supabase.removeChannel() is async — if two hooks share
    // a name, StrictMode double-mount or fast remounts would race: the
    // second mount hits supabase.channel(name) before the cleanup finishes,
    // gets handed back the still-subscribed channel, and .on() after
    // .subscribe() throws "cannot add postgres_changes callbacks".
    const channel = supabase
      .channel(`leaderboard-${period}-${limit}-${hookId}`)
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "projects" },
        () => {
          // Re-fetch the full leaderboard on any project update
          fetchLeaderboard();
        },
      )
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "projects" },
        () => {
          fetchLeaderboard();
        },
      )
      .subscribe((status) => {
        setConnected(status === "SUBSCRIBED");
      });

    return () => {
      supabase.removeChannel(channel);
      setConnected(false);
    };
  }, [period, limit, hookId, fetchLeaderboard]);

  return { entries, loading, connected };
}
