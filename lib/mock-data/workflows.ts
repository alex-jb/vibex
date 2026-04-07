import type { AgentWorkflow } from "../agent-types";

export const workflows: AgentWorkflow[] = [
  {
    id: "workflow-1",
    name: "AI Code Pipeline",
    description:
      "Analyzes code, reviews for issues, and produces a summary report. Chains CodeReviewer Pro, DataPipeline Builder, and StoryWeaver for a full code-to-docs pipeline.",
    steps: [
      {
        id: "step-1-1",
        agentId: "agent-1", // CodeReviewer Pro
        inputMapping: { task: "Review the following code for bugs and security issues" },
        outputKey: "review",
        next: ["step-1-2"],
      },
      {
        id: "step-1-2",
        agentId: "agent-4", // DataPipeline Builder
        inputMapping: { task: "Generate an improved version based on the review" },
        outputKey: "improved_code",
        next: ["step-1-3"],
      },
      {
        id: "step-1-3",
        agentId: "agent-3", // StoryWeaver (creative summary)
        inputMapping: { task: "Write a concise narrative summary of the changes made" },
        outputKey: "summary",
        next: [],
      },
    ],
    creatorId: "c2",
  },
  {
    id: "workflow-2",
    name: "Research & Report",
    description:
      "Deep-researches a topic, analyzes the data, and produces a polished written report.",
    steps: [
      {
        id: "step-2-1",
        agentId: "agent-2", // DeepResearch
        inputMapping: {},
        outputKey: "research",
        next: ["step-2-2"],
      },
      {
        id: "step-2-2",
        agentId: "agent-4", // DataPipeline Builder (data analysis)
        inputMapping: { task: "Extract key data points and structure the findings" },
        outputKey: "analysis",
        next: ["step-2-3"],
      },
      {
        id: "step-2-3",
        agentId: "agent-3", // StoryWeaver (write the report)
        inputMapping: { task: "Write a polished report from the analyzed data" },
        outputKey: "report",
        next: [],
      },
    ],
    creatorId: "c3",
  },
  {
    id: "workflow-3",
    name: "Content Factory",
    description:
      "Generates creative content and adapts it for different audiences using StoryWeaver and StudyBuddy.",
    steps: [
      {
        id: "step-3-1",
        agentId: "agent-3", // StoryWeaver
        inputMapping: {},
        outputKey: "content",
        next: ["step-3-2"],
      },
      {
        id: "step-3-2",
        agentId: "agent-6", // StudyBuddy (adapt for educational use)
        inputMapping: { task: "Adapt this content into an educational format with key takeaways" },
        outputKey: "educational_content",
        next: [],
      },
    ],
    creatorId: "c4",
  },
  {
    id: "workflow-4",
    name: "Trading Analysis",
    description:
      "Researches market conditions, generates trading signals, and produces a risk-assessed report.",
    steps: [
      {
        id: "step-4-1",
        agentId: "agent-2", // DeepResearch
        inputMapping: { task: "Research current market conditions and sentiment" },
        outputKey: "market_research",
        next: ["step-4-2"],
      },
      {
        id: "step-4-2",
        agentId: "agent-5", // AlphaSignal
        inputMapping: { task: "Generate trading signals based on the research" },
        outputKey: "signals",
        next: ["step-4-3"],
      },
      {
        id: "step-4-3",
        agentId: "agent-4", // DataPipeline Builder (structure the output)
        inputMapping: { task: "Structure the signals into a formatted analysis report" },
        outputKey: "report",
        condition: "signal",
        next: [],
      },
    ],
    creatorId: "c6",
  },
];
