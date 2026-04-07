"use client";

import { useState, useEffect } from "react";
import { supabase } from "./supabase";
import { MOCK_POSTS as RAW_MOCK_POSTS } from "./mock-data/feed";

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

// Map shared mock data to client FeedPost shape
const MOCK_POSTS: FeedPost[] = RAW_MOCK_POSTS.map((r) => ({
  id: r.id,
  userId: r.user_id,
  userName: r.user_name,
  userAvatar: r.user_avatar ?? undefined,
  content: r.content,
  projectId: r.project_id ?? undefined,
  parentId: r.parent_id ?? undefined,
  likes: r.likes,
  repliesCount: r.replies_count,
  reposts: r.reposts,
  createdAt: r.created_at,
}));

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
  const [bufferedPosts, setBufferedPosts] = useState<FeedPost[]>([]);

  const refetch = () => {
    setError(null);
    setLoading(true);
    setFetchKey((k) => k + 1);
  };

  /** Flush buffered posts into the main list */
  const flushBuffered = () => {
    setPosts((prev) => {
      const existingIds = new Set(prev.map((p) => p.id));
      const newOnes = bufferedPosts.filter((p) => !existingIds.has(p.id));
      return [...newOnes, ...prev];
    });
    setBufferedPosts([]);
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
          // Buffer new top-level posts instead of prepending directly.
          // The toast will show the count and flush on click.
          if (!newPost.parentId) {
            setBufferedPosts((prev) => {
              if (prev.some((p) => p.id === newPost.id)) return prev;
              return [newPost, ...prev];
            });
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

  return { posts, loading, error, connected, refetch, bufferedPosts, flushBuffered };
}
