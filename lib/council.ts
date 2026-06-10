/**
 * council-diff — 5-voice AI council for any decision.
 *
 * Paste a decision, get 5 specialist perspectives in parallel, see where
 * they agree and disagree. Brier-audited at resolution.
 *
 * Pattern source: Aravind Srinivas's Perplexity Model Council UI feature +
 * Orallexa LangGraph 5-voice debate (Bull / Bear / Judge / Critic / Auditor).
 *
 * Usage:
 *   import { CouncilDiff } from "council-diff";
 *
 *   const council = new CouncilDiff({ apiKey: process.env.ANTHROPIC_API_KEY });
 *   const result = await council.deliberate({
 *     domain: "founder",
 *     decision: "Should I raise a seed or bootstrap?",
 *     context: "B2B SaaS at $5K MRR, growing 20% MoM",
 *   });
 *   // result.voices[] — 5 verdicts
 *   // result.consensus — 1-paragraph synthesis
 *   // result.agreement_score — 0-1, how much they agree
 */

import Anthropic from "@anthropic-ai/sdk";

export type CouncilDomain =
  | "founder"
  | "engineer"
  | "investor"
  | "career"
  | "product"
  | "quant"
  | "custom";

export interface CouncilVoice {
  voice: string;          // slug e.g. "yc_partner"
  voice_display: string;  // "YC Partner"
  verdict: string;        // 1-2 sentences
  score: number;          // 0-100 — how strongly they side with the decision
  strength: string;       // single strongest signal supporting
  gap: string;            // single biggest risk / counter
}

export interface OracleVerdict {
  model: string;                // e.g. "claude-fable-5"
  recommendation: "go" | "wait" | "kill" | "split";
  score: number;                // 0-100
  verdict: string;              // 2-3 sentences adjudicating the 5 voices
  override_reason?: string;     // set when Oracle disagrees with council consensus
}

export interface CouncilResult {
  domain: CouncilDomain;
  decision: string;
  voices: CouncilVoice[];
  consensus: string;            // 1-paragraph synthesis
  agreement_score: number;      // 0-1 — std dev of voice scores, inverted
  recommendation: "go" | "wait" | "kill" | "split";
  computed_at: string;          // ISO timestamp
  oracle?: OracleVerdict;       // optional Mythos-class adjudication (Fable 5)
}

export interface DeliberateInput {
  domain: CouncilDomain;
  decision: string;
  context?: string;
  custom_voices?: { slug: string; display: string; role_brief: string }[];
  /**
   * Opt-in: run a single Mythos-class adjudication after the 5 voices.
   * "fable-5" → claude-fable-5 (Anthropic's flagship as of 2026-06-10).
   * Pass a raw model ID to override.
   */
  oracle?: "fable-5" | string;
}

