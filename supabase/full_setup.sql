-- VibeX - Full Database Schema
-- Run this in Supabase SQL Editor to create all tables

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
  category TEXT NOT NULL CHECK (category IN ('AI Agent', 'AI Tool', 'AI Game', 'AI Workflow', 'AI Utility', 'Experimental', 'Demo')),
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
  demo_type TEXT NOT NULL CHECK (demo_type IN ('chat', 'sandbox', 'preview', 'embedded')) DEFAULT 'preview',
  demo_url TEXT,
  demo_content TEXT,
  parent_id TEXT REFERENCES projects(id) ON DELETE SET NULL,
  viral_boosted BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_projects_category ON projects(category);
CREATE INDEX idx_projects_creator ON projects(creator_id);
CREATE INDEX idx_projects_score ON projects(score DESC);
CREATE INDEX idx_projects_created ON projects(created_at DESC);
CREATE INDEX idx_projects_featured ON projects(featured) WHERE featured = TRUE;

-- ═══════════════════════════════════════════════════════════════
-- BEHAVIOR SCORES (per project)
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
-- AI REVIEWS (per project)
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
  status TEXT NOT NULL CHECK (status IN ('idea', 'in-progress', 'launched')) DEFAULT 'idea',
  launched_project_id TEXT REFERENCES projects(id) ON DELETE SET NULL,
  -- AI evaluation fields (inline for simplicity)
  eval_viability INTEGER NOT NULL DEFAULT 0,
  eval_market_fit INTEGER NOT NULL DEFAULT 0,
  eval_competition TEXT NOT NULL CHECK (eval_competition IN ('low', 'moderate', 'high', 'saturated')) DEFAULT 'low',
  eval_uniqueness INTEGER NOT NULL DEFAULT 0,
  eval_difficulty TEXT NOT NULL CHECK (eval_difficulty IN ('easy', 'medium', 'hard', 'expert')) DEFAULT 'medium',
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
  type TEXT NOT NULL CHECK (type IN ('hackathon', 'salon', 'meetup', 'demo-day')),
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
  status TEXT CHECK (status IN ('upcoming', 'live', 'completed')) DEFAULT 'upcoming',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ═══════════════════════════════════════════════════════════════
-- TREND INSIGHTS
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE trend_insights (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('rising', 'saturated', 'opportunity', 'emerging')),
  signal TEXT NOT NULL CHECK (signal IN ('strong', 'moderate', 'early')),
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

CREATE UNIQUE INDEX idx_weekly_winners_week ON weekly_winners(week);

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
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_battles_challenger ON battle_history(challenger_id);
CREATE INDEX idx_battles_defender ON battle_history(defender_id);
CREATE INDEX idx_battles_created ON battle_history(created_at DESC);

-- ═══════════════════════════════════════════════════════════════
-- FUNDING INFO (per project, optional)
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE funding (
  project_id TEXT PRIMARY KEY REFERENCES projects(id) ON DELETE CASCADE,
  goal INTEGER NOT NULL DEFAULT 0,
  raised INTEGER NOT NULL DEFAULT 0,
  donors INTEGER NOT NULL DEFAULT 0,
  vc_interest INTEGER NOT NULL DEFAULT 0
);

-- ═══════════════════════════════════════════════════════════════
-- AUTO-UPDATE TIMESTAMPS
-- ═══════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_creators_updated BEFORE UPDATE ON creators FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_projects_updated BEFORE UPDATE ON projects FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ═══════════════════════════════════════════════════════════════
-- ROW LEVEL SECURITY (basic - public read)
-- ═══════════════════════════════════════════════════════════════

ALTER TABLE creators ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE behavior_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE ideas ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE trend_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE weekly_winners ENABLE ROW LEVEL SECURITY;
ALTER TABLE battle_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE funding ENABLE ROW LEVEL SECURITY;

-- Public read access for all tables
CREATE POLICY "Public read" ON creators FOR SELECT USING (true);
CREATE POLICY "Public read" ON projects FOR SELECT USING (true);
CREATE POLICY "Public read" ON behavior_scores FOR SELECT USING (true);
CREATE POLICY "Public read" ON ai_reviews FOR SELECT USING (true);
CREATE POLICY "Public read" ON ideas FOR SELECT USING (true);
CREATE POLICY "Public read" ON events FOR SELECT USING (true);
CREATE POLICY "Public read" ON trend_insights FOR SELECT USING (true);
CREATE POLICY "Public read" ON weekly_winners FOR SELECT USING (true);
CREATE POLICY "Public read" ON battle_history FOR SELECT USING (true);
CREATE POLICY "Public read" ON funding FOR SELECT USING (true);

-- Public insert for battle history (anyone can battle)
CREATE POLICY "Public insert battles" ON battle_history FOR INSERT WITH CHECK (true);

-- Public insert for ideas (anyone can submit)
CREATE POLICY "Public insert ideas" ON ideas FOR INSERT WITH CHECK (true);

-- ═══════════════════════════════════════════════════════════════
-- SEED DATA (auto-generated from mock-data.ts)
-- ═══════════════════════════════════════════════════════════════

