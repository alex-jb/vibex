import { executeAgent } from "@/lib/agent-engine";
import { getAgentById } from "@/lib/db";
import { getAuthUser } from "@/lib/supabase-server";
import { checkRateLimit } from "@/lib/rate-limit";

export async function POST(request: Request) {
  // Wallet protection. This endpoint streams the output of executeAgent,
  // which makes paid LLM calls. Fable 5 audit 2026-06-11 flagged this
  // route as having zero auth AND zero rate limit — anyone hitting it
  // burns Anthropic credits. Auth + per-user rate limit close the hole.
  // The in-memory checkRateLimit() is still imperfect on serverless (it
  // resets per cold start), but combined with auth-gating it raises the
  // bar from "free for the internet" to "free for any signed-in user up
  // to ~5/min per instance," which the audit followup will tighten to a
  // shared store. For now: auth first, finer-grained later.
  const user = await getAuthUser();
  if (!user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }
  const { allowed } = await checkRateLimit(`${user.id}:agents-stream`, 5, 60_000);
  if (!allowed) {
    return new Response(
      JSON.stringify({ error: "Rate limit exceeded. Try again later." }),
      { status: 429, headers: { "Content-Type": "application/json" } },
    );
  }

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
