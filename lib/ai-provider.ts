/**
 * AI Provider Abstraction — SCAFFOLD 2026-06-14
 *
 * Lets VibeXForge AI calls run on Claude (default) OR on an OpenAI-
 * compatible provider (Kimi K2 / DeepSeek V3 / GLM-4 / Qwen-coder) via
 * the `openai` SDK + custom baseURL.
 *
 * Status: SCAFFOLD ONLY. As of 2026-06-14 only `generateProjectReview`
 * in lib/ai.ts has been routed through this shim as a proof point. The
 * remaining 6 callers (generateStructuredReview / evaluateIdea /
 * generateBattleNarrative / streamBattleNarrative / streamLaunchAssistant /
 * generateLaunchPackage / generateGrowthSuggestions / analyzeTrend) still
 * call Anthropic directly. Phase 2 = port the rest. See
 * docs/provider-abstraction-2026-06-14.md.
 *
 * Backward compatibility: when `AI_PROVIDER` env var is unset OR set to
 * `claude`, behavior is identical to before. Existing prod env stays on
 * Claude until Alex explicitly flips the switch.
 *
 * Why we picked the OpenAI SDK as the universal client:
 * - Kimi / DeepSeek / GLM / Qwen all publish OpenAI-compatible endpoints.
 * - `openai` v6 is already in package.json (used for gpt-image-2 covers).
 * - Zero new deps. Just a different `baseURL` + API key per provider.
 *
 * What this shim does NOT do (yet):
 * - Streaming (Part of phase 2; streamBattleNarrative + streamLaunchAssistant
 *   still call Anthropic.messages.stream directly).
 * - Prompt caching translation. Anthropic-style `cache_control` blocks
 *   are silently dropped when routed to OpenAI-compatible providers.
 *   None of Kimi/DeepSeek/GLM/Qwen have an equivalent server-side cache
 *   contract yet; if/when they do we'll add a per-provider hook.
 * - Anthropic-style tool_choice forcing. OpenAI-compatible providers
 *   honor `tool_choice: { type: "function", function: { name: X } }`.
 *   Translation is handled below.
 */

import Anthropic from "@anthropic-ai/sdk";
import OpenAI from "openai";

export type AIProvider = "claude" | "kimi" | "deepseek" | "glm" | "qwen";

/**
 * Per-provider config. Model names are the "small / cheap fast" tier of
 * each lineup (analog to claude-haiku) — these are the right default for
 * VibeXForge's review-style calls. Swap to the "large" tier per-call by
 * passing `model: "..."` explicitly to runStructuredCall().
 *
 * Sources verified 2026-06-14:
 * - Kimi: https://platform.moonshot.ai/docs (kimi-k2-0905-preview is the
 *   public model id; "kimi-k2.6" is the family name Alex referenced).
 * - DeepSeek: https://api-docs.deepseek.com (`deepseek-chat` is the V3
 *   alias that auto-routes to the latest checkpoint).
 * - GLM: https://docs.bigmodel.cn (`glm-4.6` is current; `glm-5` not yet
 *   public as of 2026-06-14 — using 4.6 as the placeholder).
 * - Qwen: https://help.aliyun.com/zh/dashscope (`qwen3-coder-plus` is the
 *   coding-tuned variant; for general review use `qwen3-max`).
 *
 * baseURL is what makes the OpenAI SDK speak to a non-OpenAI server.
 */
export const PROVIDER_CONFIG: Record<
  Exclude<AIProvider, "claude">,
  { baseURL: string; envKey: string; defaultModel: string }
> = {
  kimi: {
    baseURL: "https://api.moonshot.ai/v1",
    envKey: "KIMI_API_KEY",
    defaultModel: "kimi-k2-0905-preview",
  },
  deepseek: {
    baseURL: "https://api.deepseek.com/v1",
    envKey: "DEEPSEEK_API_KEY",
    defaultModel: "deepseek-chat",
  },
  glm: {
    baseURL: "https://open.bigmodel.cn/api/paas/v4",
    envKey: "GLM_API_KEY",
    defaultModel: "glm-4.6",
  },
  qwen: {
    baseURL: "https://dashscope.aliyuncs.com/compatible-mode/v1",
    envKey: "QWEN_API_KEY",
    defaultModel: "qwen3-coder-plus",
  },
};

/** Read the configured provider from env. Defaults to `claude`. */
export function getProvider(): AIProvider {
  const raw = (process.env.AI_PROVIDER || "claude").toLowerCase();
  if (
    raw === "claude" ||
    raw === "kimi" ||
    raw === "deepseek" ||
    raw === "glm" ||
    raw === "qwen"
  ) {
    return raw;
  }
  // Silent fallback to claude if env is malformed (e.g. typo). Don't
  // crash production over a misspelled var.
  console.warn(`[ai-provider] unknown AI_PROVIDER="${raw}", falling back to claude`);
  return "claude";
}

