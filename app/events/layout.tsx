import { redirect } from "next/navigation";
import { isFeatureEnabled } from "@/lib/feature-flags";
import { createMetadata } from "@/lib/metadata";

export const metadata = createMetadata({
  title: "Events & Community",
  description: "Discover hackathons, salons, meetups, and demo days happening across the vibe coding community.",
  path: "/events",
});

export default function Layout({ children }: { children: React.ReactNode }) {
  if (!isFeatureEnabled("FEATURE_EVENTS")) {
    redirect("/");
  }
  return children;
}
