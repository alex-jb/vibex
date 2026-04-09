import { createMetadata } from "@/lib/metadata";

export const metadata = createMetadata({
  title: "Analytics",
  description:
    "Agent run data, cost tracking, and performance trends across the VibeX platform.",
  path: "/analytics",
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
