// Public stub — full implementation is proprietary. See LICENSE.

import Anthropic from "@anthropic-ai/sdk";
import { runStructuredCall, runStructuredCallWithFallback } from "./ai-provider";
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
 * Five-dimension AI-scored review.
 *
 * Routes through `lib/ai-provider.ts` so the call hits Claude (default)
 * OR Kimi / DeepSeek / GLM / Qwen depending on the `AI_PROVIDER` env
 * var. See docs/provider-abstraction-2026-06-14.md for the switch.
 *
 * Returns a neutral stub when no API key is configured for the active
 * provider so local dev and first-boot prod don't crash.
 *
 * Previously called Anthropic directly + parsed JSON via regex from a
 * text response. Now uses forced structured output (tool_use on Claude,
 * function-call on OpenAI-compatible providers) — more reliable across
 * providers and removes the regex.
 */
const PROJECT_REVIEW_SCHEMA = {
  type: "object" as const,
  properties: {
    originality: { type: "integer", minimum: 0, maximum: 100, description: "How novel and unique is this idea?" },
    clarity: { type: "integer", minimum: 0, maximum: 100, description: "How well-defined and understandable is the project?" },
    uxPotential: { type: "integer", minimum: 0, maximum: 100, description: "How good could the user experience be?" },
    viralityPotential: { type: "integer", minimum: 0, maximum: 100, description: "How likely is this to spread organically?" },
    investorCuriosity: { type: "integer", minimum: 0, maximum: 100, description: "How interesting would this be to investors?" },
    strengths: { type: "array", items: { type: "string" }, minItems: 2, maxItems: 3 },
    weaknesses: { type: "array", items: { type: "string" }, minItems: 2, maxItems: 3 },
    suggestions: { type: "array", items: { type: "string" }, minItems: 2, maxItems: 3 },
  },
  required: [
    "originality",
    "clarity",
    "uxPotential",
    "viralityPotential",
    "investorCuriosity",
    "strengths",
    "weaknesses",
    "suggestions",
  ],
};

