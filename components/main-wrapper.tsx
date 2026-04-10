"use client";

import { usePathname } from "next/navigation";

interface MainWrapperProps {
  children: React.ReactNode;
}

/**
 * Wraps the main content area and conditionally applies the navbar
 * top padding. On the landing page (`/`), the navbar is hidden so we
 * remove the 56px padding to avoid an empty white strip at the top.
 */
export function MainWrapper({ children }: MainWrapperProps) {
  const pathname = usePathname();
  const isLanding = pathname === "/";

  return (
    <main className={`flex-1 ${isLanding ? "" : "pt-14"}`}>
      {children}
    </main>
  );
}
