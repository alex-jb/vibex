"use client";

import { useEffect, useState } from "react";
import { supabase } from "./supabase";

/**
 * Hook to subscribe to real-time changes on a table
 */
export function useRealtimeTable<T>(
  table: string,
  filter?: string,
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
              prev.map((item: any) =>
                item.id === (payload.new as any).id ? (payload.new as T) : item
              )
            );
          } else if (payload.eventType === "DELETE") {
            setData((prev) =>
              prev.filter((item: any) => item.id !== (payload.old as any).id)
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
          setCount((payload.new as any).upvotes);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [projectId]);

  return count;
}
