"use client";

import type { FeedTab } from "@/lib/feed";

interface FeedTabsProps {
  activeTab: FeedTab;
  onTabChange: (tab: FeedTab) => void;
}

const TABS: { key: FeedTab; label: string }[] = [
  { key: "following", label: "\u5173\u6CE8" },
  { key: "trending", label: "\u70ED\u95E8" },
  { key: "latest", label: "\u6700\u65B0" },
];

export function FeedTabs({ activeTab, onTabChange }: FeedTabsProps) {
  return (
    <div style={{ display: "flex", gap: 6, marginBottom: 16 }}>
      {TABS.map((tab) => (
        <button
          key={tab.key}
          className={`nes-btn${activeTab === tab.key ? " is-primary" : ""}`}
          onClick={() => onTabChange(tab.key)}
          style={{ fontSize: 10, padding: "6px 14px" }}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
