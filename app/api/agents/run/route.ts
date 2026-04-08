import { runAgent } from "@/lib/agent-engine";
import { validateString } from "@/lib/validate";
import { getAgentById } from "@/lib/db";
import { apiSuccess, apiError } from "@/lib/api-response";
import { serverLog } from "@/lib/logger";

export async function POST(request: Request) {
  let body: { agentId?: string; input?: string };
  try {
    body = await request.json();
  } catch {
    return apiError("Invalid JSON body", 400);
  }

  const { agentId, input } = body;

  const errors: string[] = [];
  const agentIdErr = validateString(agentId, "agentId");
  if (agentIdErr) errors.push(agentIdErr);
  const inputErr = validateString(input, "input", { max: 10000 });
  if (inputErr) errors.push(inputErr);

  if (errors.length > 0) {
    return apiError(errors.join("; "), 400);
  }

  const validAgentId = agentId as string;
  const validInput = input as string;

  const agent = await getAgentById(validAgentId);
  if (!agent) {
    return apiError(`Agent not found: ${validAgentId}`, 404);
  }

  try {
    const result = await runAgent(agent, validInput);
    return apiSuccess(result);
  } catch (error) {
    const errorId = `err-${Date.now()}`;
    serverLog.error(errorId, "Agent run error", error);
    return apiError("Agent execution failed", 500, errorId);
  }
}
