import { NextResponse } from "next/server";
import { runAgent } from "@/lib/agent-engine";
import { validateString } from "@/lib/validate";
import { getAgentById } from "@/lib/db";

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

  const agent = await getAgentById(validAgentId);
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
