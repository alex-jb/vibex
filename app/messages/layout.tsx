import { redirect } from "next/navigation";
import { isFeatureEnabled } from "@/lib/feature-flags";
import { createMetadata } from "@/lib/metadata";

export const metadata = createMetadata({
  title: "Messages",
  description: "Send and receive direct messages on VibeX",
  path: "/messages",
});

export default function MessagesLayout({ children }: { children: React.ReactNode }) {
  if (!isFeatureEnabled("FEATURE_MESSAGES")) {
    redirect("/");
  }
  return <>{children}</>;
}
