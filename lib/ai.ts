// Public stub — full implementation is proprietary. See LICENSE.

import Anthropic from "@anthropic-ai/sdk";
import type {
  StructuredReview,
  FeedbackAction,
  FeedbackActionType,
  FeedbackSeverity,
  FeedbackSuccessMetric,
} from "./types";

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

const REVIEW_MODEL = "claude-haiku-4-5";

const STUB_REVIEW: AIReviewResult = {
  originality: 75,
  clarity: 80,
  uxPotential: 70,
  viralityPotential: 65,
  investorCuriosity: 60,
  strengths: ["Interesting concept", "Clean presentation"],
  weaknesses: ["Needs more detail", "Market validation pending"],
  suggestions: ["Add a demo video", "Define target audience more clearly"],
};

/**
 * Five-dimension Claude-scored review. Calls the Anthropic API when
 * ANTHROPIC_API_KEY is present, else returns a neutral stub so local dev
 * (no key) and first-boot prod don't crash.
 *
 * Pattern mirrors generateStructuredReview() below — same fallback shape.
 * Previously this was a hardcoded stub even with a key in env; that was
 * the reason /api/projects/submit wrote 0/empty AI fields to every new
 * user's project page. Fixed 2026-04-17.
 */
export async function generateProjectReview(project: {
  title: string;
  tagline: string;
  description: string;
  category: string;
  tags: string[];
}): Promise<AIReviewResult> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return STUB_REVIEW;

  try {
    const client = new Anthropic({ apiKey });
    const response = await client.messages.create({
      model: REVIEW_MODEL,
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
    const parsed = JSON.parse(jsonMatch?.[0] || "{}") as Partial<AIReviewResult>;

    // Defensive: Claude can omit fields on rare malformed responses.
    // Merge with the stub so every field always has a safe default.
    return {
      ...STUB_REVIEW,
      ...parsed,
      strengths: parsed.strengths?.length ? parsed.strengths : STUB_REVIEW.strengths,
      weaknesses: parsed.weaknesses?.length ? parsed.weaknesses : STUB_REVIEW.weaknesses,
      suggestions: parsed.suggestions?.length ? parsed.suggestions : STUB_REVIEW.suggestions,
    };
  } catch (err) {
    console.error("[ai] generateProjectReview failed, returning stub:", err);
    return STUB_REVIEW;
  }
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

export async function evaluateIdea(_idea: {
  title: string;
  description: string;
  category: string;
}): Promise<AIIdeaEvalResult> {
  return {
    viability: 70,
    marketFit: 65,
    competition: "moderate",
    uniqueness: 60,
    difficulty: "medium",
    suggestions: ["Validate with early users", "Build an MVP first"],
    similarProjects: ["ExampleProject"],
  };
}

// ═══════════════════════════════════════════════════════════════
// LAUNCH FEEDBACK LOOP — structured, actionable review
// See ceo-plans/launch-feedback-loop-20260413.md
// ═══════════════════════════════════════════════════════════════

type ProjectForReview = {
  id: string;
  title: string;
  tagline: string;
  description: string;
  category: string;
  tags: string[];
};

/**
 * Generate a structured AI review that returns concrete, actionable items
 * instead of prose bullets. Each item has severity, 2-3 candidate fixes the
 * creator can apply with one click, and a success metric we'll watch after
 * apply to compute outcome delta.
 *
 * Uses Claude (Anthropic API) when ANTHROPIC_API_KEY is set in the server
 * env. Falls back to a hand-written stub review when the key isn't available
 * (local dev without an Anthropic account, CI, first-boot prod) so the UI
 * keeps rendering a plausible shape.
 */
export async function generateStructuredReview(
  project: ProjectForReview,
): Promise<StructuredReview> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (apiKey) {
    try {
      return await generateClaudeReview(project, apiKey);
    } catch (err) {
      console.error("[ai] Claude review failed, falling back to stub:", err);
      // fall through to stub
    }
  }
  return generateStubReview(project);
}

/**
 * Real Claude-powered review via Anthropic SDK + tool use for reliable
 * structured output. Forced tool_choice prevents the model from producing
 * prose instead of JSON.
 */
async function generateClaudeReview(
  project: ProjectForReview,
  apiKey: string,
): Promise<StructuredReview> {
  const client = new Anthropic({ apiKey });
  const review_id = `cl-${project.id}-${Date.now().toString(36)}`;

  const systemPrompt = `You are VibeX Launch Coach — a sharp, direct reviewer of AI projects on a launch platform. You have the instincts of a YC partner reviewing a demo day pitch: you name specific, fixable issues and reject vague advice.

Your job: return 5 to 7 concrete actions the creator can apply RIGHT NOW to improve how this project lands with users. Each action must have:
- ONE problem named (not "could be better" — what specifically is weak)
- TWO or THREE suggested_values — each a real, usable rewrite or concrete instruction (not "improve the X", the actual new X)
- WHY it matters tied to a metric the platform tracks

Tone: direct, founder-to-founder. No AI hedging words. No "consider thinking about potentially". Name the problem, name the fix.

Action type distribution — aim for:
- 1-2 must_fix (the thing that will lose the most users if not fixed)
- 2-3 should_try (high-leverage improvements)
- 1-2 consider (nice-to-haves)

Pick action TYPES that match what's actually weak. Don't generate all 10 types — pick the 5-7 most relevant.`;

  const userPrompt = `Review this project and submit your structured review via the submit_review tool.

PROJECT METADATA
────────────────
Title:       ${project.title}
Tagline:     ${project.tagline}
Category:    ${project.category}
Tags:        ${project.tags.length ? project.tags.join(", ") : "(none)"}

Description:
${project.description}`;

  const response = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 3000,
    system: systemPrompt,
    tools: [
      {
        name: "submit_review",
        description:
          "Submit the structured review with 5-7 actionable items and aggregate scores.",
        input_schema: REVIEW_TOOL_SCHEMA,
      },
    ],
    tool_choice: { type: "tool", name: "submit_review" },
    messages: [{ role: "user", content: userPrompt }],
  });

  // Extract the tool_use block — tool_choice forced means it's always present.
  const block = response.content.find((b) => b.type === "tool_use");
  if (!block || block.type !== "tool_use") {
    throw new Error("Claude did not return a tool_use block");
  }
  const parsed = block.input as {
    actions: Array<{
      type: FeedbackActionType;
      severity: FeedbackSeverity;
      rationale: string;
      current_value: string | null;
      suggested_values: string[];
      success_metric: FeedbackSuccessMetric;
    }>;
    originality: number;
    clarity: number;
    ux_potential: number;
    virality_potential: number;
    investor_curiosity: number;
  };

  const actions: FeedbackAction[] = parsed.actions.map((a, i) => ({
    action_id: `${a.type}-${i + 1}`,
    review_id,
    type: a.type,
    severity: a.severity,
    rationale: a.rationale,
    current_value: a.current_value,
    suggested_values: a.suggested_values,
    success_metric: a.success_metric,
    status: "suggested" as const,
  }));

  return {
    review_id,
    actions,
    originality: parsed.originality,
    clarity: parsed.clarity,
    ux_potential: parsed.ux_potential,
    virality_potential: parsed.virality_potential,
    investor_curiosity: parsed.investor_curiosity,
  };
}