-- Creators
INSERT INTO creators (id, name, avatar, bio, rank, weekly_growth, joined_at, badges) VALUES ('c1', 'Sarah Chen', NULL, 'NLP researcher turned indie builder. Obsessed with making AI communication feel human.', 4, 12.5, '2025-11-15', ARRAY['pioneer']) ON CONFLICT (id) DO NOTHING;
INSERT INTO creators (id, name, avatar, bio, rank, weekly_growth, joined_at, badges) VALUES ('c2', 'Marcus Liu', NULL, 'Serial AI builder. Previously at OpenAI. Building the future of autonomous agents.', 1, 28.3, '2025-09-01', ARRAY['top-creator','weekly-winner','viral']) ON CONFLICT (id) DO NOTHING;
INSERT INTO creators (id, name, avatar, bio, rank, weekly_growth, joined_at, badges) VALUES ('c3', 'Yuki Tanaka', NULL, 'Game dev + AI enthusiast from Tokyo. Making creative tools that spark joy.', 2, 22.1, '2025-10-20', ARRAY['top-creator','remix-king','viral']) ON CONFLICT (id) DO NOTHING;
INSERT INTO creators (id, name, avatar, bio, rank, weekly_growth, joined_at, badges) VALUES ('c4', 'Alex Rivera', NULL, 'Staff engineer by day, vibe coder by night. Building dev tools that actually save time.', 3, 15.7, '2025-12-05', ARRAY['trending']) ON CONFLICT (id) DO NOTHING;
INSERT INTO creators (id, name, avatar, bio, rank, weekly_growth, joined_at, badges) VALUES ('c5', 'Emma Walsh', NULL, 'Designer-developer hybrid. Exploring the intersection of AI and creative workflows.', 7, 8.2, '2026-01-10', ARRAY['pioneer']) ON CONFLICT (id) DO NOTHING;
INSERT INTO creators (id, name, avatar, bio, rank, weekly_growth, joined_at, badges) VALUES ('c6', 'Jin Park', NULL, 'Voice technology expert. Building accessible AI interfaces for everyone.', 8, 5.4, '2026-02-01', '{}') ON CONFLICT (id) DO NOTHING;
INSERT INTO creators (id, name, avatar, bio, rank, weekly_growth, joined_at, badges) VALUES ('c7', 'Priya Sharma', NULL, 'Storyteller and AI engineer. Combining narrative design with generative AI.', 5, 18.9, '2025-11-28', ARRAY['trending','weekly-winner']) ON CONFLICT (id) DO NOTHING;
INSERT INTO creators (id, name, avatar, bio, rank, weekly_growth, joined_at, badges) VALUES ('c8', 'Luna Martinez', NULL, 'Full-stack creator specializing in design-to-code AI. Making frontend magic.', 6, 34.6, '2026-01-22', ARRAY['viral','weekly-winner']) ON CONFLICT (id) DO NOTHING;