const DOMAIN_VOICES: Record<CouncilDomain, { slug: string; display: string; role: string }[]> = {
  founder: [
    { slug: "yc_partner", display: "YC Partner",
      role: "Pattern matches against 4000+ portcos. Bias: 'make something people want'. Will push: distribution before product polish." },
    { slug: "vc_skeptic", display: "Tier-1 VC Skeptic",
      role: "Looks for moat, capital efficiency, founder-market fit. Bias: most startups die from lack of revenue, not product. Will push back on premature scaling." },
    { slug: "lawyer", display: "Startup Lawyer",
      role: "Contract / equity / IP / liability lens. Bias: don't sign anything that locks future optionality. Will flag legal landmines." },
    { slug: "accountant", display: "Indie CFO",
      role: "Burn rate / runway / unit economics. Bias: cash discipline beats growth-at-all-costs for solo founders. Will push for bootstrapping where possible." },
    { slug: "spouse", display: "Pragmatic Spouse",
      role: "Lifestyle / family / mental health lens. Bias: founder burnout kills more startups than competition. Will ask 'and then what'." },
  ],
  engineer: [
    { slug: "rust_maintainer", display: "Rust Core Maintainer",
      role: "Performance, safety, zero-cost abstractions. Bias: types catch bugs. Will push for static guarantees over runtime checks." },
    { slug: "sre_oncall", display: "SRE Oncall",
      role: "Reliability, observability, blast radius. Bias: simple > clever. Will push back on novel infra in production." },
    { slug: "recruiter", display: "Tech Recruiter",
      role: "Hiring availability + talent market. Bias: ecosystem maturity matters. Will flag tech-stack as hiring blocker or magnet." },
    { slug: "junior_dev", display: "Junior Dev Just Onboarded",
      role: "Onboarding cost + cognitive load. Bias: docs + examples > theoretical purity. Will push for boring-but-readable." },
    { slug: "cto_5y_later", display: "CTO 5 Years From Now",
      role: "Migration cost + tech debt accumulation. Bias: today's choice is tomorrow's legacy. Will look for irreversibility." },
  ],
  investor: [
    { slug: "macro", display: "Macro Strategist",
      role: "Rates / cycle / regime. Bias: macro tide lifts/sinks individual picks. Will frame in 8th-inning vs early-cycle terms." },
    { slug: "sector_analyst", display: "Sector Analyst",
      role: "Industry structure / competition / cycle. Bias: most sectors don't compound. Will rate the sector before the company." },
    { slug: "pm", display: "Portfolio Manager",
      role: "Position sizing, correlation, hedging. Bias: even good ideas at wrong size lose money. Will ask about exit + max drawdown." },
    { slug: "vc_growth", display: "Growth VC",
      role: "Network effects, retention, moat. Bias: durability > growth rate. Will look for compounding advantage." },
    { slug: "short_seller", display: "Activist Short Seller",
      role: "Bear case, accounting risks, hidden liabilities. Bias: most stocks have a fault line. Will find the worst plausible reading." },
  ],
  career: [
    { slug: "mentor_20y", display: "Mentor with 20 Years Career Capital",
      role: "Long-arc reputation game. Bias: which doors does this open in 5 years? Will think compounding career capital." },
    { slug: "recruiter", display: "Top-Firm Recruiter",
      role: "Market value + signal quality. Bias: brand-name resume lines > obscure prestige. Will frame in deal-flow terms." },
    { slug: "peer_doing_well", display: "Peer Who's Doing Well",
      role: "Counterfactual benchmark. Bias: someone in your cohort is making the opposite call. Will surface FOMO + bias correction." },
    { slug: "cso", display: "Chief Strategy Officer (your own)",
      role: "Your 1-year financial + skill plan. Bias: cash now vs option later. Will run the numbers cold." },
    { slug: "future_you_5y", display: "You, 5 Years Older",
      role: "Regret minimization. Bias: optionality + experiences > marginal salary. Will weigh life cost of the path." },
  ],
  product: [
    { slug: "real_user", display: "Real User in the ICP",
      role: "Job-to-be-done. Bias: I will or won't pay. Will state when they'd open wallet vs eye-roll." },
    { slug: "competitor", display: "Competitor's PM",
      role: "Threat assessment. Bias: am I scared of this move? Will rank impact on their roadmap." },
    { slug: "internal_dev", display: "Internal Dev Who Has To Ship It",
      role: "Engineering cost / debt / complexity. Bias: scope creep kills momentum. Will flag the part they'd push back on." },
    { slug: "garry_tan", display: "YC Partner — Garry-style",
      role: "Distribution + craft + ship velocity. Bias: ship faster, polish less. Will press on go-to-market." },
    { slug: "naval", display: "Naval-style Skeptic",
      role: "First principles + leverage. Bias: is there an irreducible insight here? Will ask 'what's the actual leverage'." },
  ],
  quant: [
    { slug: "jane_street", display: "Jane Street MD",
      role: "Statistical rigor + calibration. Bias: distribution-of-outcomes > point estimate. Will push for honest base rates." },
    { slug: "citadel", display: "Citadel Quant",
      role: "Real money in real markets. Bias: backtest fits ≠ live performance. Will demand walk-forward + slippage." },
    { slug: "two_sigma", display: "Two Sigma ML",
      role: "Modern ML methods + nonstationarity. Bias: regime change breaks every model. Will look for regime detection." },
    { slug: "anthropic_researcher", display: "Anthropic Researcher",
      role: "LLM + agent system depth. Bias: tools, not magic. Will flag prompt + eval drift." },
    { slug: "hft_engineer", display: "HFT Engineer",
      role: "Latency, kernel, deterministic systems. Bias: nanoseconds matter. Will surface low-level robustness gaps." },
  ],
  custom: [
    { slug: "voice_1", display: "Voice 1", role: "Custom voice 1" },
    { slug: "voice_2", display: "Voice 2", role: "Custom voice 2" },
    { slug: "voice_3", display: "Voice 3", role: "Custom voice 3" },
    { slug: "voice_4", display: "Voice 4", role: "Custom voice 4" },
    { slug: "voice_5", display: "Voice 5", role: "Custom voice 5" },
  ],
};

export interface CouncilOptions {
  apiKey?: string;
  model?: string;
}

export class CouncilDiff {
  private client: Anthropic;
  private model: string;

  constructor(opts: CouncilOptions = {}) {
    const key = opts.apiKey ?? process.env.ANTHROPIC_API_KEY;
    if (!key) throw new Error("ANTHROPIC_API_KEY not set");
    this.client = new Anthropic({ apiKey: key });
    this.model = opts.model ?? "claude-sonnet-4-6";
  }

