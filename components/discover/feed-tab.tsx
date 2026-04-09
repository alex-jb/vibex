"use client";

import dynamic from "next/dynamic";

const FeedPage = dynamic(() => import("@/app/feed/page"), {
  ssr: false,
  loading: () => (
    <div style={{ padding: 24, textAlign: "center" }}>
      <span
        className="font-pixel"
        style={{ fontSize: 10, color: "#555", letterSpacing: 2 }}
      >
        {"> LOADING FEED..."}
      </span>
    </div>
  ),
});

export function FeedTab() {
  return (
    <div style={{ margin: "-1.5rem" }}>
      <FeedPage />
    </div>
  );
}
