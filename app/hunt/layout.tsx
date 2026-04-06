import { createMetadata } from "@/lib/metadata";

export const metadata = createMetadata({
  title: "The Hunt",
  description: "Daily arena for AI-native launches. Upvote the projects that inspire you.",
  path: "/hunt",
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
