/**
 * VibeX Agent System - Core Type Definitions
 *
 * Each project on VibeX can be an AI Agent with:
 * - A defined set of tools it can use
 * - A system prompt that defines its behavior
 * - Input/output schemas
 * - Execution history and metrics
 */

// ═══════════════════════════════════════════════════════════════
// TOOL DEFINITIONS
// ═══════════════════════════════════════════════════════════════

export interface AgentTool {
  id: string;
  name: string;
  description: string;
  category: ToolCategory;
  inputSchema: Record<string, unknown>;
  icon: string; // lucide icon name
}

export type ToolCategory =
  | "web"        // Web search, fetch, scrape
  | "code"       // Code execution, analysis
  | "data"       // Database, file operations
  | "ai"         // LLM calls, embeddings
  | "media"      // Image, audio, video
  | "comms"      // Email, messaging, notifications
  | "custom";    // User-defined tools

// ═══════════════════════════════════════════════════════════════
// AGENT DEFINITIONS
// ═══════════════════════════════════════════════════════════════

export interface AgentDefinition {
  id: string;
  name: string;
  description: string;
  version: string;
  creatorId: string;
  creatorName: string;

  // Agent configuration
  systemPrompt: string;
  model: "claude-haiku-4-5" | "claude-sonnet-4-6" | "claude-opus-4-6";
  temperature: number;
  maxTokens: number;
  tools: string[]; // tool IDs

  // Input/Output
  inputSchema: AgentIOSchema;
  outputSchema: AgentIOSchema;

  // Metadata
  category: AgentCategory;
  tags: string[];
  isPublic: boolean;
  featured: boolean;

  // Stats
  runs: number;
  avgLatencyMs: number;
  successRate: number;
  upvotes: number;
  forks: number;

  // Timestamps
  createdAt: string;
  updatedAt: string;
}

export type AgentCategory =
  | "coding"      // Code generation, review, refactoring
  | "research"    // Web research, data analysis
  | "creative"    // Writing, design, content
  | "automation"  // Workflow automation, data processing
  | "assistant"   // Personal assistants, chatbots
  | "trading"     // Financial analysis, trading
  | "education"   // Tutoring, learning
  | "other";

export interface AgentIOSchema {
  type: "text" | "json" | "file" | "multi";
  fields?: {
    name: string;
    type: "string" | "number" | "boolean" | "array" | "object";
    description: string;
    required: boolean;
  }[];
}

// ═══════════════════════════════════════════════════════════════
// AGENT EXECUTION
// ═══════════════════════════════════════════════════════════════

export interface AgentRun {
  id: string;
  agentId: string;
  userId?: string;
  status: "running" | "completed" | "failed" | "cancelled";
  input: unknown;
  output?: unknown;

  // Execution trace
  steps: AgentStep[];
  totalTokens: number;
  latencyMs: number;
  cost: number; // estimated USD

  // Timestamps
  startedAt: string;
  completedAt?: string;
}

export interface AgentStep {
  id: string;
  type: "thinking" | "tool_call" | "tool_result" | "response";
  content: string;
  toolName?: string;
  toolInput?: unknown;
  toolOutput?: unknown;
  tokens: number;
  durationMs: number;
  timestamp: string;
}

// ═══════════════════════════════════════════════════════════════
// AGENT MARKETPLACE
// ═══════════════════════════════════════════════════════════════

export interface AgentListItem {
  id: string;
  name: string;
  description: string;
  category: AgentCategory;
  creatorName: string;
  model: string;
  tools: string[];
  runs: number;
  successRate: number;
  upvotes: number;
  tags: string[];
  featured: boolean;
}

// ═══════════════════════════════════════════════════════════════
// WORKFLOW (Multi-Agent)
// ═══════════════════════════════════════════════════════════════

export interface AgentWorkflow {
  id: string;
  name: string;
  description: string;
  steps: WorkflowStep[];
  creatorId: string;
}

export interface WorkflowStep {
  id: string;
  agentId: string;
  inputMapping: Record<string, string>; // maps workflow input to agent input
  outputKey: string; // key to store result
  condition?: string; // optional condition to run this step
  next: string[]; // next step IDs (supports branching)
}
