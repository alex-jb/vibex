"use client";

import { useState, useEffect, useCallback } from "react";
import type { Project, Creator, Idea, Event, TrendInsight, WeeklyWinner } from "./types";
import * as mock from "./mock-data";

/**
 * Generic data hook that fetches from /api/data/[entity] with mock fallback.
 * Provides instant mock data while the async fetch resolves.
 *
 * Revalidates in three cases (SWR-style):
 *   1. On mount — initial fetch.
 *   2. When the tab regains visibility (visibilitychange).
 *   3. When the window regains focus.
 *
 * (2) + (3) cover the "submitted on /launch, navigated back to /home"
 * flow where the Next.js router cache can serve a stale /home tree and
 * the mount effect wouldn't re-run. /launch also calls router.refresh()
 * on success to invalidate the cache explicitly, but visibility-based
 * revalidation is a belt-and-suspenders safety net for the same bug
 * and for the more general "I left the tab for a while" case.
 */
function useData<T>(entity: string, fallback: T[]): { data: T[]; loading: boolean } {
  const [data, setData] = useState<T[]>(fallback);
  const [loading, setLoading] = useState(true);

  const fetchOnce = useCallback(
    async (signal?: AbortSignal) => {
      try {
        const res = await fetch(`/api/data/${entity}`, { signal });
        if (!res.ok) throw new Error("fetch failed");
        const result = await res.json();
        if (Array.isArray(result)) setData(result);
      } catch (err) {
        // AbortError just means we cancelled — don't log. Other errors:
        // fall back silently to the last good data (initially mock).
        if ((err as Error)?.name !== "AbortError") {
          // no-op: keep showing what we have
        }
      }
    },
    [entity],
  );

  useEffect(() => {
    const controller = new AbortController();

    // Initial fetch
    setLoading(true);
    fetchOnce(controller.signal).finally(() => {
      if (!controller.signal.aborted) setLoading(false);
    });

    // Revalidate on focus / visibility
    const revalidate = () => {
      if (document.visibilityState === "visible") {
        fetchOnce();
      }
    };
    document.addEventListener("visibilitychange", revalidate);
    window.addEventListener("focus", revalidate);

    return () => {
      controller.abort();
      document.removeEventListener("visibilitychange", revalidate);
      window.removeEventListener("focus", revalidate);
    };
  }, [fetchOnce]);

  return { data, loading };
}

export function useProjects() {
  return useData<Project>("projects", mock.projects);
}

export function useCreators() {
  return useData<Creator>("creators", mock.creators);
}

export function useIdeas() {
  return useData<Idea>("ideas", mock.ideas);
}

export function useEvents() {
  return useData<Event>("events", mock.events);
}

export function useTrendInsights() {
  return useData<TrendInsight>("trends", mock.trendInsights);
}

export function useWeeklyWinners() {
  return useData<WeeklyWinner>("winners", mock.weeklyWinners);
}
