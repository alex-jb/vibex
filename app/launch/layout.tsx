import { createMetadata } from "@/lib/metadata";

export const metadata = createMetadata({
  title: "Launch Your Project",
  description: "Give your AI creation the stage it deserves. Submit and get instant AI-powered feedback.",
  path: "/launch",
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
