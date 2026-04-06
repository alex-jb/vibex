import { createMetadata } from "@/lib/metadata";

export const metadata = createMetadata({
  title: "Idea Incubator",
  description: "Submit your next big idea and get instant AI evaluation on viability, market fit, and competition.",
  path: "/ideas",
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
