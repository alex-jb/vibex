import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();
const MODEL = "claude-haiku-4-5"; // Cost-effective for structured generation

// ═══════════════════════════════════════════════════════════════
// AI PROJECT REVIEW
// ═══════════════════════════════════════════════════════════════

export interface AIReviewResult {
  originality: number;
  clarity: number;
  uxPotential: number;
  viralityPotential: number;
  investorCuriosity: number;
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
}

export async function generateProjectReview(project: {
  title: string;
  tagline: string;
  description: string;
  category: string;
  tags: string[];
}): Promise<AIReviewResult> {
  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 2000,
    system: `You are an expert AI project reviewer for VibeX, a platform for AI-native creations.
Evaluate projects on these dimensions (0-100 scale):
- originality: How novel and unique is this idea?
- clarity: How well-defined and understandable is the project?
- uxPotential: How good could the user experience be?
- viralityPotential: How likely is this to spread organically?
- investorCuriosity: How interesting would this be to investors?

Also provide 2-3 strengths, 2-3 weaknesses, and 2-3 actionable suggestions.
Respond ONLY with valid JSON matching the exact schema.`,
    messages: [
      {
        role: "user",
        content: `Review this project:
Title: ${project.title}
Tagline: ${project.tagline}
Description: ${project.description}
Category: ${project.category}
Tags: ${project.tags.join(", ")}

Respond with JSON: {"originality":N,"clarity":N,"uxPotential":N,"viralityPotential":N,"investorCuriosity":N,"strengths":["..."],"weaknesses":["..."],"suggestions":["..."]}`,
      },
    ],
  });

  const text = response.content.find((b) => b.type === "text")?.text || "{}";
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  return JSON.parse(jsonMatch?.[0] || "{}") as AIReviewResult;
}

// ═══════════════════════════════════════════════════════════════
// AI IDEA EVALUATION
// ═══════════════════════════════════════════════════════════════

export interface AIIdeaEvalResult {
  viability: number;
  marketFit: number;
  competition: "low" | "moderate" | "high" | "saturated";
  uniqueness: number;
  difficulty: "easy" | "medium" | "hard" | "expert";
  suggestions: string[];
  similarProjects: string[];
}

export async function evaluateIdea(idea: {
  title: string;
  description: string;
  category: string;
}): Promise<AIIdeaEvalResult> {
  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 2000,
    system: `You are an AI startup idea evaluator for VibeX.
Evaluate ideas on:
- viability (0-100): Can this be built and succeed?
- marketFit (0-100): Does the market need this?
- competition: "low" | "moderate" | "high" | "saturated"
- uniqueness (0-100): How different from existing solutions?
- difficulty: "easy" | "medium" | "hard" | "expert"
- suggestions: 2-3 actionable next steps
- similarProjects: 1-3 names of similar existing projects

Respond ONLY with valid JSON.`,
    messages: [
      {
        role: "user",
        content: `Evaluate this idea:
Title: ${idea.title}
Description: ${idea.description}
Category: ${idea.category}

Respond with JSON: {"viability":N,"marketFit":N,"competition":"...","uniqueness":N,"difficulty":"...","suggestions":["..."],"similarProjects":["..."]}`,
      },
    ],
  });

  const text = response.content.find((b) => b.type === "text")?.text || "{}";
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  return JSON.parse(jsonMatch?.[0] || "{}") as AIIdeaEvalResult;
}

// ═══════════════════════════════════════════════════════════════
// AI BATTLE COMMENTARY
// ═══════════════════════════════════════════════════════════════

export interface AIBattleNarrative {
  intro: string;
  roundNarratives: string[];
  conclusion: string;
  mvpComment: string;
}

export async function generateBattleNarrative(battle: {
  challengerTitle: string;
  defenderTitle: string;
  rounds: { attribute: string; challengerValue: number; defenderValue: number; winner: string; isCritical: boolean }[];
  winner: string;
}): Promise<AIBattleNarrative> {
  const roundSummary = battle.rounds
    .map((r, i) => `Round ${i + 1}: ${r.attribute} - Challenger ${r.challengerValue} vs Defender ${r.defenderValue} (${r.winner} wins${r.isCritical ? ", CRITICAL HIT" : ""})`)
    .join("\n");

  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 1500,
    system: `You are a dramatic RPG battle announcer for VibeX's AI project arena.
Generate exciting, pixel-game-style commentary for battles between AI projects.
Use gaming terminology, dramatic flair, and RPG references.
Keep each narrative 1-2 sentences. Be fun and energetic.
Respond ONLY with valid JSON.`,
    messages: [
      {
        role: "user",
        content: `Generate battle narrative:
Challenger: ${battle.challengerTitle}
Defender: ${battle.defenderTitle}
${roundSummary}
Overall Winner: ${battle.winner}

Respond with JSON: {"intro":"...","roundNarratives":["one per round"],"conclusion":"...","mvpComment":"..."}`,
      },
    ],
  });

  const text = response.content.find((b) => b.type === "text")?.text || "{}";
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  return JSON.parse(jsonMatch?.[0] || "{}") as AIBattleNarrative;
}

