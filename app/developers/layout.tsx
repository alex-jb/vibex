import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { isFeatureEnabled } from "@/lib/feature-flags";

export const metadata: Metadata = {
  title: "Developer Platform | VibeX",
  description:
    "VibeX API Developer Platform - REST API, streaming, SDKs, and documentation for building on the VibeX ecosystem.",
};

export default function DevelopersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (!isFeatureEnabled("FEATURE_DEVELOPERS")) {
    redirect("/");
  }
  return children;
}
