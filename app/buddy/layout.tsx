import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { isFeatureEnabled } from "@/lib/feature-flags";

export const metadata: Metadata = {
  title: "Buddy Lab | VibeX",
  description: "Summon, collect, and evolve your pixel buddies in the VibeX Buddy Lab.",
};

export default function BuddyLayout({ children }: { children: React.ReactNode }) {
  if (!isFeatureEnabled("FEATURE_BUDDY")) {
    redirect("/");
  }
  return children;
}