// ═══════════════════════════════════════════════════════════════
// AI BATTLE COMMENTARY (streaming)
// ═══════════════════════════════════════════════════════════════

export async function* streamBattleNarrative(battle: {
  challengerTitle: string;
  defenderTitle: string;
  rounds: { attribute: string; challengerValue: number; defenderValue: number; winner: string; isCritical: boolean }[];
  winner: string;
}): AsyncGenerator<string> {
  const roundSummary = battle.rounds
    .map((r, i) => `Round ${i + 1}: ${r.attribute} - Challenger ${r.challengerValue} vs Defender ${r.defenderValue} (${r.winner} wins${r.isCritical ? ", CRITICAL HIT" : ""})`)
    .join("\n");

  const stream = client.messages.stream({
    model: MODEL,
    max_tokens: 1500,
    system: `You are a dramatic RPG battle announcer for VibeX's AI project arena.
Generate exciting, pixel-game-style commentary for battles between AI projects.
Use gaming terminology, dramatic flair, and RPG references.
Keep each narrative 1-2 sentences. Be fun and energetic.
Respond ONLY with valid JSON.`,
    messages: [
      {
        role: "user",
        content: `Generate battle narrative:
Challenger: ${battle.challengerTitle}
Defender: ${battle.defenderTitle}
${roundSummary}
Overall Winner: ${battle.winner}

Respond with JSON: {"intro":"...","roundNarratives":["one per round"],"conclusion":"...","mvpComment":"..."}`,
      },
    ],
  });

  for await (const event of stream) {
    if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
      yield event.delta.text;
    }
  }
}

// ═══════════════════════════════════════════════════════════════
// AI LAUNCH ASSISTANT (streaming)
// ═══════════════════════════════════════════════════════════════

export async function* streamLaunchAssistant(project: {
  title: string;
  tagline: string;
  description: string;
  category: string;
}): AsyncGenerator<string> {
  const stream = client.messages.stream({
    model: MODEL,
    max_tokens: 1000,
    system: `You are an AI launch assistant for VibeX. Help creators improve their project submission.
Analyze the title, tagline, description, and category. Give concise, actionable feedback.
Focus on: title impact, tagline hook quality, description completeness, category fit, viral potential.
Be encouraging but honest. Use short bullet points. Respond in the user's language.`,
    messages: [
      {
        role: "user",
        content: `Help me improve my launch:
Title: ${project.title || "(empty)"}
Tagline: ${project.tagline || "(empty)"}
Description: ${project.description || "(empty)"}
Category: ${project.category || "(not selected)"}`,
      },
    ],
  });

  for await (const event of stream) {
    if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
      yield event.delta.text;
    }
  }
}

// ═══════════════════════════════════════════════════════════════
// AI PROJECT SUMMARY (for social sharing)
// ═══════════════════════════════════════════════════════════════

export async function generateShareSummary(project: {
  title: string;
  tagline: string;
  category: string;
}, platform: "twitter" | "xiaohongshu" | "douyin"): Promise<string> {
  const platformGuides: Record<string, string> = {
    twitter: "280 chars max, include relevant hashtags, techy/concise tone",
    xiaohongshu: "Chinese, use emojis, enthusiastic tone, 200 chars, include hashtags like #AI #VibeX",
    douyin: "Chinese, catchy short text for video caption, 100 chars, trendy tone",
  };

  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 300,
    messages: [
      {
        role: "user",
        content: `Write a ${platform} post for this AI project:
Title: ${project.title}
Tagline: ${project.tagline}
Category: ${project.category}

Guidelines: ${platformGuides[platform]}
Output ONLY the post text, nothing else.`,
      },
    ],
  });

  return response.content.find((b) => b.type === "text")?.text || "";
}

// ═══════════════════════════════════════════════════════════════
// AI TREND ANALYSIS
// ═══════════════════════════════════════════════════════════════

export async function analyzeTrend(category: string, projectCount: number): Promise<{
  type: "rising" | "saturated" | "opportunity" | "emerging";
  signal: "strong" | "moderate" | "early";
  summary: string;
  momentum: number;
  confidence: number;
}> {
  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 500,
    system: `You are a market trend analyst for AI projects. Analyze the given category and provide trend intelligence.
Respond ONLY with valid JSON.`,
    messages: [
      {
        role: "user",
        content: `Analyze this AI project category:
Category: ${category}
Number of projects: ${projectCount}

Respond with JSON: {"type":"rising|saturated|opportunity|emerging","signal":"strong|moderate|early","summary":"2-3 sentence analysis","momentum":0-100,"confidence":0-100}`,
      },
    ],
  });

  const text = response.content.find((b) => b.type === "text")?.text || "{}";
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  return JSON.parse(jsonMatch?.[0] || "{}");
}

