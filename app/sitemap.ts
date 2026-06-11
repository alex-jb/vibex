import { MetadataRoute } from "next";
import { supabase } from "@/lib/supabase";
import { projects as mockProjects } from "@/lib/mock-data";
import { HOOK_ARCHETYPES } from "@/lib/hook-archetypes";

/**
 * Sitemap for crawlers.
 * - High priority: landing, home, launch, discover, feed (conversion funnel)
 * - Medium: content hubs (creators, insights, dojo, ideas)
 * - Low: user-specific (profile/settings) and legal
 * - Auth flows (/login, /register) intentionally excluded — no SEO value
 * - Dynamic routes (/project/[id]) pulled live from Supabase, with a
 *   fall-through to mock data so the sitemap still generates when the
 *   DB is unreachable (Vercel build without env, local dev, etc).
 *
 * Canonical host is www — matches metadataBase in app/layout.tsx
 * (switched 2026-04-17; the old apex URL costs a 307 hop per crawl).
 */
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://www.vibexforge.com";
  const now = new Date();

  type Entry = { path: string; priority: number; changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"] };

  const staticRoutes: Entry[] = [
    // Conversion funnel — highest priority, daily updates
    { path: "", priority: 1.0, changeFrequency: "daily" },
    { path: "/home", priority: 0.95, changeFrequency: "daily" },
    { path: "/launch", priority: 0.9, changeFrequency: "daily" },
    { path: "/feed", priority: 0.9, changeFrequency: "hourly" },
    { path: "/hunt", priority: 0.85, changeFrequency: "daily" },
    // Content hubs
    { path: "/creators", priority: 0.8, changeFrequency: "daily" },
    { path: "/creators/graph", priority: 0.7, changeFrequency: "weekly" },
    { path: "/insights", priority: 0.8, changeFrequency: "daily" },
    { path: "/insights/growth", priority: 0.7, changeFrequency: "weekly" },
    { path: "/dojo", priority: 0.8, changeFrequency: "weekly" },
    { path: "/arena", priority: 0.75, changeFrequency: "weekly" },
    { path: "/ideas", priority: 0.75, changeFrequency: "daily" },
    { path: "/events", priority: 0.7, changeFrequency: "weekly" },
    { path: "/messages", priority: 0.5, changeFrequency: "monthly" },
    // Creator tools
    { path: "/tools/video-decode", priority: 0.85, changeFrequency: "weekly" },
    { path: "/hooks", priority: 0.8, changeFrequency: "weekly" },
    { path: "/create-card", priority: 0.75, changeFrequency: "monthly" },
    { path: "/agents/builder", priority: 0.7, changeFrequency: "weekly" },
    { path: "/workflows", priority: 0.7, changeFrequency: "weekly" },
    { path: "/buddy", priority: 0.7, changeFrequency: "weekly" },
    { path: "/buddy/trade", priority: 0.6, changeFrequency: "weekly" },
    { path: "/developers", priority: 0.7, changeFrequency: "weekly" },
    // VC / investor surface
    { path: "/investors", priority: 0.85, changeFrequency: "monthly" },
    { path: "/vc/dashboard", priority: 0.6, changeFrequency: "daily" },
    { path: "/analytics", priority: 0.6, changeFrequency: "daily" },
    // User pages
    { path: "/profile", priority: 0.5, changeFrequency: "weekly" },
    { path: "/profile/dashboard", priority: 0.5, changeFrequency: "weekly" },
    { path: "/settings", priority: 0.3, changeFrequency: "monthly" },
    // Legal, contact & info
    { path: "/about", priority: 0.5, changeFrequency: "monthly" },
    { path: "/contact", priority: 0.4, changeFrequency: "monthly" },
    { path: "/privacy", priority: 0.3, changeFrequency: "yearly" },
    { path: "/terms", priority: 0.3, changeFrequency: "yearly" },
  ];

  const staticPages: MetadataRoute.Sitemap = staticRoutes.map((r) => ({
    url: `${baseUrl}${r.path}`,
    lastModified: now,
    changeFrequency: r.changeFrequency,
    priority: r.priority,
  }));

  // Pull live projects from Supabase — before 2026-04-17 this used
  // mock data, so user-submitted projects never appeared in the
  // sitemap and Google couldn't discover them. Fall through to mock
  // data when the DB is unreachable so the build doesn't break.
  let projectIds: { id: string; updated: string }[] = [];
  try {
    const { data } = await supabase
      .from("projects")
      .select("id, created_at")
      .order("created_at", { ascending: false })
      .limit(2000);
    if (data) {
      projectIds = data.map((r) => ({
        id: r.id as string,
        updated: (r.created_at as string) || now.toISOString(),
      }));
    }
  } catch {
    // fall through to mock
  }

  if (projectIds.length === 0) {
    projectIds = mockProjects.map((p) => ({
      id: p.id,
      updated: p.createdAt || now.toISOString(),
    }));
  }

  // Defensive: encode the id so a future DB-backed project with special
  // characters (slashes, hashes, unicode) doesn't produce a malformed URL.
  const projectPages: MetadataRoute.Sitemap = projectIds.map((p) => ({
    url: `${baseUrl}/project/${encodeURIComponent(p.id)}`,
    lastModified: new Date(p.updated),
    changeFrequency: "weekly" as const,
    priority: 0.65,
  }));

  // Category deep-links — added 2026-04-24. The landing page's BROWSE row
  // and /home category pills both resolve to `/home?category=AI+AGENT`-
  // style URLs; expose each one to crawlers as its own entry so Google
  // + AI Overviews can index category pages separately from /home.
  const CATEGORIES = [
    "AI AGENT",
    "AI TOOL",
    "AI GAME",
    "AI WORKFLOW",
    "AI UTILITY",
    "AI EXPERIMENT",
  ];
  const categoryPages: MetadataRoute.Sitemap = CATEGORIES.map((c) => ({
    url: `${baseUrl}/home?category=${encodeURIComponent(c)}`,
    lastModified: now,
    changeFrequency: "daily" as const,
    priority: 0.82,
  }));

  // Hook archetype detail pages — 12 SSG routes with long-tail SEO
  // value ("douyin pain reveal hook", "抖音权威背书公式"). Static, so
  // safe to enumerate unconditionally.
  const archetypePages: MetadataRoute.Sitemap = HOOK_ARCHETYPES.map((a) => ({
    url: `${baseUrl}/hooks/${a.slug}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.75,
  }));

  return [...staticPages, ...categoryPages, ...projectPages, ...archetypePages];
}
