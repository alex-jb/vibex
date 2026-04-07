import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Buddy Lab | VibeX",
  description: "Summon, collect, and evolve your pixel buddies in the VibeX Buddy Lab.",
};

export default function BuddyLayout({ children }: { children: React.ReactNode }) {
  return children;
}
