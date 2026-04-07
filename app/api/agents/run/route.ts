import { NextResponse } from "next/server";
import { runAgent } from "@/lib/agent-engine";
import { validateString } from "@/lib/validate";
import type { AgentDefinition } from "@/lib/agent-types";

const SAMPLE_AGENTS: Record<string, AgentDefinition> = {
  "research-assistant": {
    id: "research-assistant",
    name: "Research Assistant",
    description: "Searches the web and summarizes findings",
    version: "1.0.0",
    creatorId: "system",
    creatorName: "VibeX",
    systemPrompt:
      "You are a helpful research assistant. Use the web_search and summarizer tools to find and condense information for the user.",
    model: "claude-haiku-4-5",
    temperature: 0.3,
    maxTokens: 1024,
    tools: ["web_search", "summarizer"],
    inputSchema: { type: "text" },
    outputSchema: { type: "text" },
    category: "research",
    tags: ["research", "search"],
    isPublic: true,
    featured: true,
    runs: 142,
    avgLatencyMs: 2400,
    successRate: 0.96,
    upvotes: 38,
    forks: 5,
    createdAt: "2025-01-01T00:00:00Z",
    updatedAt: "2025-03-15T00:00:00Z",
  },
  "code-reviewer": {
    id: "code-reviewer",
    name: "Code Reviewer",
    description: "Analyzes code and provides improvement suggestions",
    version: "1.0.0",
    creatorId: "system",
    creatorName: "VibeX",
    systemPrompt:
      "You are an expert code reviewer. Use the code_analyzer tool to inspect code and provide actionable feedback.",
    model: "claude-sonnet-4-6",
    temperature: 0.2,
    maxTokens: 2048,
    tools: ["code_analyzer"],
    inputSchema: { type: "text" },
    outputSchema: { type: "text" },
    category: "coding",
    tags: ["code", "review"],
    isPublic: true,
    featured: false,
    runs: 87,
    avgLatencyMs: 3100,
    successRate: 0.94,
    upvotes: 22,
    forks: 3,
    createdAt: "2025-02-01T00:00:00Z",
    updatedAt: "2025-03-20T00:00:00Z",
  },
};

export async function POST(request: Request) {
  let body: { agentId?: string; input?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { agentId, input } = body;

  const errors: string[] = [];
  const agentIdErr = validateString(agentId, "agentId");
  if (agentIdErr) errors.push(agentIdErr);
  const inputErr = validateString(input, "input", { max: 10000 });
  if (inputErr) errors.push(inputErr);

  if (errors.length > 0) {
    return NextResponse.json(
      { error: errors.join("; ") },
      { status: 400 },
    );
  }

  const validAgentId = agentId as string;
  const validInput = input as string;

  const agent = SAMPLE_AGENTS[validAgentId];
  if (!agent) {
    return NextResponse.json(
      { error: `Agent not found: ${validAgentId}` },
      { status: 404 },
    );
  }

  try {
    const result = await runAgent(agent, validInput);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Agent run error:", error);
    return NextResponse.json(
      { error: "Agent execution failed" },
      { status: 500 },
    );
  }
}
