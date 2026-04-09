import { redirect } from "next/navigation";
import { isFeatureEnabled } from "@/lib/feature-flags";
import { createMetadata } from "@/lib/metadata";

export const metadata = createMetadata({
  title: "Creator Dashboard",
  description:
    "Manage your creator analytics, revenue, and audience insights on VibeX.",
  path: "/profile/dashboard",
});

export default function Layout({ children }: { children: React.ReactNode }) {
  if (!isFeatureEnabled("FEATURE_CREATOR_DASHBOARD")) {
    redirect("/");
  }
  return children;
}
