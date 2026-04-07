"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth";

interface PostComposerProps {
  onSubmit: (content: string, userName: string, projectId?: string, projectTitle?: string) => void;
}

export function PostComposer({ onSubmit }: PostComposerProps) {
  const { user } = useAuth();
  const [content, setContent] = useState("");
  const [linkProject, setLinkProject] = useState(false);
  const MAX_CHARS = 500;

  const displayName =
    (user?.user_metadata?.full_name as string) ??
    (user?.user_metadata?.name as string) ??
    user?.email?.split("@")[0] ??
    "Trainer";

  const handleSubmit = () => {
    if (!content.trim() || !user) return;
    onSubmit(content.trim(), displayName);
    setContent("");
    setLinkProject(false);
  };

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
    <div className="rpgui-container framed" style={{ padding: 16, marginBottom: 16 }}>
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
        }}
        onFocus={(e) => { e.currentTarget.style.borderColor = "#9D00FF60"; }}
        onBlur={(e) => { e.currentTarget.style.borderColor = "#2A2A30"; }}
      />

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
        </div>

        <button
          className="nes-btn is-success"
          onClick={handleSubmit}
          disabled={!content.trim()}
          style={{
            fontSize: 9,
            padding: "6px 14px",
            opacity: !content.trim() ? 0.4 : 1,
            cursor: !content.trim() ? "not-allowed" : "pointer",
          }}
        >
          {"\u53D1\u5E03"}
        </button>
      </div>
    </div>
  );
}
