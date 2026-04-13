import { NextResponse } from "next/server";
import { generateLaunchPackage } from "@/lib/ai";
import { validateString } from "@/lib/validate";
import { checkRateLimit } from "@/lib/rate-limit";
import { serverLog } from "@/lib/logger";

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for") || "unknown";
  const { allowed } = await checkRateLimit(`${ip}:launch-package`, 3, 60_000);
  if (!allowed) {
    return NextResponse.json(
      { error: "Rate limit exceeded. Try again in a minute." },
      { status: 429 },
    );
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { title, tagline, description, category, tags, demoUrl } = body as {
    title?: string;
    tagline?: string;
    description?: string;
    category?: string;
    tags?: string[];
    demoUrl?: string;
  };

  const titleErr = validateString(title, "title", { min: 2, max: 100 });
  if (titleErr) return NextResponse.json({ error: titleErr }, { status: 400 });

  const descErr = validateString(description, "description", { min: 10, max: 2000 });
  if (descErr) return NextResponse.json({ error: descErr }, { status: 400 });

  try {
    const pkg = await generateLaunchPackage({
      title: title!,
      tagline: tagline || "",
      description: description!,
      category: category || "AI Tool",
      tags: tags || [],
      demoUrl,
    });

    return NextResponse.json(pkg);
  } catch (error) {
    const errId = `LP-${Date.now()}`;
    serverLog.error(errId, "Launch package generation failed", error);
    return NextResponse.json(
      { error: "Failed to generate launch package", errorId: errId },
      { status: 500 },
    );
  }
}