-- Projects
INSERT INTO projects (id, title, tagline, description, category, creator_id, tags, thumbnail, views, upvotes, plays, shares, remix_count, score, featured, demo_type, demo_url, demo_content, parent_id, viral_boosted, created_at) VALUES ('1', 'VibeTranslate', 'Real-time AI translation that understands context and emotion', 'VibeTranslate goes beyond word-for-word translation. It uses multi-modal AI to capture tone, cultural nuance, and emotional context — then renders translations that actually feel human. Built with Claude 4 and a custom emotion-detection pipeline, it supports 40+ languages with sub-200ms latency. Perfect for global teams, content creators, and anyone tired of robotic translations.', 'AI Tool', 'c1', ARRAY['NLP','Translation','Real-time','Multi-modal'], '', 12400, 847, 8920, 1340, 12, 94, TRUE, 'chat', 'https://vibetranslate.demo.vibex.app', 'Try typing a sentence to see emotion-aware translation in action.', NULL, TRUE, '2026-04-05') ON CONFLICT (id) DO NOTHING;
INSERT INTO projects (id, title, tagline, description, category, creator_id, tags, thumbnail, views, upvotes, plays, shares, remix_count, score, featured, demo_type, demo_url, demo_content, parent_id, viral_boosted, created_at) VALUES ('2', 'AgentForge', 'Build autonomous AI agents with drag-and-drop workflows', 'AgentForge lets anyone create complex AI agent pipelines without writing code. Connect LLM calls, tool invocations, memory systems, and decision trees through an intuitive visual builder. Export as standalone apps or API endpoints. Already powering 2,000+ agent deployments across startups and enterprises.', 'AI Agent', 'c2', ARRAY['Agents','No-Code','Automation','Workflow'], '', 18200, 1243, 14500, 2870, 45, 97, TRUE, 'sandbox', 'https://agentforge.demo.vibex.app', 'Drag components to build your first agent in 60 seconds.', NULL, TRUE, '2026-04-04') ON CONFLICT (id) DO NOTHING;
INSERT INTO projects (id, title, tagline, description, category, creator_id, tags, thumbnail, views, upvotes, plays, shares, remix_count, score, featured, demo_type, demo_url, demo_content, parent_id, viral_boosted, created_at) VALUES ('3', 'PixelMind', 'AI game engine that generates levels from text descriptions', 'Describe the game level you want, and PixelMind generates playable 2D environments with physics, enemies, and interactive elements. Uses a fine-tuned diffusion model for assets and an LLM-based level designer for layout and mechanics. Currently supports platformer, puzzle, and RPG genres.', 'AI Game', 'c3', ARRAY['Gaming','Generative','Creative','Level-Design'], '', 9800, 672, 7200, 1560, 28, 89, TRUE, 'preview', 'https://pixelmind.demo.vibex.app', 'Type a scene description to generate a playable level.', NULL, FALSE, '2026-04-04') ON CONFLICT (id) DO NOTHING;
INSERT INTO projects (id, title, tagline, description, category, creator_id, tags, thumbnail, views, upvotes, plays, shares, remix_count, score, featured, demo_type, demo_url, demo_content, parent_id, viral_boosted, created_at) VALUES ('4', 'CodeReview AI', 'Senior engineer-level code reviews powered by multi-agent analysis', 'CodeReview AI runs your pull requests through a panel of specialized AI reviewers: security expert, performance optimizer, readability checker, and architecture analyst. Each reviewer provides independent feedback, then a synthesis agent combines insights into actionable, prioritized suggestions. Integrates with GitHub, GitLab, and Bitbucket.', 'AI Workflow', 'c4', ARRAY['DevTools','Code-Review','Multi-Agent','CI/CD'], '', 15600, 1087, 11200, 1890, 18, 93, FALSE, 'chat', 'https://codereview-ai.demo.vibex.app', 'Paste a code snippet to see multi-perspective AI review.', NULL, FALSE, '2026-04-03') ON CONFLICT (id) DO NOTHING;
INSERT INTO projects (id, title, tagline, description, category, creator_id, tags, thumbnail, views, upvotes, plays, shares, remix_count, score, featured, demo_type, demo_url, demo_content, parent_id, viral_boosted, created_at) VALUES ('5', 'DreamBoard', 'AI-powered mood board generator for designers', 'Describe your design vision in natural language and DreamBoard creates curated mood boards with color palettes, typography suggestions, layout references, and AI-generated visual assets. Export directly to Figma. Used by 500+ design teams.', 'AI Tool', 'c5', ARRAY['Design','Creative','Figma','Mood-Board'], '', 8900, 534, 5600, 870, 8, 82, FALSE, 'preview', 'https://dreamboard.demo.vibex.app', 'Describe your aesthetic to generate a mood board.', NULL, FALSE, '2026-04-03') ON CONFLICT (id) DO NOTHING;
INSERT INTO projects (id, title, tagline, description, category, creator_id, tags, thumbnail, views, upvotes, plays, shares, remix_count, score, featured, demo_type, demo_url, demo_content, parent_id, viral_boosted, created_at) VALUES ('6', 'VoiceOS', 'Build voice-first AI apps with one config file', 'VoiceOS is a framework for building voice-controlled AI applications. Define your app''s capabilities in a YAML config, and VoiceOS handles speech recognition, intent parsing, context management, and response generation. Ships with pre-built modules for smart home, productivity, and accessibility.', 'AI Utility', 'c6', ARRAY['Voice','Framework','Accessibility','SDK'], '', 6700, 421, 3800, 520, 5, 78, FALSE, 'chat', NULL, 'Try voice commands to see real-time intent parsing.', NULL, FALSE, '2026-04-02') ON CONFLICT (id) DO NOTHING;
INSERT INTO projects (id, title, tagline, description, category, creator_id, tags, thumbnail, views, upvotes, plays, shares, remix_count, score, featured, demo_type, demo_url, demo_content, parent_id, viral_boosted, created_at) VALUES ('7', 'NarrativeAI', 'Interactive fiction engine powered by adaptive storytelling AI', 'NarrativeAI creates branching, adaptive stories that respond to player choices in real-time. Unlike static choice trees, the AI generates new narrative paths dynamically while maintaining plot coherence, character consistency, and emotional arcs. Built for game studios, educators, and creative writers.', 'AI Game', 'c7', ARRAY['Storytelling','Interactive','Gaming','Creative'], '', 11300, 789, 8400, 1120, 22, 86, FALSE, 'chat', 'https://narrativeai.demo.vibex.app', 'Start an interactive story and make choices to shape the narrative.', '3', FALSE, '2026-04-02') ON CONFLICT (id) DO NOTHING;
INSERT INTO projects (id, title, tagline, description, category, creator_id, tags, thumbnail, views, upvotes, plays, shares, remix_count, score, featured, demo_type, demo_url, demo_content, parent_id, viral_boosted, created_at) VALUES ('8', 'DataSculpt', 'Transform messy data into clean pipelines with natural language', 'DataSculpt watches you describe your data transformation needs and builds production-ready ETL pipelines. Upload CSV, JSON, or connect databases — then describe what you want in plain English. It generates, tests, and deploys data pipelines with monitoring and alerting built in.', 'AI Workflow', 'c4', ARRAY['Data','ETL','Pipeline','No-Code'], '', 7400, 498, 4300, 610, 7, 81, FALSE, 'sandbox', NULL, 'Upload sample data and describe your transformation.', NULL, FALSE, '2026-04-01') ON CONFLICT (id) DO NOTHING;
INSERT INTO projects (id, title, tagline, description, category, creator_id, tags, thumbnail, views, upvotes, plays, shares, remix_count, score, featured, demo_type, demo_url, demo_content, parent_id, viral_boosted, created_at) VALUES ('9', 'SketchToApp', 'Draw UI wireframes and get a working React app instantly', 'SketchToApp converts hand-drawn wireframes into functional React components with Tailwind CSS styling. Take a photo of your whiteboard sketch or draw directly in the app — the AI identifies UI elements, infers layout relationships, and generates clean, responsive code. Exports to Next.js, Vite, or standalone React.', 'AI Tool', 'c8', ARRAY['UI','Code-Gen','Design-to-Code','React'], '', 21000, 1456, 15200, 2950, 38, 96, TRUE, 'preview', 'https://sketchtoapp.demo.vibex.app', 'Upload a sketch to see instant React component generation.', NULL, TRUE, '2026-04-05') ON CONFLICT (id) DO NOTHING;
INSERT INTO projects (id, title, tagline, description, category, creator_id, tags, thumbnail, views, upvotes, plays, shares, remix_count, score, featured, demo_type, demo_url, demo_content, parent_id, viral_boosted, created_at) VALUES ('10', 'EcoTrack AI', 'AI sustainability auditor for your codebase and infrastructure', 'EcoTrack AI analyzes your code, cloud infrastructure, and CI/CD pipelines to estimate carbon footprint and suggest optimizations. Get real-time sustainability scores, identify wasteful compute patterns, and generate ESG-ready reports. Integrates with AWS, GCP, Azure, and Vercel.', 'Experimental', 'c5', ARRAY['Sustainability','Green-Tech','DevOps','Analytics'], '', 4200, 287, 2100, 310, 2, 73, FALSE, 'sandbox', NULL, 'Connect a repo to see your codebase sustainability score.', NULL, FALSE, '2026-04-01') ON CONFLICT (id) DO NOTHING;
INSERT INTO projects (id, title, tagline, description, category, creator_id, tags, thumbnail, views, upvotes, plays, shares, remix_count, score, featured, demo_type, demo_url, demo_content, parent_id, viral_boosted, created_at) VALUES ('11', 'MeetingMind', 'AI meeting copilot that actually remembers your project context', 'MeetingMind joins your video calls, transcribes in real-time, and provides context-aware summaries by connecting meeting content to your project management tools. Unlike generic transcription, it understands your team''s jargon, ongoing tasks, and decision history.', 'AI Utility', 'c2', ARRAY['Meetings','Productivity','Transcription','Context'], '', 13500, 923, 9800, 1450, 14, 90, FALSE, 'chat', 'https://meetingmind.demo.vibex.app', 'Simulate a meeting to see context-aware summarization.', '4', FALSE, '2026-04-04') ON CONFLICT (id) DO NOTHING;
INSERT INTO projects (id, title, tagline, description, category, creator_id, tags, thumbnail, views, upvotes, plays, shares, remix_count, score, featured, demo_type, demo_url, demo_content, parent_id, viral_boosted, created_at) VALUES ('12', 'SynthLab', 'AI music production studio in your browser', 'SynthLab is a browser-based DAW with AI-powered composition, arrangement, and mixing. Hum a melody, describe a genre, or upload a reference track — the AI generates full arrangements with customizable instruments, effects, and mastering. Export as WAV, MIDI, or stems.', 'Demo', 'c3', ARRAY['Music','Creative','Audio','Browser'], '', 16800, 1134, 12600, 2340, 31, 92, TRUE, 'embedded', 'https://synthlab.demo.vibex.app', 'Describe a mood or hum a melody to generate music.', '3', FALSE, '2026-04-03') ON CONFLICT (id) DO NOTHING;

