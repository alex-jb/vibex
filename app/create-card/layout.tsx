import { createMetadata } from "@/lib/metadata";

export const metadata = createMetadata({
  title: "Create Your VibeX Card",
  description:
    "See how VibeX turns your AI project into a viral hero card with stats, rarity, and QR code. Paste your URL and watch the magic.",
  path: "/create-card",
});

export default function CreateCardLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
