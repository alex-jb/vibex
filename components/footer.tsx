"use client";

import { Sparkles } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLang } from "@/lib/i18n";

export function Footer() {
  const { t } = useLang();
  const pathname = usePathname();
  // Hide footer on the minimal landing page
  if (pathname === "/") return null;
  return (
    <footer aria-label="Footer navigation" className="relative border-t border-white/[0.04] bg-background" data-slot="footer">
      {/* Top gradient accent line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-violet-500/20 to-transparent" />

      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500 shadow-lg shadow-violet-500/20">
                <Sparkles className="h-3.5 w-3.5 text-white" />
              </div>
              <span className="font-pixel text-[10px] tracking-widest text-foreground">
                Vibe<span className="text-violet-400">X</span>
              </span>
            </div>
            <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
              {t("footer.description")}
            </p>
          </div>
          <div>
            <h4 className="mb-4 font-pixel text-[8px] uppercase tracking-[0.2em] text-foreground/80">
              {t("footer.platform")}
            </h4>
            <div className="flex flex-col gap-2.5">
              <Link href="/discover" className="font-pixel text-[9px] text-muted-foreground hover:text-foreground transition-colors duration-200">{t("nav.explore")}</Link>
              <Link href="/hunt" className="font-pixel text-[9px] text-muted-foreground hover:text-foreground transition-colors duration-200">{t("nav.hunt")}</Link>
              <Link href="/ideas" className="font-pixel text-[9px] text-muted-foreground hover:text-foreground transition-colors duration-200">{t("footer.ideaLab")}</Link>
              <Link href="/creators" className="font-pixel text-[9px] text-muted-foreground hover:text-foreground transition-colors duration-200">{t("nav.creators")}</Link>
              <Link href="/launch" className="font-pixel text-[9px] text-muted-foreground hover:text-foreground transition-colors duration-200">{t("nav.launch")}</Link>
              <Link href="/events" className="font-pixel text-[9px] text-muted-foreground hover:text-foreground transition-colors duration-200">{t("nav.events")}</Link>
            </div>
          </div>
          <div>
            <h4 className="mb-4 font-pixel text-[8px] uppercase tracking-[0.2em] text-foreground/80">
              {t("footer.resources")}
            </h4>
            <div className="flex flex-col gap-2.5">
              <Link href="/insights" className="font-pixel text-[9px] text-muted-foreground hover:text-foreground transition-colors duration-200">{t("footer.trendsInsights")}</Link>
              <span className="font-pixel text-[9px] text-zinc-400">{t("footer.apiComingSoon")}</span>
              <span className="font-pixel text-[9px] text-zinc-400">{t("footer.documentation")}</span>
              <span className="font-pixel text-[9px] text-zinc-400">{t("footer.changelog")}</span>
            </div>
          </div>
          <div>
            <h4 className="mb-4 font-pixel text-[8px] uppercase tracking-[0.2em] text-foreground/80">
              {t("footer.community")}
            </h4>
            <div className="flex flex-col gap-2.5">
              <span className="font-pixel text-[9px] text-zinc-400">Discord (Coming Soon)</span>
              <span className="font-pixel text-[9px] text-zinc-400">Twitter / X</span>
              <a href="https://github.com/alex-jb/vibex" target="_blank" rel="noopener noreferrer" className="font-pixel text-[9px] text-muted-foreground hover:text-foreground transition-colors duration-200">GitHub</a>
              <span className="font-pixel text-[9px] text-zinc-400">{t("footer.newsletter")} (Coming Soon)</span>
            </div>
          </div>
        </div>
        <div className="mt-14 flex flex-col items-center gap-3 border-t border-white/[0.04] pt-8 sm:flex-row sm:justify-between">
          <p className="text-[11px] text-muted-foreground">
            &copy; {new Date().getFullYear()} {t("footer.copyright")}
          </p>
          <p className="text-[11px] text-zinc-400">
            {t("footer.crafted")}
          </p>
        </div>
      </div>
    </footer>
  );
}
