import { redirect } from "next/navigation";
import { isFeatureEnabled } from "@/lib/feature-flags";
import { createMetadata } from "@/lib/metadata";

export const metadata = createMetadata({
  title: "Analytics",
  description:
    "Agent run data, cost tracking, and performance trends across the VibeX platform.",
  path: "/analytics",
});

export default function Layout({ children }: { children: React.ReactNode }) {
  if (!isFeatureEnabled("FEATURE_USER_ANALYTICS")) {
    redirect("/");
  }
  return children;
}
