import { NextResponse } from "next/server";
import { getProjects } from "@/lib/db";

export const runtime = "nodejs";
export const revalidate = 600; // 10 min — top builders changes slowly

/**
 * /api/learn/top-builders — top 5 projects by compound score, for /learn sidebar.
 *
 * Reuses existing getProjects() (sorted by score DESC) and trims to 5 fields
 * so the wire format stays tight (~1.5KB per response).
 */
export async function GET() {
  const projects = await getProjects();
  const top = projects.slice(0, 5).map((p) => ({
    id: p.id,
    title: p.title,
    creator: p.creatorName,
    thumbnail: p.thumbnail,
    views: p.views,
    upvotes: p.upvotes,
    category: p.category,
  }));
  return NextResponse.json({ top });
}
