import { NextResponse } from "next/server";
import { generateShareSummary } from "@/lib/ai";
import { validateString, validateEnum } from "@/lib/validate";
import { serverLog } from "@/lib/logger";

const VALID_PLATFORMS = ["twitter", "xiaohongshu", "douyin"];

export async function POST(request: Request) {
  const body = await request.json();

  const errors: string[] = [];
  const titleErr = validateString(body.title, "title", { max: 200 });
  if (titleErr) errors.push(titleErr);
  const platformErr = validateEnum(body.platform, "platform", VALID_PLATFORMS);
  if (platformErr) errors.push(platformErr);

  if (errors.length > 0) {
    return NextResponse.json({ error: errors.join("; ") }, { status: 400 });
  }

  const platform = body.platform as "twitter" | "xiaohongshu" | "douyin";

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
    const errorId = `err-${Date.now()}`;
    serverLog.error(errorId, "AI share summary error", error);
    return NextResponse.json(
      { error: "Share summary generation failed", errorId },
      { status: 500 }
    );
  }
}
