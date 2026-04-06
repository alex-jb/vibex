import { createMetadata } from "@/lib/metadata";

export const metadata = createMetadata({
  title: "Creator Pokédex",
  description: "Meet the builders shaping the future of AI. View class, attributes, and battle history.",
  path: "/creators",
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
