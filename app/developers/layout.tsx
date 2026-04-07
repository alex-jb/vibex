import type { Metadata } from "next";

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
  return children;
}
