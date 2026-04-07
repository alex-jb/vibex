import { createMetadata } from "@/lib/metadata";

export const metadata = createMetadata({
  title: "Agent Builder",
  description:
    "Create and configure custom AI agents with tools, system prompts, and model settings.",
  path: "/agents/builder",
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
