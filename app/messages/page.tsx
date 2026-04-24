"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

interface Conversation {
  id: string;
  other_user_name?: string;
  other_user_id?: string;
  last_message?: string;
  last_message_at?: string;
  unread?: number;
  user_a_id?: string;
  user_b_id?: string;
}

interface Message {
  id: string;
  sender_id: string;
  sender_name: string;
  content: string;
  read: boolean;
  created_at: string;
}

function relativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function MessagesPage() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConv, setActiveConv] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch conversations
  useEffect(() => {
    fetch("/api/messages")
      .then((res) => res.json())
      .then((data) => setConversations(data.conversations ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Fetch messages for active conversation
  useEffect(() => {
    if (!activeConv) return;
    fetch(`/api/messages/${activeConv}`)
      .then((res) => res.json())
      .then((data) => {
        setMessages(data.messages ?? []);
        setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
      })
      .catch(() => {});
  }, [activeConv]);

  // Realtime: subscribe to new messages in active conversation
  useEffect(() => {
    if (!activeConv) return;

    const channel = supabase
      .channel(`dm-${activeConv}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "direct_messages",
          filter: `conversation_id=eq.${activeConv}`,
        },
        (payload) => {
          const row = payload.new as Record<string, unknown>;
          // Avoid duplicating our own messages (already added optimistically)
          if (row.sender_id === user?.id) return;
          const newMsg: Message = {
            id: row.id as string,
            sender_id: row.sender_id as string,
            sender_name: (row.sender_name as string) || "User",
            content: row.content as string,
            read: false,
            created_at: row.created_at as string,
          };
          setMessages((prev) => [...prev, newMsg]);
          setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeConv, user?.id]);

  const handleSend = useCallback(async () => {
    if (!newMessage.trim() || sending || !activeConv) return;
    setSending(true);
    try {
      const conv = conversations.find((c) => c.id === activeConv);
      const recipientId = conv?.other_user_id ?? conv?.user_b_id ?? "";
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recipientId, content: newMessage.trim() }),
      });
      if (res.ok) {
        const msg = await res.json();
        setMessages((prev) => [...prev, msg]);
        setNewMessage("");
        setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
      }
    } catch {} finally {
      setSending(false);
    }
  }, [newMessage, sending, activeConv, conversations]);

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="rpgui-container framed" style={{ padding: 40, textAlign: "center" }}>
          <div className="font-pixel" style={{ fontSize: 12, color: "#888", marginBottom: 16 }}>
            {"Log in to view messages"}
          </div>
          <Link href="/login">
            <button className="nes-btn is-primary" style={{ fontSize: 10, padding: "8px 20px" }}>
              {"Log In"}
            </button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
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
          VIBEXFORGE://MESSAGES v1.0
        </span>
      </div>

      {/* Main container */}
      <div
        className="rpgui-container framed"
        style={{ minHeight: "70vh", padding: 0, position: "relative", overflow: "hidden" }}
      >
        {/* Scanline */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "repeating-linear-gradient(0deg, transparent 0, transparent 2px, rgba(0,0,0,0.08) 2px, rgba(0,0,0,0.08) 4px)",
            pointerEvents: "none",
            zIndex: 1,
          }}
        />

        <div style={{ position: "relative", zIndex: 2, display: "flex", height: "calc(70vh - 20px)" }}>
          {/* Conversation list */}
          <div
            style={{
              width: 220,
              borderRight: "2px solid #2A2A30",
              overflow: "auto",
              flexShrink: 0,
            }}
          >
            <div className="font-pixel" style={{ fontSize: 10, color: "#9D00FF", padding: "12px 12px 8px" }}>
              {"> Conversations"}
            </div>

            {loading && (
              <div className="font-pixel" style={{ fontSize: 8, color: "#555", padding: 12 }}>
                LOADING...
              </div>
            )}

            {!loading && conversations.length === 0 && (
              <div className="font-pixel" style={{ fontSize: 7, color: "#555", padding: 12 }}>
                {"No conversations yet"}
              </div>
            )}

            {conversations.map((conv) => (
              <button
                key={conv.id}
                onClick={() => setActiveConv(conv.id)}
                style={{
                  display: "block",
                  width: "100%",
                  padding: "10px 12px",
                  background: activeConv === conv.id ? "#9D00FF15" : "transparent",
                  border: "none",
                  borderBottom: "1px solid #1A1A1E",
                  cursor: "pointer",
                  textAlign: "left",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span className="font-pixel" style={{ fontSize: 8, color: activeConv === conv.id ? "#9D00FF" : "#E8E8EC" }}>
                    {conv.other_user_name ?? "User"}
                  </span>
                  {(conv.unread ?? 0) > 0 && (
                    <span
                      className="font-pixel"
                      style={{
                        fontSize: 7,
                        color: "#0D0D0D",
                        background: "#FF4500",
                        padding: "0 4px",
                        minWidth: 14,
                        textAlign: "center",
                      }}
                    >
                      {conv.unread}
                    </span>
                  )}
                </div>
                {conv.last_message && (
                  <div className="font-retro" style={{ fontSize: 10, color: "#666", marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {conv.last_message}
                  </div>
                )}
                {conv.last_message_at && (
                  <div className="font-pixel" style={{ fontSize: 6, color: "#444", marginTop: 2 }}>
                    {relativeTime(conv.last_message_at)}
                  </div>
                )}
              </button>
            ))}
          </div>

          {/* Chat area */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
            {!activeConv ? (
              <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <div className="font-pixel" style={{ fontSize: 10, color: "#555" }}>
                  {"Select a conversation"}
                </div>
              </div>
            ) : (
              <>
                {/* Messages */}
                <div style={{ flex: 1, overflow: "auto", padding: 16 }}>
                  {messages.map((msg) => {
                    const isMine = user && msg.sender_id === user.id;
                    return (
                      <motion.div
                        key={msg.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        style={{
                          display: "flex",
                          justifyContent: isMine ? "flex-end" : "flex-start",
                          marginBottom: 8,
                        }}
                      >
                        <div
                          className="retro-card"
                          style={{
                            maxWidth: "70%",
                            padding: "8px 12px",
                            background: isMine ? "#9D00FF20" : "#0A0A0C",
                            border: `1px solid ${isMine ? "#9D00FF40" : "#2A2A30"}`,
                          }}
                        >
                          <div className="font-pixel" style={{ fontSize: 7, color: isMine ? "#9D00FF" : "#FACC15", marginBottom: 4 }}>
                            {msg.sender_name}
                          </div>
                          <div className="font-retro" style={{ fontSize: 13, color: "#E8E8EC", lineHeight: 1.5 }}>
                            {msg.content}
                          </div>
                          <div className="font-pixel" style={{ fontSize: 6, color: "#444", marginTop: 4, textAlign: "right" }}>
                            {relativeTime(msg.created_at)}
                            {isMine && msg.read && " \u2714"}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input bar */}
                <div style={{ padding: "8px 12px", borderTop: "2px solid #2A2A30", display: "flex", gap: 8 }}>
                  <input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
                    placeholder={"Type a message..."}
                    disabled={sending}
                    className="font-retro"
                    style={{
                      flex: 1,
                      background: "#0A0A0C",
                      border: "2px solid #2A2A30",
                      padding: "8px 12px",
                      fontSize: 13,
                      color: "#E8E8EC",
                      outline: "none",
                    }}
                  />
                  <button
                    className="nes-btn is-primary"
                    onClick={handleSend}
                    disabled={!newMessage.trim() || sending}
                    style={{ fontSize: 9, padding: "6px 14px", opacity: !newMessage.trim() ? 0.4 : 1 }}
                  >
                    {sending ? "..." : "Send"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
