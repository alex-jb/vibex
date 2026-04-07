import { createMetadata } from "@/lib/metadata";

export const metadata = createMetadata({
  title: "Buddy \u4EA4\u6613\u5E02\u573A",
  description: "Trade and collect pixel buddies on VibeX",
  path: "/buddy/trade",
});

export default function BuddyTradeLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
