import { createMetadata } from "@/lib/metadata";

export const metadata = createMetadata({
  title: "Dojo",
  description: "Your training grounds. Battle in the Arena, raise your Buddy, hunt projects, and chat with trainers.",
  path: "/dojo",
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