-- Behavior Scores
INSERT INTO behavior_scores (project_id, plays, avg_stay_seconds, share_rate, remix_count, ai_score, compound) VALUES ('1', 8920, 124, 0.108, 12, 85, 3032.2716) ON CONFLICT (project_id) DO NOTHING;
INSERT INTO behavior_scores (project_id, plays, avg_stay_seconds, share_rate, remix_count, ai_score, compound) VALUES ('2', 14500, 167, 0.142, 45, 89.8, 5089.9784) ON CONFLICT (project_id) DO NOTHING;
INSERT INTO behavior_scores (project_id, plays, avg_stay_seconds, share_rate, remix_count, ai_score, compound) VALUES ('3', 7200, 145, 0.12, 28, 88, 2572.024) ON CONFLICT (project_id) DO NOTHING;
INSERT INTO behavior_scores (project_id, plays, avg_stay_seconds, share_rate, remix_count, ai_score, compound) VALUES ('4', 11200, 132, 0.098, 18, 83.2, 3853.3196000000003) ON CONFLICT (project_id) DO NOTHING;
INSERT INTO behavior_scores (project_id, plays, avg_stay_seconds, share_rate, remix_count, ai_score, compound) VALUES ('5', 5600, 98, 0.072, 8, 83.6, 1918.4144000000001) ON CONFLICT (project_id) DO NOTHING;
INSERT INTO behavior_scores (project_id, plays, avg_stay_seconds, share_rate, remix_count, ai_score, compound) VALUES ('6', 3800, 76, 0.058, 5, 76.6, 1289.1616000000001) ON CONFLICT (project_id) DO NOTHING;
INSERT INTO behavior_scores (project_id, plays, avg_stay_seconds, share_rate, remix_count, ai_score, compound) VALUES ('7', 8400, 156, 0.094, 22, 84.4, 2821.1187999999997) ON CONFLICT (project_id) DO NOTHING;
INSERT INTO behavior_scores (project_id, plays, avg_stay_seconds, share_rate, remix_count, ai_score, compound) VALUES ('8', 4300, 88, 0.065, 7, 80.2, 1462.5629999999999) ON CONFLICT (project_id) DO NOTHING;
INSERT INTO behavior_scores (project_id, plays, avg_stay_seconds, share_rate, remix_count, ai_score, compound) VALUES ('9', 15200, 172, 0.138, 38, 91.4, 5320.377600000001) ON CONFLICT (project_id) DO NOTHING;
INSERT INTO behavior_scores (project_id, plays, avg_stay_seconds, share_rate, remix_count, ai_score, compound) VALUES ('10', 2100, 54, 0.042, 2, 78.8, 727.2084000000001) ON CONFLICT (project_id) DO NOTHING;
INSERT INTO behavior_scores (project_id, plays, avg_stay_seconds, share_rate, remix_count, ai_score, compound) VALUES ('11', 9800, 108, 0.089, 14, 80.6, 3322.6678) ON CONFLICT (project_id) DO NOTHING;
INSERT INTO behavior_scores (project_id, plays, avg_stay_seconds, share_rate, remix_count, ai_score, compound) VALUES ('12', 12600, 148, 0.112, 31, 88.4, 4387.1224) ON CONFLICT (project_id) DO NOTHING;

