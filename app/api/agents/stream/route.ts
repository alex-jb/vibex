import { executeAgent } from "@/lib/agent-engine";
import { getAgentById } from "@/lib/db";

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

  const agent = await getAgentById(agentId);
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
