"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "./supabase";
import { useAuth } from "./auth";

export interface ChatMessage {
  id: string;
  projectId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string;
  createdAt: string;
}

const USE_SUPABASE = !!(
  typeof window !== "undefined" &&
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// Mock messages for when Supabase is not configured
const MOCK_MESSAGES: ChatMessage[] = [
  { id: "m1", projectId: "1", userId: "u1", userName: "Alex", content: "This project is so cool! The translation quality is impressive", createdAt: new Date(Date.now() - 300000).toISOString() },
  { id: "m2", projectId: "1", userId: "u2", userName: "Yuki", content: "Agreed! Especially the sentiment detection part, very accurate", createdAt: new Date(Date.now() - 180000).toISOString() },
  { id: "m3", projectId: "1", userId: "u3", userName: "Sarah", content: "Thanks for the feedback everyone! Adding more language support next week", createdAt: new Date(Date.now() - 60000).toISOString() },
];

/**
 * Real-time chat hook for a project
 */
export function useProjectChat(projectId: string) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [connected, setConnected] = useState(false);
  const { user } = useAuth();

  // Fetch initial messages
  const fetchMessages = useCallback(async () => {
    if (!USE_SUPABASE) {
      setMessages(MOCK_MESSAGES.filter(m => m.projectId === projectId));
      setLoading(false);
      setConnected(true);
      return;
    }

    const { data } = await supabase
      .from("chat_messages")
      .select("*")
      .eq("project_id", projectId)
      .order("created_at", { ascending: true })
      .limit(100);
    if (data) {
      setMessages(data.map(mapMessage));
    }
    setLoading(false);
  }, [projectId]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void fetchMessages();

    if (!USE_SUPABASE) return;

    // Subscribe to new messages
    const channel = supabase
      .channel(`chat-${projectId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "chat_messages", filter: `project_id=eq.${projectId}` },
        (payload) => {
          setMessages(prev => [...prev, mapMessage(payload.new)]);
        }
      )
      .subscribe((status) => {
        setConnected(status === "SUBSCRIBED");
      });

    return () => { supabase.removeChannel(channel); };
  }, [projectId, fetchMessages]);

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim()) return;

    if (!USE_SUPABASE) {
      // Mock: add message locally
      const msg: ChatMessage = {
        id: `m-${Date.now()}`,
        projectId,
        userId: user?.id || "anonymous",
        userName: user?.user_metadata?.full_name as string || user?.email?.split("@")[0] || "Anonymous",
        content: content.trim(),
        createdAt: new Date().toISOString(),
      };
      setMessages(prev => [...prev, msg]);
      return;
    }

    await supabase.from("chat_messages").insert({
      project_id: projectId,
      user_id: user?.id,
      user_name: user?.user_metadata?.full_name || user?.email?.split("@")[0] || "Anonymous",
      user_avatar: user?.user_metadata?.avatar_url || null,
      content: content.trim(),
    });
  }, [projectId, user]);

  return { messages, loading, connected, sendMessage };
}

function mapMessage(row: Record<string, unknown>): ChatMessage {
  return {
    id: row.id as string,
    projectId: row.project_id as string,
    userId: row.user_id as string,
    userName: row.user_name as string,
    userAvatar: row.user_avatar as string | undefined,
    content: row.content as string,
    createdAt: row.created_at as string,
  };
}
