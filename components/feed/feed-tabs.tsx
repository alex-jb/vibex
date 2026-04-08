"use client";

import type { FeedTab } from "@/lib/feed";
import { useLang } from "@/lib/i18n";

interface FeedTabsProps {
  activeTab: FeedTab;
  onTabChange: (tab: FeedTab) => void;
}

const TABS: { key: FeedTab; i18nKey: "feed.following" | "feed.trending" | "feed.latest" }[] = [
  { key: "following", i18nKey: "feed.following" },
  { key: "trending", i18nKey: "feed.trending" },
  { key: "latest", i18nKey: "feed.latest" },
];

export function FeedTabs({ activeTab, onTabChange }: FeedTabsProps) {
  const { t } = useLang();
  return (
    <div role="tablist" style={{ display: "flex", gap: 6, marginBottom: 16 }}>
      {TABS.map((tab) => (
        <button
          key={tab.key}
          role="tab"
          aria-selected={activeTab === tab.key}
          className={`nes-btn${activeTab === tab.key ? " is-primary" : ""}`}
          onClick={() => onTabChange(tab.key)}
          style={{ fontSize: 10, padding: "6px 14px" }}
        >
          {t(tab.i18nKey)}
        </button>
      ))}
    </div>
  );
}
