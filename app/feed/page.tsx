"use client";

import { useState, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import { useRealtimeFeed, type FeedTab, type FeedPost } from "@/lib/feed";
import { useAuth } from "@/lib/auth";
import { PostCard } from "@/components/feed/post-card";
import { PostComposer } from "@/components/feed/post-composer";
import { FeedTabs } from "@/components/feed/feed-tabs";
import { NewPostsToast } from "@/components/feed/new-posts-toast";
import Link from "next/link";

/* ─── Skeleton card for loading states ─── */
function SkeletonPostCard() {
  return (
    <div
      className="retro-card l-corner relative overflow-hidden"
      style={{ padding: 16, marginBottom: 12 }}
    >
      {/* Avatar + name skeleton */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
        <div
          style={{
            width: 32,
            height: 32,
            background: "#2A2A30",
            animation: "skeleton-pulse 1.2s ease-in-out infinite",
          }}
        />
        <div style={{ flex: 1 }}>
          <div
            style={{
              width: 80,
              height: 10,
              background: "#2A2A30",
              marginBottom: 4,
              animation: "skeleton-pulse 1.2s ease-in-out infinite",
            }}
          />
          <div
            style={{
              width: 50,
              height: 8,
              background: "#1E1E22",
              animation: "skeleton-pulse 1.2s ease-in-out infinite",
            }}
          />
        </div>
      </div>
      {/* Content skeleton lines */}
      <div
        style={{
          width: "100%",
          height: 12,
          background: "#2A2A30",
          marginBottom: 6,
          animation: "skeleton-pulse 1.2s ease-in-out infinite",
        }}
      />
      <div
        style={{
          width: "75%",
          height: 12,
          background: "#2A2A30",
          marginBottom: 6,
          animation: "skeleton-pulse 1.2s ease-in-out infinite",
        }}
      />
      <div
        style={{
          width: "50%",
          height: 12,
          background: "#1E1E22",
          marginBottom: 12,
          animation: "skeleton-pulse 1.2s ease-in-out infinite",
        }}
      />
      {/* Action bar skeleton */}
      <div style={{ display: "flex", gap: 8 }}>
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            style={{
              width: 60,
              height: 24,
              background: "#2A2A30",
              animation: "skeleton-pulse 1.2s ease-in-out infinite",
            }}
          />
        ))}
      </div>
    </div>
  );
}

