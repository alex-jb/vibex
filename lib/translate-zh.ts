/**
 * lib/translate-zh.ts — translate creator-submitted English content
 * (idea titles, project taglines, descriptions) to native idiomatic
 * Chinese using Claude Sonnet 4.6.
 *
 * Used by /api/cron/translate-zh which runs daily and fills missing
 * `_zh` fields on ideas + projects tables.
 *
 * Voice rule (mirrors lib/draft-generator.ts SYSTEM_BASE_ZH): no
 * marketing speak, no "革命性 / 黑科技 / 下一个独角兽", concrete
 * specifics translate as concrete specifics. Brand names and
 * technical terms with no Chinese equivalent (Claude, GitHub, OAuth)
 * stay in English.
 */

import Anthropic from "@anthropic-ai/sdk";

const MODEL = "claude-sonnet-4-6";

const SYSTEM_PROMPT =
  "You translate AI-product copy from English to native idiomatic Simplified Chinese. " +
  "Voice: technical, honest, no marketing fluff, no '革命性' / '黑科技' / '下一个独角兽'. " +
  "Keep brand names (Claude, GitHub, OAuth, X, Reddit) in English. Keep technical terms " +
  "with no Chinese equivalent in English. Preserve the tone — punchy stays punchy, " +
  "explanatory stays explanatory. Do NOT add or remove ideas. Translate, don't rewrite. " +
  "Return ONLY a JSON object matching the requested shape, no preamble, no commentary.";

type Fields = Record<string, string>;

/**
 * Translate a flat object of English string fields to Chinese.
 * Returns the same shape with _zh values, or null if the call failed.
 *
 * Example:
 *   translateFields({ title: "AI dungeon master for tabletop RPG campaigns",
 *                     description: "..." })
 *   → { title: "桌游 RPG 战役的 AI 地下城主", description: "..." }
 */
export async function translateFields(
  fields: Fields,
): Promise<Fields | null> {
  if (!process.env.ANTHROPIC_API_KEY) return null;
  const keys = Object.keys(fields);
  if (keys.length === 0) return {};

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const userPrompt = [
    "Translate each value below to native idiomatic Chinese.",
    "Return JSON with the same keys, values translated.",
    "",
    "Input:",
    JSON.stringify(fields, null, 2),
    "",
    "Output as JSON only:",
  ].join("\n");

  try {
    const resp = await client.messages.create({
      model: MODEL,
      max_tokens: 1500,
      system: [
        {
          type: "text",
          text: SYSTEM_PROMPT,
          cache_control: { type: "ephemeral" },
        },
      ],
      messages: [{ role: "user", content: userPrompt }],
    });
    let text = "";
    for (const block of resp.content) {
      if (block.type === "text") text += block.text;
    }
    text = text.trim();
    // Strip markdown fences if Claude wrapped the JSON.
    text = text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "");
    const parsed = JSON.parse(text);
    if (typeof parsed !== "object" || !parsed) return null;
    // Validate every requested key is in the response and is a string.
    for (const k of keys) {
      if (typeof parsed[k] !== "string") return null;
    }
    return parsed as Fields;
  } catch (err) {
    console.error("[translate-zh] failed:", err);
    return null;
  }
}
