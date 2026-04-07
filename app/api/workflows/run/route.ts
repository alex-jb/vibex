import { NextResponse } from "next/server";
import { workflows } from "@/lib/mock-data/workflows";
import { runWorkflow } from "@/lib/workflow-engine";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { workflowId, input } = body as {
      workflowId?: string;
      input?: string;
    };

    if (!workflowId || !input) {
      return NextResponse.json(
        { error: "Missing required fields: workflowId and input" },
        { status: 400 },
      );
    }

    const workflow = workflows.find((w) => w.id === workflowId);
    if (!workflow) {
      return NextResponse.json(
        { error: `Workflow ${workflowId} not found` },
        { status: 404 },
      );
    }

    const result = await runWorkflow(workflow, input);

    return NextResponse.json(result);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
