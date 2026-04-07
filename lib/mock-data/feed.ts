/**
 * Shared mock data for the Social Feed.
 * Used by both client hooks (lib/feed.ts) and API routes (app/api/feed/).
 */

export interface MockPostRow {
  id: string;
  user_id: string;
  user_name: string;
  user_avatar: string | null;
  content: string;
  project_id: string | null;
  parent_id: string | null;
  likes: number;
  replies_count: number;
  reposts: number;
  created_at: string;
  media_url: string | null;
  media_type: string | null;
  hashtags: string[];
}

export const MOCK_POSTS: MockPostRow[] = [
  {
    id: "post-1",
    user_id: "u1",
    user_name: "PixelMaster",
    user_avatar: null,
    content:
      "Just shipped my first vibe-coded RPG battle system! The AI generated balanced stats on the first try.",
    project_id: "1",
    parent_id: null,
    likes: 24,
    replies_count: 5,
    reposts: 3,
    created_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    media_url: null,
    media_type: null,
    hashtags: [],
  },
  {
    id: "post-2",
    user_id: "u2",
    user_name: "CodeWizard",
    user_avatar: null,
    content: "Hot take: vibe coding is the future of game dev. Fight me.",
    project_id: null,
    parent_id: null,
    likes: 42,
    replies_count: 12,
    reposts: 8,
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    media_url: null,
    media_type: null,
    hashtags: [],
  },
  {
    id: "post-3",
    user_id: "u3",
    user_name: "NeonHacker",
    user_avatar: null,
    content:
      "My AI agent just evolved to level 5! The evolution mechanic in VibeCode Hunt is addictive.",
    project_id: "2",
    parent_id: null,
    likes: 18,
    replies_count: 3,
    reposts: 1,
    created_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    media_url: null,
    media_type: null,
    hashtags: [],
  },
  {
    id: "post-4",
    user_id: "u4",
    user_name: "RetroQueen",
    user_avatar: null,
    content:
      "Anyone else notice the 16-bit aesthetic pairs perfectly with procedural generation? Sharing my tileset generator soon.",
    project_id: null,
    parent_id: null,
    likes: 31,
    replies_count: 7,
    reposts: 5,
    created_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    media_url: null,
    media_type: null,
    hashtags: [],
  },
  {
    id: "post-5",
    user_id: "u5",
    user_name: "AITrainer",
    user_avatar: null,
    content:
      "Tip: use chain-of-thought prompting when generating NPC dialogue. The results are way more natural.",
    project_id: "3",
    parent_id: null,
    likes: 15,
    replies_count: 2,
    reposts: 4,
    created_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    media_url: null,
    media_type: null,
    hashtags: [],
  },
  {
    id: "post-6",
    user_id: "u6",
    user_name: "SpriteKing",
    user_avatar: null,
    content:
      "Just launched a marketplace listing for my pixel art pack. 200+ sprites, all AI-assisted. Link in my profile!",
    project_id: null,
    parent_id: null,
    likes: 9,
    replies_count: 1,
    reposts: 2,
    created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    media_url: null,
    media_type: null,
    hashtags: [],
  },
];
