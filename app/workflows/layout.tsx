import { redirect } from "next/navigation";
import { isFeatureEnabled } from "@/lib/feature-flags";
import { createMetadata } from "@/lib/metadata";

export const metadata = createMetadata({
  title: "Workflows",
  description:
    "Build and run multi-agent workflows. Chain AI agents into powerful pipelines.",
  path: "/workflows",
});

export default function Layout({ children }: { children: React.ReactNode }) {
  if (!isFeatureEnabled("FEATURE_WORKFLOWS")) {
    redirect("/");
  }
  return children;
}
