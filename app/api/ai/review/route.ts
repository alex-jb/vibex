import { NextResponse } from "next/server";
import { generateProjectReview } from "@/lib/ai";
import { checkRateLimit } from "@/lib/rate-limit";

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for") || "unknown";
  const { allowed } = checkRateLimit(`${ip}:ai-review`, 20, 60_000);
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
    const review = await generateProjectReview({
      title: body.title,
      tagline: body.tagline || "",
      description: body.description,
      category: body.category || "",
      tags: body.tags || [],
    });
    return NextResponse.json(review);
  } catch (error) {
    const errorId = `err-${Date.now()}`;
    console.error(`[${errorId}] AI review error:`, error instanceof Error ? error.message : error);
    return NextResponse.json(
      { error: "AI review generation failed", errorId },
      { status: 500 }
    );
  }
}
