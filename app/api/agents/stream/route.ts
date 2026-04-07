import { executeAgent } from "@/lib/agent-engine";
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
    return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const { agentId, input } = body;

  if (!agentId || !input) {
    return new Response(
      JSON.stringify({ error: "Missing required fields: agentId, input" }),
      { status: 400, headers: { "Content-Type": "application/json" } },
    );
  }

  const agent = SAMPLE_AGENTS[agentId];
  if (!agent) {
    return new Response(
      JSON.stringify({ error: `Agent not found: ${agentId}` }),
      { status: 404, headers: { "Content-Type": "application/json" } },
    );
  }

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      try {
        for await (const step of executeAgent(agent, input)) {
          const event = `data: ${JSON.stringify(step)}\n\n`;
          controller.enqueue(encoder.encode(event));
        }
        controller.enqueue(encoder.encode("data: [DONE]\n\n"));
      } catch (error) {
        const errorMsg =
          error instanceof Error ? error.message : "Unknown error";
        const event = `data: ${JSON.stringify({ type: "error", content: errorMsg })}\n\n`;
        controller.enqueue(encoder.encode(event));
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
