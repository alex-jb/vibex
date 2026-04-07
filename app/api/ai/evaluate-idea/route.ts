import { NextResponse } from "next/server";
import { evaluateIdea } from "@/lib/ai";
import { checkRateLimit } from "@/lib/rate-limit";

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for") || "unknown";
  const { allowed } = checkRateLimit(`${ip}:ai-evaluate`, 20, 60_000);
  if (!allowed) {
    return NextResponse.json(
      { error: "Rate limit exceeded. Try again later." },
      { status: 429, headers: { "X-RateLimit-Remaining": "0" } }
    );
  }

  const body = await request.json();

  if (!body.title || !body.description) {
    return NextResponse.json(
      { error: "Missing required fields: title, description" },
      { status: 400 }
    );
  }

  try {
    const evaluation = await evaluateIdea({
      title: body.title,
      description: body.description,
      category: body.category || "",
    });
    return NextResponse.json(evaluation);
  } catch (error) {
    console.error("AI evaluation error:", error);
    return NextResponse.json(
      { error: "AI evaluation failed" },
      { status: 500 }
    );
  }
}
