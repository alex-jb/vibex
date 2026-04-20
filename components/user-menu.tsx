"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LogOut, User, Swords, Target, MessageSquare, Heart } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { useLang } from "@/lib/i18n";
import { isFeatureEnabled } from "@/lib/feature-flags";

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function getDisplayName(user: { email?: string; user_metadata?: Record<string, unknown> }): string {
  const meta = user.user_metadata;
  if (meta?.full_name) return meta.full_name as string;
  if (meta?.name) return meta.name as string;
  if (meta?.user_name) return meta.user_name as string;
  return user.email?.split("@")[0] || "Trainer";
}

export function UserMenu() {
  const { t } = useLang();
  const { user, loading, signOut } = useAuth();
  const [open, setOpen] = useState(false);

  if (loading) {
    return (
      <div className="size-8 rounded-full bg-white/5 animate-pulse shrink-0" />
    );
  }

  if (!user) {
    return (
      <Link
        href="/login"
        // min-h-11 = 44px mobile touch target floor.
        // 10px pixel font meets DESIGN.md readability floor for
        // "text user must read to act" (DESIGN.md Typography > Rules).
        className="flex items-center justify-center font-pixel text-[10px] min-h-11 px-3.5 uppercase tracking-wider transition-colors duration-200 hover:text-foreground shrink-0 rounded-sm"
        style={{
          border: "2px solid var(--border-bolt, #444)",
          color: "var(--neon-green, #39FF14)",
          background: "transparent",
          imageRendering: "pixelated",
          cursor: "pointer",
        }}
      >
        LOGIN
      </Link>
    );
  }

  const displayName = getDisplayName(user);
  const avatar = user.user_metadata?.avatar_url as string | undefined;

  return (
    <div className="relative">
      <button
        aria-label="User menu"
        aria-expanded={open}
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 rounded-full p-0.5 transition-all hover:ring-2 hover:ring-violet-500/30"
      >
        {avatar ? (
          /* External avatar URL from OAuth provider -- next/image requires explicit domain allowlisting */
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={avatar}
            alt={displayName}
            className="size-8 rounded-full border border-white/10"
          />
        ) : (
          <div
            className="size-8 flex items-center justify-center text-[10px] font-bold"
            style={{
              background: "linear-gradient(135deg, #FF4500 0%, #B8380B 100%)",
              border: "2px solid #FFE27D",
              color: "#1A0F00",
              boxShadow: "2px 2px 0 #000",
              fontFamily: "var(--font-pixel), monospace",
            }}
          >
            {getInitials(displayName)}
          </div>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-40"
              onClick={() => setOpen(false)}
            />

            {/* Dropdown */}
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              role="menu"
              className="absolute right-0 top-full mt-2 z-50 w-56 glass-card-strong rounded-xl border border-white/[0.08] py-2 shadow-xl"
            >
              {/* User info */}
              <div className="px-4 py-3 border-b border-white/[0.06]">
                <p className="text-sm font-medium truncate">{displayName}</p>
                <p className="text-xs text-muted-foreground truncate">
                  {user.email}
                </p>
              </div>

              {/* Menu items */}
              <div className="py-1">
                <Link
                  role="menuitem"
                  href="/profile"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors"
                >
                  <User className="size-4" />
                  {t("user.profile")}
                </Link>
              </div>

              {/* Dojo section */}
              <div className="border-t border-white/[0.06] pt-1">
                <div className="px-4 py-1.5">
                  <span className="font-pixel text-[7px] text-violet-400 uppercase tracking-widest">
                    {t("user.dojo")}
                  </span>
                </div>
                <Link
                  role="menuitem"
                  href="/arena"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors"
                >
                  <Swords className="size-4 text-amber-400" />
                  {t("nav.arena")}
                </Link>
                {isFeatureEnabled("FEATURE_BUDDY") && (
                  <Link
                    role="menuitem"
                    href="/buddy"
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-3 px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors"
                  >
                    <Heart className="size-4 text-pink-400" />
                    {t("nav.buddy")}
                  </Link>
                )}
                <Link
                  role="menuitem"
                  href="/hunt"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors"
                >
                  <Target className="size-4 text-emerald-400" />
                  {t("nav.hunt")}
                </Link>
                <Link
                  role="menuitem"
                  href="/messages"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors"
                >
                  <MessageSquare className="size-4 text-cyan-400" />
                  {t("nav.messages")}
                </Link>
              </div>

              {/* Sign out */}
              <div className="border-t border-white/[0.06] pt-1">
                <button
                  role="menuitem"
                  onClick={() => {
                    signOut();
                    setOpen(false);
                  }}
                  className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                >
                  <LogOut className="size-4" />
                  {t("user.signOut")}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
