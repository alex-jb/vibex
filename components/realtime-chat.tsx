"use client";

import { useState, useRef, useEffect, type KeyboardEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useProjectChat, type ChatMessage } from "@/lib/chat";
import { useAuth } from "@/lib/auth";

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

  if (mins < 1) return "now";
  if (mins < 60) return `${mins}m`;
  if (hrs < 24) return `${hrs}h`;
  return `${days}d`;
}

/* ─── Message Bubble ─── */

function MessageBubble({
  msg,
  isOwn,
}: {
  msg: ChatMessage;
  isOwn: boolean;
}) {
  const color = avatarColor(msg.userName);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      style={{
        display: "flex",
        flexDirection: isOwn ? "row-reverse" : "row",
        alignItems: "flex-start",
        gap: 8,
        marginBottom: 10,
      }}
    >
      {/* Avatar */}
      <div
        style={{
          width: 28,
          height: 28,
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: `${color}25`,
          border: `2px solid ${color}60`,
          color,
          fontSize: 9,
          fontWeight: 700,
          fontFamily: "var(--font-pixel)",
        }}
      >
        {getInitials(msg.userName)}
      </div>

      {/* Content */}
      <div
        style={{
          maxWidth: "75%",
          display: "flex",
          flexDirection: "column",
          alignItems: isOwn ? "flex-end" : "flex-start",
        }}
      >
        {/* Name + time */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            marginBottom: 2,
            flexDirection: isOwn ? "row-reverse" : "row",
          }}
        >
          <span
            className="font-pixel"
            style={{ fontSize: 7, color: color }}
          >
            {msg.userName}
          </span>
          <span
            className="font-pixel"
            style={{ fontSize: 6, color: "#555" }}
          >
            {relativeTime(msg.createdAt)}
          </span>
        </div>

        {/* Bubble */}
        <div
          style={{
            background: isOwn ? "#9D00FF20" : "#1A1A1F",
            border: `2px solid ${isOwn ? "#9D00FF40" : "#2A2A30"}`,
            padding: "6px 10px",
            fontSize: 13,
            lineHeight: 1.5,
            color: "#E8E8EC",
            fontFamily: "var(--font-retro)",
            wordBreak: "break-word",
          }}
        >
          {msg.content}
        </div>
      </div>
    </motion.div>
  );
}

/* ─── Main Component ─── */

export function RealtimeChat({ projectId }: { projectId: string }) {
  const { messages, loading, connected, sendMessage } = useProjectChat(projectId);
  const { user } = useAuth();
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || sending) return;
    setSending(true);
    await sendMessage(input);
    setInput("");
    setSending(false);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey && input.trim()) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div>
      {/* ═══ Terminal Header ═══ */}
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
          VIBEX://CHAT
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

      {/* ═══ Chat Body (RPGUI framed) ═══ */}
      <div
        className="rpgui-container framed"
        style={{
          padding: 0,
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
              "repeating-linear-gradient(0deg, transparent 0, transparent 2px, rgba(0,0,0,0.06) 2px, rgba(0,0,0,0.06) 4px)",
            pointerEvents: "none",
            zIndex: 1,
          }}
        />

        {/* Messages area */}
        <div
          ref={scrollRef}
          style={{
            position: "relative",
            zIndex: 2,
            height: 320,
            overflowY: "auto",
            padding: "12px 14px 8px",
          }}
        >
          {loading && (
            <div
              className="font-pixel"
              style={{ textAlign: "center", color: "#555", fontSize: 8, padding: 20 }}
            >
              LOADING MESSAGES...
            </div>
          )}

          {!loading && messages.length === 0 && (
            <div
              className="font-pixel"
              style={{ textAlign: "center", color: "#555", fontSize: 8, padding: 40 }}
            >
              NO MESSAGES YET. START THE CONVERSATION!
            </div>
          )}

          <AnimatePresence initial={false}>
            {messages.map((msg) => (
              <MessageBubble
                key={msg.id}
                msg={msg}
                isOwn={msg.userId === (user?.id ?? "__none__")}
              />
            ))}
          </AnimatePresence>
        </div>

        {/* ─── Input Area ─── */}
        <div
          style={{
            position: "relative",
            zIndex: 2,
            borderTop: "2px solid #2A2A30",
            padding: "10px 12px",
            background: "#0A0A0C",
          }}
        >
          {user ? (
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type a message..."
                disabled={sending}
                className="font-retro"
                style={{
                  flex: 1,
                  background: "#111114",
                  border: "2px solid #2A2A30",
                  padding: "8px 12px",
                  fontSize: 14,
                  color: "#E8E8EC",
                  outline: "none",
                  fontFamily: "var(--font-retro)",
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = "#9D00FF60";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = "#2A2A30";
                }}
              />
              <button
                className="nes-btn is-primary"
                onClick={handleSend}
                disabled={!input.trim() || sending}
                style={{
                  fontSize: 9,
                  padding: "8px 14px",
                  opacity: !input.trim() || sending ? 0.4 : 1,
                  cursor: !input.trim() || sending ? "not-allowed" : "pointer",
                }}
              >
                SEND
              </button>
            </div>
          ) : (
            <div
              style={{
                textAlign: "center",
                padding: "8px 0",
              }}
            >
              <span className="font-pixel" style={{ fontSize: 8, color: "#8888A0" }}>
                <Link
                  href="/login"
                  style={{
                    color: "#9D00FF",
                    textDecoration: "underline",
                    textUnderlineOffset: 3,
                  }}
                >
                  Log in
                </Link>
                {" "}to join the discussion
              </span>
            </div>
          )}
        </div>

        {/* Footer status bar */}
        <div
          style={{
            position: "relative",
            zIndex: 2,
            borderTop: "1px solid #1A1A1F",
            padding: "4px 12px",
            background: "#08080A",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span className="font-pixel" style={{ fontSize: 6, color: "#444" }}>
            MSG: {messages.length}
          </span>
          <span className="font-pixel" style={{ fontSize: 6, color: connected ? "#39FF14" : "#FF4500" }}>
            {connected ? "CONNECTED" : "DISCONNECTED"}
          </span>
        </div>
      </div>

      {/* Pulse animation for LIVE badge */}
      <style>{`
        @keyframes pulse-live {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(1.3); }
        }
      `}</style>
    </div>
  );
}
