import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "隐私政策 | VibeX",
  description: "VibeX 平台隐私政策",
};

export default function PrivacyLayout({ children }: { children: React.ReactNode }) {
  return children;
}