/** JSON schema for the submit_review tool. Mirrors StructuredReview. */
const REVIEW_TOOL_SCHEMA = {
  type: "object" as const,
  properties: {
    actions: {
      type: "array",
      description: "5 to 7 structured, actionable review items.",
      minItems: 5,
      maxItems: 7,
      items: {
        type: "object",
        properties: {
          type: {
            type: "string",
            enum: [
              "tagline_rewrite",
              "description_rewrite",
              "demo_add",
              "demo_quality",
              "audience_narrow",
              "cta_revamp",
              "tag_fix",
              "category_retarget",
              "thumbnail_upgrade",
              "pricing_clarify",
            ],
          },
          severity: {
            type: "string",
            enum: ["must_fix", "should_try", "consider"],
          },
          rationale: {
            type: "string",
            description:
              "1-2 sentences explaining what is weak and why fixing it helps.",
          },
          current_value: {
            type: ["string", "null"],
            description:
              "The current text or state the action refers to. Null if the action is to ADD something that doesn't exist yet (e.g., demo_add when no demo is present).",
          },
          suggested_values: {
            type: "array",
            description:
              "2-3 concrete, usable replacement texts or specific instructions the creator can apply directly.",
            minItems: 2,
            maxItems: 3,
            items: { type: "string" },
          },
          success_metric: {
            type: "string",
            enum: [
              "upvotes",
              "plays",
              "shares",
              "ctr",
              "retention",
              "remix_count",
            ],
          },
        },
        required: [
          "type",
          "severity",
          "rationale",
          "current_value",
          "suggested_values",
          "success_metric",
        ],
      },
    },
    originality: {
      type: "integer",
      minimum: 0,
      maximum: 100,
      description: "How novel the concept is vs. the existing landscape.",
    },
    clarity: {
      type: "integer",
      minimum: 0,
      maximum: 100,
      description: "How clearly the project explains itself.",
    },
    ux_potential: {
      type: "integer",
      minimum: 0,
      maximum: 100,
      description: "How much the UX could convert a curious visitor.",
    },
    virality_potential: {
      type: "integer",
      minimum: 0,
      maximum: 100,
      description: "Likelihood of organic sharing.",
    },
    investor_curiosity: {
      type: "integer",
      minimum: 0,
      maximum: 100,
      description: "How likely a VC would want a closer look.",
    },
  },
  required: [
    "actions",
    "originality",
    "clarity",
    "ux_potential",
    "virality_potential",
    "investor_curiosity",
  ],
};

