/**
 * Client-safe data access layer.
 *
 * Provides the same synchronous mock data arrays for client components,
 * but also exposes async fetchers that hit API routes when Supabase is configured.
 * Pages can progressively migrate from sync imports to async hooks.
 *
 * Usage:
 *   import { projects, creators } from "@/lib/data";        // sync (mock fallback)
 *   import { fetchProjects } from "@/lib/data";              // async (real data when available)
 */

import * as mock from "./mock-data";
import { agents as mockAgents } from "./mock-data/agents";
import { workflows as mockWorkflows } from "./mock-data/workflows";

// Re-export synchronous mock data for backwards compatibility
// These are used by client components that can't await
export const { projects, creators, ideas, events, trendInsights, weeklyWinners, categories } = mock;
export { mockAgents as agents };
export { mockWorkflows as workflows };

// ═══════════════════════════════════════════════════════════════
// Async fetchers — call API routes, fallback to mock on error
// ═══════════════════════════════════════════════════════════════

async function safeFetch<T>(url: string, fallback: T): Promise<T> {
  try {
    const res = await fetch(url);
    if (!res.ok) return fallback;
    return await res.json();
  } catch {
    return fallback;
  }
}

export async function fetchProjects() {
  return safeFetch("/api/data/projects", mock.projects);
}

export async function fetchCreators() {
  return safeFetch("/api/data/creators", mock.creators);
}

export async function fetchIdeas() {
  return safeFetch("/api/data/ideas", mock.ideas);
}

export async function fetchEvents() {
  return safeFetch("/api/data/events", mock.events);
}

export async function fetchTrendInsights() {
  return safeFetch("/api/data/trends", mock.trendInsights);
}
