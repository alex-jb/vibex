import { redirect } from "next/navigation";
import { isFeatureEnabled } from "@/lib/feature-flags";
import { createMetadata } from "@/lib/metadata";

export const metadata = createMetadata({
  title: "Agent Marketplace",
  description:
    "Discover, run, and deploy AI Agents. Each agent is an executable AI workflow with tools, metrics, and community trust.",
  path: "/agents",
});

export default function Layout({ children }: { children: React.ReactNode }) {
  if (!isFeatureEnabled("FEATURE_AGENTS")) {
    redirect("/");
  }
  return children;
}
