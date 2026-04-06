import { createMetadata } from "@/lib/metadata";

export const metadata = createMetadata({
  title: "Login",
  description: "Sign in to VibeCode Hunt. Join the AI-native creator community.",
  path: "/login",
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
