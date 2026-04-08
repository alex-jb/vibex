import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About | VibeX",
  description: "About VibeX - A 16-bit RPG-style AI creator economy platform",
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return children;
}
