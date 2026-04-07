"use client";

import { useState, useEffect } from "react";
import { supabase } from "./supabase";

export type FeedTab = "following" | "trending" | "latest";

export interface FeedPost {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string;
  projectId?: string;
  parentId?: string;
  likes: number;
  repliesCount: number;
  reposts: number;
  createdAt: string;
}

const USE_SUPABASE = !!(
  typeof window !== "undefined" &&
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const MOCK_POSTS: FeedPost[] = [
  {
    id: "post-1",
    userId: "u1",
    userName: "PixelMaster",
    content: "Just shipped my first vibe-coded RPG battle system! The AI generated balanced stats on the first try.",
    projectId: "1",
    likes: 24,
    repliesCount: 5,
    reposts: 3,
    createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
  },
  {
    id: "post-2",
    userId: "u2",
    userName: "CodeWizard",
    content: "Hot take: vibe coding is the future of game dev. Fight me.",
    likes: 42,
    repliesCount: 12,
    reposts: 8,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "post-3",
    userId: "u3",
    userName: "NeonHacker",
    content: "My AI agent just evolved to level 5! The evolution mechanic in VibeCode Hunt is addictive.",
    projectId: "2",
    likes: 18,
    repliesCount: 3,
    reposts: 1,
    createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "post-4",
    userId: "u4",
    userName: "RetroQueen",
    content: "Anyone else notice the 16-bit aesthetic pairs perfectly with procedural generation? Sharing my tileset generator soon.",
    likes: 31,
    repliesCount: 7,
    reposts: 5,
    createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "post-5",
    userId: "u5",
    userName: "AITrainer",
    content: "Tip: use chain-of-thought prompting when generating NPC dialogue. The results are way more natural.",
    projectId: "3",
    likes: 15,
    repliesCount: 2,
    reposts: 4,
    createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "post-6",
    userId: "u6",
    userName: "SpriteKing",
    content: "Just launched a marketplace listing for my pixel art pack. 200+ sprites, all AI-assisted. Link in my profile!",
    likes: 9,
    repliesCount: 1,
    reposts: 2,
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  },
];

function mapRow(row: Record<string, unknown>): FeedPost {
  return {
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
  };
}

function sortMockPosts(tab: FeedTab, posts: FeedPost[]): FeedPost[] {
  const copy = [...posts];
  if (tab === "trending") {
    return copy.sort((a, b) => b.likes - a.likes);
  }
  // "latest" and "following" both sort by date
  return copy.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}

/**
 * Real-time feed hook with tab-based ordering
 */
export function useRealtimeFeed(tab: FeedTab) {
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [connected, setConnected] = useState(false);
  const [fetchKey, setFetchKey] = useState(0);

  const refetch = () => {
    setError(null);
    setLoading(true);
    setFetchKey((k) => k + 1);
  };

  useEffect(() => {
    setError(null);

    // --- Mock fallback ---
    if (!USE_SUPABASE) {
      setPosts(sortMockPosts(tab, MOCK_POSTS));
      setLoading(false);
      setConnected(true);
      return;
    }

    // --- Supabase fetch ---
    let query = supabase
      .from("posts")
      .select("*")
      .is("parent_id", null)
      .limit(20);

    if (tab === "trending") {
      query = query.order("likes", { ascending: false }).order("created_at", { ascending: false });
    } else {
      query = query.order("created_at", { ascending: false });
    }

    query.then(({ data, error: fetchError }) => {
      if (fetchError) {
        setError(fetchError.message);
        setLoading(false);
        return;
      }
      if (data) {
        setPosts(data.map(mapRow));
      }
      setLoading(false);
    });

    // --- Real-time subscription ---
    const channel = supabase
      .channel(`feed-${tab}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "posts" },
        (payload) => {
          const newPost = mapRow(payload.new);
          // Only add top-level posts to the feed
          if (!newPost.parentId) {
            setPosts((prev) => [newPost, ...prev]);
          }
        },
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "posts" },
        (payload) => {
          const updated = mapRow(payload.new);
          setPosts((prev) =>
            prev.map((p) => (p.id === updated.id ? updated : p)),
          );
        },
      )
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: "posts" },
        (payload) => {
          const deletedId = (payload.old as Record<string, unknown>).id as string;
          setPosts((prev) => prev.filter((p) => p.id !== deletedId));
        },
      )
      .subscribe((status) => {
        setConnected(status === "SUBSCRIBED");
      });

    return () => {
      supabase.removeChannel(channel);
      setConnected(false);
    };
  }, [tab, fetchKey]);

  return { posts, loading, error, connected, refetch };
}
