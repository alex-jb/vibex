"use client";

import { usePathname } from "next/navigation";

interface MainWrapperProps {
  children: React.ReactNode;
}

/**
 * Wraps the main content area and conditionally applies the navbar
 * top padding. On chrome-less routes (landing + auth flows), the navbar
 * is hidden so we remove the 56px padding to avoid an empty strip.
 */
const CHROMELESS_ROUTES = new Set(["/arcade", "/login", "/register"]);

export function MainWrapper({ children }: MainWrapperProps) {
  const pathname = usePathname();
  const hideChrome = CHROMELESS_ROUTES.has(pathname);

  // Reserve space for:
  //   - 56px navbar top on non-chromeless routes
  //   - 64px mobile bottom nav on non-chromeless routes (md+ = 0)
  //   - safe-area-inset-bottom handled inside MobileBottomNav itself
  return (
    <main
      className={`flex-1 ${hideChrome ? "" : "pt-14 pb-16 md:pb-0"}`}
    >
      {children}
    </main>
  );
}
