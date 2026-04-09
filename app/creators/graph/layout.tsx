import { redirect } from "next/navigation";
import { isFeatureEnabled } from "@/lib/feature-flags";
import { createMetadata } from "@/lib/metadata";

export const metadata = createMetadata({
  title: "Creator Graph",
  description:
    "Explore the social graph of creators shaping the vibe coding ecosystem.",
  path: "/creators/graph",
});

export default function Layout({ children }: { children: React.ReactNode }) {
  if (!isFeatureEnabled("FEATURE_CREATOR_GRAPH")) {
    redirect("/");
  }
  return children;
}
