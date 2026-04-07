import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "服务条款 | VibeX",
  description: "VibeX 平台服务条款",
};

export default function TermsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
