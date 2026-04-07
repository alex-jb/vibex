import type { AgentTool } from "./agent-types";

export const BUILTIN_TOOLS: AgentTool[] = [
  {
    id: "web_search",
    name: "web_search",
    description: "Search the web for current information on any topic",
    category: "web",
    icon: "Globe",
    inputSchema: {
      type: "object",
      properties: {
        query: { type: "string", description: "Search query" },
      },
      required: ["query"],
    },
  },
  {
    id: "calculator",
    name: "calculator",
    description: "Evaluate mathematical expressions",
    category: "data",
    icon: "Calculator",
    inputSchema: {
      type: "object",
      properties: {
        expression: { type: "string", description: "Math expression to evaluate" },
      },
      required: ["expression"],
    },
  },
  {
    id: "code_analyzer",
    name: "code_analyzer",
    description: "Analyze code for patterns, bugs, and improvements",
    category: "code",
    icon: "Code",
    inputSchema: {
      type: "object",
      properties: {
        code: { type: "string", description: "Source code to analyze" },
        language: { type: "string", description: "Programming language" },
      },
      required: ["code", "language"],
    },
  },
  {
    id: "summarizer",
    name: "summarizer",
    description: "Summarize long text into key points",
    category: "ai",
    icon: "FileText",
    inputSchema: {
      type: "object",
      properties: {
        text: { type: "string", description: "Text to summarize" },
        maxLength: { type: "number", description: "Max summary length in characters" },
      },
      required: ["text"],
    },
  },
  {
    id: "json_formatter",
    name: "json_formatter",
    description: "Parse and pretty-print JSON data",
    category: "data",
    icon: "Braces",
    inputSchema: {
      type: "object",
      properties: {
        data: { type: "string", description: "Raw JSON string to format" },
      },
      required: ["data"],
    },
  },
  {
    id: "translator",
    name: "translator",
    description: "Translate text between languages",
    category: "ai",
    icon: "Languages",
    inputSchema: {
      type: "object",
      properties: {
        text: { type: "string", description: "Text to translate" },
        targetLanguage: { type: "string", description: "Target language code (e.g. 'es', 'ja')" },
        sourceLanguage: { type: "string", description: "Source language code (optional)" },
      },
      required: ["text", "targetLanguage"],
    },
  },
  {
    id: "sentiment_analyzer",
    name: "sentiment_analyzer",
    description: "Analyze the sentiment and emotional tone of text",
    category: "ai",
    icon: "Heart",
    inputSchema: {
      type: "object",
      properties: {
        text: { type: "string", description: "Text to analyze" },
      },
      required: ["text"],
    },
  },
  {
    id: "data_extractor",
    name: "data_extractor",
    description: "Extract structured data (emails, dates, names, etc.) from text",
    category: "data",
    icon: "Database",
    inputSchema: {
      type: "object",
      properties: {
        text: { type: "string", description: "Text to extract data from" },
        fields: {
          type: "array",
          items: { type: "string" },
          description: "Fields to extract (e.g. 'emails', 'dates', 'names')",
        },
      },
      required: ["text", "fields"],
    },
  },
];
