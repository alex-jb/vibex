/**
 * Seed script - generates SQL INSERT statements from mock data.
 *
 * Usage:
 *   npx tsx supabase/seed.ts > supabase/migrations/002_seed_data.sql
 *
 * Then paste the output into Supabase SQL Editor.
 */

import { projects, creators, ideas, events, trendInsights, weeklyWinners } from "../lib/mock-data";

function esc(s: string | undefined | null): string {
  if (s == null) return "NULL";
  return `'${s.replace(/'/g, "''")}'`;
}

function escArr(arr: string[]): string {
  if (!arr || arr.length === 0) return "'{}'";
  return `ARRAY[${arr.map((s) => esc(s)).join(",")}]`;
}

function escBool(b: boolean): string {
  return b ? "TRUE" : "FALSE";
}

function escNum(n: number | undefined): string {
  return n == null ? "0" : String(n);
}

function escNullText(s: string | undefined | null): string {
  if (s == null || s === "") return "NULL";
  return esc(s);
}

const lines: string[] = [];

lines.push("-- ═══════════════════════════════════════════════════════════════");
lines.push("-- SEED DATA (auto-generated from mock-data.ts)");
lines.push("-- ═══════════════════════════════════════════════════════════════");
lines.push("");

// CREATORS
lines.push("-- Creators");
for (const c of creators) {
  lines.push(`INSERT INTO creators (id, name, avatar, bio, rank, weekly_growth, joined_at, badges) VALUES (${esc(c.id)}, ${esc(c.name)}, ${escNullText(c.avatar)}, ${esc(c.bio)}, ${escNum(c.rank)}, ${escNum(c.weeklyGrowth)}, ${esc(c.joinedAt)}, ${escArr(c.badges)}) ON CONFLICT (id) DO NOTHING;`);
}
lines.push("");

// PROJECTS
lines.push("-- Projects");
for (const p of projects) {
  lines.push(`INSERT INTO projects (id, title, tagline, description, category, creator_id, tags, thumbnail, views, upvotes, plays, shares, remix_count, score, featured, demo_type, demo_url, demo_content, parent_id, viral_boosted, created_at) VALUES (${esc(p.id)}, ${esc(p.title)}, ${esc(p.tagline)}, ${esc(p.description)}, ${esc(p.category)}, ${esc(p.creatorId)}, ${escArr(p.tags)}, ${esc(p.thumbnail)}, ${escNum(p.views)}, ${escNum(p.upvotes)}, ${escNum(p.plays)}, ${escNum(p.shares)}, ${escNum(p.remixCount)}, ${escNum(p.score)}, ${escBool(p.featured)}, ${esc(p.demoType)}, ${escNullText(p.demoUrl)}, ${escNullText(p.demoContent)}, ${escNullText(p.parentId)}, ${escBool(p.viralBoosted ?? false)}, ${esc(p.createdAt)}) ON CONFLICT (id) DO NOTHING;`);
}
lines.push("");

// BEHAVIOR SCORES
lines.push("-- Behavior Scores");
for (const p of projects) {
  const b = p.behaviorScore;
  lines.push(`INSERT INTO behavior_scores (project_id, plays, avg_stay_seconds, share_rate, remix_count, ai_score, compound) VALUES (${esc(p.id)}, ${escNum(b.plays)}, ${escNum(b.avgStaySeconds)}, ${escNum(b.shareRate)}, ${escNum(b.remixCount)}, ${escNum(b.aiScore)}, ${escNum(b.compound)}) ON CONFLICT (project_id) DO NOTHING;`);
}
lines.push("");

// AI REVIEWS
lines.push("-- AI Reviews");
for (const p of projects) {
  const r = p.aiReview;
  lines.push(`INSERT INTO ai_reviews (project_id, originality, clarity, ux_potential, virality_potential, investor_curiosity, strengths, weaknesses, suggestions) VALUES (${esc(p.id)}, ${escNum(r.originality)}, ${escNum(r.clarity)}, ${escNum(r.uxPotential)}, ${escNum(r.viralityPotential)}, ${escNum(r.investorCuriosity)}, ${escArr(r.strengths)}, ${escArr(r.weaknesses)}, ${escArr(r.suggestions)}) ON CONFLICT (project_id) DO NOTHING;`);
}
lines.push("");

// IDEAS
lines.push("-- Ideas");
for (const i of ideas) {
  const e = i.aiEvaluation;
  lines.push(`INSERT INTO ideas (id, title, description, creator_name, category, upvotes, status, launched_project_id, eval_viability, eval_market_fit, eval_competition, eval_uniqueness, eval_difficulty, eval_suggestions, eval_similar_projects, eval_estimated_category, created_at) VALUES (${esc(i.id)}, ${esc(i.title)}, ${esc(i.description)}, ${esc(i.creatorName)}, ${esc(i.category)}, ${escNum(i.upvotes)}, ${esc(i.status)}, ${escNullText(i.launchedProjectId)}, ${escNum(e.viability)}, ${escNum(e.marketFit)}, ${esc(e.competition)}, ${escNum(e.uniqueness)}, ${esc(e.difficulty)}, ${escArr(e.suggestions)}, ${escArr(e.similarProjects)}, ${esc(e.estimatedCategory)}, ${esc(i.createdAt)}) ON CONFLICT (id) DO NOTHING;`);
}
lines.push("");

// EVENTS
lines.push("-- Events");
for (const e of events) {
  lines.push(`INSERT INTO events (id, title, type, date, location, organizer, description, is_online, featured, image, top_project_ids, ai_generated_topics, participant_count, status) VALUES (${esc(e.id)}, ${esc(e.title)}, ${esc(e.type)}, ${esc(e.date)}, ${esc(e.location)}, ${esc(e.organizer)}, ${esc(e.description)}, ${escBool(e.isOnline)}, ${escBool(e.featured)}, ${escNullText(e.image)}, ${escArr(e.topProjectIds ?? [])}, ${escArr(e.aiGeneratedTopics ?? [])}, ${escNum(e.participantCount ?? 0)}, ${esc(e.status ?? "upcoming")}) ON CONFLICT (id) DO NOTHING;`);
}
lines.push("");

// TREND INSIGHTS
lines.push("-- Trend Insights");
for (const t of trendInsights) {
  lines.push(`INSERT INTO trend_insights (id, title, type, signal, summary, momentum, confidence, category) VALUES (${esc(t.id)}, ${esc(t.title)}, ${esc(t.type)}, ${esc(t.signal)}, ${esc(t.summary)}, ${escNum(t.momentum)}, ${escNum(t.confidence)}, ${esc(t.category)}) ON CONFLICT (id) DO NOTHING;`);
}
lines.push("");

// WEEKLY WINNERS
lines.push("-- Weekly Winners");
for (const w of weeklyWinners) {
  lines.push(`INSERT INTO weekly_winners (week, project_id, project_title, creator_name, score, category) VALUES (${esc(w.week)}, ${esc(w.projectId)}, ${esc(w.projectTitle)}, ${esc(w.creatorName)}, ${escNum(w.score)}, ${esc(w.category)}) ON CONFLICT (week) DO NOTHING;`);
}

console.log(lines.join("\n"));