export default function FeedPage() {
  const [tab, setTab] = useState<FeedTab>("trending");
  const { posts, loading, error, connected, refetch, bufferedPosts, flushBuffered } = useRealtimeFeed(tab);
  const { user } = useAuth();
  const [visibleCount, setVisibleCount] = useState(10);
  const [loadingMore, setLoadingMore] = useState(false);
  const [tabSwitching, setTabSwitching] = useState(false);
  const [localPosts, setLocalPosts] = useState<FeedPost[]>([]);

  // Sync posts from hook into local state
  useEffect(() => {
    setLocalPosts(posts);
  }, [posts]);

  // Brief skeleton on tab switch
  const handleTabChange = useCallback((newTab: FeedTab) => {
    setTab(newTab);
    setVisibleCount(10);
    setTabSwitching(true);
    setTimeout(() => setTabSwitching(false), 300);
  }, []);

  const visiblePosts = localPosts;
  // hasMore: true if we have a multiple of 20 posts (could be more on server)
  const hasMore = localPosts.length > 0 && localPosts.length % 20 === 0;
  const exhausted = !hasMore && localPosts.length > 0;

  const handleReply = useCallback((_postId: string) => {
    // placeholder for reply interaction
  }, []);

  const handleDelete = useCallback((postId: string) => {
    setLocalPosts((prev) => prev.filter((p) => p.id !== postId));
  }, []);

  const handleNewPost = useCallback((_post: FeedPost) => {
    // Don't optimistically prepend — realtime subscription will deliver the post.
    // This avoids the duplicate post bug where both optimistic add + realtime INSERT
    // prepend the same post to the list.
  }, []);

  const handleLoadMore = useCallback(async () => {
    setLoadingMore(true);
    try {
      const offset = localPosts.length;
      const res = await fetch(`/api/feed?tab=${tab}&offset=${offset}`);
      if (res.ok) {
        const morePosts: FeedPost[] = (await res.json()).map((row: Record<string, unknown>) => ({
          id: row.id as string,
          userId: row.user_id as string,
          userName: row.user_name as string,
          userAvatar: row.user_avatar as string | undefined,
          content: row.content as string,
          projectId: (row.project_id as string) || undefined,
          parentId: (row.parent_id as string) || undefined,
          likes: row.likes as number,
          repliesCount: row.replies_count as number,
          reposts: row.reposts as number,
          createdAt: row.created_at as string,
          mediaUrl: (row.media_url as string) || undefined,
          mediaType: (row.media_type as "image" | "gif") || undefined,
        }));
        if (morePosts.length > 0) {
          setLocalPosts((prev) => [...prev, ...morePosts]);
        } else {
          setVisibleCount(localPosts.length); // signal exhausted
        }
      }
    } catch {
      // silently fail load more
    } finally {
      setLoadingMore(false);
    }
  }, [localPosts.length, tab]);

  const showSkeleton = loading || tabSwitching;

  /* ─── Per-tab empty state messages ─── */
  function renderEmptyState() {
    if (tab === "following") {
      return (
        <div style={{ textAlign: "center", padding: "40px 0" }}>
          <div className="font-retro" style={{ fontSize: 14, color: "#555", marginBottom: 16 }}>
            {"\u8FD8\u6CA1\u6709\u5173\u6CE8\u4EFB\u4F55\u4EBA\uFF0C\u53BB\u53D1\u73B0\u521B\u4F5C\u8005\u5427\uFF01"}
          </div>
          <Link href="/creators">
            <button
              className="nes-btn is-primary"
              style={{ fontSize: 10, padding: "8px 20px" }}
            >
              {"\u53D1\u73B0\u521B\u4F5C\u8005"}
            </button>
          </Link>
        </div>
      );
    }
    if (tab === "trending") {
      return (
        <div style={{ textAlign: "center", padding: "40px 0" }}>
          <div className="font-retro" style={{ fontSize: 14, color: "#555" }}>
            {"\u8FD8\u6CA1\u6709\u70ED\u95E8\u52A8\u6001"}
          </div>
        </div>
      );
    }
    // latest
    return (
      <div style={{ textAlign: "center", padding: "40px 0" }}>
        <div className="font-retro" style={{ fontSize: 14, color: "#555", marginBottom: 16 }}>
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
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6">
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
          {/* New posts toast */}
          <NewPostsToast
            count={bufferedPosts.length}
            onClick={() => {
              flushBuffered();
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
          />

          <PostComposer onNewPost={handleNewPost} />

          {/* Tabs */}
          <FeedTabs activeTab={tab} onTabChange={handleTabChange} />

          {/* Loading state: 3 skeleton cards */}
          {showSkeleton && (
            <div>
              <SkeletonPostCard />
              <SkeletonPostCard />
              <SkeletonPostCard />
            </div>
          )}

          {/* Error state */}
          {!showSkeleton && error && (
            <div style={{ textAlign: "center", padding: "40px 0" }}>
              <div className="font-retro" style={{ fontSize: 14, color: "#FF4500", marginBottom: 16 }}>
                {"\u52A0\u8F7D\u5931\u8D25"}
              </div>
              <button
                className="nes-btn is-error"
                onClick={refetch}
                style={{ fontSize: 10, padding: "8px 20px" }}
              >
                {"\u91CD\u8BD5"}
              </button>
            </div>
          )}

          {/* Post list */}
          {!showSkeleton && !error && visiblePosts.length > 0 && (
            <>
              <div role="feed" aria-live="polite" aria-label="Social feed posts">
                {visiblePosts.map((post) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    onReply={handleReply}
                    onDelete={handleDelete}
                    isOwn={!!user && user.id === post.userId}
                  />
                ))}
              </div>

              {/* Load more / exhausted */}
              <div style={{ textAlign: "center", marginTop: 16 }}>
                {hasMore && (
                  <button
                    className="nes-btn"
                    onClick={handleLoadMore}
                    disabled={loadingMore}
                    style={{ fontSize: 10, padding: "8px 20px" }}
                  >
                    {loadingMore ? "\u52A0\u8F7D\u4E2D..." : "\u52A0\u8F7D\u66F4\u591A"}
                  </button>
                )}
                {exhausted && (
                  <button
                    className="nes-btn"
                    disabled
                    style={{ fontSize: 10, padding: "8px 20px", opacity: 0.4, cursor: "not-allowed" }}
                  >
                    {"\u6CA1\u6709\u66F4\u591A\u4E86"}
                  </button>
                )}
              </div>
            </>
          )}

          {/* Empty state (per tab) */}
          {!showSkeleton && !error && visiblePosts.length === 0 && renderEmptyState()}

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
        @keyframes skeleton-pulse {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 0.8; }
        }
      `}</style>
    </div>
  );
}