-- AI Reviews
INSERT INTO ai_reviews (project_id, originality, clarity, ux_potential, virality_potential, investor_curiosity, strengths, weaknesses, suggestions) VALUES ('1', 88, 92, 85, 78, 82, ARRAY['Emotion-aware translation is a clear differentiator','Sub-200ms latency makes it production-ready','Clean, intuitive interface'], ARRAY['Retention loop unclear after initial wow moment','No collaborative features yet'], ARRAY['Add team workspace for shared glossaries','Show emotion breakdown visualization','Create browser extension for inline translation']) ON CONFLICT (project_id) DO NOTHING;
INSERT INTO ai_reviews (project_id, originality, clarity, ux_potential, virality_potential, investor_curiosity, strengths, weaknesses, suggestions) VALUES ('2', 82, 95, 93, 88, 91, ARRAY['Visual builder dramatically lowers barrier to entry','Export-as-API is a killer feature for developers','Strong community traction already'], ARRAY['Crowded agent-builder space','Debugging complex flows could be challenging'], ARRAY['Add agent marketplace for sharing templates','Implement real-time collaboration','Show cost estimation per agent run']) ON CONFLICT (project_id) DO NOTHING;
INSERT INTO ai_reviews (project_id, originality, clarity, ux_potential, virality_potential, investor_curiosity, strengths, weaknesses, suggestions) VALUES ('3', 95, 78, 88, 92, 87, ARRAY['Extremely high novelty — text-to-playable-level is magical','Demo wow factor is off the charts','Strong viral potential on social media'], ARRAY['Limited to 3 genres currently','Asset quality varies significantly'], ARRAY['Add multiplayer level sharing','Create a TikTok-style feed of generated levels','Support custom sprite uploads']) ON CONFLICT (project_id) DO NOTHING;
INSERT INTO ai_reviews (project_id, originality, clarity, ux_potential, virality_potential, investor_curiosity, strengths, weaknesses, suggestions) VALUES ('4', 75, 94, 90, 72, 85, ARRAY['Multi-agent approach gives more thorough reviews than single-model','Git platform integrations make adoption frictionless','Clear value proposition for engineering teams'], ARRAY['Code review AI is a competitive space','Enterprise pricing strategy unclear'], ARRAY['Add team-specific coding standards training','Show confidence scores per suggestion','Create VS Code extension for inline reviews']) ON CONFLICT (project_id) DO NOTHING;
INSERT INTO ai_reviews (project_id, originality, clarity, ux_potential, virality_potential, investor_curiosity, strengths, weaknesses, suggestions) VALUES ('5', 80, 88, 91, 85, 74, ARRAY['Strong designer workflow integration','Figma export is a smart distribution move','Visual output is highly shareable'], ARRAY['Depends heavily on generated asset quality','Limited customization after generation'], ARRAY['Add style mixing from multiple references','Enable real-time collaborative boards','Create Pinterest-style discovery feed']) ON CONFLICT (project_id) DO NOTHING;
INSERT INTO ai_reviews (project_id, originality, clarity, ux_potential, virality_potential, investor_curiosity, strengths, weaknesses, suggestions) VALUES ('6', 83, 76, 80, 65, 79, ARRAY['Config-driven approach lowers barrier significantly','Pre-built modules accelerate time-to-market','Strong accessibility angle'], ARRAY['Developer-focused, limited appeal to non-technical users','Documentation could be more beginner-friendly'], ARRAY['Add visual flow editor for non-developers','Create showcase gallery of voice apps built with VoiceOS','Partner with accessibility organizations']) ON CONFLICT (project_id) DO NOTHING;
INSERT INTO ai_reviews (project_id, originality, clarity, ux_potential, virality_potential, investor_curiosity, strengths, weaknesses, suggestions) VALUES ('7', 90, 82, 87, 83, 80, ARRAY['Dynamic narrative generation is genuinely impressive','Character consistency sets it apart from basic chatbots','Multiple use cases (games, education, writing)'], ARRAY['Story quality can degrade in very long sessions','No multiplayer narrative support yet'], ARRAY['Add collaborative storytelling mode','Create story templates marketplace','Implement save/share/fork for story branches']) ON CONFLICT (project_id) DO NOTHING;
INSERT INTO ai_reviews (project_id, originality, clarity, ux_potential, virality_potential, investor_curiosity, strengths, weaknesses, suggestions) VALUES ('8', 77, 89, 85, 62, 88, ARRAY['Solves a real, painful problem for data teams','Natural language interface is well-implemented','Built-in monitoring is a smart differentiator'], ARRAY['Enterprise sales cycle could be long','Complex transformations may need manual SQL fallback'], ARRAY['Add pipeline version control and rollback','Create template library for common transformations','Show cost estimation for pipeline runs']) ON CONFLICT (project_id) DO NOTHING;
INSERT INTO ai_reviews (project_id, originality, clarity, ux_potential, virality_potential, investor_curiosity, strengths, weaknesses, suggestions) VALUES ('9', 85, 93, 95, 94, 90, ARRAY['Sketch-to-code is immediately understandable value prop','Generated code quality is surprisingly high','Multi-framework export maximizes addressable market'], ARRAY['Competing with Figma-to-code tools','Complex layouts still need manual tweaking'], ARRAY['Add design system awareness (import existing components)','Create real-time collaborative sketching','Build Figma plugin for bidirectional sync']) ON CONFLICT (project_id) DO NOTHING;
INSERT INTO ai_reviews (project_id, originality, clarity, ux_potential, virality_potential, investor_curiosity, strengths, weaknesses, suggestions) VALUES ('10', 91, 80, 72, 68, 83, ARRAY['Unique positioning in sustainability + dev tools','ESG reporting angle opens enterprise doors','Growing regulatory demand for carbon tracking'], ARRAY['Carbon estimation accuracy is hard to validate','Niche audience may limit growth'], ARRAY['Add team leaderboards for sustainability goals','Create badges for green-certified repos','Partner with cloud providers for verified metrics']) ON CONFLICT (project_id) DO NOTHING;
INSERT INTO ai_reviews (project_id, originality, clarity, ux_potential, virality_potential, investor_curiosity, strengths, weaknesses, suggestions) VALUES ('11', 72, 91, 88, 70, 82, ARRAY['Context-awareness is a genuine differentiator vs Otter/Fireflies','PM tool integration makes it sticky','Clear ROI story for team leads'], ARRAY['Saturated meeting AI market','Privacy concerns with always-on recording'], ARRAY['Add action item auto-creation in Jira/Linear','Create meeting health scores','Build async meeting mode for distributed teams']) ON CONFLICT (project_id) DO NOTHING;
INSERT INTO ai_reviews (project_id, originality, clarity, ux_potential, virality_potential, investor_curiosity, strengths, weaknesses, suggestions) VALUES ('12', 88, 86, 92, 91, 85, ARRAY['Browser-based removes all friction','Multiple input modes (hum, describe, reference)','Stem export enables professional workflows'], ARRAY['Audio quality inconsistent across genres','Copyright implications for reference-based generation'], ARRAY['Add collaborative jam sessions','Create a public library of AI-generated tracks','Integrate with Spotify/SoundCloud for distribution']) ON CONFLICT (project_id) DO NOTHING;

