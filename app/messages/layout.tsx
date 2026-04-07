import { createMetadata } from "@/lib/metadata";

export const metadata = createMetadata({
  title: "\u79C1\u4FE1",
  description: "Send and receive direct messages on VibeX",
  path: "/messages",
});

export default function MessagesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
