"use client";

import { useLang } from "@/lib/i18n";

export function LangToggle() {
  const { lang, setLang } = useLang();

  return (
    <button
      onClick={() => setLang(lang === "en" ? "zh" : "en")}
      className="font-pixel text-[8px] px-2.5 py-1.5 uppercase tracking-wider transition-colors duration-200 hover:text-foreground shrink-0"
      style={{
        border: "2px solid var(--border-bolt, #444)",
        color: "var(--neon-cyan, #06B6D4)",
        background: "transparent",
        imageRendering: "pixelated",
        cursor: "pointer",
      }}
      title={lang === "en" ? "Switch to Chinese" : "Switch to English"}
    >
      {lang === "en" ? "\u4e2d\u6587" : "EN"}
    </button>
  );
}
