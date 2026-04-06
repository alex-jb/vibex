import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  // Read current upvotes
  const { data: current, error: readError } = await supabase
    .from("projects")
    .select("upvotes")
    .eq("id", id)
    .single();

  if (readError || !current) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  // Increment
  const newUpvotes = current.upvotes + 1;
  const { error: updateError } = await supabase
    .from("projects")
    .update({ upvotes: newUpvotes })
    .eq("id", id);

  if (updateError) {
    return NextResponse.json({ error: "Failed to upvote" }, { status: 500 });
  }

  return NextResponse.json({ upvotes: newUpvotes });
}
