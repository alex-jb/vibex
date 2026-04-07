import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "关于 | VibeX",
  description: "关于 VibeX - 16-bit RPG 风格的 AI 创作者经济平台",
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return children;
}
