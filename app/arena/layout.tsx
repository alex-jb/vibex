import { createMetadata } from "@/lib/metadata";

export const metadata = createMetadata({
  title: "Battle Arena",
  description: "AI Project Combat System. Pit projects against each other in attribute-based battles.",
  path: "/arena",
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
