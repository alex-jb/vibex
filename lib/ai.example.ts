/**
 * AI Service Layer (Example / Stub)
 *
 * This is a public example showing the API interface.
 * The actual AI implementation (lib/ai.ts) uses Claude API
 * with proprietary prompts and scoring algorithms.
 *
 * To build your own: copy this file to lib/ai.ts and
 * implement each function with your preferred LLM provider.
 */

import type { AIReview, IdeaEvaluation } from "./types";

// ─── Project Review ───
export async function generateProjectReview(_project: {
  title: string;
  tagline: string;
  description: string;
  category: string;
  tags: string[];
}): Promise<AIReview> {
  // TODO: Implement with your LLM provider
  // The real version uses Claude to generate scores and feedback
  return {
    originality: 75,
    clarity: 80,
    uxPotential: 70,
    viralityPotential: 65,
    investorCuriosity: 60,
    strengths: ["Well-defined concept", "Clear value proposition"],
    weaknesses: ["Needs more differentiation"],
    suggestions: ["Add a unique demo experience"],
  };
}

// ─── Idea Evaluation ───
export async function evaluateIdea(_idea: {
  title: string;
  description: string;
  category: string;
}): Promise<{
  viability: number;
  marketFit: number;
  competition: string;
  uniqueness: number;
  difficulty: string;
  suggestions: string[];
  similarProjects: string[];
}> {
  // TODO: Implement with your LLM provider
  return {
    viability: 70,
    marketFit: 65,
    competition: "moderate",
    uniqueness: 75,
    difficulty: "medium",
    suggestions: ["Validate with potential users first"],
    similarProjects: ["Similar Project A"],
  };
}

// ─── Battle Narrative ───
export async function generateBattleNarrative(_battle: {
  challengerTitle: string;
  defenderTitle: string;
  rounds: unknown[];
  winner: string;
}): Promise<{
  intro: string;
  roundNarratives: string[];
  conclusion: string;
  mvpComment: string;
}> {
  // TODO: Implement with your LLM provider
  return {
    intro: "A fierce battle begins!",
    roundNarratives: ["Round 1 was intense!"],
    conclusion: "What an epic battle!",
    mvpComment: "Both contenders showed great potential.",
  };
}

// ─── Launch Assistant (streaming) ───
export async function* streamLaunchAssistant(_project: {
  title: string;
  tagline: string;
  description: string;
  category: string;
}): AsyncGenerator<string> {
  // TODO: Implement streaming with your LLM provider
  yield "Great project concept! Here are some suggestions...\n";
  yield "- Consider making the title more specific\n";
  yield "- Add metrics to your tagline for credibility\n";
}

// ─── Share Summary ───
export async function generateShareSummary(_project: {
  title: string;
  tagline: string;
  category: string;
}, _platform: "twitter" | "xiaohongshu" | "douyin"): Promise<string> {
  // TODO: Implement with your LLM provider
  return "Check out this amazing AI project! #AI #VibeX";
}

// ─── Trend Analysis ───
export async function analyzeTrend(_category: string, _projectCount: number) {
  // TODO: Implement with your LLM provider
  return {
    type: "rising" as const,
    signal: "moderate" as const,
    summary: "This category is showing growth potential.",
    momentum: 65,
    confidence: 70,
  };
}
