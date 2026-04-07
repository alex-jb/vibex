"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth";
import type { FeedPost } from "@/lib/feed";

interface PostComposerProps {
  onNewPost?: (post: FeedPost) => void;
}

export function PostComposer({ onNewPost }: PostComposerProps) {
  const { user } = useAuth();
  const [content, setContent] = useState("");
  const [linkProject, setLinkProject] = useState(false);
  const [mediaUrl, setMediaUrl] = useState("");
  const [showMediaInput, setShowMediaInput] = useState(false);
  const [posting, setPosting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successFlash, setSuccessFlash] = useState(false);
  const MAX_CHARS = 500;

  const displayName =
    (user?.user_metadata?.full_name as string) ??
    (user?.user_metadata?.name as string) ??
    user?.email?.split("@")[0] ??
    "Trainer";

  const handleSubmit = useCallback(async () => {
    if (!content.trim() || !user || posting) return;
    setPosting(true);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/feed", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          userName: displayName,
          userAvatar: user.user_metadata?.avatar_url ?? null,
          content: content.trim(),
          ...(linkProject ? { projectId: "1" } : {}),
          ...(mediaUrl.trim() ? { mediaUrl: mediaUrl.trim(), mediaType: mediaUrl.match(/\.gif($|\?)/i) ? "gif" : "image" } : {}),
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "\u53D1\u5E03\u5931\u8D25");
      }

      const postData = await res.json();

      // Map API response to FeedPost
      const newPost: FeedPost = {
        id: postData.id,
        userId: postData.user_id,
        userName: postData.user_name,
        userAvatar: postData.user_avatar ?? undefined,
        content: postData.content,
        projectId: postData.project_id ?? undefined,
        parentId: postData.parent_id ?? undefined,
        likes: postData.likes ?? 0,
        repliesCount: postData.replies_count ?? 0,
        reposts: postData.reposts ?? 0,
        createdAt: postData.created_at,
      };

      // Success flash
      setSuccessFlash(true);
      setTimeout(() => setSuccessFlash(false), 600);

      setContent("");
      setLinkProject(false);
      setMediaUrl("");
      setShowMediaInput(false);

      // Notify parent
      onNewPost?.(newPost);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "\u53D1\u5E03\u5931\u8D25";
      setErrorMsg(msg);
      setTimeout(() => setErrorMsg(null), 3000);
    } finally {
      setPosting(false);
    }
  }, [content, user, posting, displayName, linkProject, onNewPost]);

  if (!user) {
    return (
      <div
        className="rpgui-container framed"
        style={{ padding: 16, marginBottom: 16, textAlign: "center" }}
      >
        <span className="font-pixel" style={{ fontSize: 8, color: "#8888A0" }}>
          <Link
            href="/login"
            style={{ color: "#9D00FF", textDecoration: "underline", textUnderlineOffset: 3 }}
          >
            {"\u767B\u5F55"}
          </Link>
          {"\u540E\u53D1\u5E03\u52A8\u6001"}
        </span>
      </div>
    );
  }

  const remaining = MAX_CHARS - content.length;
  const nearLimit = remaining <= 50;

  return (
    <div
      className="rpgui-container framed"
      style={{
        padding: 16,
        marginBottom: 16,
        borderColor: successFlash ? "#39FF14" : errorMsg ? "#FF4500" : undefined,
        boxShadow: successFlash
          ? "0 0 12px #39FF1460"
          : errorMsg
            ? "0 0 12px #FF450060"
            : undefined,
        transition: "border-color 0.3s, box-shadow 0.3s",
      }}
    >
      {/* Terminal header */}
      <div className="font-retro" style={{ fontSize: 14, color: "#39FF14", marginBottom: 10 }}>
        {">"} {"\u53D1\u5E03\u52A8\u6001"}
      </div>

      {/* Textarea */}
      <textarea
        value={content}
        onChange={(e) => {
          if (e.target.value.length <= MAX_CHARS) setContent(e.target.value);
        }}
        placeholder={"\u5206\u4EAB\u4F60\u7684\u60F3\u6CD5..."}
        disabled={posting}
        className="font-retro"
        style={{
          width: "100%",
          minHeight: 80,
          background: "#0A0A0C",
          border: "2px solid #2A2A30",
          padding: "10px 12px",
          fontSize: 14,
          lineHeight: 1.5,
          color: "#E8E8EC",
          resize: "vertical",
          outline: "none",
          fontFamily: "var(--font-retro)",
          opacity: posting ? 0.5 : 1,
        }}
        onFocus={(e) => { e.currentTarget.style.borderColor = "#9D00FF60"; }}
        onBlur={(e) => { e.currentTarget.style.borderColor = "#2A2A30"; }}
      />

      {/* Error message */}
      {errorMsg && (
        <div
          className="font-pixel"
          style={{ fontSize: 8, color: "#FF4500", marginTop: 4 }}
        >
          {errorMsg}
        </div>
      )}

      {/* Footer row */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {/* Char counter */}
          <span
            className="font-pixel"
            style={{ fontSize: 7, color: nearLimit ? "#FF4500" : "#555" }}
          >
            {content.length}/{MAX_CHARS}
          </span>

          {/* Link project toggle */}
          <button
            onClick={() => setLinkProject(!linkProject)}
            className="font-pixel"
            disabled={posting}
            style={{
              fontSize: 7,
              color: linkProject ? "#9D00FF" : "#555",
              background: "none",
              border: "none",
              cursor: "pointer",
              textDecoration: linkProject ? "underline" : "none",
            }}
          >
            {"\uD83D\uDD17 \u94FE\u63A5\u9879\u76EE"}
          </button>

          {/* Media toggle */}
          <button
            onClick={() => setShowMediaInput(!showMediaInput)}
            className="font-pixel"
            disabled={posting}
            style={{
              fontSize: 7,
              color: showMediaInput ? "#FACC15" : "#555",
              background: "none",
              border: "none",
              cursor: "pointer",
              textDecoration: showMediaInput ? "underline" : "none",
            }}
          >
            {"\uD83D\uDDBC\uFE0F \u56FE\u7247"}
          </button>
        </div>

        <button
          className="nes-btn is-success"
          onClick={handleSubmit}
          disabled={!content.trim() || posting}
          style={{
            fontSize: 9,
            padding: "6px 14px",
            opacity: !content.trim() || posting ? 0.4 : 1,
            cursor: !content.trim() || posting ? "not-allowed" : "pointer",
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          {posting && (
            <span
              style={{
                display: "inline-block",
                width: 10,
                height: 10,
                border: "2px solid #fff",
                borderTopColor: "transparent",
                borderRadius: "50%",
                animation: "composer-spin 0.6s linear infinite",
              }}
            />
          )}
          {posting ? "\u53D1\u5E03\u4E2D..." : "\u53D1\u5E03"}
        </button>
      </div>

      {/* Media URL input */}
      {showMediaInput && (
        <div style={{ marginTop: 8 }}>
          <input
            type="url"
            value={mediaUrl}
            onChange={(e) => setMediaUrl(e.target.value)}
            placeholder={"图片/GIF URL..."}
            disabled={posting}
            className="font-retro"
            style={{
              width: "100%",
              background: "#0A0A0C",
              border: "2px solid #2A2A30",
              padding: "6px 10px",
              fontSize: 12,
              color: "#E8E8EC",
              outline: "none",
              fontFamily: "var(--font-retro)",
            }}
          />
          {mediaUrl.trim() && (
            <div
              className="font-pixel"
              style={{ fontSize: 7, color: "#FACC15", marginTop: 4 }}
            >
              {mediaUrl.match(/\.gif($|\?)/i) ? "GIF" : "IMAGE"} {"\u2714"}
            </div>
          )}
        </div>
      )}

      {/* Spinner animation */}
      <style>{`
        @keyframes composer-spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
