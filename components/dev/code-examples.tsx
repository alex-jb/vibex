"use client";

import { useState } from "react";
import { useLang } from "@/lib/i18n";

const CODE_EXAMPLES = {
  typescript: `import { VibeX } from "@vibex/sdk";

const vx = new VibeX({ apiKey: "vx-pk-..." });

const result = await vx.agents.run({
  agentId: "agent_abc123",
  input: { prompt: "Analyze this code quality" },
  config: { maxTokens: 4096 },
});

console.log(result.output);
// => "Code analysis result: Overall quality is good..."`,
  python: `from vibex import VibeX

vx = VibeX(api_key="vx-pk-...")

result = vx.agents.run(
    agent_id="agent_abc123",
    input={"prompt": "Analyze this code quality"},
    config={"max_tokens": 4096},
)

print(result.output)
# => "Code analysis result: Overall quality is good..."`,
  curl: `curl -X POST https://vibexforge.com/api/agents/run \\
  -H "Authorization: Bearer vx-pk-..." \\
  -H "Content-Type: application/json" \\
  -d '{
    "agentId": "agent_abc123",
    "input": { "prompt": "Analyze this code quality" },
    "config": { "maxTokens": 4096 }
  }'`,
};

export function CodeExamples() {
  const { t } = useLang();
  const [codeTab, setCodeTab] = useState<"typescript" | "python" | "curl">("typescript");

  return (
    <section>
      <span className="font-pixel" style={{ fontSize: 9, color: "#9D00FF" }}>
        {">"} {t("dev.codeExamples")}
      </span>
      <div style={{ marginTop: 12 }}>
        {/* Tabs */}
        <div role="tablist" style={{ display: "flex", gap: 4, marginBottom: 0 }}>
          {(["typescript", "python", "curl"] as const).map((tab) => (
            <button
              key={tab}
              className={`nes-btn ${codeTab === tab ? "is-primary" : ""}`}
              style={{ fontSize: 8, padding: "6px 14px" }}
              onClick={() => setCodeTab(tab)}
            >
              {tab === "typescript" ? "TypeScript" : tab === "python" ? "Python" : "cURL"}
            </button>
          ))}
        </div>
        <div className="rpgui-container framed" style={{ padding: 16, position: "relative", overflow: "hidden" }}>
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "repeating-linear-gradient(0deg, transparent 0, transparent 2px, rgba(0,0,0,0.06) 2px, rgba(0,0,0,0.06) 4px)",
              pointerEvents: "none",
            }}
          />
          <div className="overflow-x-auto">
            <pre
              className="font-mono"
              style={{
                fontSize: 12,
                color: "#39FF14",
                margin: 0,
                whiteSpace: "pre-wrap",
                lineHeight: 1.6,
                position: "relative",
                zIndex: 1,
              }}
            >
              {CODE_EXAMPLES[codeTab]}
            </pre>
          </div>
        </div>
      </div>
    </section>
  );
}
