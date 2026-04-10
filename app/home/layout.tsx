import { createMetadata } from "@/lib/metadata";

export const metadata = createMetadata({
  title: "Home",
  description:
    "Your VibeX dashboard. Launch a project, discover viral AI cards, tackle daily quests, and grow your creator reputation.",
  path: "/home",
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
