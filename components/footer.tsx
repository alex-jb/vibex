"use client";

import { Sparkles } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLang } from "@/lib/i18n";
import { isFeatureEnabled } from "@/lib/feature-flags";

export function Footer() {
  const { t } = useLang();
  const pathname = usePathname();
  const eventsOn = isFeatureEnabled("FEATURE_EVENTS");
  // Hide footer on chrome-less routes (landing + auth flows)
  const hideChrome = pathname === "/" || pathname === "/login" || pathname === "/register";
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
          <div>
            <h2 className="mb-4 font-pixel text-[8px] uppercase tracking-[0.2em] text-foreground/80">
              {t("footer.platform")}
            </h2>
            <div className="flex flex-col gap-2.5">
              <Link href="/home" className="flex items-center min-h-11 font-pixel text-[10px] transition-colors duration-200 hover:text-[var(--neon-yellow)]" style={{ color: "var(--text)" }}>{t("nav.home")}</Link>
              <Link href="/hunt" className="flex items-center min-h-11 font-pixel text-[10px] transition-colors duration-200 hover:text-[var(--neon-yellow)]" style={{ color: "var(--text)" }}>{t("nav.hunt")}</Link>
              <Link href="/ideas" className="flex items-center min-h-11 font-pixel text-[10px] transition-colors duration-200 hover:text-[var(--neon-yellow)]" style={{ color: "var(--text)" }}>{t("footer.ideaLab")}</Link>
              <Link href="/creators" className="flex items-center min-h-11 font-pixel text-[10px] transition-colors duration-200 hover:text-[var(--neon-yellow)]" style={{ color: "var(--text)" }}>{t("nav.creators")}</Link>
              <Link href="/launch" className="flex items-center min-h-11 font-pixel text-[10px] transition-colors duration-200 hover:text-[var(--neon-yellow)]" style={{ color: "var(--text)" }}>{t("nav.launch")}</Link>
              {eventsOn && (
                <Link href="/events" className="flex items-center min-h-11 font-pixel text-[10px] transition-colors duration-200 hover:text-[var(--neon-yellow)]" style={{ color: "var(--text)" }}>{t("nav.events")}</Link>
              )}
            </div>
          </div>
          <div>
            <h2 className="mb-4 font-pixel text-[8px] uppercase tracking-[0.2em] text-foreground/80">
              {t("footer.resources")}
            </h2>
            <div className="flex flex-col gap-2.5">
              <Link href="/insights" className="flex items-center min-h-11 font-pixel text-[10px] transition-colors duration-200 hover:text-[var(--neon-yellow)]" style={{ color: "var(--text)" }}>{t("footer.trendsInsights")}</Link>
              <Link href="/investors" className="flex items-center min-h-11 font-pixel text-[10px] transition-colors duration-200 hover:text-[var(--neon-yellow)]" style={{ color: "var(--text)" }}>For Investors</Link>
              <span className="flex items-center min-h-11 font-pixel text-[10px]" style={{ color: "var(--text-muted)" }}>{t("footer.apiComingSoon")}</span>
              <span className="flex items-center min-h-11 font-pixel text-[10px]" style={{ color: "var(--text-muted)" }}>{t("footer.documentation")}</span>
              <span className="flex items-center min-h-11 font-pixel text-[10px]" style={{ color: "var(--text-muted)" }}>{t("footer.changelog")}</span>
            </div>
          </div>
          <div>
            <h2 className="mb-4 font-pixel text-[8px] uppercase tracking-[0.2em] text-foreground/80">
              {t("footer.community")}
            </h2>
            <div className="flex flex-col gap-2.5">
              <span className="flex items-center min-h-11 font-pixel text-[10px]" style={{ color: "var(--text-muted)" }}>Discord (Coming Soon)</span>
              <span className="flex items-center min-h-11 font-pixel text-[10px]" style={{ color: "var(--text-muted)" }}>Twitter / X</span>
              <a href="https://github.com/alex-jb/vibex" target="_blank" rel="noopener noreferrer" className="flex items-center min-h-11 font-pixel text-[10px] transition-colors duration-200 hover:text-[var(--neon-yellow)]" style={{ color: "var(--text)" }}>GitHub</a>
              <span className="flex items-center min-h-11 font-pixel text-[10px]" style={{ color: "var(--text-muted)" }}>{t("footer.newsletter")} (Coming Soon)</span>
            </div>
          </div>
        </div>
        <div className="mt-14 flex flex-col items-center gap-3 border-t border-white/[0.04] pt-8 sm:flex-row sm:justify-between">
          <p className="text-[11px]" style={{ color: "var(--text-muted)" }}>
            &copy; {new Date().getFullYear()} {t("footer.copyright")}
          </p>
          <p className="text-[11px]" style={{ color: "var(--text-muted)" }}>
            {t("footer.crafted")}
          </p>
        </div>
      </div>
    </footer>
  );
}
