"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import type { FeedPost } from "@/lib/feed";
import { useLang } from "@/lib/i18n";
import { ReactionBar, type ReactionCounts, type ReactionType } from "./reaction-bar";
import { MediaAttachment } from "./media-attachment";
import { LevelBadge, type CreatorLevel } from "./level-badge";
import { ReportButton } from "./report-button";
import { trackEvent } from "@/lib/analytics";

/* ─── Helpers ─── */

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function avatarColor(name: string): string {
  const palette = [
    "#9D00FF", "#39FF14", "#FF4500", "#06B6D4",
    "#FACC15", "#FF69B4", "#00BFFF", "#FF6347",
  ];
  let h = 0;
  for (let i = 0; i < name.length; i++) {
    h = name.charCodeAt(i) + ((h << 5) - h);
  }
  return palette[Math.abs(h) % palette.length];
}

function relativeTime(dateStr: string, t: (key: string) => string): string {
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diffMs / 60000);
  const hrs = Math.floor(mins / 60);
  const days = Math.floor(hrs / 24);

  if (mins < 1) return t("feed.justNow");
  if (mins < 60) return `${mins}${t("feed.minutesAgo")}`;
  if (hrs < 24) return `${hrs}${t("feed.hoursAgo")}`;
  return `${days}${t("feed.daysAgo")}`;
}

const TRUNCATE_LENGTH = 280;

/* ─── PostCard ─── */

interface PostCardProps {
  post: FeedPost;
  onReply: (id: string) => void;
  onDelete?: (id: string) => void;
  reactionCounts?: ReactionCounts;
  userReactions?: ReactionType[];
  creatorLevel?: CreatorLevel;
  isOwn?: boolean;
}

export function PostCard({
  post,
  onReply,
  onDelete,
  reactionCounts = { fire: 0, game: 0, art: 0, mindblown: 0 },
  userReactions = [],
  creatorLevel,
  isOwn = false,
}: PostCardProps) {
  const { t } = useLang();
  const [expanded, setExpanded] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const color = avatarColor(post.userName);

  const needsTruncation = post.content.length > TRUNCATE_LENGTH;
  const displayContent = needsTruncation && !expanded
    ? post.content.slice(0, TRUNCATE_LENGTH)
    : post.content;

  const handleDelete = useCallback(async () => {
    if (!confirming) {
      setConfirming(true);
      return;
    }
    // Confirmed
    try {
      await fetch(`/api/feed/${post.id}`, { method: "DELETE" });
      trackEvent("post_deleted", { post_id: post.id });
    } catch {
      // best effort
    }
    onDelete?.(post.id);
    setConfirming(false);
  }, [confirming, onDelete, post.id]);

  return (
    <motion.article
      aria-label={`Post by ${post.userName}`}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="retro-card l-corner relative overflow-hidden"
      style={{ padding: 16, marginBottom: 12 }}
    >
      <div className="l-corner-inner absolute inset-0 pointer-events-none" />

      {/* Header: Avatar + Name + Time + Delete */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10, position: "relative", zIndex: 2 }}>
        <div
          style={{
            width: 32,
            height: 32,
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: `${color}25`,
            border: `2px solid ${color}60`,
            color,
            fontSize: 10,
            fontWeight: 700,
            fontFamily: "var(--font-pixel)",
          }}
        >
          {getInitials(post.userName)}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <span className="font-pixel" style={{ fontSize: 8, color }}>
            {post.userName}
            {creatorLevel && <LevelBadge level={creatorLevel} />}
          </span>
          <span className="font-pixel" style={{ fontSize: 7, color: "#555", marginLeft: 8 }}>
            {relativeTime(post.createdAt, t as (key: string) => string)}
          </span>
        </div>
        {/* Delete button for own posts / Report for others */}
        {isOwn ? (
          <button
            className="nes-btn is-error"
            onClick={handleDelete}
            aria-label="Delete post"
            style={{ fontSize: 7, padding: "2px 8px", minWidth: "auto" }}
          >
            {confirming ? t("feed.confirmDelete") : t("feed.delete")}
          </button>
        ) : (
          <ReportButton postId={post.id} />
        )}
      </div>

      {/* Content with truncation */}
      <div
        className="font-retro"
        style={{
          fontSize: 14,
          lineHeight: 1.6,
          color: "#E8E8EC",
          marginBottom: 10,
          position: "relative",
          zIndex: 2,
        }}
      >
        {displayContent}
        {needsTruncation && !expanded && (
          <button
            onClick={() => setExpanded(true)}
            style={{
              background: "none",
              border: "none",
              color: "#9D00FF",
              cursor: "pointer",
              fontSize: 14,
              fontFamily: "var(--font-retro)",
              padding: 0,
              marginLeft: 2,
            }}
          >
            {t("feed.expand")}
          </button>
        )}
        {needsTruncation && expanded && (
          <button
            onClick={() => setExpanded(false)}
            style={{
              background: "none",
              border: "none",
              color: "#555",
              cursor: "pointer",
              fontSize: 12,
              fontFamily: "var(--font-retro)",
              padding: 0,
              marginLeft: 4,
            }}
          >
            {t("feed.collapse")}
          </button>
        )}
      </div>

      {/* Media attachment */}
      {post.mediaUrl && post.mediaType && (
        <div style={{ position: "relative", zIndex: 2 }}>
          <MediaAttachment url={post.mediaUrl} type={post.mediaType} />
        </div>
      )}

      {/* Project badge */}
      {post.projectId && (
        <Link
          href={`/project/${post.projectId}`}
          style={{ position: "relative", zIndex: 2 }}
        >
          <span
            className="font-pixel"
            style={{
              display: "inline-block",
              fontSize: 7,
              color: "#0D0D0D",
              background: "#9D00FF",
              padding: "2px 8px",
              marginBottom: 10,
              cursor: "pointer",
            }}
          >
            {">> "}PROJECT #{post.projectId}
          </span>
        </Link>
      )}

      {/* Action bar: Reactions + Reply */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8, position: "relative", zIndex: 2 }}>
        {/* Reactions */}
        <ReactionBar
          postId={post.id}
          counts={reactionCounts}
          userReactions={userReactions}
        />

        {/* Reply */}
        <div>
          <button
            className="nes-btn"
            onClick={() => onReply(post.id)}
            aria-label={`${t("feed.reply")} (${post.repliesCount})`}
            style={{ fontSize: 9, padding: "4px 10px", display: "flex", alignItems: "center", gap: 4 }}
          >
            <span>{"\uD83D\uDCAC"}</span>
            <span className="font-pixel" style={{ fontSize: 7 }}>{post.repliesCount}</span>
            <span className="hidden sm:inline font-pixel" style={{ fontSize: 7 }}>{t("feed.reply")}</span>
          </button>
        </div>
      </div>
    </motion.article>
  );
}
