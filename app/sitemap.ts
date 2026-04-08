import { MetadataRoute } from "next";
import { projects } from "@/lib/mock-data";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://vibex.app";

  const staticPages = [
    "", "/discover", "/hunt", "/arena", "/ideas",
    "/creators", "/events", "/insights", "/launch", "/login",
    "/register", "/analytics", "/developers",
    "/buddy", "/feed", "/profile", "/settings",
    "/about", "/terms", "/privacy",
    // New pages
    "/messages", "/admin", "/admin/analytics",
    "/buddy/trade", "/creators/graph", "/insights/growth",
  ].map(path => ({
    url: `${baseUrl}${path}`,
    lastModified: new Date(),
    changeFrequency: "daily" as const,
    priority: path === "" ? 1 : path === "/feed" ? 0.9 : path === "/launch" ? 0.9 : 0.8,
  }));

  const projectPages = projects.map(p => ({
    url: `${baseUrl}/project/${p.id}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));

  return [...staticPages, ...projectPages];
}
