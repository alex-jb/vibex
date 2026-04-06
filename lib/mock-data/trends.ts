import type { TrendInsight } from "../types";

// ─── Trend Insights ──────────────────────────────────────────────────────────

export const trendInsights: TrendInsight[] = [
  {
    id: "t1",
    title: "AI Agent Frameworks",
    type: "rising",
    signal: "strong",
    summary:
      "Multi-agent orchestration tools are seeing explosive growth. Projects with agent-building capabilities are 3x more likely to trend.",
    momentum: 92,
    confidence: 88,
    category: "AI Agent",
  },
  {
    id: "t2",
    title: "Simple Chatbot Wrappers",
    type: "saturated",
    signal: "strong",
    summary:
      "Basic ChatGPT wrappers without unique value propositions are declining rapidly. Users expect differentiation beyond a chat interface.",
    momentum: 15,
    confidence: 95,
    category: "AI Tool",
  },
  {
    id: "t3",
    title: "AI-Assisted Creative Tools",
    type: "opportunity",
    signal: "moderate",
    summary:
      "Music, art, and video creation tools powered by AI are gaining traction. Low competition but high shareability — ideal for viral growth.",
    momentum: 78,
    confidence: 72,
    category: "Demo",
  },
  {
    id: "t4",
    title: "Voice-First AI Interfaces",
    type: "emerging",
    signal: "early",
    summary:
      "Early signals suggest voice-controlled AI apps are gaining developer interest. Accessibility and hands-free use cases driving adoption.",
    momentum: 45,
    confidence: 58,
    category: "AI Utility",
  },
  {
    id: "t5",
    title: "AI Code Generation",
    type: "saturated",
    signal: "strong",
    summary:
      "The code generation space is crowded. New entrants need 10x differentiation (e.g., domain-specific, visual, or agent-based approaches).",
    momentum: 25,
    confidence: 91,
    category: "AI Tool",
  },
  {
    id: "t6",
    title: "Sustainability & Green AI",
    type: "opportunity",
    signal: "early",
    summary:
      "Carbon-aware computing and sustainable AI tools are an untapped niche with growing regulatory tailwinds. First movers will define the category.",
    momentum: 62,
    confidence: 65,
    category: "Experimental",
  },
  {
    id: "t7",
    title: "AI-Native Game Engines",
    type: "rising",
    signal: "moderate",
    summary:
      "AI-powered game creation tools are trending. Text-to-game and procedural generation projects are receiving unusually high engagement.",
    momentum: 81,
    confidence: 76,
    category: "AI Game",
  },
  {
    id: "t8",
    title: "Context-Aware AI Assistants",
    type: "rising",
    signal: "strong",
    summary:
      "AI tools that deeply integrate with user context (projects, history, preferences) are outperforming generic assistants by significant margins.",
    momentum: 87,
    confidence: 84,
    category: "AI Workflow",
  },
];
