# AI Provider Abstraction — scaffold 2026-06-14

Status: **scaffold only, uncommitted, not pushed.** Alex to review and decide ship timing.

## What shipped

Two new pieces:

1. **`lib/ai-provider.ts`** — thin shim that lets VibeXForge AI calls run on Claude (default) OR an OpenAI-compatible provider (Kimi K2 / DeepSeek V3 / GLM-4 / Qwen) via the `openai` SDK + a custom `baseURL`. Zero new dependencies (`openai` v6 already in `package.json`, used for cover images).
2. **`lib/ai.ts::generateProjectReview`** refactored to route through the shim as a single proof-point caller. Reverted from the old regex-JSON-extraction pattern to forced structured output (`tool_use` on Claude, `function` tool-call on OpenAI-compatible) — this is more reliable across providers and removes the regex.

Plus:

- `.env.local.example` — adds `AI_PROVIDER`, `KIMI_API_KEY`, `DEEPSEEK_API_KEY`, `GLM_API_KEY`, `QWEN_API_KEY` placeholders (all commented out so default Claude behavior is unchanged).
- `AGENTS.md` — 2-line note under "Preferred skills" pointing here.

## Backward compatibility

Identical behavior when `AI_PROVIDER` is unset or `claude`. Prod env continues calling Claude until Alex flips the env var in Vercel.

## How to test locally

```bash
# 1. Sync env
vercel env pull

# 2a. Test Claude (default — should match current prod behavior)
npm run dev
# → open /launch, submit a project, watch /api/projects/submit logs

# 2b. Test Kimi (or deepseek/glm/qwen — same pattern)
echo "AI_PROVIDER=kimi" >> .env.local
echo "KIMI_API_KEY=sk-your-moonshot-key" >> .env.local
npm run dev
# → submit a project; review JSON should arrive from Moonshot

# Restore default by deleting/commenting out the two new lines.
```

## What to verify before commit

1. **Provider switch actually swaps endpoint.** With `AI_PROVIDER=kimi` set and a real `KIMI_API_KEY`, watch a network trace or Moonshot dashboard usage tick up while Anthropic dashboard stays flat. (Easy QA: tail Moonshot's billing page.)
2. **Cost differential is real.** Run the same project through Claude haiku-4-5, then through Kimi K2 (`kimi-k2-0905-preview`). Log token cost from each provider's billing dashboard. Expected: Kimi/DeepSeek roughly 1/5 the Claude price; verify before claiming savings.
3. **Output quality comparable.** Same project → same JSON shape, scores within ±10 of Claude. If Kimi/DeepSeek hallucinate fields or return garbage `strengths`, the stub fallback catches it but quality drops.

## Phase-2 callers still on direct Anthropic

`lib/ai.ts` has 8 functions calling Claude. The scaffold only ports **1** of them as a proof point. The other 7 still call `Anthropic.messages.create` / `.stream` directly:

| Function | Why deferred | Effort to port |
|---|---|---|
| `generateStructuredReview` | Uses prompt caching (`cache_control` ephemeral). Need to decide: drop caching when on non-Claude, or skip phase-2 for this function entirely. | medium |
| `evaluateIdea` | Already tool-use shape — easy port via `runStructuredCall`. | low |
| `generateBattleNarrative` | Already tool-use shape — easy port. | low |
| `streamBattleNarrative` | Uses streaming. Need `runStreamingCall` helper in the shim (Anthropic delta events vs OpenAI delta chunks differ). | medium |
| `streamLaunchAssistant` | Same — streaming. | medium |
| `generateLaunchPackage` | Tool-use + caching. | medium |
| `generateGrowthSuggestions` | Tool-use + caching. | medium |
| `analyzeTrend` | Tool-use + caching. | low-medium |

Recommended porting order (cheapest to most expensive): `evaluateIdea` → `generateBattleNarrative` → `analyzeTrend` → `generateGrowthSuggestions` → `generateLaunchPackage` → `generateStructuredReview` → streaming pair last (needs the streaming helper first).

## What the shim does NOT do

- **Streaming.** `streamBattleNarrative` + `streamLaunchAssistant` need a separate `runStreamingCall` helper.
- **Prompt caching translation.** Anthropic-style `cache_control` blocks are dropped on non-Claude paths. None of Kimi/DeepSeek/GLM/Qwen have a comparable server-side cache contract yet.
- **Model-name pass-through to non-Claude providers.** The `model` option in `StructuredCallOptions` is only honored on Claude. Non-Claude calls use the per-provider `defaultModel` in `PROVIDER_CONFIG`. To change Kimi's model, edit `PROVIDER_CONFIG.kimi.defaultModel`.

## Model defaults (verified 2026-06-14)

| Provider | Default model | baseURL |
|---|---|---|
| `kimi` | `kimi-k2-0905-preview` | `https://api.moonshot.ai/v1` |
| `deepseek` | `deepseek-chat` | `https://api.deepseek.com/v1` |
| `glm` | `glm-4.6` | `https://open.bigmodel.cn/api/paas/v4` |
| `qwen` | `qwen3-coder-plus` | `https://dashscope.aliyuncs.com/compatible-mode/v1` |

Edit `PROVIDER_CONFIG` in `lib/ai-provider.ts` to swap to the "max" tier of each lineup.

## Files touched

- NEW: `lib/ai-provider.ts`
- MODIFIED: `lib/ai.ts` (added import + refactored `generateProjectReview`)
- MODIFIED: `.env.local.example` (added 5 commented env vars)
- MODIFIED: `AGENTS.md` (2-line note)
- NEW: this file
