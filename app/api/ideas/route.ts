import { NextResponse } from "next/server";
import { createIdea } from "@/lib/db";

export async function POST(request: Request) {
  const body = await request.json();

  if (!body.title || !body.description || !body.category) {
    return NextResponse.json(
      { error: "Missing required fields: title, description, category" },
      { status: 400 }
    );
  }

  const idea = await createIdea(body);

  if (!idea) {
    return NextResponse.json(
      { error: "Failed to create idea" },
      { status: 500 }
    );
  }

  return NextResponse.json(idea, { status: 201 });
}
