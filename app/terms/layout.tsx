import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service | VibeX",
  description: "VibeX platform terms of service",
};

export default function TermsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
