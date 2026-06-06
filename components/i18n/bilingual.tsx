"use client";
import type { ReactNode } from "react";
import { useLang } from "@/lib/i18n";

// Accepts either a string (most existing call sites) or arbitrary JSX (the
// /predictions page renders nested <span> / <a> inline). Both work because
// React renders strings and elements via the same return path.
export function Bilingual({ en, zh }: { en: ReactNode; zh: ReactNode }) {
  const { lang } = useLang();
  return <>{lang === "zh" ? zh : en}</>;
}
