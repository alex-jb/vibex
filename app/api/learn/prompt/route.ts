import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

export const runtime = "nodejs";

/**
 * /api/learn/prompt — Chapter 2 prompt-engineering exercise.
 *
 * Takes 4 slots (role / context / task / constraint), composes a Claude
 * Haiku call, returns the assistant text. Capped at 250 tokens so cost
 * stays under $0.001/call. Stub fallback when ANTHROPIC_API_KEY missing.
 *
 * Phase 0 abuse guard: 280-char cap per slot. No auth required — this is
 * the funnel top, openly accessible. Watch usage; add IP rate-limit if
 * costs exceed $5/day.
 */

const MAX_LEN = 280;

interface Body {
  role?: string;
  context?: string;
  task?: string;
  constraint?: string;
}

export async function POST(req: Request) {
  let body: Body = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }

  const role = String(body.role || "").trim().slice(0, MAX_LEN);
  const context = String(body.context || "").trim().slice(0, MAX_LEN);
  const task = String(body.task || "").trim().slice(0, MAX_LEN);
  const constraint = String(body.constraint || "").trim().slice(0, MAX_LEN);

  if (!task) {
    return NextResponse.json(
      { error: "task is required — what should the AI actually do?" },
      { status: 400 }
    );
  }

  // Compose the structured prompt — this is the lesson itself.
  const systemBits: string[] = [];
  if (role) systemBits.push(`Role: ${role}`);
  if (context) systemBits.push(`Context: ${context}`);
  if (constraint) systemBits.push(`Constraint: ${constraint}`);
  const system = systemBits.join("\n");

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    // Fallback so the lesson works without a key — show structurally
    // what a real run would look like. Brain rule (lib/ai.ts pattern).
    return NextResponse.json({
      response: `[STUB — set ANTHROPIC_API_KEY for real output]\n\nGiven your prompt:\n  • Role: ${role || "(unset)"}\n  • Context: ${context || "(unset)"}\n  • Task: ${task}\n  • Constraint: ${constraint || "(unset)"}\n\nA real Claude run would respond here in 1-3 paragraphs, scoped to your task and constraints.`,
      stub: true,
    });
  }

  try {
    const client = new Anthropic({ apiKey });
    const completion = await client.messages.create({
      model: "claude-haiku-4-5",
      max_tokens: 250,
      system: system || "You are a helpful assistant.",
      messages: [{ role: "user", content: task }],
    });
    const textBlock = completion.content.find((b) => b.type === "text");
    const response =
      textBlock && textBlock.type === "text"
        ? textBlock.text
        : "(empty response — try a different task)";
    return NextResponse.json({ response, stub: false });
  } catch (err) {
    console.error("[learn/prompt] failed:", err);
    return NextResponse.json(
      {
        error: "Claude call failed — try again in a minute, or simpler slots.",
      },
      { status: 502 }
    );
  }
}
