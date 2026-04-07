import { NextResponse } from "next/server";
import { generateGrowthSuggestions } from "@/lib/ai";
import { checkRateLimit } from "@/lib/rate-limit";

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for") || "unknown";
  const { allowed } = checkRateLimit(`${ip}:growth-sug`, 5, 60_000);
  if (!allowed) {
    return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
  }

  let body: Record<string, unknown>;
  try { body = await request.json(); } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { title, description, category, views, upvotes, comments, daysSinceLaunch } = body as {
    title?: string; description?: string; category?: string;
    views?: number; upvotes?: number; comments?: number; daysSinceLaunch?: number;
  };

  if (!title || !description) {
    return NextResponse.json({ error: "title and description required" }, { status: 400 });
  }

  try {
    const suggestions = await generateGrowthSuggestions({
      title,
      description,
      category: category ?? "AI Tool",
      views: views ?? 0,
      upvotes: upvotes ?? 0,
      comments: comments ?? 0,
      daysSinceLaunch: daysSinceLaunch ?? 1,
    });
    return NextResponse.json(suggestions);
  } catch (error) {
    console.error("Growth suggestions error:", error);
    return NextResponse.json({ error: "Failed to generate suggestions" }, { status: 500 });
  }
}
