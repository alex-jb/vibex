import { NextRequest, NextResponse } from "next/server";
import {
  getProjects,
  getCreators,
  getIdeas,
  getEvents,
  getTrendInsights,
  getWeeklyWinners,
  getAgents,
} from "@/lib/db";

const handlers: Record<string, () => Promise<unknown>> = {
  projects: getProjects,
  creators: getCreators,
  ideas: getIdeas,
  events: getEvents,
  trends: getTrendInsights,
  winners: getWeeklyWinners,
  agents: getAgents,
};

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ entity: string }> }
) {
  const { entity } = await params;
  const handler = handlers[entity];

  if (!handler) {
    return NextResponse.json({ error: "Unknown entity" }, { status: 404 });
  }

  const data = await handler();
  return NextResponse.json(data);
}
