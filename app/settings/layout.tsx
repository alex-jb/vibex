import { createMetadata } from "@/lib/metadata";

export const metadata = createMetadata({
  title: "Settings",
  description: "Manage your language, theme, notification, and account preferences.",
  path: "/settings",
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
