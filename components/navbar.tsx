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

const navItemKeys = [
  { href: "/", key: "nav.home" as const },
  { href: "/explore", key: "nav.explore" as const },
  { href: "/hunt", key: "nav.hunt" as const },
  { href: "/arena", key: "nav.arena" as const },
  { href: "/ideas", key: "nav.ideas" as const },
  { href: "/creators", key: "nav.creators" as const },
  { href: "/events", key: "nav.events" as const },
  { href: "/insights", key: "nav.insights" as const },
  { href: "/agents", key: "nav.agents" as const },
  { href: "/workflows", key: "nav.workflows" as const },
  { href: "/analytics", key: "nav.analytics" as const },
  { href: "/developers", key: "nav.developers" as const },
];

export function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const { t } = useLang();

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
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500 shadow-lg shadow-violet-500/20">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <span className="text-lg font-bold tracking-wide">
              Vibe<span className="text-gradient-subtle">X</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav aria-label="Main navigation" className="hidden items-center gap-0.5 md:flex">
            {navItemKeys.map((item) => {
              const isActive =
                item.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "relative flex flex-col items-center px-3.5 py-2 text-sm font-medium transition-colors duration-200",
                    isActive
                      ? "text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  )}
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
          <div className="hidden items-center gap-3 md:flex">
            <button onClick={() => setSearchOpen(true)} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
              <Search className="size-4" />
              <kbd className="hidden sm:inline-flex h-5 items-center gap-1 rounded border border-white/10 bg-white/5 px-1.5 text-[10px] text-muted-foreground">⌘K</kbd>
            </button>
            <LangToggle />
            <Link href="/launch">
              <Button
                size="sm"
                className="bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white text-xs hover:from-violet-500 hover:to-fuchsia-500 shadow-lg shadow-violet-500/10"
              >
                <Rocket className="mr-1.5 h-3 w-3" />
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
              {navItemKeys.map((item) => {
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
                      "flex items-center rounded-lg px-3 py-2.5 text-sm font-medium transition-colors duration-200",
                      isActive
                        ? "text-foreground"
                        : "text-muted-foreground hover:text-foreground"
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
