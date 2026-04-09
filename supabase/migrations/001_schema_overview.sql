-- Public stub — full implementation is proprietary. See LICENSE.
-- Schema overview: CREATE TABLE statements only (no data, no RLS, no functions, no triggers).

-- ═══════════════════════════════════════════════════════════════
-- CREATORS
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE creators (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  avatar TEXT,
  bio TEXT NOT NULL DEFAULT '',
  rank INTEGER NOT NULL DEFAULT 0,
  weekly_growth NUMERIC(5,2) NOT NULL DEFAULT 0,
  joined_at DATE NOT NULL DEFAULT CURRENT_DATE,
  badges TEXT[] NOT NULL DEFAULT '{}',
  auth_user_id UUID,
  follower_count INTEGER NOT NULL DEFAULT 0,
  following_count INTEGER NOT NULL DEFAULT 0,
  total_followers INTEGER NOT NULL DEFAULT 0,
  github_url TEXT,
  twitter_url TEXT,
  website_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ═══════════════════════════════════════════════════════════════
-- PROJECTS
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE projects (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  tagline TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  category TEXT NOT NULL,
  creator_id TEXT NOT NULL REFERENCES creators(id) ON DELETE CASCADE,
  tags TEXT[] NOT NULL DEFAULT '{}',
  thumbnail TEXT NOT NULL DEFAULT '',
  views INTEGER NOT NULL DEFAULT 0,
  upvotes INTEGER NOT NULL DEFAULT 0,
  plays INTEGER NOT NULL DEFAULT 0,
  shares INTEGER NOT NULL DEFAULT 0,
  remix_count INTEGER NOT NULL DEFAULT 0,
  score INTEGER NOT NULL DEFAULT 0,
  featured BOOLEAN NOT NULL DEFAULT FALSE,
  demo_type TEXT NOT NULL DEFAULT 'preview',
  demo_url TEXT,
  demo_content TEXT,
  parent_id TEXT REFERENCES projects(id) ON DELETE SET NULL,
  viral_boosted BOOLEAN NOT NULL DEFAULT FALSE,
  evolution_stage TEXT DEFAULT 'Seed',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ═══════════════════════════════════════════════════════════════
-- BEHAVIOR SCORES
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE behavior_scores (
  project_id TEXT PRIMARY KEY REFERENCES projects(id) ON DELETE CASCADE,
  plays INTEGER NOT NULL DEFAULT 0,
  avg_stay_seconds NUMERIC(8,2) NOT NULL DEFAULT 0,
  share_rate NUMERIC(5,4) NOT NULL DEFAULT 0,
  remix_count INTEGER NOT NULL DEFAULT 0,
  ai_score INTEGER NOT NULL DEFAULT 0,
  compound NUMERIC(8,2) NOT NULL DEFAULT 0
);

-- ═══════════════════════════════════════════════════════════════
-- AI REVIEWS
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE ai_reviews (
  project_id TEXT PRIMARY KEY REFERENCES projects(id) ON DELETE CASCADE,
  originality INTEGER NOT NULL DEFAULT 0,
  clarity INTEGER NOT NULL DEFAULT 0,
  ux_potential INTEGER NOT NULL DEFAULT 0,
  virality_potential INTEGER NOT NULL DEFAULT 0,
  investor_curiosity INTEGER NOT NULL DEFAULT 0,
  strengths TEXT[] NOT NULL DEFAULT '{}',
  weaknesses TEXT[] NOT NULL DEFAULT '{}',
  suggestions TEXT[] NOT NULL DEFAULT '{}'
);

-- ═══════════════════════════════════════════════════════════════
-- IDEAS
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE ideas (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  creator_name TEXT NOT NULL,
  category TEXT NOT NULL,
  upvotes INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'idea',
  launched_project_id TEXT REFERENCES projects(id) ON DELETE SET NULL,
  eval_viability INTEGER NOT NULL DEFAULT 0,
  eval_market_fit INTEGER NOT NULL DEFAULT 0,
  eval_competition TEXT NOT NULL DEFAULT 'low',
  eval_uniqueness INTEGER NOT NULL DEFAULT 0,
  eval_difficulty TEXT NOT NULL DEFAULT 'medium',
  eval_suggestions TEXT[] NOT NULL DEFAULT '{}',
  eval_similar_projects TEXT[] NOT NULL DEFAULT '{}',
  eval_estimated_category TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ═══════════════════════════════════════════════════════════════
-- EVENTS
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE events (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  type TEXT NOT NULL,
  date TEXT NOT NULL,
  location TEXT NOT NULL,
  organizer TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  is_online BOOLEAN NOT NULL DEFAULT FALSE,
  featured BOOLEAN NOT NULL DEFAULT FALSE,
  image TEXT,
  top_project_ids TEXT[] NOT NULL DEFAULT '{}',
  ai_generated_topics TEXT[] NOT NULL DEFAULT '{}',
  participant_count INTEGER DEFAULT 0,
  status TEXT DEFAULT 'upcoming',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ═══════════════════════════════════════════════════════════════
-- TREND INSIGHTS
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE trend_insights (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  type TEXT NOT NULL,
  signal TEXT NOT NULL,
  summary TEXT NOT NULL DEFAULT '',
  momentum INTEGER NOT NULL DEFAULT 0,
  confidence INTEGER NOT NULL DEFAULT 0,
  category TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ═══════════════════════════════════════════════════════════════
-- WEEKLY WINNERS
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE weekly_winners (
  id SERIAL PRIMARY KEY,
  week TEXT NOT NULL,
  project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  project_title TEXT NOT NULL,
  creator_name TEXT NOT NULL,
  score INTEGER NOT NULL DEFAULT 0,
  category TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ═══════════════════════════════════════════════════════════════
-- BATTLE HISTORY
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE battle_history (
  id TEXT PRIMARY KEY,
  challenger_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  defender_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  winner_id TEXT NOT NULL,
  rounds JSONB NOT NULL DEFAULT '[]',
  exp_gained_challenger INTEGER NOT NULL DEFAULT 0,
  exp_gained_defender INTEGER NOT NULL DEFAULT 0,
  user_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ═══════════════════════════════════════════════════════════════
-- FUNDING
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE funding (
  project_id TEXT PRIMARY KEY REFERENCES projects(id) ON DELETE CASCADE,
  goal INTEGER NOT NULL DEFAULT 0,
  raised INTEGER NOT NULL DEFAULT 0,
  donors INTEGER NOT NULL DEFAULT 0,
  vc_interest INTEGER NOT NULL DEFAULT 0
);

-- ═══════════════════════════════════════════════════════════════
-- USER UPVOTES
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE user_upvotes (
  user_id UUID NOT NULL,
  project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, project_id)
);

-- ═══════════════════════════════════════════════════════════════
-- COMMENTS
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE comments (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  parent_id TEXT REFERENCES comments(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  likes INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ═══════════════════════════════════════════════════════════════
-- COMMENT LIKES
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE comment_likes (
  user_id UUID NOT NULL,
  comment_id TEXT NOT NULL REFERENCES comments(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, comment_id)
);

-- ═══════════════════════════════════════════════════════════════
-- FOLLOWS
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE follows (
  follower_id UUID NOT NULL,
  following_id TEXT NOT NULL REFERENCES creators(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (follower_id, following_id)
);

-- ═══════════════════════════════════════════════════════════════
-- NOTIFICATIONS
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE notifications (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL,
  type TEXT NOT NULL,
  title TEXT,
  body TEXT,
  link TEXT,
  read BOOLEAN NOT NULL DEFAULT FALSE,
  actor_id UUID,
  actor_name TEXT,
  actor_avatar TEXT,
  project_id TEXT REFERENCES projects(id) ON DELETE SET NULL,
  post_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ═══════════════════════════════════════════════════════════════
-- WORKFLOWS
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE workflows (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  steps JSONB NOT NULL DEFAULT '[]',
  creator_id TEXT REFERENCES creators(id) ON DELETE SET NULL,
  is_public BOOLEAN NOT NULL DEFAULT TRUE,
  runs INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ═══════════════════════════════════════════════════════════════
-- AGENT DEFINITIONS
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE agent_definitions (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  version TEXT NOT NULL DEFAULT '1.0.0',
  creator_id TEXT REFERENCES creators(id) ON DELETE SET NULL,
  creator_name TEXT NOT NULL DEFAULT '',
  system_prompt TEXT NOT NULL DEFAULT '',
  model TEXT NOT NULL DEFAULT 'claude-haiku-4-5',
  temperature NUMERIC(3,2) NOT NULL DEFAULT 0.7,
  max_tokens INTEGER NOT NULL DEFAULT 4000,
  tools TEXT[] NOT NULL DEFAULT '{}',
  input_schema JSONB NOT NULL DEFAULT '{"type":"text"}',
  output_schema JSONB NOT NULL DEFAULT '{"type":"text"}',
  category TEXT NOT NULL DEFAULT 'other',
  tags TEXT[] NOT NULL DEFAULT '{}',
  is_public BOOLEAN NOT NULL DEFAULT TRUE,
  featured BOOLEAN NOT NULL DEFAULT FALSE,
  runs INTEGER NOT NULL DEFAULT 0,
  avg_latency_ms INTEGER NOT NULL DEFAULT 0,
  success_rate NUMERIC(5,2) NOT NULL DEFAULT 0,
  upvotes INTEGER NOT NULL DEFAULT 0,
  forks INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ═══════════════════════════════════════════════════════════════
-- USER EXP & BUDDIES
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE user_exp (
  user_id UUID PRIMARY KEY,
  total_exp INTEGER NOT NULL DEFAULT 0,
  daily_login_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE user_buddies (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL,
  buddy_type_id TEXT NOT NULL,
  nickname TEXT,
  level INTEGER NOT NULL DEFAULT 1,
  exp INTEGER NOT NULL DEFAULT 0,
  happiness INTEGER NOT NULL DEFAULT 100,
  is_active BOOLEAN NOT NULL DEFAULT FALSE,
  obtained_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE exp_log (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL,
  action TEXT NOT NULL,
  exp_gained INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ═══════════════════════════════════════════════════════════════
-- WEBHOOKS
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE webhooks (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL,
  url TEXT NOT NULL,
  secret TEXT NOT NULL,
  events TEXT[] NOT NULL DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  last_triggered_at TIMESTAMPTZ,
  failure_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE webhook_logs (
  id SERIAL PRIMARY KEY,
  webhook_id TEXT NOT NULL REFERENCES webhooks(id) ON DELETE CASCADE,
  event TEXT NOT NULL,
  payload JSONB NOT NULL,
  response_status INTEGER,
  response_body TEXT,
  duration_ms INTEGER,
  success BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ═══════════════════════════════════════════════════════════════
-- CHAT MESSAGES (project live chat)
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE chat_messages (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID,
  user_name TEXT NOT NULL DEFAULT 'Anonymous',
  user_avatar TEXT,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ═══════════════════════════════════════════════════════════════
-- SOCIAL FEED: POSTS
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE posts (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL,
  user_name TEXT NOT NULL,
  user_avatar TEXT,
  content TEXT NOT NULL,
  project_id TEXT REFERENCES projects(id) ON DELETE SET NULL,
  parent_id TEXT REFERENCES posts(id) ON DELETE CASCADE,
  likes INTEGER NOT NULL DEFAULT 0,
  replies_count INTEGER NOT NULL DEFAULT 0,
  reposts INTEGER NOT NULL DEFAULT 0,
  media_url TEXT,
  media_type TEXT,
  mentions TEXT[] DEFAULT '{}',
  hashtags TEXT[] DEFAULT '{}',
  moderation_status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE post_likes (
  user_id UUID NOT NULL,
  post_id TEXT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, post_id)
);

CREATE TABLE post_reactions (
  user_id UUID NOT NULL,
  post_id TEXT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  reaction_type TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, post_id, reaction_type)
);

-- ═══════════════════════════════════════════════════════════════
-- CREATOR XP PROFILES
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE creator_profiles (
  user_id UUID PRIMARY KEY,
  user_name TEXT NOT NULL,
  xp INTEGER NOT NULL DEFAULT 0,
  skills TEXT[] DEFAULT '{}',
  active_streak INTEGER DEFAULT 0,
  total_launches INTEGER DEFAULT 0,
  success_rate FLOAT DEFAULT 0,
  growth_velocity FLOAT DEFAULT 0,
  top_category TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE xp_awards (
  id TEXT PRIMARY KEY,
  recipient_id UUID NOT NULL,
  actor_id UUID NOT NULL,
  post_id TEXT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  reaction_type TEXT NOT NULL,
  xp_amount INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ═══════════════════════════════════════════════════════════════
-- CONTENT MODERATION
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE post_reports (
  id TEXT PRIMARY KEY,
  post_id TEXT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  reporter_id UUID NOT NULL,
  reason TEXT NOT NULL,
  details TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ
);

CREATE TABLE content_filters (
  id SERIAL PRIMARY KEY,
  pattern TEXT NOT NULL UNIQUE,
  action TEXT NOT NULL DEFAULT 'flag',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ═══════════════════════════════════════════════════════════════
-- AGENT MARKETPLACE: REVIEWS, INSTALLS, VERSIONS
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE agent_reviews (
  id TEXT PRIMARY KEY,
  agent_id TEXT NOT NULL,
  user_id UUID NOT NULL,
  user_name TEXT NOT NULL,
  rating INTEGER NOT NULL,
  content TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE agent_installs (
  id TEXT PRIMARY KEY,
  agent_id TEXT NOT NULL,
  user_id UUID NOT NULL,
  installed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE agent_versions (
  id TEXT PRIMARY KEY,
  agent_id TEXT NOT NULL,
  version TEXT NOT NULL,
  changelog TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ═══════════════════════════════════════════════════════════════
-- ARENA: SEASONS, REPLAYS, LEADERBOARD
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE arena_seasons (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL DEFAULT 'upcoming',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE battle_replays (
  id TEXT PRIMARY KEY,
  battle_id TEXT NOT NULL,
  season_id TEXT REFERENCES arena_seasons(id),
  project_a_id TEXT NOT NULL,
  project_a_name TEXT NOT NULL,
  project_b_id TEXT NOT NULL,
  project_b_name TEXT NOT NULL,
  winner_id TEXT,
  rounds JSONB NOT NULL DEFAULT '[]',
  spectator_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE season_leaderboard (
  id TEXT PRIMARY KEY,
  season_id TEXT NOT NULL REFERENCES arena_seasons(id) ON DELETE CASCADE,
  project_id TEXT NOT NULL,
  project_name TEXT NOT NULL,
  creator_name TEXT NOT NULL,
  wins INTEGER NOT NULL DEFAULT 0,
  losses INTEGER NOT NULL DEFAULT 0,
  draws INTEGER NOT NULL DEFAULT 0,
  rating INTEGER NOT NULL DEFAULT 1000,
  rank INTEGER,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ═══════════════════════════════════════════════════════════════
-- BUDDY EVOLUTION, INTERACTIONS, TRADING
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE buddy_evolutions (
  id TEXT PRIMARY KEY,
  base_type_id TEXT NOT NULL,
  evolved_type_id TEXT NOT NULL,
  required_level INTEGER NOT NULL,
  required_affinity INTEGER NOT NULL DEFAULT 0,
  evolution_name TEXT NOT NULL,
  evolution_name_zh TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE buddy_interactions (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL,
  buddy_id TEXT NOT NULL,
  action TEXT NOT NULL,
  affinity_gained INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE buddy_trades (
  id TEXT PRIMARY KEY,
  seller_id UUID NOT NULL,
  buyer_id UUID,
  buddy_id TEXT NOT NULL,
  buddy_type_id TEXT NOT NULL,
  buddy_name TEXT NOT NULL,
  buddy_level INTEGER NOT NULL,
  price_xp INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'listed',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  sold_at TIMESTAMPTZ
);

-- ═══════════════════════════════════════════════════════════════
-- DIRECT MESSAGES
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE dm_conversations (
  id TEXT PRIMARY KEY,
  user_a_id UUID NOT NULL,
  user_b_id UUID NOT NULL,
  last_message_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE dm_messages (
  id TEXT PRIMARY KEY,
  conversation_id TEXT NOT NULL REFERENCES dm_conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL,
  sender_name TEXT NOT NULL,
  content TEXT NOT NULL,
  read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ═══════════════════════════════════════════════════════════════
-- USER BANS
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE user_bans (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL,
  banned_by UUID NOT NULL,
  reason TEXT NOT NULL,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  lifted_at TIMESTAMPTZ,
  lifted_by UUID
);

-- ═══════════════════════════════════════════════════════════════
-- PROJECT ANALYTICS
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE project_events (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL,
  event_type TEXT NOT NULL,
  user_id UUID,
  referrer TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ═══════════════════════════════════════════════════════════════
-- DATA MOAT: CREATOR GRAPH + PRODUCT GRAPH + GROWTH DATA
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE creator_connections (
  id TEXT PRIMARY KEY,
  from_user_id UUID NOT NULL,
  to_user_id UUID NOT NULL,
  connection_type TEXT NOT NULL,
  strength INTEGER NOT NULL DEFAULT 1,
  last_interaction_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE product_signals (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL,
  signal_type TEXT NOT NULL,
  score FLOAT NOT NULL,
  details JSONB,
  measured_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE product_comparisons (
  id TEXT PRIMARY KEY,
  project_a_id TEXT NOT NULL,
  project_b_id TEXT NOT NULL,
  comparison JSONB NOT NULL,
  generated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE launch_outcomes (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL,
  launch_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  channels_used TEXT[] DEFAULT '{}',
  copy_style TEXT,
  title_length INTEGER,
  has_demo BOOLEAN DEFAULT false,
  has_video BOOLEAN DEFAULT false,
  day1_views INTEGER DEFAULT 0,
  day7_views INTEGER DEFAULT 0,
  day30_views INTEGER DEFAULT 0,
  day1_upvotes INTEGER DEFAULT 0,
  day7_upvotes INTEGER DEFAULT 0,
  conversion_rate FLOAT DEFAULT 0,
  category TEXT,
  tags TEXT[] DEFAULT '{}'
);

CREATE TABLE growth_patterns (
  id TEXT PRIMARY KEY,
  pattern_name TEXT NOT NULL UNIQUE,
  pattern_type TEXT NOT NULL,
  description TEXT NOT NULL,
  evidence_count INTEGER NOT NULL DEFAULT 0,
  avg_impact FLOAT NOT NULL DEFAULT 0,
  confidence FLOAT NOT NULL DEFAULT 0,
  details JSONB,
  discovered_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ═══════════════════════════════════════════════════════════════
-- USER ROLES
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE user_roles (
  user_id UUID PRIMARY KEY,
  role TEXT NOT NULL DEFAULT 'user',
  granted_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ═══════════════════════════════════════════════════════════════
-- SHARE EVENTS
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE share_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id TEXT NOT NULL,
  event_type TEXT NOT NULL,
  platform TEXT,
  referrer TEXT,
  ip_hash TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
