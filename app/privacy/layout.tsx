import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | VibeX",
  description: "VibeXForge platform privacy policy",
};

export default function PrivacyLayout({ children }: { children: React.ReactNode }) {
  return children;
}
