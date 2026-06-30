import { describe, it, expect, afterEach, vi } from "vitest";

// We mutate process.env per-test to control which provider keys are
// "configured", then restore in afterEach. vi.resetModules() ensures
// the module's top-level env reads happen against the test env, not a
// cached version from a previous test.
type Mod = typeof import("../ai-provider");

const SAVED_ENV: Record<string, string | undefined> = {};
const ENV_KEYS = [
  "ANTHROPIC_API_KEY", "KIMI_API_KEY", "DEEPSEEK_API_KEY",
  "GLM_API_KEY", "QWEN_API_KEY", "AI_PROVIDER",
];

function saveEnv() {
  for (const k of ENV_KEYS) SAVED_ENV[k] = process.env[k];
}

function restoreEnv() {
  for (const k of ENV_KEYS) {
    if (SAVED_ENV[k] === undefined) delete process.env[k];
    else process.env[k] = SAVED_ENV[k];
  }
}

async function loadModule(env: Record<string, string | undefined>): Promise<Mod> {
  saveEnv();
  for (const k of ENV_KEYS) delete process.env[k];
  for (const [k, v] of Object.entries(env)) {
    if (v !== undefined) process.env[k] = v;
  }
  vi.resetModules();
  return await import("../ai-provider");
}

afterEach(() => {
  restoreEnv();
});

describe("isBillingEnvelopeError", () => {
  it("matches Anthropic credit-balance-too-low message", async () => {
    const m = await loadModule({});
    expect(m.isBillingEnvelopeError(new Error("Your credit balance is too low to make this request"))).toBe(true);
  });
  it("matches Anthropic monthly-usage-cap message", async () => {
    const m = await loadModule({});
    expect(m.isBillingEnvelopeError(new Error("You have reached your specified API usage limits"))).toBe(true);
  });
  it("matches OpenAI insufficient_quota 429", async () => {
    const m = await loadModule({});
    expect(m.isBillingEnvelopeError(new Error("Error code: 429 - {'error': 'insufficient_quota'}"))).toBe(true);
  });
  it("does NOT match Anthropic 529 overloaded_error (transient capacity)", async () => {
    const m = await loadModule({});
    expect(m.isBillingEnvelopeError(new Error("529 overloaded_error"))).toBe(false);
  });
  it("does NOT match generic 429 rate-limit (transient, retry not fallback)", async () => {
    const m = await loadModule({});
    expect(m.isBillingEnvelopeError(new Error("Rate limit reached"))).toBe(false);
  });
  it("does NOT match auth errors (401 / invalid_api_key)", async () => {
    const m = await loadModule({});
    expect(m.isBillingEnvelopeError(new Error("401 invalid_api_key"))).toBe(false);
  });
  it("safely handles non-Error values", async () => {
    const m = await loadModule({});
    expect(m.isBillingEnvelopeError(null)).toBe(false);
    expect(m.isBillingEnvelopeError(undefined)).toBe(false);
    expect(m.isBillingEnvelopeError("plain string with quota exceeded")).toBe(true);
  });
});

describe("getProviderFallbackChain", () => {
  it("returns empty array when no keys configured", async () => {
    const m = await loadModule({});
    expect(m.getProviderFallbackChain()).toEqual([]);
  });

  it("returns single-element chain when only one provider has a key", async () => {
    const m = await loadModule({ ANTHROPIC_API_KEY: "sk-ant-..." });
    expect(m.getProviderFallbackChain()).toEqual(["claude"]);
  });

  it("puts AI_PROVIDER first in chain when set", async () => {
    const m = await loadModule({
      AI_PROVIDER: "glm",
      ANTHROPIC_API_KEY: "sk-ant-...",
      GLM_API_KEY: "glm-key",
      KIMI_API_KEY: "kimi-key",
    });
    const chain = m.getProviderFallbackChain();
    expect(chain[0]).toBe("glm");
    expect(chain).toContain("claude");
    expect(chain).toContain("kimi");
    expect(chain).toHaveLength(3); // only providers with keys
  });

  it("filters out providers without keys", async () => {
    const m = await loadModule({
      ANTHROPIC_API_KEY: "sk-ant-...",
      KIMI_API_KEY: "kimi-key",
      // No DeepSeek, GLM, Qwen
    });
    const chain = m.getProviderFallbackChain();
    expect(chain).toEqual(expect.arrayContaining(["claude", "kimi"]));
    expect(chain).not.toContain("deepseek");
    expect(chain).not.toContain("glm");
    expect(chain).not.toContain("qwen");
    expect(chain).toHaveLength(2);
  });

  it("explicit primary arg overrides AI_PROVIDER env", async () => {
    const m = await loadModule({
      AI_PROVIDER: "claude",
      ANTHROPIC_API_KEY: "sk-ant-...",
      GLM_API_KEY: "glm-key",
    });
    const chain = m.getProviderFallbackChain("glm");
    expect(chain[0]).toBe("glm");
  });

  it("preserves backward compat: AI_PROVIDER default is claude, claude first if key present", async () => {
    const m = await loadModule({
      ANTHROPIC_API_KEY: "sk-ant-...",
      GLM_API_KEY: "glm-key",
    });
    const chain = m.getProviderFallbackChain();
    expect(chain[0]).toBe("claude");
  });
});

describe("runStructuredCallWithFallback null-return contract", () => {
  it("returns null when no providers have keys", async () => {
    const m = await loadModule({});
    const result = await m.runStructuredCallWithFallback({
      systemPrompt: "you are a test",
      userPrompt: "say hi",
      schema: { type: "object" },
      schemaName: "test_fn",
      schemaDescription: "test",
    });
    expect(result).toBeNull();
  });
});
