import { MetadataRoute } from "next";
import { projects } from "@/lib/mock-data";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://vibex.app";

  const staticPages = [
    "", "/explore", "/hunt", "/arena", "/ideas",
    "/creators", "/events", "/insights", "/launch", "/login",
    "/agents", "/workflows", "/analytics", "/developers",
    "/buddy", "/feed", "/profile", "/settings",
    "/about", "/terms", "/privacy",
  ].map(path => ({
    url: `${baseUrl}${path}`,
    lastModified: new Date(),
    changeFrequency: "daily" as const,
    priority: path === "" ? 1 : 0.8,
  }));

  const projectPages = projects.map(p => ({
    url: `${baseUrl}/project/${p.id}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));

  return [...staticPages, ...projectPages];
}
