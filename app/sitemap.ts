import { MetadataRoute } from "next";
import { projects } from "@/lib/mock-data";

/**
 * Sitemap for crawlers.
 * - High priority: landing, home, launch, discover, feed (conversion funnel)
 * - Medium: content hubs (creators, insights, dojo, ideas)
 * - Low: user-specific (profile/settings) and legal
 * - Auth flows (/login, /register) intentionally excluded — no SEO value
 * - Dynamic routes (/project/[id]) enumerated from mock data; swap to DB later
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://vibexforge.com";
  const now = new Date();

  type Entry = { path: string; priority: number; changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"] };

  const staticRoutes: Entry[] = [
    // Conversion funnel — highest priority, daily updates
    { path: "", priority: 1.0, changeFrequency: "daily" },
    { path: "/home", priority: 0.95, changeFrequency: "daily" },
    { path: "/launch", priority: 0.9, changeFrequency: "daily" },
    { path: "/discover", priority: 0.9, changeFrequency: "daily" },
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
    { path: "/create-card", priority: 0.75, changeFrequency: "monthly" },
    { path: "/agents/builder", priority: 0.7, changeFrequency: "weekly" },
    { path: "/workflows", priority: 0.7, changeFrequency: "weekly" },
    { path: "/buddy", priority: 0.7, changeFrequency: "weekly" },
    { path: "/buddy/trade", priority: 0.6, changeFrequency: "weekly" },
    { path: "/developers", priority: 0.7, changeFrequency: "weekly" },
    // VC / investor surface
    { path: "/vc/dashboard", priority: 0.6, changeFrequency: "daily" },
    { path: "/analytics", priority: 0.6, changeFrequency: "daily" },
    // User pages
    { path: "/profile", priority: 0.5, changeFrequency: "weekly" },
    { path: "/profile/dashboard", priority: 0.5, changeFrequency: "weekly" },
    { path: "/settings", priority: 0.3, changeFrequency: "monthly" },
    // Legal & info (low priority, rarely change)
    { path: "/about", priority: 0.5, changeFrequency: "monthly" },
    { path: "/privacy", priority: 0.3, changeFrequency: "yearly" },
    { path: "/terms", priority: 0.3, changeFrequency: "yearly" },
  ];

  const staticPages: MetadataRoute.Sitemap = staticRoutes.map((r) => ({
    url: `${baseUrl}${r.path}`,
    lastModified: now,
    changeFrequency: r.changeFrequency,
    priority: r.priority,
  }));

  // Defensive: encode the id so a future DB-backed project with special
  // characters (slashes, hashes, unicode) doesn't produce a malformed URL.
  const projectPages: MetadataRoute.Sitemap = projects.map((p) => ({
    url: `${baseUrl}/project/${encodeURIComponent(p.id)}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.65,
  }));

  return [...staticPages, ...projectPages];
}
