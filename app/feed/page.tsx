"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { useRealtimeFeed, type FeedTab } from "@/lib/feed";
import { useAuth } from "@/lib/auth";
import { PostCard } from "@/components/feed/post-card";
import { PostComposer } from "@/components/feed/post-composer";
import { FeedTabs } from "@/components/feed/feed-tabs";

export default function FeedPage() {
  const [tab, setTab] = useState<FeedTab>("trending");
  const { posts, loading, connected } = useRealtimeFeed(tab);
  const [visibleCount, setVisibleCount] = useState(10);
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set());

  const visiblePosts = posts.slice(0, visibleCount);
  const hasMore = visibleCount < posts.length;

  const handleLike = useCallback((postId: string) => {
    setLikedIds((prev) => {
      const next = new Set(prev);
      if (next.has(postId)) {
        next.delete(postId);
      } else {
        next.add(postId);
      }
      return next;
    });
  }, []);

  const handleReply = useCallback((_postId: string) => {
    // placeholder for reply interaction
  }, []);

  const handleAddPost = useCallback((_content: string, _userName: string) => {
    // placeholder for post creation
  }, []);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6">
      {/* Terminal Header */}
      <div
        style={{
          background: "#0A0A0C",
          padding: "8px 12px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: "2px solid #2A2A30",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ width: 10, height: 10, background: "#FF4500", display: "inline-block" }} />
          <span style={{ width: 10, height: 10, background: "#FACC15", display: "inline-block" }} />
          <span style={{ width: 10, height: 10, background: "#39FF14", display: "inline-block" }} />
        </div>

        <span className="font-pixel" style={{ fontSize: 8, color: "#555", letterSpacing: 2 }}>
          VIBEX://FEED v1.0
        </span>

        {/* LIVE badge */}
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: connected ? "#FF4500" : "#555",
              display: "inline-block",
              animation: connected ? "pulse-live 1.5s ease-in-out infinite" : "none",
            }}
          />
          <span
            className="font-pixel"
            style={{ fontSize: 7, color: connected ? "#FF4500" : "#555" }}
          >
            {connected ? "LIVE" : "OFFLINE"}
          </span>
        </div>
      </div>

      {/* Main Terminal Body (RPGUI framed) */}
      <div
        className="rpgui-container framed"
        style={{
          minHeight: "70vh",
          padding: 20,
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Scanline overlay */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "repeating-linear-gradient(0deg, transparent 0, transparent 2px, rgba(0,0,0,0.08) 2px, rgba(0,0,0,0.08) 4px)",
            pointerEvents: "none",
            zIndex: 1,
          }}
        />

        <div style={{ position: "relative", zIndex: 2 }}>
          {/* Title */}
          <motion.div
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.2 }}
            className="font-pixel"
            style={{
              fontSize: 14,
              color: "#39FF14",
              textShadow: "0 0 12px #39FF1440",
              marginBottom: 16,
            }}
          >
            {"> \u52A8\u6001"}
          </motion.div>

          {/* Composer */}
          <PostComposer onSubmit={handleAddPost} />

          {/* Tabs */}
          <FeedTabs activeTab={tab} onTabChange={setTab} />

          {/* Loading state */}
          {loading && (
            <div
              className="font-pixel"
              style={{ textAlign: "center", color: "#555", fontSize: 8, padding: 40 }}
            >
              LOADING FEED...
            </div>
          )}

          {/* Post list */}
          {!loading && visiblePosts.length > 0 && (
            <>
              {visiblePosts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  onLike={handleLike}
                  onReply={handleReply}
                  liked={likedIds.has(post.id)}
                />
              ))}

              {/* Load more */}
              {hasMore && (
                <div style={{ textAlign: "center", marginTop: 16 }}>
                  <button
                    className="nes-btn"
                    onClick={() => setVisibleCount((c) => c + 10)}
                    style={{ fontSize: 10, padding: "8px 20px" }}
                  >
                    {"\u52A0\u8F7D\u66F4\u591A"}
                  </button>
                </div>
              )}
            </>
          )}

          {/* Empty state */}
          {!loading && visiblePosts.length === 0 && (
            <div style={{ textAlign: "center", padding: "40px 0" }}>
              <div
                className="font-retro"
                style={{ fontSize: 14, color: "#555", marginBottom: 16 }}
              >
                {"\u8FD8\u6CA1\u6709\u52A8\u6001\uFF0C\u53D1\u5E03\u7B2C\u4E00\u6761\u5427\uFF01"}
              </div>
              <button
                className="nes-btn is-primary"
                style={{ fontSize: 10, padding: "8px 20px" }}
                onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              >
                {"\u53D1\u5E03\u52A8\u6001"}
              </button>
            </div>
          )}

          {/* Terminal prompt */}
          <div style={{ marginTop: 24 }}>
            <span className="font-retro" style={{ color: "#39FF14", fontSize: 18 }}>
              {">"}{" "}
            </span>
            <span
              style={{
                display: "inline-block",
                width: 8,
                height: 16,
                background: "#39FF14",
                animation: "blink-cursor 0.8s step-end infinite",
                verticalAlign: "middle",
              }}
            />
          </div>
        </div>
      </div>

      {/* Animations */}
      <style>{`
        @keyframes blink-cursor {
          50% { opacity: 0; }
        }
        @keyframes pulse-live {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(1.3); }
        }
      `}</style>
    </div>
  );
}
