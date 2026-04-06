import { NextResponse } from "next/server";
import { generateShareSummary } from "@/lib/ai";

export async function POST(request: Request) {
  const body = await request.json();

  if (!body.title || !body.platform) {
    return NextResponse.json(
      { error: "Missing required fields: title, platform" },
      { status: 400 }
    );
  }

  const platform = body.platform as "twitter" | "xiaohongshu" | "douyin";
  if (!["twitter", "xiaohongshu", "douyin"].includes(platform)) {
    return NextResponse.json(
      { error: "Invalid platform. Use: twitter, xiaohongshu, douyin" },
      { status: 400 }
    );
  }

  try {
    const summary = await generateShareSummary(
      {
        title: body.title,
        tagline: body.tagline || "",
        category: body.category || "",
      },
      platform
    );
    return NextResponse.json({ text: summary });
  } catch (error) {
    console.error("AI share summary error:", error);
    return NextResponse.json(
      { error: "Share summary generation failed" },
      { status: 500 }
    );
  }
}
