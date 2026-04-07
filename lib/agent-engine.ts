import Anthropic from "@anthropic-ai/sdk";
import type { AgentDefinition, AgentRun, AgentStep } from "./agent-types";
import { BUILTIN_TOOLS } from "./agent-tools";

const client = new Anthropic();

/**
 * Execute an agent with the given input.
 * Returns an async generator that yields steps in real-time.
 */
export async function* executeAgent(
  agent: AgentDefinition,
  input: string,
): AsyncGenerator<AgentStep> {
  const tools: Anthropic.Tool[] = agent.tools
    .map((tid) => BUILTIN_TOOLS.find((t) => t.id === tid))
    .filter(Boolean)
    .map((t) => ({
      name: t!.name,
      description: t!.description,
      input_schema: t!.inputSchema as Anthropic.Tool.InputSchema,
    }));

  const messages: Anthropic.MessageParam[] = [
    { role: "user", content: input },
  ];

  let iteration = 0;
  const maxIterations = 10;

  while (iteration < maxIterations) {
    iteration++;
    const startTime = Date.now();

    const response = await client.messages.create({
      model: agent.model,
      max_tokens: agent.maxTokens,
      system: agent.systemPrompt,
      tools: tools.length > 0 ? tools : undefined,
      messages,
    });

    for (const block of response.content) {
      if (block.type === "text") {
        yield {
          id: `step-${Date.now()}`,
          type: "response",
          content: block.text,
          tokens: response.usage.output_tokens,
          durationMs: Date.now() - startTime,
          timestamp: new Date().toISOString(),
        };
      } else if (block.type === "tool_use") {
        yield {
          id: `step-${Date.now()}-call`,
          type: "tool_call",
          content: `Calling ${block.name}`,
          toolName: block.name,
          toolInput: block.input,
          tokens: 0,
          durationMs: 0,
          timestamp: new Date().toISOString(),
        };

        const toolResult = await executeToolCall(block.name, block.input);

        yield {
          id: `step-${Date.now()}-result`,
          type: "tool_result",
          content:
            typeof toolResult === "string"
              ? toolResult
              : JSON.stringify(toolResult),
          toolName: block.name,
          toolOutput: toolResult,
          tokens: 0,
          durationMs: Date.now() - startTime,
          timestamp: new Date().toISOString(),
        };
      }
    }

    if (response.stop_reason === "end_turn") break;

    if (response.stop_reason === "tool_use") {
      messages.push({ role: "assistant", content: response.content });

      const toolResults: Anthropic.ToolResultBlockParam[] = [];
      for (const block of response.content) {
        if (block.type === "tool_use") {
          const result = await executeToolCall(block.name, block.input);
          toolResults.push({
            type: "tool_result",
            tool_use_id: block.id,
            content:
              typeof result === "string" ? result : JSON.stringify(result),
          });
        }
      }
      messages.push({ role: "user", content: toolResults });
    } else {
      break;
    }
  }
}

async function executeToolCall(
  toolName: string,
  input: unknown,
): Promise<unknown> {
  switch (toolName) {
    case "web_search": {
      const { query } = input as { query: string };
      return {
        results: [
          `Search results for: ${query}`,
          "Result 1: ...",
          "Result 2: ...",
        ],
      };
    }
    case "calculator": {
      const { expression } = input as { expression: string };
      try {
        const sanitized = expression.replace(/[^0-9+\-*/().%\s]/g, "");
        const result = Function(`"use strict"; return (${sanitized})`)();
        return { result: String(result) };
      } catch {
        return { error: "Invalid expression" };
      }
    }
    case "code_analyzer": {
      const { code, language } = input as { code: string; language: string };
      return {
        analysis: `Analyzed ${language} code (${code.length} chars)`,
        suggestions: [],
      };
    }
    case "summarizer": {
      const { text, maxLength } = input as {
        text: string;
        maxLength?: number;
      };
      const len = maxLength ?? 200;
      return {
        summary: text.slice(0, len) + (text.length > len ? "..." : ""),
      };
    }
    case "json_formatter": {
      const { data } = input as { data: string };
      try {
        return { formatted: JSON.stringify(JSON.parse(data), null, 2) };
      } catch {
        return { error: "Invalid JSON" };
      }
    }
    case "translator": {
      const { text, targetLanguage } = input as {
        text: string;
        targetLanguage: string;
      };
      return { translated: text, targetLanguage, note: "Stub: real translation via LLM" };
    }
    case "sentiment_analyzer": {
      const { text } = input as { text: string };
      return { sentiment: "neutral", confidence: 0.5, text: text.slice(0, 50) };
    }
    case "data_extractor": {
      const { text, fields } = input as { text: string; fields: string[] };
      const extracted: Record<string, string[]> = {};
      for (const field of fields) {
        extracted[field] = [];
      }
      if (fields.includes("emails")) {
        const emails = text.match(/[\w.-]+@[\w.-]+\.\w+/g);
        if (emails) extracted["emails"] = emails;
      }
      return { extracted };
    }
    default:
      return { error: `Unknown tool: ${toolName}` };
  }
}

/**
 * Run agent and collect all steps (non-streaming).
 */
export async function runAgent(
  agent: AgentDefinition,
  input: string,
): Promise<AgentRun> {
  const steps: AgentStep[] = [];
  const startTime = Date.now();
  let totalTokens = 0;

  try {
    for await (const step of executeAgent(agent, input)) {
      steps.push(step);
      totalTokens += step.tokens;
    }

    return {
      id: `run-${Date.now()}`,
      agentId: agent.id,
      status: "completed",
      input,
      output: steps
        .filter((s) => s.type === "response")
        .map((s) => s.content)
        .join("\n"),
      steps,
      totalTokens,
      latencyMs: Date.now() - startTime,
      cost: totalTokens * 0.000001,
      startedAt: new Date(startTime).toISOString(),
      completedAt: new Date().toISOString(),
    };
  } catch (error) {
    return {
      id: `run-${Date.now()}`,
      agentId: agent.id,
      status: "failed",
      input,
      output: error instanceof Error ? error.message : "Unknown error",
      steps,
      totalTokens,
      latencyMs: Date.now() - startTime,
      cost: totalTokens * 0.000001,
      startedAt: new Date(startTime).toISOString(),
      completedAt: new Date().toISOString(),
    };
  }
}
