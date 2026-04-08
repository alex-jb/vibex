import { createMetadata } from "@/lib/metadata";

export const metadata = createMetadata({
  title: "Buddy Trade Market",
  description: "Trade and collect pixel buddies on VibeX",
  path: "/buddy/trade",
});

export default function BuddyTradeLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
