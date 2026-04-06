import { NextResponse } from "next/server";
import { evaluateIdea } from "@/lib/ai";

export async function POST(request: Request) {
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
