import { NextResponse } from "next/server";
import { analyzeTrend } from "@/lib/ai";

export async function POST(request: Request) {
  const body = await request.json();

  if (!body.category) {
    return NextResponse.json(
      { error: "Missing required field: category" },
      { status: 400 }
    );
  }

  try {
    const trend = await analyzeTrend(
      body.category,
      body.projectCount || 0
    );
    return NextResponse.json(trend);
  } catch (error) {
    console.error("AI trend analysis error:", error);
    return NextResponse.json(
      { error: "Trend analysis failed" },
      { status: 500 }
    );
  }
}
