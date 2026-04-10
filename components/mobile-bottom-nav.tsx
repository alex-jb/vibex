"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Compass, Rocket, MessageSquare, User } from "lucide-react";
import type { LucideIcon } from "lucide-react";

/* ═══════════════════════════════════════════════════════════════════════════
   MobileBottomNav — fixed bottom tab bar for mobile.
   - 5 items max (Material Design cap)
   - Hidden on ≥md and on chrome-less routes (landing, auth)
   - Uses safe-area-inset-bottom for notched devices
   - Active state: neon purple glow + filled icon + dot indicator
   ═══════════════════════════════════════════════════════════════════════════ */

const CHROMELESS_ROUTES = new Set(["/", "/login", "/register"]);

interface NavItem {
  href: string;
  label: string;
  Icon: LucideIcon;
  exactMatch?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { href: "/home", label: "HOME", Icon: Home },
  { href: "/discover", label: "EXPLORE", Icon: Compass },
  { href: "/launch", label: "LAUNCH", Icon: Rocket },
  { href: "/feed", label: "FEED", Icon: MessageSquare },
  { href: "/profile", label: "PROFILE", Icon: User },
];

export function MobileBottomNav() {
  const pathname = usePathname();

  if (CHROMELESS_ROUTES.has(pathname)) return null;

  return (
    <nav
      aria-label="Mobile bottom navigation"
      className="fixed bottom-0 left-0 right-0 z-40 md:hidden"
      style={{
        background: "rgba(10,10,20,0.92)",
        backdropFilter: "blur(16px) saturate(150%)",
        WebkitBackdropFilter: "blur(16px) saturate(150%)",
        borderTop: "2px solid var(--neon-purple)",
        boxShadow:
          "0 -4px 0 #000, 0 -8px 24px rgba(157,0,255,0.2)",
        paddingBottom: "env(safe-area-inset-bottom, 0)",
      }}
    >
      <div className="grid grid-cols-5 gap-0">
        {NAV_ITEMS.map(({ href, label, Icon, exactMatch }) => {
          const isActive = exactMatch
            ? pathname === href
            : pathname === href || pathname.startsWith(`${href}/`);
          const isLaunch = href === "/launch";

          return (
            <Link
              key={href}
              href={href}
              aria-label={label}
              aria-current={isActive ? "page" : undefined}
              className="relative flex flex-col items-center justify-center gap-1 py-2.5 transition-colors"
              style={{
                minHeight: 56,
              }}
            >
              {/* Active top indicator bar */}
              {isActive && (
                <span
                  aria-hidden="true"
                  className="absolute top-0 left-1/2 -translate-x-1/2"
                  style={{
                    width: 28,
                    height: 3,
                    background: "var(--neon-purple)",
                    boxShadow: "0 0 8px rgba(157,0,255,0.8)",
                  }}
                />
              )}

              {/* Launch button — visually lifted and highlighted */}
              {isLaunch ? (
                <div
                  className="flex items-center justify-center"
                  style={{
                    width: 40,
                    height: 40,
                    marginTop: -10,
                    background: isActive
                      ? "linear-gradient(135deg, var(--neon-purple), #C026D3)"
                      : "linear-gradient(135deg, #C026D3, var(--neon-purple))",
                    border: "2px solid #FFF",
                    boxShadow: isActive
                      ? "3px 3px 0 #000, 0 0 16px rgba(157,0,255,0.8)"
                      : "3px 3px 0 #000, 0 0 12px rgba(157,0,255,0.5)",
                  }}
                >
                  <Icon
                    className="size-5"
                    style={{ color: "#FFF" }}
                    strokeWidth={2.5}
                  />
                </div>
              ) : (
                <Icon
                  className="size-5"
                  style={{
                    color: isActive ? "var(--neon-purple)" : "#8B7AA0",
                    filter: isActive
                      ? "drop-shadow(0 0 6px rgba(157,0,255,0.6))"
                      : "none",
                  }}
                  strokeWidth={isActive ? 2.5 : 2}
                />
              )}

              <span
                className="font-pixel"
                style={{
                  fontSize: 6,
                  letterSpacing: 1,
                  color: isActive ? "#E9BDFF" : "#6B5A80",
                  textShadow: isActive
                    ? "0 0 4px rgba(157,0,255,0.5)"
                    : "none",
                }}
              >
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
