import { createMetadata } from "@/lib/metadata";

export const metadata = createMetadata({
  title: "Explore Projects",
  description: "Browse the frontier of AI-native creations. Find inspiration, learn new techniques, and upvote the projects shaping tomorrow.",
  path: "/explore",
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
