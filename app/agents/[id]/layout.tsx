import { createMetadata } from "@/lib/metadata";

export const metadata = createMetadata({
  title: "Agent Detail",
  description:
    "View agent configuration, run history, and execute AI agents interactively.",
  path: "/agents",
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
