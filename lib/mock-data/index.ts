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
  const playableUrl = `https://play.vibecode.hunt/p/${project.id}`;

  return {
    twitter: `Just discovered "${project.title}" on @VibeCodeHunt — ${project.tagline.toLowerCase()}. This is what AI-native building looks like. Try it yourself: ${playableUrl} #vibecoding #ai`,
    xiaohongshu: `🔥 发现了一个超酷的AI项目「${project.title}」！${project.tagline} ✨ 已经有${project.upvotes}人点赞了，快来体验一下吧！链接在主页 #AI创作 #VibeCode #科技前沿 #独立开发`,
    douyin: `这个AI项目火了！「${project.title}」— ${project.tagline}，${project.plays}人已经在玩了 🚀 #AI #科技 #独立开发者`,
    embedCode: `<iframe src="${playableUrl}" width="100%" height="500" />`,
    playableUrl,
  };
}