export async function generateProjectReview(project: {
  title: string;
  tagline: string;
  description: string;
  category: string;
  tags: string[];
}): Promise<AIReviewResult> {
  const result = await runStructuredCall<AIReviewResult>({
    systemPrompt: `You are an expert AI project reviewer for VibeX, a platform for AI-native creations.
Evaluate projects on these dimensions (0-100 scale):
- originality: How novel and unique is this idea?
- clarity: How well-defined and understandable is the project?
- uxPotential: How good could the user experience be?
- viralityPotential: How likely is this to spread organically?
- investorCuriosity: How interesting would this be to investors?

Also provide 2-3 strengths, 2-3 weaknesses, and 2-3 actionable suggestions. Be specific, not generic.`,
    userPrompt: `Review this project:
Title: ${project.title}
Tagline: ${project.tagline}
Description: ${project.description}
Category: ${project.category}
Tags: ${project.tags.join(", ")}`,
    schema: PROJECT_REVIEW_SCHEMA,
    schemaName: "submit_project_review",
    schemaDescription: "Submit the five-dimension project review with strengths, weaknesses, and suggestions.",
    model: REVIEW_MODEL,
    maxTokens: 2000,
  });

  if (!result) return STUB_REVIEW;

  // Defensive: merge with stub so any omitted array field stays populated.
  return {
    ...STUB_REVIEW,
    ...result,
    strengths: result.strengths?.length ? result.strengths : STUB_REVIEW.strengths,
    weaknesses: result.weaknesses?.length ? result.weaknesses : STUB_REVIEW.weaknesses,
    suggestions: result.suggestions?.length ? result.suggestions : STUB_REVIEW.suggestions,
  };
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

const IDEA_EVAL_STUB: AIIdeaEvalResult = {
  viability: 70,
  marketFit: 65,
  competition: "moderate",
  uniqueness: 60,
  difficulty: "medium",
  suggestions: ["Validate with early users", "Build an MVP first"],
  similarProjects: ["ExampleProject"],
};

const IDEA_EVAL_TOOL_SCHEMA = {
  type: "object" as const,
  properties: {
    viability: { type: "number", minimum: 0, maximum: 100, description: "How real is the demand?" },
    marketFit: { type: "number", minimum: 0, maximum: 100, description: "How well does this match an underserved segment?" },
    competition: { type: "string", enum: ["low", "moderate", "high", "saturated"] },
    uniqueness: { type: "number", minimum: 0, maximum: 100 },
    difficulty: { type: "string", enum: ["easy", "medium", "hard", "expert"] },
    suggestions: { type: "array", items: { type: "string" }, minItems: 2, maxItems: 5, description: "Concrete next steps. No 'consider thinking about'." },
    similarProjects: { type: "array", items: { type: "string" }, minItems: 1, maxItems: 4, description: "Real product names that already exist in this space." },
  },
  required: ["viability", "marketFit", "competition", "uniqueness", "difficulty", "suggestions", "similarProjects"],
};

export async function evaluateIdea(idea: {
  title: string;
  description: string;
  category: string;
}): Promise<AIIdeaEvalResult> {
  // 2026-06-30 port: was raw Anthropic SDK call, now goes through
  // runStructuredCallWithFallback so a single-provider billing
  // envelope (Anthropic monthly cap, OpenAI insufficient_quota etc.)
  // doesn't immediately drop user-facing reviews to the stub. Multi-
  // provider chain attempts Claude → Kimi → DeepSeek → GLM → Qwen in
  // priority order; falls to stub only when entire chain exhausts.
  //
  // Note on cache_control: the fallback chain drops Anthropic
  // ephemeral cache when routed to OpenAI-compat providers (none of
  // Kimi/DeepSeek/GLM/Qwen have an equivalent server-side cache
  // contract). For idea evaluations cached prompts save ~70% input
  // cost during launch surges; tolerable to lose this on fallback
  // tier since fallback is the unhappy path.
  const result = await runStructuredCallWithFallback<AIIdeaEvalResult>({
    systemPrompt: `You evaluate AI project ideas at YC-partner level. No hedging. Name real competitors. Numbers over adjectives.`,
    userPrompt: `Title: ${idea.title}\nCategory: ${idea.category}\n\nDescription:\n${idea.description}`,
    schema: IDEA_EVAL_TOOL_SCHEMA as Record<string, unknown>,
    schemaName: "submit_idea_eval",
    schemaDescription: "Submit idea evaluation.",
    maxTokens: 1200,
  });
  if (!result) return IDEA_EVAL_STUB;
  return result.data;
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
  // 2026-06-30 port: was direct Anthropic call → fall-to-stub, now
  // routes through runStructuredCallWithFallback so a Claude billing
  // envelope mid-launch falls to Kimi/GLM/DeepSeek/Qwen before
  // dropping the structured review (which the / submit flow depends on).
  // generateClaudeReview() retained as private fallback if WithFallback
  // ever needs to be bypassed for cache-control-only path.
  try {
    return await generateReviewViaProviderChain(project);
  } catch (err) {
    console.error("[ai] structured review chain failed, falling back to stub:", err);
    return generateStubReview(project);
  }
}

async function generateReviewViaProviderChain(
  project: ProjectForReview,
): Promise<StructuredReview> {
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

  const result = await runStructuredCallWithFallback<{
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
  }>({
    systemPrompt,
    userPrompt,
    schema: REVIEW_TOOL_SCHEMA as Record<string, unknown>,
    schemaName: "submit_review",
    schemaDescription:
      "Submit the structured review with 5-7 actionable items and aggregate scores.",
    maxTokens: 3000,
  });
  if (!result) throw new Error("provider chain returned null (all tiers exhausted)");
  const parsed = result.data;

  // Hand back the parsed tool output in the shape the caller expects.
  // (Mirror of the build logic in generateClaudeReview below.)
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

  // Prompt caching: the system prompt + tool schema are identical across
  // every review. Mark them ephemeral so Anthropic caches them server-side.
  // Cached reads are 10% of normal input cost + zero latency. With launch-
  // week traffic this saves ~70% of generateProjectReview input spend.
  // 2026-06-05 deep-research finding: Opus 4.8 lowered min cacheable
  // prompt to 1,024 tokens (Sonnet 4.6 still 2,048). System prompt above
  // is ~700 tokens — not over Sonnet's 2K floor on its own, but combined
  // with the tool schema (~1.5K tokens) the cache_control block at the
  // end of `system` should hit Sonnet's threshold.
  const response = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 3000,
    system: [
      {
        type: "text" as const,
        text: systemPrompt,
        cache_control: { type: "ephemeral" as const },
      },
    ],
    tools: [
      {
        name: "submit_review",
        description:
          "Submit the structured review with 5-7 actionable items and aggregate scores.",
        input_schema: REVIEW_TOOL_SCHEMA,
        cache_control: { type: "ephemeral" as const },
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

const BATTLE_NARRATIVE_STUB = (battle: {
  challengerTitle: string;
  defenderTitle: string;
  rounds: { attribute: string; challengerValue: number; defenderValue: number; winner: string; isCritical: boolean }[];
  winner: string;
}): AIBattleNarrative => ({
  intro: `${battle.challengerTitle} vs ${battle.defenderTitle} — let the battle begin!`,
  roundNarratives: battle.rounds.map(
    (r) => `${r.attribute}: ${r.winner} wins this round!`,
  ),
  conclusion: `${battle.winner} claims victory!`,
  mvpComment: "An impressive showing from both sides.",
});

const BATTLE_NARRATIVE_TOOL_SCHEMA = {
  type: "object" as const,
  properties: {
    intro: { type: "string", description: "1-2 sentences setting up the matchup. Cracked / RPG tone. No buzzwords." },
    roundNarratives: { type: "array", items: { type: "string" }, description: "One line per round in the order given. Reference the attribute + which side won + the value gap." },
    conclusion: { type: "string", description: "1-2 sentences declaring the winner. Tie back to the stat that won it." },
    mvpComment: { type: "string", description: "1 sentence on the strongest moment from either side." },
  },
  required: ["intro", "roundNarratives", "conclusion", "mvpComment"],
};

export async function generateBattleNarrative(battle: {
  challengerTitle: string;
  defenderTitle: string;
  rounds: { attribute: string; challengerValue: number; defenderValue: number; winner: string; isCritical: boolean }[];
  winner: string;
}): Promise<AIBattleNarrative> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return BATTLE_NARRATIVE_STUB(battle);
  try {
    const client = new Anthropic({ apiKey });
    const roundsBlob = battle.rounds
      .map((r, i) =>
        `Round ${i + 1} (${r.attribute}): ${battle.challengerTitle} ${r.challengerValue} vs ${battle.defenderTitle} ${r.defenderValue} → ${r.winner} wins${r.isCritical ? " (CRITICAL)" : ""}`,
      )
      .join("\n");
    const response = await client.messages.create({
      model: REVIEW_MODEL,
      max_tokens: 800,
      // System prompt + tool schema same across battles, varies only in
      // round count interpolation. Cache the static parts.
      system: [
        {
          type: "text" as const,
          text: `You narrate AI project battles in a Cracked / RPG voice. Tight punchy lines. Reference actual stat gaps. No "revolutionary", "epic", "ultimate". No em dashes. ${battle.rounds.length} rounds — produce that many roundNarratives in order.`,
          cache_control: { type: "ephemeral" as const },
        },
      ],
      tools: [{
        name: "submit_battle",
        description: "Submit battle narrative.",
        input_schema: BATTLE_NARRATIVE_TOOL_SCHEMA,
        cache_control: { type: "ephemeral" as const },
      }],
      tool_choice: { type: "tool", name: "submit_battle" },
      messages: [{
        role: "user",
        content: `${battle.challengerTitle} vs ${battle.defenderTitle}\n\nRounds:\n${roundsBlob}\n\nOverall winner: ${battle.winner}`,
      }],
    });
    const block = response.content.find((b) => b.type === "tool_use");
    if (!block || block.type !== "tool_use") throw new Error("no tool_use");
    return block.input as AIBattleNarrative;
  } catch (err) {
    console.error("[ai] generateBattleNarrative failed:", err);
    return BATTLE_NARRATIVE_STUB(battle);
  }
}

// ═══════════════════════════════════════════════════════════════
// AI BATTLE COMMENTARY (streaming)
// ═══════════════════════════════════════════════════════════════

/**
 * Streaming battle narrative. Calls Claude with `stream: true` and yields
 * raw text chunks as they arrive. Front-end can render progressively.
 *
 * Falls back to a chunked stub when ANTHROPIC_API_KEY is absent so the
 * UI still streams something rather than appearing broken.
 */
export async function* streamBattleNarrative(battle: {
  challengerTitle: string;
  defenderTitle: string;
  rounds: { attribute: string; challengerValue: number; defenderValue: number; winner: string; isCritical: boolean }[];
  winner: string;
}): AsyncGenerator<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    const stub = `${battle.challengerTitle} vs ${battle.defenderTitle}. ${battle.winner} takes it.`;
    for (let i = 0; i < stub.length; i += 20) {
      yield stub.slice(i, i + 20);
    }
    return;
  }
  try {
    const client = new Anthropic({ apiKey });
    const roundsBlob = battle.rounds
      .map((r, i) =>
        `Round ${i + 1} (${r.attribute}): ${r.challengerValue} vs ${r.defenderValue} → ${r.winner}${r.isCritical ? " CRITICAL" : ""}`,
      )
      .join("\n");
    const stream = await client.messages.stream({
      model: REVIEW_MODEL,
      max_tokens: 600,
      system: `Narrate an AI project battle round-by-round in a Cracked / RPG voice. Punchy sentences. Use the real numbers. No "epic", no "ultimate", no em dashes.`,
      messages: [{
        role: "user",
        content: `${battle.challengerTitle} vs ${battle.defenderTitle}\n\n${roundsBlob}\n\nOverall winner: ${battle.winner}\n\nWrite a single-pass narrative (intro, 1 line per round, conclusion).`,
      }],
    });
    for await (const event of stream) {
      if (
        event.type === "content_block_delta" &&
        event.delta.type === "text_delta"
      ) {
        yield event.delta.text;
      }
    }
  } catch (err) {
    console.error("[ai] streamBattleNarrative failed:", err);
    yield `${battle.challengerTitle} vs ${battle.defenderTitle}. ${battle.winner} takes it.`;
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
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    const tips = [
      "Your project looks promising. ",
      "Add a demo video. ",
      "Catchy tagline under 10 words. ",
      "Target a specific niche.",
    ];
    for (const tip of tips) yield tip;
    return;
  }
  try {
    const client = new Anthropic({ apiKey });
    const stream = await client.messages.stream({
      model: REVIEW_MODEL,
      max_tokens: 600,
      system: `You are VibeX Launch Coach. Direct, founder-to-founder. Give 3-5 specific, actionable next-step suggestions for this project's launch. No "revolutionary", no em dashes, no preamble. Stream as plain text, one suggestion per paragraph.`,
      messages: [{
        role: "user",
        content: `Title: ${project.title}\nTagline: ${project.tagline}\nCategory: ${project.category}\n\nDescription:\n${project.description}\n\nGive launch advice.`,
      }],
    });
    for await (const event of stream) {
      if (
        event.type === "content_block_delta" &&
        event.delta.type === "text_delta"
      ) {
        yield event.delta.text;
      }
    }
  } catch (err) {
    console.error("[ai] streamLaunchAssistant failed:", err);
    yield `Add a demo video. Tighten the tagline under 10 words. Pick one niche subreddit and post within 7 days of going live.`;
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
  const apiKey = process.env.ANTHROPIC_API_KEY;
  const stub = `Check out ${project.title} — ${project.tagline} #AI #VibeX`;
  if (!apiKey) return stub;
  const platformVoice = {
    twitter: "Direct, founder-to-founder. Under 240 chars (room for the link). Hook in first 5 words. 1-2 relevant hashtags, not 5.",
    xiaohongshu: "小红书 voice: friendly, conversational Chinese (or English w/ Chinese accent), emojis OK (3-5 max), 100-150 字, ends with a question or invite. Avoid marketing speak.",
    douyin: "抖音 voice: hook-led Chinese, short punchy lines, 50-80 字, energetic, ends with a CTA.",
  }[platform];
  try {
    const client = new Anthropic({ apiKey });
    const response = await client.messages.create({
      model: REVIEW_MODEL,
      max_tokens: 400,
      system: `You write share posts in the voice of the platform. No "AI-native", no "revolutionary", no em dashes. Specific over abstract.\n\nPlatform voice: ${platformVoice}`,
      messages: [{ role: "user", content: `Project: ${project.title}\nTagline: ${project.tagline}\nCategory: ${project.category}\n\nWrite ONE share post text. Return ONLY the post body, no quotes, no labels, no preface.` }],
    });
    const block = response.content.find((b) => b.type === "text");
    if (!block || block.type !== "text") return stub;
    return block.text.trim();
  } catch (err) {
    console.error("[ai] generateShareSummary failed:", err);
    return stub;
  }
}

// ═══════════════════════════════════════════════════════════════
// AI TREND ANALYSIS
// ═══════════════════════════════════════════════════════════════

const TREND_STUB = {
  type: "rising" as const,
  signal: "moderate" as const,
  summary: "This category shows steady growth with room for innovation.",
  momentum: 65,
  confidence: 70,
};

const TREND_TOOL_SCHEMA = {
  type: "object" as const,
  properties: {
    type: { type: "string", enum: ["rising", "saturated", "opportunity", "emerging"] },
    signal: { type: "string", enum: ["strong", "moderate", "early"] },
    summary: { type: "string", description: "One sentence. Specific to category + count. No buzzwords." },
    momentum: { type: "number", minimum: 0, maximum: 100 },
    confidence: { type: "number", minimum: 0, maximum: 100 },
  },
  required: ["type", "signal", "summary", "momentum", "confidence"],
};

export async function analyzeTrend(category: string, projectCount: number): Promise<typeof TREND_STUB> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return TREND_STUB;
  try {
    const client = new Anthropic({ apiKey });
    const response = await client.messages.create({
      model: REVIEW_MODEL,
      max_tokens: 500,
      system: [
        {
          type: "text" as const,
          text: `You analyze category trends for an AI-project launch platform. Be honest: most niches are 'saturated' or 'emerging', not 'rising'. Use the project count as a sanity check.`,
          cache_control: { type: "ephemeral" as const },
        },
      ],
      tools: [{
        name: "submit_trend",
        description: "Submit trend analysis.",
        input_schema: TREND_TOOL_SCHEMA,
        cache_control: { type: "ephemeral" as const },
      }],
      tool_choice: { type: "tool", name: "submit_trend" },
      messages: [{ role: "user", content: `Category: ${category}\nProjects in this category on the platform: ${projectCount}\n\nAnalyze the trend.` }],
    });
    const block = response.content.find((b) => b.type === "tool_use");
    if (!block || block.type !== "tool_use") throw new Error("no tool_use");
    return block.input as typeof TREND_STUB;
  } catch (err) {
    console.error("[ai] analyzeTrend failed:", err);
    return TREND_STUB;
  }
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

const LAUNCH_PACKAGE_STUB = (project: {
  title: string;
  tagline: string;
  description: string;
  category: string;
  tags: string[];
  demoUrl?: string;
}): LaunchPackage => ({
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
      { name: "Twitter/X", reason: "Large AI community", priority: "high" as const },
      { name: "Reddit", reason: "Authentic discussion", priority: "high" as const },
      { name: "Product Hunt", reason: "Launch visibility", priority: "medium" as const },
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
});

const LAUNCH_PACKAGE_TOOL_SCHEMA = {
  type: "object" as const,
  properties: {
    positioning: {
      type: "object",
      properties: {
        oneLiner: { type: "string", description: "Under 90 chars. Names problem + solution + outcome. No buzzwords." },
        targetAudience: { type: "string", description: "Specific persona, not 'developers and creators'." },
        problemSolved: { type: "string", description: "Concrete pain point in one sentence." },
        uniqueValue: { type: "string", description: "What only this project does. Don't say 'community-driven'." },
      },
      required: ["oneLiner", "targetAudience", "problemSolved", "uniqueValue"],
    },
    copy: {
      type: "object",
      properties: {
        title: { type: "string" },
        tagline: { type: "string", description: "Punchy. Under 10 words." },
        elevatorPitch: { type: "string", description: "2-3 sentences. Hook first, mechanism second." },
        productHuntDescription: { type: "string", description: "PH-style: third-person, benefit-led, ends with call to action." },
      },
      required: ["title", "tagline", "elevatorPitch", "productHuntDescription"],
    },
    social: {
      type: "object",
      properties: {
        twitterThread: { type: "array", items: { type: "string" }, minItems: 3, maxItems: 6, description: "Each tweet ≤ 280 chars. Hook tweet first." },
        linkedinPost: { type: "string", description: "Professional tone, 2-4 short paragraphs." },
        redditTitle: { type: "string", description: "No clickbait. 'I built X — does it solve Y?'-style." },
        redditBody: { type: "string", description: "Honest founder voice, mention process and ask specific feedback." },
      },
      required: ["twitterThread", "linkedinPost", "redditTitle", "redditBody"],
    },
    distribution: {
      type: "object",
      properties: {
        channels: {
          type: "array",
          items: {
            type: "object",
            properties: {
              name: { type: "string" },
              reason: { type: "string", description: "Why THIS audience, specific." },
              priority: { type: "string", enum: ["high", "medium", "low"] },
            },
            required: ["name", "reason", "priority"],
          },
          minItems: 3, maxItems: 6,
        },
        timing: { type: "string", description: "Best day/time with reason." },
        targetCommunities: { type: "array", items: { type: "string" }, minItems: 2, maxItems: 6, description: "Real subreddits / Discord / forums." },
      },
      required: ["channels", "timing", "targetCommunities"],
    },
    investorPitch: {
      type: "object",
      properties: {
        problem: { type: "string" },
        solution: { type: "string" },
        market: { type: "string", description: "Real TAM with source if possible." },
        traction: { type: "string", description: "What's true today, not aspirational." },
        ask: { type: "string", description: "Specific ask." },
      },
      required: ["problem", "solution", "market", "traction", "ask"],
    },
    demoScript: { type: "string", description: "60-second demo walkthrough." },
    competitors: {
      type: "array",
      items: {
        type: "object",
        properties: {
          name: { type: "string" },
          difference: { type: "string", description: "Honest, specific differentiator." },
        },
        required: ["name", "difference"],
      },
      minItems: 1, maxItems: 4,
    },
  },
  required: ["positioning", "copy", "social", "distribution", "investorPitch", "demoScript", "competitors"],
};

export async function generateLaunchPackage(project: {
  title: string;
  tagline: string;
  description: string;
  category: string;
  tags: string[];
  demoUrl?: string;
}): Promise<LaunchPackage> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return LAUNCH_PACKAGE_STUB(project);

  try {
    const client = new Anthropic({ apiKey });
    const systemPrompt = `You are VibeX Launch Coach — direct, founder-to-founder. You write launch copy that doesn't sound AI-generated. No "revolutionary", "next-gen", "AI-native", "delve", "unlock", "robust", "comprehensive". No em dashes — use commas, periods, or "...".

You're packaging a project for Product Hunt + HN + Reddit + Twitter + LinkedIn launch. Hook first, mechanism second, benefit third. Specifics over abstractions. Numbers over adjectives.

Return via submit_launch_package tool. Every field filled.`;

    const userPrompt = `Project to launch:

Title:       ${project.title}
Tagline:     ${project.tagline}
Category:    ${project.category}
Tags:        ${project.tags.length ? project.tags.join(", ") : "(none)"}
Demo URL:    ${project.demoUrl ?? "(none)"}

Description:
${project.description}`;

    // Same caching strategy as generateClaudeReview — system + tool schema
    // are identical across calls, only userPrompt varies.
    const response = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 4000,
      system: [
        {
          type: "text" as const,
          text: systemPrompt,
          cache_control: { type: "ephemeral" as const },
        },
      ],
      tools: [
        {
          name: "submit_launch_package",
          description: "Submit the complete launch package: positioning, copy, social, distribution, investor pitch, demo script, competitors.",
          input_schema: LAUNCH_PACKAGE_TOOL_SCHEMA,
          cache_control: { type: "ephemeral" as const },
        },
      ],
      tool_choice: { type: "tool", name: "submit_launch_package" },
      messages: [{ role: "user", content: userPrompt }],
    });

    const block = response.content.find((b) => b.type === "tool_use");
    if (!block || block.type !== "tool_use") {
      throw new Error("Claude did not return tool_use block");
    }
    return block.input as LaunchPackage;
  } catch (err) {
    console.error("[ai] generateLaunchPackage failed, returning stub:", err);
    return LAUNCH_PACKAGE_STUB(project);
  }
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

