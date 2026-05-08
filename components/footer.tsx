"use client";

import { Sparkles } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLang } from "@/lib/i18n";

// Small uptime badge linking to the public OpenStatus page. Renders
// nothing if NEXT_PUBLIC_STATUS_PAGE_URL isn't set — that way dev + PRs
// don't show a broken badge before the status page is provisioned.
// Pulsing green dot is decorative; real liveness comes from click-through.
function StatusBadge() {
  const url = process.env.NEXT_PUBLIC_STATUS_PAGE_URL;
  if (!url) return null;
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex items-center gap-1.5 font-pixel text-[9px] tracking-widest uppercase transition-colors hover:text-[var(--neon-green)]"
      style={{ color: "var(--text-muted)" }}
      aria-label="System status"
    >
      <span
        aria-hidden
        className="relative inline-flex h-1.5 w-1.5"
      >
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--neon-green)] opacity-60" />
        <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[var(--neon-green)]" />
      </span>
      Status
    </a>
  );
}

export function Footer() {
  const { t } = useLang();
  const pathname = usePathname();
  // Hide footer on chrome-less routes (landing + auth flows)
  const hideChrome = pathname === "/arcade" || pathname === "/login" || pathname === "/register";
  if (hideChrome) return null;
  return (
    <footer aria-label="Footer navigation" className="relative border-t border-white/[0.04] bg-background" data-slot="footer">
      {/* Top gradient accent line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-violet-500/20 to-transparent" />

      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="flex items-center gap-2.5">
              <div
                className="flex h-7 w-7 items-center justify-center"
                style={{
                  background: "#FF4500",
                  border: "2px solid #FFE27D",
                  boxShadow: "2px 2px 0 #000",
                }}
              >
                <Sparkles className="h-3.5 w-3.5" style={{ color: "#1A0F00" }} />
              </div>
              <span className="font-pixel text-[10px] tracking-widest text-foreground">
                Vibe<span style={{ color: "#FF4500" }}>X</span>
              </span>
            </div>
            <p className="mt-4 text-xs leading-relaxed" style={{ color: "var(--text-muted)" }}>
              {t("footer.description")}
            </p>
          </div>
          {/* 2026-05-08 IA realignment: 22 links → 9. Cut every game
              route (Hunt / Dojo / Buddy / Trade / Workflows / Events
              / Insights / Creators / Newsletter-coming-soon /
              Discord-coming-soon / Twitter / API-coming-soon /
              Documentation-coming-soon). The Arcade portal link
              consolidates the RPG layer into one entry point. */}
          <div>
            <h2 className="mb-4 text-[10px] font-medium uppercase tracking-[0.15em] text-foreground/60">
              {t("footer.platform")}
            </h2>
            <div className="flex flex-col gap-2">
              <Link href="/launch" className="flex items-center min-h-9 text-sm transition-colors hover:text-foreground" style={{ color: "var(--text-muted)" }}>{t("nav.launch")}</Link>
              <Link href="/how-it-works" className="flex items-center min-h-9 text-sm transition-colors hover:text-foreground" style={{ color: "var(--text-muted)" }}>{t("nav.howItWorks")}</Link>
              <Link href="/try" className="flex items-center min-h-9 text-sm transition-colors hover:text-foreground" style={{ color: "var(--text-muted)" }}>Try (no signup)</Link>
              <Link href="/home" className="flex items-center min-h-9 text-sm transition-colors hover:text-foreground" style={{ color: "var(--text-muted)" }}>{t("nav.showcase")}</Link>
            </div>
          </div>
          <div>
            <h2 className="mb-4 text-[10px] font-medium uppercase tracking-[0.15em] text-foreground/60">
              {t("footer.resources")}
            </h2>
            <div className="flex flex-col gap-2">
              <Link href="/changelog" className="flex items-center min-h-9 text-sm transition-colors hover:text-foreground" style={{ color: "var(--text-muted)" }}>{t("nav.changelog")}</Link>
              <Link href="/investors" className="flex items-center min-h-9 text-sm transition-colors hover:text-foreground" style={{ color: "var(--text-muted)" }}>For Investors</Link>
              <a href="https://github.com/alex-jb/vibex" target="_blank" rel="noopener noreferrer" className="flex items-center min-h-9 text-sm transition-colors hover:text-foreground" style={{ color: "var(--text-muted)" }}>GitHub ↗</a>
              <Link href="/arcade" className="flex items-center min-h-9 text-sm transition-colors hover:text-foreground" style={{ color: "var(--text-muted)" }}>Arcade →</Link>
            </div>
          </div>
          <div>
            <h2 className="mb-4 text-[10px] font-medium uppercase tracking-[0.15em] text-foreground/60">
              {t("footer.community")}
            </h2>
            <div className="flex flex-col gap-2">
              <Link href="/about" className="flex items-center min-h-9 text-sm transition-colors hover:text-foreground" style={{ color: "var(--text-muted)" }}>About</Link>
              <Link href="/contact" className="flex items-center min-h-9 text-sm transition-colors hover:text-foreground" style={{ color: "var(--text-muted)" }}>Contact</Link>
              <Link href="/privacy" className="flex items-center min-h-9 text-sm transition-colors hover:text-foreground" style={{ color: "var(--text-muted)" }}>Privacy</Link>
              <Link href="/terms" className="flex items-center min-h-9 text-sm transition-colors hover:text-foreground" style={{ color: "var(--text-muted)" }}>Terms</Link>
            </div>
          </div>
        </div>
        <div className="mt-14 flex flex-col items-center gap-3 border-t border-white/[0.04] pt-8 sm:flex-row sm:justify-between">
          <p className="text-[11px]" style={{ color: "var(--text-muted)" }}>
            &copy; {new Date().getFullYear()} {t("footer.copyright")}
          </p>
          <div className="flex items-center gap-5">
            <StatusBadge />
            <a
              href="https://github.com/alex-jb/solo-founder-os"
              target="_blank"
              rel="noopener noreferrer"
              className="font-pixel text-[9px] tracking-widest uppercase transition-colors hover:text-[var(--neon-yellow)]"
              style={{ color: "var(--text-muted)" }}
              aria-label="Built with Solo Founder OS — open source agent stack"
            >
              Built with Solo Founder OS
            </a>
            <p className="text-[11px]" style={{ color: "var(--text-muted)" }}>
              {t("footer.crafted")}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