/** Returns the API key for the active provider, or null if not configured. */
export function getProviderApiKey(provider: AIProvider): string | null {
  if (provider === "claude") return process.env.ANTHROPIC_API_KEY ?? null;
  const cfg = PROVIDER_CONFIG[provider];
  return process.env[cfg.envKey] ?? null;
}

/**
 * Returns an OpenAI SDK instance pointed at the configured non-Claude
 * provider. Throws if `provider === "claude"` (caller should branch).
 */
export function getOpenAICompatibleClient(provider: Exclude<AIProvider, "claude">): OpenAI {
  const cfg = PROVIDER_CONFIG[provider];
  const apiKey = process.env[cfg.envKey];
  if (!apiKey) {
    throw new Error(
      `[ai-provider] ${cfg.envKey} not set in env (required for AI_PROVIDER=${provider})`,
    );
  }
  return new OpenAI({ apiKey, baseURL: cfg.baseURL });
}

// ═══════════════════════════════════════════════════════════════
// runStructuredCall — provider-agnostic JSON-shape extraction
// ═══════════════════════════════════════════════════════════════

export interface StructuredCallOptions {
  systemPrompt: string;
  userPrompt: string;
  /**
   * JSON Schema describing the shape we want back. For Anthropic this is
   * the `input_schema` of a forced tool_use. For OpenAI-compatible this
   * is the `function.parameters` of a forced function-call.
   */
  schema: Record<string, unknown>;
  /** Tool / function name. */
  schemaName: string;
  /** Human description shown to the model. */
  schemaDescription: string;
  /**
   * Override the Claude model. Only used when provider === "claude".
   * Non-Claude providers always use their own `defaultModel` from
   * PROVIDER_CONFIG. (Claude-style model names like "claude-haiku-4-5"
   * are invalid on Kimi/DeepSeek/etc, so we deliberately don't pass them
   * through.) To override a non-Claude model, edit PROVIDER_CONFIG.
   */
  model?: string;
  /** Max output tokens. Default 2000. */
  maxTokens?: number;
}

/**
 * Run a forced-structured-output call against whichever provider is
 * configured. Returns the parsed JSON object the model emitted, or
 * `null` if the call failed or the provider is unconfigured.
 *
 * Caller should fall back to a hand-written stub on null — same pattern
 * the existing lib/ai.ts uses for missing ANTHROPIC_API_KEY.
 */
export async function runStructuredCall<T>(
  opts: StructuredCallOptions,
): Promise<T | null> {
  const provider = getProvider();
  const apiKey = getProviderApiKey(provider);
  if (!apiKey) {
    // No key configured for active provider — caller will use stub.
    return null;
  }

  try {
    if (provider === "claude") {
      return await runClaudeStructured<T>(opts, apiKey);
    }
    return await runOpenAICompatibleStructured<T>(opts, provider);
  } catch (err) {
    console.error(`[ai-provider] ${provider} structured call failed:`, err);
    return null;
  }
}

async function runClaudeStructured<T>(
  opts: StructuredCallOptions,
  apiKey: string,
): Promise<T> {
  const client = new Anthropic({ apiKey });
  const model = opts.model ?? "claude-haiku-4-5";
  const response = await client.messages.create({
    model,
    max_tokens: opts.maxTokens ?? 2000,
    system: opts.systemPrompt,
    tools: [
      {
        name: opts.schemaName,
        description: opts.schemaDescription,
        // Anthropic SDK types insist on a concrete shape here; the
        // generic Record<string, unknown> is structurally compatible.
        input_schema: opts.schema as never,
      },
    ],
    tool_choice: { type: "tool", name: opts.schemaName },
    messages: [{ role: "user", content: opts.userPrompt }],
  });
  const block = response.content.find((b) => b.type === "tool_use");
  if (!block || block.type !== "tool_use") {
    throw new Error("[ai-provider] Claude did not return a tool_use block");
  }
  return block.input as T;
}

async function runOpenAICompatibleStructured<T>(
  opts: StructuredCallOptions,
  provider: Exclude<AIProvider, "claude">,
): Promise<T> {
  const client = getOpenAICompatibleClient(provider);
  // Deliberately ignore opts.model — it's a Claude name and won't resolve.
  const model = PROVIDER_CONFIG[provider].defaultModel;
  const response = await client.chat.completions.create({
    model,
    max_tokens: opts.maxTokens ?? 2000,
    messages: [
      { role: "system", content: opts.systemPrompt },
      { role: "user", content: opts.userPrompt },
    ],
    tools: [
      {
        type: "function",
        function: {
          name: opts.schemaName,
          description: opts.schemaDescription,
          parameters: opts.schema,
        },
      },
    ],
    tool_choice: {
      type: "function",
      function: { name: opts.schemaName },
    },
  });
  const msg = response.choices?.[0]?.message;
  const call = msg?.tool_calls?.[0];
  if (!call || call.type !== "function") {
    throw new Error(
      `[ai-provider] ${provider} did not return a function tool_call`,
    );
  }
  // OpenAI-compatible servers return arguments as a stringified JSON.
  return JSON.parse(call.function.arguments) as T;
}
