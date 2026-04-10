"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Rocket, Menu, X, Search } from "lucide-react";
import { SearchDialog } from "@/components/search-dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useLang } from "@/lib/i18n";
import { LangToggle } from "@/components/lang-toggle";
import { UserMenu } from "@/components/user-menu";
import { NotificationBell } from "@/components/notification-bell";
import { useAuth } from "@/lib/auth";

// Primary nav items — same for guests and logged-in users
// Feed merged into Discover (as tab), Analytics merged into Insights (as tab)
const fullNavItems = [
  { href: "/home", key: "nav.home" as const },
  { href: "/discover", key: "nav.discover" as const },
  { href: "/creators", key: "nav.creators" as const },
  { href: "/dojo", key: "nav.dojo" as const },
  { href: "/insights", key: "nav.insights" as const },
  { href: "/ideas", key: "nav.ideas" as const },
  { href: "/developers", key: "nav.developers" as const },
];

// Guest nav = same as full nav (all features visible to visitors)
const guestNavItems = fullNavItems;

// Dojo items (in user menu + mobile menu)
const dojoNavItems = [
  { href: "/arena", key: "nav.arena" as const },
  { href: "/hunt", key: "nav.hunt" as const },
  { href: "/messages", key: "nav.messages" as const },
];

export function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const { t, lang } = useLang();
  const { user } = useAuth();

  // Hide navbar on the minimal landing page (single CTA brand entry point)
  if (pathname === "/") return null;

  const primaryNavItems = user ? fullNavItems : guestNavItems;
  const allNavItems = [...primaryNavItems, ...(user ? dojoNavItems : [])];
  const isCJK = lang === "zh";
  const navFont: React.CSSProperties = isCJK
    ? { fontFamily: "var(--font-zpix), monospace", fontSize: 12, letterSpacing: 4, transform: "scale(1.35)", transformOrigin: "center" }
    : { fontFamily: "var(--font-pixel), monospace", fontSize: 11, letterSpacing: 1, imageRendering: "pixelated" };

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 z-50" data-slot="navbar" role="navigation">
      {/* Main bar */}
      <div className="bg-background/60 backdrop-blur-2xl backdrop-saturate-150 border-b border-white/[0.04]">
        <div className="mx-auto flex h-14 items-center justify-between px-3 sm:px-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-gradient-to-br from-violet-500 to-fuchsia-500 shadow-lg shadow-violet-500/20 border border-violet-400/50">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <span className="text-sm font-bold tracking-widest font-[var(--font-press-start)] text-white">
              Vibe<span className="text-gradient-subtle">X</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav aria-label="Main navigation" className="hidden items-center gap-0.5 md:flex">
            {primaryNavItems.map((item) => {
              const isActive =
                item.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="relative flex flex-col items-center px-2.5 py-2 text-muted-foreground hover:text-foreground transition-colors duration-200"
                  style={navFont}
                >
                  {t(item.key)}
                  {isActive && (
                    <motion.div
                      layoutId="nav-dot"
                      className="absolute bottom-0.5 w-1 h-1 rounded-full bg-violet-400"
                      transition={{
                        type: "spring",
                        bounce: 0.2,
                        duration: 0.5,
                      }}
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Desktop CTA + Lang Toggle + User */}
          <div className="hidden items-center gap-2 md:flex shrink-0">
            <button onClick={() => setSearchOpen(true)} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
              <Search className="size-4" />
              <span className="hidden sm:inline-flex h-5 items-center gap-1 rounded border border-white/10 bg-white/5 px-1.5 text-[10px] text-muted-foreground font-sans">⌘K</span>
            </button>
            <LangToggle />
            <Link href="/launch">
              <Button
                size="sm"
                className="bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white hover:from-violet-500 hover:to-fuchsia-500 shadow-lg shadow-violet-500/10 px-3 h-8"
                style={isCJK ? { fontFamily: "var(--font-zpix), monospace", fontSize: 12, letterSpacing: 2 } : { fontFamily: "var(--font-pixel), monospace", fontSize: 10, letterSpacing: 1, imageRendering: "pixelated" as never }}
              >
                <Rocket className="mr-1 h-3 w-3" />
                {t("nav.launch")}
              </Button>
            </Link>
            <NotificationBell />
            <UserMenu />
          </div>

          {/* Mobile Toggle */}
          <button
            aria-label="Toggle mobile menu"
            aria-expanded={mobileOpen}
            className="flex h-10 w-10 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground md:hidden transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>

      {/* Subtle gradient accent line */}
      <div className="h-px bg-gradient-to-r from-transparent via-violet-500/20 to-transparent" />

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden bg-background/60 backdrop-blur-2xl backdrop-saturate-150 border-b border-white/[0.04] md:hidden"
          >
            <nav className="flex flex-col gap-1 p-4">
              {allNavItems.map((item) => {
                const isActive =
                  item.href === "/"
                    ? pathname === "/"
                    : pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      "flex items-center rounded-lg px-3 py-2.5 font-pixel text-[10px] tracking-wide text-muted-foreground hover:text-foreground transition-colors duration-200"
                    )}
                  >
                    {t(item.key)}
                    {isActive && (
                      <div className="ml-2 w-1 h-1 rounded-full bg-violet-400" />
                    )}
                  </Link>
                );
              })}
              <div className="mt-2 flex items-center gap-3">
                <LangToggle />
                <NotificationBell />
                <UserMenu />
                <Link href="/launch" onClick={() => setMobileOpen(false)} className="flex-1">
                  <Button className="w-full bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white text-sm">
                    <Rocket className="mr-1.5 h-3.5 w-3.5" />
                    {t("nav.launch")}
                  </Button>
                </Link>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
      <SearchDialog open={searchOpen} onOpenChange={setSearchOpen} />
    </header>
  );
}
