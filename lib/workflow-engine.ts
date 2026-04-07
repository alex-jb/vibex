import type { AgentWorkflow, AgentRun, AgentDefinition } from "./agent-types";
import { runAgent } from "./agent-engine";
import { agents } from "./mock-data/agents";

export interface WorkflowRun {
  id: string;
  workflowId: string;
  status: "running" | "completed" | "failed";
  steps: WorkflowStepResult[];
  totalTokens: number;
  totalLatencyMs: number;
  totalCost: number;
  startedAt: string;
  completedAt?: string;
}

export interface WorkflowStepResult {
  stepId: string;
  agentId: string;
  agentName: string;
  status: "pending" | "running" | "completed" | "failed" | "skipped";
  input: string;
  output?: string;
  agentRun?: AgentRun;
  durationMs: number;
}

/**
 * Execute a workflow step by step.
 * Each step's output becomes the next step's input (pipeline pattern).
 * Yields step results as they complete.
 */
export async function* executeWorkflow(
  workflow: AgentWorkflow,
  initialInput: string,
): AsyncGenerator<WorkflowStepResult> {
  let currentInput = initialInput;

  for (const step of workflow.steps) {
    const agent = agents.find((a) => a.id === step.agentId);
    if (!agent) {
      yield {
        stepId: step.id,
        agentId: step.agentId,
        agentName: "Unknown",
        status: "failed",
        input: currentInput,
        output: `Agent ${step.agentId} not found`,
        durationMs: 0,
      };
      break;
    }

    // Check condition if any
    if (step.condition) {
      const shouldRun = currentInput
        .toLowerCase()
        .includes(step.condition.toLowerCase());
      if (!shouldRun) {
        yield {
          stepId: step.id,
          agentId: step.agentId,
          agentName: agent.name,
          status: "skipped",
          input: currentInput,
          output: "Condition not met, skipped",
          durationMs: 0,
        };
        continue;
      }
    }

    // Apply input mapping
    let stepInput = currentInput;
    if (step.inputMapping && Object.keys(step.inputMapping).length > 0) {
      const context = Object.entries(step.inputMapping)
        .map(([key, value]) => `${key}: ${value}`)
        .join("\n");
      stepInput = `${context}\n\nInput: ${currentInput}`;
    }

    // Run the agent
    const startTime = Date.now();
    const result = await runAgent(agent, stepInput);
    const durationMs = Date.now() - startTime;

    const output =
      typeof result.output === "string"
        ? result.output
        : JSON.stringify(result.output);

    yield {
      stepId: step.id,
      agentId: step.agentId,
      agentName: agent.name,
      status: result.status === "completed" ? "completed" : "failed",
      input: stepInput,
      output,
      agentRun: result,
      durationMs,
    };

    // Pipeline: use this step's output as next step's input
    if (result.status === "completed" && output) {
      currentInput = output;
    } else {
      break; // Stop pipeline on failure
    }
  }
}

/**
 * Run a complete workflow and collect all results.
 */
export async function runWorkflow(
  workflow: AgentWorkflow,
  initialInput: string,
): Promise<WorkflowRun> {
  const steps: WorkflowStepResult[] = [];
  const startTime = Date.now();
  let totalTokens = 0;
  let totalCost = 0;
  let status: WorkflowRun["status"] = "completed";

  for await (const stepResult of executeWorkflow(workflow, initialInput)) {
    steps.push(stepResult);
    if (stepResult.agentRun) {
      totalTokens += stepResult.agentRun.totalTokens;
      totalCost += stepResult.agentRun.cost;
    }
    if (stepResult.status === "failed") {
      status = "failed";
      break;
    }
  }

  return {
    id: `wf-run-${Date.now()}`,
    workflowId: workflow.id,
    status,
    steps,
    totalTokens,
    totalLatencyMs: Date.now() - startTime,
    totalCost,
    startedAt: new Date(startTime).toISOString(),
    completedAt: new Date().toISOString(),
  };
}
