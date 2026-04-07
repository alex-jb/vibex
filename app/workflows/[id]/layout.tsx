import { createMetadata } from "@/lib/metadata";

export const metadata = createMetadata({
  title: "Workflow Detail",
  description:
    "View and execute multi-agent workflows with real-time progress tracking.",
  path: "/workflows",
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