-- Ideas
INSERT INTO ideas (id, title, description, creator_name, category, upvotes, status, launched_project_id, eval_viability, eval_market_fit, eval_competition, eval_uniqueness, eval_difficulty, eval_suggestions, eval_similar_projects, eval_estimated_category, created_at) VALUES ('idea-1', 'AI-powered meal planner that adapts to your fridge contents', 'Snap a photo of your fridge, and the AI identifies ingredients, suggests recipes based on what you have, accounts for dietary restrictions and expiration dates, and generates a weekly meal plan with grocery lists for missing items.', 'Sarah Chen', 'AI Tool', 234, 'in-progress', NULL, 85, 90, 'moderate', 72, 'medium', ARRAY['Integrate with grocery delivery APIs for one-click ordering','Add nutritional tracking and health goals','Consider partnerships with meal kit companies'], ARRAY['Whisk','Mealime','Supercook'], 'AI Tool', '2026-04-03') ON CONFLICT (id) DO NOTHING;
INSERT INTO ideas (id, title, description, creator_name, category, upvotes, status, launched_project_id, eval_viability, eval_market_fit, eval_competition, eval_uniqueness, eval_difficulty, eval_suggestions, eval_similar_projects, eval_estimated_category, created_at) VALUES ('idea-2', 'Real-time debate coach that argues both sides', 'An AI debate partner that can take any position on a topic and provide structured arguments, counterarguments, and rhetorical feedback. Useful for debate teams, critical thinking practice, and exploring nuanced issues.', 'Priya Sharma', 'AI Agent', 189, 'idea', NULL, 78, 65, 'low', 88, 'hard', ARRAY['Focus on education market first (schools, debate clubs)','Add structured formats (Lincoln-Douglas, Parliamentary)','Include fact-checking layer to prevent misinformation'], ARRAY['Kialo','DebateArt'], 'AI Agent', '2026-04-02') ON CONFLICT (id) DO NOTHING;
INSERT INTO ideas (id, title, description, creator_name, category, upvotes, status, launched_project_id, eval_viability, eval_market_fit, eval_competition, eval_uniqueness, eval_difficulty, eval_suggestions, eval_similar_projects, eval_estimated_category, created_at) VALUES ('idea-3', 'AI code archaeologist that explains legacy codebases', 'Point it at any legacy codebase and it generates interactive documentation, architecture diagrams, dependency maps, and plain-English explanations of business logic. Helps new team members onboard 10x faster.', 'Alex Rivera', 'AI Workflow', 312, 'launched', '4', 92, 95, 'moderate', 80, 'hard', ARRAY['Start with popular frameworks (Rails, Django, Spring)','Add Git blame integration for ownership tracking','Create Slack bot for on-demand code explanations'], ARRAY['Sourcegraph','Swimm','CodeSee'], 'AI Workflow', '2026-04-01') ON CONFLICT (id) DO NOTHING;
INSERT INTO ideas (id, title, description, creator_name, category, upvotes, status, launched_project_id, eval_viability, eval_market_fit, eval_competition, eval_uniqueness, eval_difficulty, eval_suggestions, eval_similar_projects, eval_estimated_category, created_at) VALUES ('idea-4', 'Procedural music that adapts to your work focus state', 'AI-generated ambient music that monitors your typing patterns, mouse activity, and calendar to detect focus levels, then dynamically adjusts tempo, complexity, and intensity to maintain flow state.', 'Yuki Tanaka', 'AI Utility', 156, 'in-progress', NULL, 70, 75, 'low', 92, 'expert', ARRAY['Partner with neuroscience researchers for validation','Create browser extension for easy access','Add biometric integration (heart rate, EEG) for premium tier'], ARRAY['Brain.fm','Endel','Mubert'], 'AI Utility', '2026-03-30') ON CONFLICT (id) DO NOTHING;
INSERT INTO ideas (id, title, description, creator_name, category, upvotes, status, launched_project_id, eval_viability, eval_market_fit, eval_competition, eval_uniqueness, eval_difficulty, eval_suggestions, eval_similar_projects, eval_estimated_category, created_at) VALUES ('idea-5', 'AI dungeon master for tabletop RPG campaigns', 'A virtual DM that runs full tabletop RPG sessions with dynamic world-building, NPC generation, combat resolution, and narrative continuity across sessions. Supports D&D 5e, Pathfinder, and custom rulesets.', 'Marcus Liu', 'AI Game', 445, 'idea', NULL, 82, 88, 'moderate', 75, 'expert', ARRAY['Focus on solo play and small groups without a human DM','Add voice mode for immersive sessions','Create campaign sharing and community features'], ARRAY['AI Dungeon','LitRPG Adventures','TaleSpire'], 'AI Game', '2026-03-28') ON CONFLICT (id) DO NOTHING;
INSERT INTO ideas (id, title, description, creator_name, category, upvotes, status, launched_project_id, eval_viability, eval_market_fit, eval_competition, eval_uniqueness, eval_difficulty, eval_suggestions, eval_similar_projects, eval_estimated_category, created_at) VALUES ('idea-6', 'Carbon footprint tracker for AI model training runs', 'Monitor and optimize the environmental impact of ML training pipelines. Tracks GPU hours, electricity source, cooling overhead, and estimates CO2 per experiment. Suggests greener alternatives like spot instances in low-carbon regions.', 'Emma Walsh', 'Experimental', 98, 'idea', NULL, 65, 55, 'low', 85, 'medium', ARRAY['Integrate with MLflow, W&B, and cloud provider APIs','Add carbon offset marketplace integration','Create compliance reports for EU AI Act requirements'], ARRAY['CodeCarbon','ML CO2 Impact'], 'Experimental', '2026-03-25') ON CONFLICT (id) DO NOTHING;

