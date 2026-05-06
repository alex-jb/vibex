/**
 * Onboarding: new user state management.
 * Tracks which tutorial steps and quests are completed.
 * Stored in localStorage for instant access.
 */

export interface OnboardingState {
  tutorialCompleted: boolean;
  questsCompleted: string[];
  viewMode: "simple" | "full"; // simple = info-reduced HUD mode
  firstVisit: boolean;
}

const STORAGE_KEY = "vibex-onboarding";

const DEFAULT_STATE: OnboardingState = {
  tutorialCompleted: false,
  questsCompleted: [],
  viewMode: "simple",
  firstVisit: true,
};

export function getOnboardingState(): OnboardingState {
  if (typeof window === "undefined") return DEFAULT_STATE;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_STATE;
    return { ...DEFAULT_STATE, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_STATE;
  }
}

export function saveOnboardingState(state: Partial<OnboardingState>): void {
  if (typeof window === "undefined") return;
  try {
    const current = getOnboardingState();
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...current, ...state }));
  } catch {}
}

export function completeQuest(questId: string): void {
  const state = getOnboardingState();
  if (!state.questsCompleted.includes(questId)) {
    saveOnboardingState({ questsCompleted: [...state.questsCompleted, questId] });
  }
}

/**
 * Mark a quest done AND drop a self-notification so the
 * notification-toast surfaces a "Quest complete!" pop the user
 * sees at the moment they did the thing. Idempotent at the
 * localStorage level — won't double-toast on refresh.
 *
 * Why: 2026-05-06 retention diagnostic. The 5 starter quests
 * exist in this file but nothing surfaces completion to the
 * user. First-action feedback is the single biggest lever for
 * Day-1 retention, and the toast plumbing is already wired.
 */
export async function triggerQuestComplete(questId: string): Promise<void> {
  const state = getOnboardingState();
  if (state.questsCompleted.includes(questId)) return; // dedup

  const quest = STARTER_QUESTS.find((q) => q.id === questId);
  if (!quest) return;

  completeQuest(questId);

  // Lazy-load supabase to keep this file in shared client/server space.
  try {
    const { supabase } = await import("@/lib/supabase");
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return; // anonymous — toast skipped, only localStorage updated
    await supabase.from("notifications").insert({
      user_id: user.id,
      type: "challenge",
      actor_name: "VibeXForge",
      action_text: `${quest.icon} Quest complete: ${quest.title} +${quest.xpReward} XP`,
      target_url: "/profile",
      read: false,
    });
  } catch {
    // Toast failure is non-fatal — quest still locally marked done.
  }
}

export function completeTutorial(): void {
  saveOnboardingState({ tutorialCompleted: true, firstVisit: false });
}

export function toggleViewMode(): "simple" | "full" {
  const state = getOnboardingState();
  const newMode = state.viewMode === "simple" ? "full" : "simple";
  saveOnboardingState({ viewMode: newMode });
  return newMode;
}

// ─── Quest Definitions ───

export interface Quest {
  id: string;
  title: string;
  titleZh: string;
  description: string;
  xpReward: number;
  icon: string;
}

export const STARTER_QUESTS: Quest[] = [
  {
    id: "visit_explore",
    title: "Explore the World",
    titleZh: "Explore the World",
    description: "Visit the explore page and discover AI projects",
    xpReward: 20,
    icon: "\uD83D\uDDFA\uFE0F",
  },
  {
    id: "first_reaction",
    title: "First Reaction",
    titleZh: "First Reaction",
    description: "Send a reaction on any post",
    xpReward: 15,
    icon: "\uD83D\uDD25",
  },
  {
    id: "watch_battle",
    title: "Watch a Battle",
    titleZh: "Watch a Battle",
    description: "Watch a battle in the Arena",
    xpReward: 25,
    icon: "\u2694\uFE0F",
  },
  {
    id: "first_post",
    title: "First Post",
    titleZh: "First Post",
    description: "Publish your first post in the Feed",
    xpReward: 30,
    icon: "\u270D\uFE0F",
  },
  {
    id: "summon_buddy",
    title: "Summon a Buddy",
    titleZh: "Summon a Buddy",
    description: "Summon your first pixel pet",
    xpReward: 50,
    icon: "\uD83E\uDD8A",
  },
];
