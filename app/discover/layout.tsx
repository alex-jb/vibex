import { createMetadata } from "@/lib/metadata";

export const metadata = createMetadata({
  title: "Discover",
  description: "Explore projects, AI agents, and multi-agent workflows all in one place.",
  path: "/discover",
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
