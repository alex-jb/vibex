"use client";

import { useLang } from "@/lib/i18n";
import type { Lang } from "@/lib/i18n";

const langCycle: Lang[] = ["en", "zh"];
const langLabels: Record<Lang, string> = { en: "EN", zh: "\u4e2d\u6587" };

export function LangToggle() {
  const { lang, setLang } = useLang();

  const nextLang = langCycle[(langCycle.indexOf(lang) + 1) % langCycle.length];

  return (
    <button
      onClick={() => setLang(nextLang)}
      className="text-[10px] px-2.5 py-1.5 uppercase tracking-wider transition-colors duration-200 hover:text-foreground shrink-0 font-bold"
      style={{
        border: "2px solid var(--border-bolt, #444)",
        color: "var(--neon-cyan, #06B6D4)",
        background: "transparent",
        imageRendering: "pixelated",
        cursor: "pointer",
      }}
      title={lang === "en" ? "Switch to Chinese" : "Switch to English"}
      // Accessible name must contain the visible text per WCAG
      // 2.5.3 (label-content-name-mismatch). Prefix with the
      // language code ("EN" / "中文") then describe the action.
      aria-label={
        lang === "en" ? "EN — switch to Chinese" : "中文 — switch to English"
      }
    >
      {langLabels[lang]}
    </button>
  );
}
