"use client";

import { useState, useEffect } from "react";
import type { Project, Creator, Idea, Event, TrendInsight } from "./types";
import * as mock from "./mock-data";

/**
 * Generic data hook that fetches from /api/data/[entity] with mock fallback.
 * Provides instant mock data while the async fetch resolves.
 */
function useData<T>(entity: string, fallback: T[]): { data: T[]; loading: boolean } {
  const [data, setData] = useState<T[]>(fallback);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/data/${entity}`)
      .then((res) => {
        if (!res.ok) throw new Error("fetch failed");
        return res.json();
      })
      .then((result) => {
        if (!cancelled && Array.isArray(result)) setData(result);
      })
      .catch(() => {
        // Keep using fallback mock data
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [entity]);

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
