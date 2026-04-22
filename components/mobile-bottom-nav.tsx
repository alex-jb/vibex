"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Compass, Rocket, MessageSquare, User } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useLang, type TranslationKey } from "@/lib/i18n";

/* ═══════════════════════════════════════════════════════════════════════════
   MobileBottomNav — fixed bottom tab bar for mobile.
   - 5 items max (Material Design cap)
   - Hidden on ≥md and on chrome-less routes (landing, auth)
   - Uses safe-area-inset-bottom for notched devices
   - Active state: neon purple glow + filled icon + dot indicator
   - Labels are i18n keys (nav.*) so /home reads "HQ" here and in the top nav
     instead of diverging (was "HOME" vs "HQ" pre-2026-04-17).
   ═══════════════════════════════════════════════════════════════════════════ */

const CHROMELESS_ROUTES = new Set(["/", "/login", "/register"]);

interface NavItem {
  href: string;
  key: TranslationKey;
  Icon: LucideIcon;
  exactMatch?: boolean;
}

// /discover merged into /home 2026-04-14. Replaced EXPLORE tile with ARENA
// to keep the 5-item cap (HQ · ARENA · LAUNCH · FEED · PROFILE).
const NAV_ITEMS: NavItem[] = [
  { href: "/home", key: "nav.home", Icon: Home },
  { href: "/arena", key: "nav.arena", Icon: Compass },
  { href: "/launch", key: "nav.tab.launch", Icon: Rocket },
  { href: "/feed", key: "nav.tab.feed", Icon: MessageSquare },
  { href: "/profile", key: "nav.tab.profile", Icon: User },
];

export function MobileBottomNav() {
  const pathname = usePathname();
  const { t } = useLang();

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
        {NAV_ITEMS.map(({ href, key, Icon, exactMatch }) => {
          const isActive = exactMatch
            ? pathname === href
            : pathname === href || pathname.startsWith(`${href}/`);
          const isLaunch = href === "/launch";
          const label = t(key);

          return (
            <Link
              key={href}
              href={href}
              aria-label={label}
              aria-current={isActive ? "page" : undefined}
              className="relative flex flex-col items-center justify-center gap-1 py-2.5 transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-inset focus-visible:ring-violet-500/60"
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
                aria-hidden="true"
                className="font-pixel"
                style={{
                  fontSize: 8,
                  letterSpacing: 1,
                  // Inactive matches the inactive icon color (#8B7AA0)
                  // for consistency + WCAG AA contrast (5:1 against the
                  // nav bg vs the old #6B5A80 which hit 3.17:1 on mobile).
                  color: isActive ? "#E9BDFF" : "#8B7AA0",
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
