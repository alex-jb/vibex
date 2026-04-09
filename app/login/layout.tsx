import { createMetadata } from "@/lib/metadata";

export const metadata = createMetadata({
  title: "Login",
  description: "Sign in to VibeX. Join the AI-native creator community.",
  path: "/login",
  noIndex: true,
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
