import { createMetadata } from "@/lib/metadata";

export const metadata = createMetadata({
  title: "Register",
  description: "Create your VibeX account. Join the AI-native creator community.",
  path: "/register",
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