const GROWTH_STUB: GrowthSuggestion[] = [
  { priority: "high", action: "Add a GIF preview to your listing", reason: "Increases click-through by ~55%", effort: "30min" },
  { priority: "high", action: "Share on relevant subreddits", reason: "Drives authentic discussion", effort: "30min" },
  { priority: "medium", action: "Write a short blog post about your journey", reason: "Builds credibility", effort: "1hr" },
  { priority: "low", action: "Optimize your tagline for clarity", reason: "First impression matters", effort: "5min" },
];

const GROWTH_TOOL_SCHEMA = {
  type: "object" as const,
  properties: {
    suggestions: {
      type: "array",
      minItems: 3,
      maxItems: 6,
      items: {
        type: "object",
        properties: {
          priority: { type: "string", enum: ["high", "medium", "low"] },
          action: { type: "string", description: "One concrete action. No 'consider'. Imperative." },
          reason: { type: "string", description: "Why this works for THIS project's stats, not generic." },
          effort: { type: "string", enum: ["5min", "30min", "1hr", "1day"] },
        },
        required: ["priority", "action", "reason", "effort"],
      },
    },
  },
  required: ["suggestions"],
};

export async function generateGrowthSuggestions(project: {
  title: string;
  description: string;
  category: string;
  views: number;
  upvotes: number;
  comments: number;
  daysSinceLaunch: number;
}): Promise<GrowthSuggestion[]> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return GROWTH_STUB;
  try {
    const client = new Anthropic({ apiKey });
    const ratio = project.views > 0 ? (project.upvotes / project.views * 100).toFixed(1) : "0";
    const response = await client.messages.create({
      model: REVIEW_MODEL,
      max_tokens: 1500,
      system: [
        {
          type: "text" as const,
          text: `You give post-launch growth advice. Read the stats first. Diagnose the bottleneck (low views? low conversion? low engagement?) and propose actions that fix THAT bottleneck. No generic launch advice.`,
          cache_control: { type: "ephemeral" as const },
        },
      ],
      tools: [{
        name: "submit_growth",
        description: "Submit growth suggestions.",
        input_schema: GROWTH_TOOL_SCHEMA,
        cache_control: { type: "ephemeral" as const },
      }],
      tool_choice: { type: "tool", name: "submit_growth" },
      messages: [{
        role: "user",
        content: `Project: ${project.title}\nCategory: ${project.category}\nDescription: ${project.description.slice(0, 400)}\n\nStats after ${project.daysSinceLaunch}d:\n- ${project.views} views\n- ${project.upvotes} upvotes (${ratio}% conversion)\n- ${project.comments} comments\n\nGive 3-6 specific growth actions ranked by priority.`,
      }],
    });
    const block = response.content.find((b) => b.type === "tool_use");
    if (!block || block.type !== "tool_use") throw new Error("no tool_use");
    const parsed = block.input as { suggestions: GrowthSuggestion[] };
    return parsed.suggestions;
  } catch (err) {
    console.error("[ai] generateGrowthSuggestions failed:", err);
    return GROWTH_STUB;
  }
}