/** Hand-written fallback — used when ANTHROPIC_API_KEY isn't set. */
async function generateStubReview(
  project: ProjectForReview,
): Promise<StructuredReview> {
  const review_id = `stub-${project.id}-${Date.now().toString(36)}`;

  const mk = (
    idx: number,
    type: FeedbackActionType,
    severity: FeedbackSeverity,
    rationale: string,
    current_value: string | null,
    suggested_values: string[],
    success_metric: FeedbackSuccessMetric,
  ): FeedbackAction => ({
    action_id: `${type}-${idx}`,
    review_id,
    type,
    severity,
    rationale,
    current_value,
    suggested_values,
    success_metric,
    status: "suggested",
  });

  const actions: FeedbackAction[] = [
    mk(
      1,
      "tagline_rewrite",
      "must_fix",
      "Your tagline is generic and doesn't hint at what makes this different. Pick a rewrite that names a concrete outcome or a surprising angle.",
      project.tagline,
      [
        `The first ${project.category} that actually remembers context across sessions`,
        `${project.title} — your AI co-pilot for ${project.category.toLowerCase()}, built for creators who ship weekly`,
        `Skip the boilerplate. ${project.title} takes you from idea to demo in under 5 minutes.`,
      ],
      "upvotes",
    ),
    mk(
      1,
      "demo_add",
      "must_fix",
      "No demo means visitors bounce. A 10-second looping GIF of the magic moment is non-negotiable for launch.",
      null,
      [
        "Record a 3-cut screen capture: (1) paste input, (2) hit enter, (3) show output. Export as < 3MB GIF.",
        "Use a narrated 15s Loom video showing one end-to-end user flow.",
        "Embed a live sandbox iframe so visitors can try without leaving.",
      ],
      "plays",
    ),
    mk(
      1,
      "audience_narrow",
      "should_try",
      "Your description targets 'everyone who uses AI'. Narrow to a specific persona — the wedge is who's most desperate for this today.",
      project.description.slice(0, 140),
      [
        "Solo indie developers shipping AI side-projects weekly",
        "Product managers at 10-50 person startups running AI experiments",
        "Technical founders who hate writing launch copy but need to ship",
      ],
      "retention",
    ),
    mk(
      1,
      "cta_revamp",
      "should_try",
      "A generic 'Learn More' kills conversion. The CTA should name the next action a user will actually take.",
      "Learn More",
      [
        "Try it with your own prompt →",
        "See the 60-second demo",
        "Remix this project in one click",
      ],
      "ctr",
    ),
    mk(
      1,
      "tag_fix",
      "consider",
      "Your tags overlap with the category label. Tags should add discovery surface area, not repeat what's already there.",
      project.tags.join(", "),
      [
        "Replace 'AI' with 2-3 concrete technique tags (e.g. 'diffusion', 'rag', 'agents')",
        "Add a use-case tag ('side-project', 'enterprise', 'creator-tools')",
        "Add a stage tag ('alpha', 'beta', 'v1-shipped') — filters are how people find things",
      ],
      "shares",
    ),
  ];

  return {
    review_id,
    actions,
    originality: 75,
    clarity: 80,
    ux_potential: 70,
    virality_potential: 65,
    investor_curiosity: 60,
  };
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
  return {
    intro: `${battle.challengerTitle} vs ${battle.defenderTitle} — let the battle begin!`,
    roundNarratives: battle.rounds.map(
      (r) => `${r.attribute}: ${r.winner} wins this round!`,
    ),
    conclusion: `${battle.winner} claims victory!`,
    mvpComment: "An impressive showing from both sides.",
  };
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
  const narrative = JSON.stringify({
    intro: `${battle.challengerTitle} vs ${battle.defenderTitle} — battle commences!`,
    roundNarratives: battle.rounds.map(
      (r) => `${r.attribute}: ${r.winner} wins!`,
    ),
    conclusion: `${battle.winner} is victorious!`,
    mvpComment: "Great battle!",
  });
  // Simulate streaming by yielding chunks
  for (let i = 0; i < narrative.length; i += 20) {
    yield narrative.slice(i, i + 20);
  }
}

