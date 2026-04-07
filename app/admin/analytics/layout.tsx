import { createMetadata } from "@/lib/metadata";

export const metadata = createMetadata({
  title: "Analytics Dashboard",
  description: "VibeX platform analytics and growth metrics",
  path: "/admin/analytics",
});

export default function AnalyticsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