// ═══════════════════════════════════════════════════════════════
// AI LAUNCH PACKAGE — Complete launch kit for AI creators
// ═══════════════════════════════════════════════════════════════

export interface LaunchPackage {
  positioning: {
    oneLiner: string;
    targetAudience: string;
    problemSolved: string;
    uniqueValue: string;
  };
  copy: {
    title: string;
    tagline: string;
    elevatorPitch: string;
    productHuntDescription: string;
  };
  social: {
    twitterThread: string[];
    linkedinPost: string;
    redditTitle: string;
    redditBody: string;
  };
  distribution: {
    channels: { name: string; reason: string; priority: "high" | "medium" | "low" }[];
    timing: string;
    targetCommunities: string[];
  };
  investorPitch: {
    problem: string;
    solution: string;
    market: string;
    traction: string;
    ask: string;
  };
  demoScript: string;
  competitors: { name: string; difference: string }[];
}

export async function generateLaunchPackage(project: {
  title: string;
  tagline: string;
  description: string;
  category: string;
  tags: string[];
  demoUrl?: string;
}): Promise<LaunchPackage> {
  const response = await client.messages.create({
    model: "claude-sonnet-4-6", // Use stronger model for launch package quality
    max_tokens: 4000,
    system: `You are a world-class product marketing expert and launch strategist.
Generate a complete launch package for an AI product. Be specific, actionable, and compelling.
Write copy that a founder can directly copy-paste and use.

The launch package must include:
1. positioning: oneLiner (max 15 words), targetAudience, problemSolved, uniqueValue
2. copy: title (catchy), tagline (max 10 words), elevatorPitch (3 sentences), productHuntDescription (2 paragraphs)
3. social: twitterThread (array of 4-5 tweets, first one is the hook), linkedinPost (professional tone), redditTitle (attention-grabbing), redditBody (detailed, authentic, not salesy)
4. distribution: channels (array of {name, reason, priority}), timing (best day/time to launch), targetCommunities (specific subreddits, Discord servers, Slack groups)
5. investorPitch: problem, solution, market (TAM/SAM), traction (what to highlight), ask (what you need)
6. demoScript: 30-second script for a product demo video
7. competitors: array of {name, difference} — 2-3 competitors and how this product is different

Respond ONLY with valid JSON matching this exact structure.`,
    messages: [
      {
        role: "user",
        content: `Generate a complete launch package for this AI product:

Title: ${project.title}
Tagline: ${project.tagline}
Description: ${project.description}
Category: ${project.category}
Tags: ${project.tags.join(", ")}
${project.demoUrl ? `Demo URL: ${project.demoUrl}` : ""}

Respond with JSON only.`,
      },
    ],
  });

  const text = response.content.find((b) => b.type === "text")?.text || "{}";
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  return JSON.parse(jsonMatch?.[0] || "{}") as LaunchPackage;
}

// ═══════════════════════════════════════════════════════════════
// AI GROWTH SUGGESTIONS — Post-launch optimization advice
// ═══════════════════════════════════════════════════════════════

export interface GrowthSuggestion {
  priority: "high" | "medium" | "low";
  action: string;
  reason: string;
  effort: "5min" | "30min" | "1hr" | "1day";
}

export async function generateGrowthSuggestions(project: {
  title: string;
  description: string;
  category: string;
  views: number;
  upvotes: number;
  comments: number;
  daysSinceLaunch: number;
}): Promise<GrowthSuggestion[]> {
  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 1500,
    system: `You are an AI growth advisor. Based on a project's metrics, suggest 4-6 specific, actionable growth improvements.
Each suggestion has: priority (high/medium/low), action (specific step), reason (why it matters), effort (time needed: 5min/30min/1hr/1day).
Focus on what will have the biggest impact for the least effort.
Respond ONLY with a JSON array.`,
    messages: [
      {
        role: "user",
        content: `Suggest growth actions for this project:
Title: ${project.title}
Description: ${project.description}
Category: ${project.category}
Views: ${project.views}
Upvotes: ${project.upvotes}
Comments: ${project.comments}
Days since launch: ${project.daysSinceLaunch}

Respond with JSON array: [{"priority":"high","action":"...","reason":"...","effort":"30min"}, ...]`,
      },
    ],
  });

  const text = response.content.find((b) => b.type === "text")?.text || "[]";
  const jsonMatch = text.match(/\[[\s\S]*\]/);
  return JSON.parse(jsonMatch?.[0] || "[]") as GrowthSuggestion[];
}