  async deliberate(input: DeliberateInput): Promise<CouncilResult> {
    const voices =
      input.domain === "custom" && input.custom_voices
        ? input.custom_voices.map((v) => ({ slug: v.slug, display: v.display, role: v.role_brief }))
        : DOMAIN_VOICES[input.domain];

    const system = `You are a council of 5 specialist voices evaluating a single decision. Output STRICT JSON.

The 5 voices for this case:
${voices.map((v, i) => `${i + 1}. ${v.display.toUpperCase()} — ${v.role}`).join("\n")}

For each voice, output a verdict that's grounded in their bias, not generic.
- score: 0 = strongly oppose, 50 = neutral, 100 = strongly support
- verdict: 1-2 sentences in their voice
- strength: single strongest signal supporting the decision
- gap: single biggest risk or counter from their lens
- 2026-06-08 (Cohere Aidan Gomez citation pattern): when citing evidence, end with [src:context] if from user-provided context, [src:domain_norm] for general domain knowledge.

Then output:
- consensus: 1-paragraph synthesis (60-100 words)
- recommendation: "go" if avg score ≥65, "wait" if 40-64, "kill" if ≤39, "split" if voices disagree by >40 points

Schema:
{
  "voices": [{"voice": "<slug>", "voice_display": "<display>", "score": <0-100>, "verdict": "...", "strength": "...", "gap": "..."}, ...5 total],
  "consensus": "<1 paragraph>",
  "recommendation": "go|wait|kill|split"
}`;

    const user = `DECISION: ${input.decision}\n\nCONTEXT:\n${input.context ?? "(no additional context provided)"}\n\nDeliberate.`;

    const msg = await this.client.messages.create({
      model: this.model,
      max_tokens: 2500,
      system,
      messages: [{ role: "user", content: user }],
    });

    const textBlock = msg.content.find((c) => c.type === "text");
    if (!textBlock || textBlock.type !== "text") {
      throw new Error("Empty response from Claude");
    }
    const cleaned = textBlock.text
      .replace(/^```json\n/, "")
      .replace(/^```\n/, "")
      .replace(/\n```$/, "");
    const parsed = JSON.parse(cleaned) as {
      voices: CouncilVoice[];
      consensus: string;
      recommendation: CouncilResult["recommendation"];
    };

    // Compute agreement score: inverted normalized std-dev of voice scores
    const scores = parsed.voices.map((v) => v.score);
    const mean = scores.reduce((s, v) => s + v, 0) / scores.length;
    const variance = scores.reduce((s, v) => s + (v - mean) ** 2, 0) / scores.length;
    const stddev = Math.sqrt(variance);
    const agreement_score = Math.max(0, Math.min(1, 1 - stddev / 50));

    const result: CouncilResult = {
      domain: input.domain,
      decision: input.decision,
      voices: parsed.voices,
      consensus: parsed.consensus,
      agreement_score: Math.round(agreement_score * 100) / 100,
      recommendation: parsed.recommendation,
      computed_at: new Date().toISOString(),
    };

    if (input.oracle) {
      result.oracle = await this.adjudicate(input, result);
    }

    return result;
  }

  /**
   * Oracle mode — single Mythos-class model adjudicates the 5 voice debate.
   *
   * Why: 5 mid-tier voices often hit "split" on hard calls. A flagship model
   * with full context window can weigh which voice has the strongest grounding
   * and either ratify or override the council. Brier-audited at resolution
   * separately so we can see when the Oracle beats vs underperforms the council.
   */
  private async adjudicate(
    input: DeliberateInput,
    council: CouncilResult,
  ): Promise<OracleVerdict> {
    const oracleModel =
      input.oracle === "fable-5" ? "claude-fable-5" : (input.oracle as string);

    const voicesSummary = council.voices
      .map(
        (v) =>
          `- ${v.voice_display} (${v.score}/100): ${v.verdict}\n    strength: ${v.strength}\n    gap: ${v.gap}`,
      )
      .join("\n");

    const system = `You are the Oracle. The council of 5 specialists has deliberated. Your job: read the 5 verdicts, weigh which voice has the strongest grounding, and issue a single adjudication. You have authority to OVERRIDE the council if their consensus misses something a flagship-tier reasoner would catch.

Output STRICT JSON. Be concrete. No hedging.

Schema:
{
  "recommendation": "go|wait|kill|split",
  "score": <0-100, your confidence the decision is correct>,
  "verdict": "<2-3 sentences. Name which voices you side with and why.>",
  "override_reason": "<only if your recommendation differs from the council. Empty string otherwise.>"
}`;

    const user = `DECISION: ${input.decision}

CONTEXT:
${input.context ?? "(no additional context)"}

COUNCIL CONSENSUS: ${council.recommendation} (agreement ${council.agreement_score})
${council.consensus}

THE 5 VOICES:
${voicesSummary}

Adjudicate.`;

    const msg = await this.client.messages.create({
      model: oracleModel,
      max_tokens: 800,
      system,
      messages: [{ role: "user", content: user }],
    });

    const textBlock = msg.content.find((c) => c.type === "text");
    if (!textBlock || textBlock.type !== "text") {
      throw new Error("Empty response from Oracle");
    }
    const cleaned = textBlock.text
      .replace(/^```json\n/, "")
      .replace(/^```\n/, "")
      .replace(/\n```$/, "");
    const parsed = JSON.parse(cleaned) as {
      recommendation: OracleVerdict["recommendation"];
      score: number;
      verdict: string;
      override_reason?: string;
    };

    return {
      model: oracleModel,
      recommendation: parsed.recommendation,
      score: parsed.score,
      verdict: parsed.verdict,
      override_reason: parsed.override_reason || undefined,
    };
  }
}

export { DOMAIN_VOICES };