// ═══════════════════════════════════════════════════════════════
// AI LAUNCH ASSISTANT (streaming)
// ═══════════════════════════════════════════════════════════════

export async function* streamLaunchAssistant(_project: {
  title: string;
  tagline: string;
  description: string;
  category: string;
}): AsyncGenerator<string> {
  const tips = [
    "Your project looks promising! ",
    "Consider adding a demo video. ",
    "Make sure your tagline is catchy and under 10 words. ",
    "Target a specific niche for better traction.",
  ];
  for (const tip of tips) {
    yield tip;
  }
}

// ═══════════════════════════════════════════════════════════════
// AI PROJECT SUMMARY (for social sharing)
// ═══════════════════════════════════════════════════════════════

export async function generateShareSummary(project: {
  title: string;
  tagline: string;
  category: string;
}, _platform: "twitter" | "xiaohongshu" | "douyin"): Promise<string> {
  return `Check out ${project.title} — ${project.tagline} #AI #VibeX`;
}

// ═══════════════════════════════════════════════════════════════
// AI TREND ANALYSIS
// ═══════════════════════════════════════════════════════════════

export async function analyzeTrend(_category: string, _projectCount: number): Promise<{
  type: "rising" | "saturated" | "opportunity" | "emerging";
  signal: "strong" | "moderate" | "early";
  summary: string;
  momentum: number;
  confidence: number;
}> {
  return {
    type: "rising",
    signal: "moderate",
    summary: "This category shows steady growth with room for innovation.",
    momentum: 65,
    confidence: 70,
  };
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
  return {
    positioning: {
      oneLiner: `${project.title} — the next big thing in ${project.category}`,
      targetAudience: "AI-curious developers and creators",
      problemSolved: "Helps creators launch AI projects faster",
      uniqueValue: "Community-driven discovery and feedback",
    },
    copy: {
      title: project.title,
      tagline: project.tagline,
      elevatorPitch: `${project.title} is a ${project.category} project that ${project.description.slice(0, 100)}...`,
      productHuntDescription: `${project.title} helps you ${project.tagline}. Built with AI-native principles.`,
    },
    social: {
      twitterThread: [
        `Launching ${project.title} today!`,
        `Here's what it does: ${project.tagline}`,
        "Built this in public, feedback welcome!",
        `Try it out: ${project.demoUrl ?? "link in bio"}`,
      ],
      linkedinPost: `Excited to launch ${project.title}. ${project.tagline}`,
      redditTitle: `I built ${project.title} — ${project.tagline}`,
      redditBody: `${project.description}\n\nWould love your feedback!`,
    },
    distribution: {
      channels: [
        { name: "Twitter/X", reason: "Large AI community", priority: "high" },
        { name: "Reddit", reason: "Authentic discussion", priority: "high" },
        { name: "Product Hunt", reason: "Launch visibility", priority: "medium" },
      ],
      timing: "Tuesday morning EST",
      targetCommunities: ["r/artificial", "r/SideProject"],
    },
    investorPitch: {
      problem: "AI creators lack a dedicated platform for discovery",
      solution: project.description.slice(0, 200),
      market: "$10B+ AI tools market",
      traction: "Early stage — building community",
      ask: "Feedback and early users",
    },
    demoScript: `Hi, I'm showing ${project.title}. ${project.tagline}. Let me walk you through the key features.`,
    competitors: [
      { name: "Product Hunt", difference: "We focus exclusively on AI projects" },
    ],
  };
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

export async function generateGrowthSuggestions(_project: {
  title: string;
  description: string;
  category: string;
  views: number;
  upvotes: number;
  comments: number;
  daysSinceLaunch: number;
}): Promise<GrowthSuggestion[]> {
  return [
    { priority: "high", action: "Add a GIF preview to your listing", reason: "Increases click-through by ~55%", effort: "30min" },
    { priority: "high", action: "Share on relevant subreddits", reason: "Drives authentic discussion", effort: "30min" },
    { priority: "medium", action: "Write a short blog post about your journey", reason: "Builds credibility", effort: "1hr" },
    { priority: "low", action: "Optimize your tagline for clarity", reason: "First impression matters", effort: "5min" },
  ];
}
