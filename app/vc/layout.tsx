import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "VC Dashboard | VibeX",
  description: "Investor intelligence dashboard — discover high-potential AI projects and top creators.",
  robots: { index: false, follow: false },
};

export default function VCLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
