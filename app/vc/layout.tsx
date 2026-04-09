import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { isFeatureEnabled } from "@/lib/feature-flags";

export const metadata: Metadata = {
  title: "VC Dashboard | VibeX",
  description: "Investor intelligence dashboard — discover high-potential AI projects and top creators.",
  robots: { index: false, follow: false },
};

export default function VCLayout({ children }: { children: React.ReactNode }) {
  if (!isFeatureEnabled("FEATURE_VC")) {
    redirect("/");
  }
  return <>{children}</>;
}
