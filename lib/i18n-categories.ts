/**
 * Category labels keyed by the EN canonical value.
 *
 * Categories are used as both filter values AND display labels. The
 * canonical value stays English (used for storage, URL params, filter
 * matching) and we localize at render time only.
 */

import type { Lang } from "./i18n";

const CATEGORY_ZH: Record<string, string> = {
  All: "全部",
  "AI Agent": "AI 代理",
  "AI Tool": "AI 工具",
  "AI Game": "AI 游戏",
  "AI Workflow": "AI 工作流",
  "AI Utility": "AI 实用",
  Experimental: "实验性",
  Demo: "Demo",
};

export function localizeCategory(category: string, lang: Lang): string {
  if (lang === "zh") return CATEGORY_ZH[category] || category;
  return category;
}
