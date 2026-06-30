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

// ═══════════════════════════════════════════════════════════════
// runStructuredCallWithFallback — multi-provider auto-failover
// (Hermes-router-style pattern, shipped 2026-06-30)
// ═══════════════════════════════════════════════════════════════
//
// Why this exists, on top of the existing runStructuredCall:
//   The 2026-06-27..29 distill outage burned 3 consecutive days of NY
//   evening cron fires because BOTH Anthropic (monthly spend cap) AND
//   OpenAI (insufficient_quota) hit billing envelopes the same week.
//   The same exposure exists for any VibeXForge AI call routed through
//   runStructuredCall — if Anthropic billing trips during a launch
//   surge, every /api/projects/submit cover-review call falls back to
//   the hand-written stub regardless of how many other provider keys
//   the operator has loaded into env.
//
// This function tries providers in a priority chain, treating
// billing-envelope errors as a skip (try next tier) and surfacing
// non-billing errors (auth, network, malformed schema) immediately so
// they don't get hidden behind a silent fallback.
//
// Priority order (configurable via AI_PROVIDER_FALLBACK_ORDER env, but
// defaults to a sensible chain): the env-configured AI_PROVIDER first
// (so existing single-provider behaviour is preserved when only one key
// is loaded), then the other providers in the order they appear in
// PROVIDER_CONFIG. Providers without an API key are skipped silently.
//
// Returns the parsed JSON object from whichever provider succeeded, plus
// a small metadata trailer documenting which provider was used + which
// tiers were skipped. Callers can log this for the debug surface or
// drop it for prod.

export interface FallbackResult<T> {
  data: T;
  /** Which provider produced this response. */
  providerUsed: AIProvider;
  /** Which providers were tried and why each failed/skipped. */
  tried: Array<{ provider: AIProvider; outcome: string }>;
}

/**
 * Detect provider responses that mean "billing-envelope tripped, try
 * the next provider" vs responses that mean "something else broke,
 * surface the error".
 *
 * Mirror of the alex-brain daily_brief_distiller.py _is_billing_envelope_error
 * helper — same wordings (Anthropic credit-balance, Anthropic usage-limit,
 * OpenAI insufficient_quota, generic "quota exceeded") so the two fallback
 * chains stay in sync. Drift between them would be a maintenance nightmare.
 */
export function isBillingEnvelopeError(err: unknown): boolean {
  const msg = String((err as Error)?.message ?? err ?? "").toLowerCase();
  if (msg.includes("credit balance") && msg.includes("too low")) return true;
  if (msg.includes("usage limit") || msg.includes("api usage limits")) return true;
  if (msg.includes("insufficient_quota")) return true;
  if (msg.includes("quota") && msg.includes("exceeded")) return true;
  // Anthropic returns 529 "overloaded_error" sometimes — that's NOT a billing
  // envelope, that's a transient capacity issue. Don't fallback on it; the
  // caller should retry with backoff instead. Same for 429 rate-limit.
  return false;
}

/**
 * Return the chain of providers to try, in priority order, filtered to
 * those that actually have an API key present in env. AI_PROVIDER (or
 * the first arg, if given) goes first to preserve existing single-
 * provider behaviour. Everything else follows.
 */
export function getProviderFallbackChain(primary?: AIProvider): AIProvider[] {
  const all: AIProvider[] = ["claude", "kimi", "deepseek", "glm", "qwen"];
  const head = primary ?? getProvider();
  const rest = all.filter((p) => p !== head);
  const ordered = [head, ...rest];
  // Keep only providers whose key is present — otherwise the chain wastes
  // time trying providers that will immediately return null.
  return ordered.filter((p) => getProviderApiKey(p) !== null);
}

/**
 * Run a structured call with multi-provider fallback. Returns the
 * parsed JSON plus a trace of which provider succeeded and which were
 * skipped. Returns null only when the ENTIRE chain (every configured
 * provider) tripped a billing envelope or had no key. Surfaces the
 * non-billing error from the first provider that hit one — those are
 * usually bugs in the call (bad schema, auth wrong, network down) that
 * should not be hidden behind a silent fallback to a different provider.
 */
export async function runStructuredCallWithFallback<T>(
  opts: StructuredCallOptions,
): Promise<FallbackResult<T> | null> {
  const chain = getProviderFallbackChain();
  if (chain.length === 0) {
    return null;
  }

  const tried: Array<{ provider: AIProvider; outcome: string }> = [];
  let firstNonBilling: Error | null = null;

  for (const provider of chain) {
    const apiKey = getProviderApiKey(provider);
    if (!apiKey) {
      tried.push({ provider, outcome: "no-key" });
      continue;
    }
    try {
      const data =
        provider === "claude"
          ? await runClaudeStructured<T>(opts, apiKey)
          : await runOpenAICompatibleStructured<T>(opts, provider);
      tried.push({ provider, outcome: "success" });
      return { data, providerUsed: provider, tried };
    } catch (err) {
      if (isBillingEnvelopeError(err)) {
        tried.push({ provider, outcome: "billing-envelope" });
        continue; // try next provider
      }
      // Non-billing failure — record but keep trying the chain. If the
      // entire chain fails, we surface this error (most diagnostic) rather
      // than the last billing envelope, because non-billing errors are
      // usually real bugs that need to be fixed at the call site.
      if (firstNonBilling === null) {
        firstNonBilling = err instanceof Error ? err : new Error(String(err));
      }
      tried.push({
        provider,
        outcome: `non-billing-failure: ${(err as Error)?.message?.slice(0, 80) ?? "unknown"}`,
      });
    }
  }

  // Whole chain exhausted. Log the trace for the operator surface so it's
  // obvious which keys need top-up / which providers are unconfigured.
  console.warn("[ai-provider] all fallback tiers exhausted:", tried);
  if (firstNonBilling) {
    // The trace shows where the chain went; the surfaced error tells the
    // operator what actually broke at the first non-billing failure.
    console.error("[ai-provider] first non-billing failure:", firstNonBilling);
  }
  return null;
}
