import { createMetadata } from "@/lib/metadata";

export const metadata = createMetadata({
  title: "Trend Intelligence",
  description: "AI-analyzed trends across the vibe coding ecosystem. Spot rising categories, saturated markets, and emerging opportunities.",
  path: "/insights",
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