-- Events
INSERT INTO events (id, title, type, date, location, organizer, description, is_online, featured, image, top_project_ids, ai_generated_topics, participant_count, status) VALUES ('e1', 'VibeX Global Hackathon 2026', 'hackathon', '2026-04-20', 'San Francisco + Online', 'VibeX', '48-hour hackathon to build the most creative AI-native project. $50K in prizes. Open to all skill levels.', TRUE, TRUE, NULL, '{}', ARRAY['Build an AI agent that automates a boring daily task','Create a multiplayer AI game with procedural content','Design an accessibility tool powered by multimodal AI','Remix an existing top project with a unique twist'], 2400, 'upcoming') ON CONFLICT (id) DO NOTHING;
INSERT INTO events (id, title, type, date, location, organizer, description, is_online, featured, image, top_project_ids, ai_generated_topics, participant_count, status) VALUES ('e2', 'AI Creators Salon: The Future of Vibe Coding', 'salon', '2026-04-15', 'New York City', 'AI Builders Collective', 'An intimate evening of demos, discussions, and networking for AI-native creators. Limited to 80 attendees.', FALSE, TRUE, NULL, '{}', ARRAY['How vibe coding changes the builder-user relationship','Monetization strategies for AI-native projects','The remix economy: building on top of others'' work'], 80, 'upcoming') ON CONFLICT (id) DO NOTHING;
INSERT INTO events (id, title, type, date, location, organizer, description, is_online, featured, image, top_project_ids, ai_generated_topics, participant_count, status) VALUES ('e3', 'Demo Day: Top 10 Vibe Projects of Q1', 'demo-day', '2026-04-12', 'Online (Zoom)', 'VibeX', 'Watch the top 10 projects of Q1 2026 present live. Community voting determines the quarterly champion.', TRUE, TRUE, NULL, ARRAY['2','9','12','1','4'], ARRAY['What made Q1''s top projects stand out','Emerging patterns in AI-native UX','From demo to product: scaling vibe projects'], 1200, 'upcoming') ON CONFLICT (id) DO NOTHING;
INSERT INTO events (id, title, type, date, location, organizer, description, is_online, featured, image, top_project_ids, ai_generated_topics, participant_count, status) VALUES ('e4', 'Tokyo AI Meetup: Vibe Coding Edition', 'meetup', '2026-04-18', 'Tokyo, Japan', 'Tokyo AI Community', 'Monthly meetup focused on vibe coding techniques, tool sharing, and live coding sessions. Bilingual EN/JP.', FALSE, FALSE, NULL, '{}', ARRAY['Live-coding an AI game from scratch','Japanese-language AI tools and NLP challenges','Cross-cultural design patterns for AI products'], 120, 'upcoming') ON CONFLICT (id) DO NOTHING;
INSERT INTO events (id, title, type, date, location, organizer, description, is_online, featured, image, top_project_ids, ai_generated_topics, participant_count, status) VALUES ('e5', 'AI Agent Building Workshop', 'hackathon', '2026-04-25', 'London + Online', 'European AI Labs', 'Hands-on workshop: build and deploy autonomous AI agents in 6 hours. Mentored by industry experts.', TRUE, FALSE, NULL, '{}', ARRAY['Multi-agent orchestration patterns','Tool use and function calling best practices','Testing and debugging autonomous agents'], 350, 'upcoming') ON CONFLICT (id) DO NOTHING;
INSERT INTO events (id, title, type, date, location, organizer, description, is_online, featured, image, top_project_ids, ai_generated_topics, participant_count, status) VALUES ('e6', 'Shanghai Vibe Coding Night', 'salon', '2026-03-22', 'Shanghai, China', 'Shanghai Dev Hub', 'An evening showcasing the best AI projects from Chinese creators. Demos, lightning talks, and networking.', FALSE, FALSE, NULL, ARRAY['1','3','7'], ARRAY['AI applications for the Chinese market','Cross-border collaboration in vibe coding','Building bilingual AI products','WeChat mini-program integration with AI tools'], 95, 'completed') ON CONFLICT (id) DO NOTHING;

-- Trend Insights
INSERT INTO trend_insights (id, title, type, signal, summary, momentum, confidence, category) VALUES ('t1', 'AI Agent Frameworks', 'rising', 'strong', 'Multi-agent orchestration tools are seeing explosive growth. Projects with agent-building capabilities are 3x more likely to trend.', 92, 88, 'AI Agent') ON CONFLICT (id) DO NOTHING;
INSERT INTO trend_insights (id, title, type, signal, summary, momentum, confidence, category) VALUES ('t2', 'Simple Chatbot Wrappers', 'saturated', 'strong', 'Basic ChatGPT wrappers without unique value propositions are declining rapidly. Users expect differentiation beyond a chat interface.', 15, 95, 'AI Tool') ON CONFLICT (id) DO NOTHING;
INSERT INTO trend_insights (id, title, type, signal, summary, momentum, confidence, category) VALUES ('t3', 'AI-Assisted Creative Tools', 'opportunity', 'moderate', 'Music, art, and video creation tools powered by AI are gaining traction. Low competition but high shareability — ideal for viral growth.', 78, 72, 'Demo') ON CONFLICT (id) DO NOTHING;
INSERT INTO trend_insights (id, title, type, signal, summary, momentum, confidence, category) VALUES ('t4', 'Voice-First AI Interfaces', 'emerging', 'early', 'Early signals suggest voice-controlled AI apps are gaining developer interest. Accessibility and hands-free use cases driving adoption.', 45, 58, 'AI Utility') ON CONFLICT (id) DO NOTHING;
INSERT INTO trend_insights (id, title, type, signal, summary, momentum, confidence, category) VALUES ('t5', 'AI Code Generation', 'saturated', 'strong', 'The code generation space is crowded. New entrants need 10x differentiation (e.g., domain-specific, visual, or agent-based approaches).', 25, 91, 'AI Tool') ON CONFLICT (id) DO NOTHING;
INSERT INTO trend_insights (id, title, type, signal, summary, momentum, confidence, category) VALUES ('t6', 'Sustainability & Green AI', 'opportunity', 'early', 'Carbon-aware computing and sustainable AI tools are an untapped niche with growing regulatory tailwinds. First movers will define the category.', 62, 65, 'Experimental') ON CONFLICT (id) DO NOTHING;
INSERT INTO trend_insights (id, title, type, signal, summary, momentum, confidence, category) VALUES ('t7', 'AI-Native Game Engines', 'rising', 'moderate', 'AI-powered game creation tools are trending. Text-to-game and procedural generation projects are receiving unusually high engagement.', 81, 76, 'AI Game') ON CONFLICT (id) DO NOTHING;
INSERT INTO trend_insights (id, title, type, signal, summary, momentum, confidence, category) VALUES ('t8', 'Context-Aware AI Assistants', 'rising', 'strong', 'AI tools that deeply integrate with user context (projects, history, preferences) are outperforming generic assistants by significant margins.', 87, 84, 'AI Workflow') ON CONFLICT (id) DO NOTHING;

