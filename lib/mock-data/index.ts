import type { Project, Creator, ShareContent } from "../types";
import { computeHeroStats, computeSkillQuadrant } from "../rpg-utils";
import { projects } from "./projects";
import { creators } from "./creators";

export { projects, creators };
export { ideas } from "./ideas";
export { events } from "./events";
export { trendInsights } from "./trends";
export { weeklyWinners } from "./winners";
export { categories } from "./categories";

// ─── Auto-compute RPG Hero Stats ─────────────────────────────────────────────

// Attach hero stats to every project
for (const project of projects) {
  project.hero = computeHeroStats(project);
}

// Attach skill quadrants to creators
for (const creator of creators) {
  const creatorProjects = projects.filter((p) => p.creatorId === creator.id);
  creator.skillQuadrant = computeSkillQuadrant(creator, creatorProjects);
}

// ─── Helper Functions ────────────────────────────────────────────────────────

export function getProjectById(id: string): Project | undefined {
  return projects.find((p) => p.id === id);
}

export function getCreatorById(id: string): Creator | undefined {
  return creators.find((c) => c.id === id);
}

export function getRemixChain(projectId: string): Project[] {
  const chain: Project[] = [];
  let current = getProjectById(projectId);

  while (current) {
    chain.unshift(current);
    if (current.parentId) {
      current = getProjectById(current.parentId);
    } else {
      break;
    }
  }

  return chain;
}

export function generateShareContent(project: Project): ShareContent {
  const playableUrl = `https://vibexforge.com/project/${project.id}`;

  return {
    twitter: `Just discovered "${project.title}" on @VibeX — ${project.tagline.toLowerCase()}. This is what AI-native building looks like. Try it yourself: ${playableUrl} #vibecoding #ai`,
    xiaohongshu: `Found an amazing AI project "${project.title}"! ${project.tagline} Already ${project.upvotes} upvotes, come try it out! Link in bio #AICreation #VibeX #TechFrontier #IndieDev`,
    douyin: `This AI project is trending! "${project.title}" — ${project.tagline}, ${project.plays} people already playing #AI #Tech #IndieDev`,
    embedCode: `<iframe src="${playableUrl}" width="100%" height="500" />`,
    playableUrl,
  };
}
