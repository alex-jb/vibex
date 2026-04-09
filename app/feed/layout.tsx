import { createMetadata } from "@/lib/metadata";

export const metadata = createMetadata({
  title: "Feed",
  description: "Social feed for the VibeX community. Share updates, discover projects, and connect with fellow AI creators.",
  path: "/feed",
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
