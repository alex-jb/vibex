import { createMetadata } from "@/lib/metadata";

export const metadata = createMetadata({
  title: "Admin Panel",
  description: "VibeX moderation and management dashboard",
  path: "/admin",
  noIndex: true,
});

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
