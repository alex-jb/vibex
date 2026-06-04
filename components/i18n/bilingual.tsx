"use client";
import { useLang } from "@/lib/i18n";

export function Bilingual({ en, zh }: { en: string; zh: string }) {
  const { lang } = useLang();
  return <>{lang === "zh" ? zh : en}</>;
}