-- Weekly Winners
INSERT INTO weekly_winners (week, project_id, project_title, creator_name, score, category) VALUES ('2026-W14', '9', 'SketchToApp', 'Luna Martinez', 96, 'AI Tool') ON CONFLICT (week) DO NOTHING;
INSERT INTO weekly_winners (week, project_id, project_title, creator_name, score, category) VALUES ('2026-W13', '2', 'AgentForge', 'Marcus Liu', 97, 'AI Agent') ON CONFLICT (week) DO NOTHING;
INSERT INTO weekly_winners (week, project_id, project_title, creator_name, score, category) VALUES ('2026-W12', '12', 'SynthLab', 'Yuki Tanaka', 92, 'Demo') ON CONFLICT (week) DO NOTHING;
INSERT INTO weekly_winners (week, project_id, project_title, creator_name, score, category) VALUES ('2026-W11', '7', 'NarrativeAI', 'Priya Sharma', 86, 'AI Game') ON CONFLICT (week) DO NOTHING;

-- Link creators to Supabase auth users
-- Run this after 001_initial_schema.sql

-- Add auth user reference to creators
ALTER TABLE creators ADD COLUMN IF NOT EXISTS auth_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_creators_auth_user ON creators(auth_user_id) WHERE auth_user_id IS NOT NULL;

-- User profiles view (joins auth.users with creators)
CREATE OR REPLACE VIEW user_profiles AS
SELECT
  c.*,
  u.email,
  u.raw_user_meta_data->>'avatar_url' AS auth_avatar,
  u.raw_user_meta_data->>'full_name' AS auth_name
FROM creators c
LEFT JOIN auth.users u ON c.auth_user_id = u.id;

-- Track upvotes per user (prevent double voting)
CREATE TABLE IF NOT EXISTS user_upvotes (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, project_id)
);

ALTER TABLE user_upvotes ENABLE ROW LEVEL SECURITY;

-- Users can read their own upvotes
CREATE POLICY "Users read own upvotes" ON user_upvotes
  FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own upvotes
CREATE POLICY "Users insert own upvotes" ON user_upvotes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can delete their own upvotes (un-upvote)
CREATE POLICY "Users delete own upvotes" ON user_upvotes
  FOR DELETE USING (auth.uid() = user_id);

-- Link battle history to auth users
ALTER TABLE battle_history ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- RLS: authenticated users can insert battles
DROP POLICY IF EXISTS "Public insert battles" ON battle_history;
CREATE POLICY "Auth insert battles" ON battle_history
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL OR true);

-- Update projects RLS for authenticated writes
CREATE POLICY "Auth update projects" ON projects
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM creators
      WHERE creators.id = projects.creator_id
      AND creators.auth_user_id = auth.uid()
    )
  );

-- Authenticated users can insert projects
CREATE POLICY "Auth insert projects" ON projects
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- ═══════════════════════════════════════════════════════════════
-- SOCIAL FEATURES: Comments, Follows, Notifications
-- ═══════════════════════════════════════════════════════════════

-- ─── COMMENTS ───
CREATE TABLE comments (
  id TEXT PRIMARY KEY DEFAULT 'cmt-' || gen_random_uuid()::text,
  project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  parent_id TEXT REFERENCES comments(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  likes INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_comments_project ON comments(project_id, created_at DESC);
CREATE INDEX idx_comments_user ON comments(user_id);
CREATE INDEX idx_comments_parent ON comments(parent_id) WHERE parent_id IS NOT NULL;

ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read comments" ON comments FOR SELECT USING (true);
CREATE POLICY "Auth insert comments" ON comments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Own update comments" ON comments FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Own delete comments" ON comments FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER trg_comments_updated BEFORE UPDATE ON comments FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Comment likes (prevent double-like)
CREATE TABLE comment_likes (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  comment_id TEXT NOT NULL REFERENCES comments(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, comment_id)
);

ALTER TABLE comment_likes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read comment_likes" ON comment_likes FOR SELECT USING (true);
CREATE POLICY "Auth insert comment_likes" ON comment_likes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Own delete comment_likes" ON comment_likes FOR DELETE USING (auth.uid() = user_id);

-- ─── FOLLOWS ───
CREATE TABLE follows (
  follower_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  following_id TEXT NOT NULL REFERENCES creators(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (follower_id, following_id)
);

CREATE INDEX idx_follows_following ON follows(following_id);
CREATE INDEX idx_follows_follower ON follows(follower_id);

ALTER TABLE follows ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read follows" ON follows FOR SELECT USING (true);
CREATE POLICY "Auth insert follows" ON follows FOR INSERT WITH CHECK (auth.uid() = follower_id);
CREATE POLICY "Own delete follows" ON follows FOR DELETE USING (auth.uid() = follower_id);

-- Add follower/following counts to creators
ALTER TABLE creators ADD COLUMN IF NOT EXISTS follower_count INTEGER NOT NULL DEFAULT 0;
ALTER TABLE creators ADD COLUMN IF NOT EXISTS following_count INTEGER NOT NULL DEFAULT 0;

-- ─── NOTIFICATIONS ───
CREATE TABLE notifications (
  id TEXT PRIMARY KEY DEFAULT 'ntf-' || gen_random_uuid()::text,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('upvote', 'comment', 'reply', 'follow', 'battle', 'mention', 'system')),
  title TEXT NOT NULL,
  body TEXT,
  link TEXT,
  read BOOLEAN NOT NULL DEFAULT FALSE,
  actor_name TEXT,
  actor_avatar TEXT,
  project_id TEXT REFERENCES projects(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_notifications_user ON notifications(user_id, created_at DESC);
CREATE INDEX idx_notifications_unread ON notifications(user_id, read) WHERE read = FALSE;

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Own read notifications" ON notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Auth insert notifications" ON notifications FOR INSERT WITH CHECK (true);
CREATE POLICY "Own update notifications" ON notifications FOR UPDATE USING (auth.uid() = user_id);

-- ─── USER PROFILES (extend creators) ───
ALTER TABLE creators ADD COLUMN IF NOT EXISTS total_followers INTEGER NOT NULL DEFAULT 0;
ALTER TABLE creators ADD COLUMN IF NOT EXISTS github_url TEXT;
ALTER TABLE creators ADD COLUMN IF NOT EXISTS twitter_url TEXT;
ALTER TABLE creators ADD COLUMN IF NOT EXISTS website_url TEXT;
