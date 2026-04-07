"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import type { FeedPost } from "@/lib/feed";

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

function relativeTime(dateStr: string): string {
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diffMs / 60000);
  const hrs = Math.floor(mins / 60);
  const days = Math.floor(hrs / 24);

  if (mins < 1) return "\u521a\u521a";
  if (mins < 60) return `${mins}\u5206\u949f\u524d`;
  if (hrs < 24) return `${hrs}\u5c0f\u65f6\u524d`;
  return `${days}\u5929\u524d`;
}

/* ─── PostCard ─── */

interface PostCardProps {
  post: FeedPost;
  onLike: (id: string) => void;
  onReply: (id: string) => void;
  liked?: boolean;
}

export function PostCard({ post, onLike, onReply, liked = false }: PostCardProps) {
  const [bouncing, setBouncing] = useState(false);
  const color = avatarColor(post.userName);

  const handleLike = () => {
    setBouncing(true);
    onLike(post.id);
    setTimeout(() => setBouncing(false), 400);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="retro-card l-corner relative overflow-hidden"
      style={{ padding: 16, marginBottom: 12 }}
    >
      <div className="l-corner-inner absolute inset-0 pointer-events-none" />

      {/* Header: Avatar + Name + Time */}
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
          </span>
          <span className="font-pixel" style={{ fontSize: 7, color: "#555", marginLeft: 8 }}>
            {relativeTime(post.createdAt)}
          </span>
        </div>
      </div>

      {/* Content */}
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
        {post.content}
      </div>

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

      {/* Action bar */}
      <div style={{ display: "flex", gap: 8, position: "relative", zIndex: 2 }}>
        {/* Like */}
        <motion.button
          className="nes-btn"
          animate={bouncing ? { scale: [1, 1.3, 1] } : {}}
          transition={{ duration: 0.3 }}
          onClick={handleLike}
          style={{
            fontSize: 9,
            padding: "4px 10px",
            display: "flex",
            alignItems: "center",
            gap: 4,
            color: liked ? "#FF69B4" : undefined,
            boxShadow: liked ? "0 0 8px #FF69B460" : undefined,
          }}
        >
          <span>{liked ? "\u2665" : "\u2661"}</span>
          <span className="font-pixel" style={{ fontSize: 7 }}>{post.likes}</span>
        </motion.button>

        {/* Reply */}
        <button
          className="nes-btn"
          onClick={() => onReply(post.id)}
          style={{ fontSize: 9, padding: "4px 10px", display: "flex", alignItems: "center", gap: 4 }}
        >
          <span>{"\uD83D\uDCAC"}</span>
          <span className="font-pixel" style={{ fontSize: 7 }}>{post.repliesCount}</span>
        </button>

        {/* Repost */}
        <button
          className="nes-btn"
          style={{ fontSize: 9, padding: "4px 10px", display: "flex", alignItems: "center", gap: 4 }}
        >
          <span>{"\uD83D\uDD01"}</span>
          <span className="font-pixel" style={{ fontSize: 7 }}>{post.reposts}</span>
        </button>
      </div>
    </motion.div>
  );
}
