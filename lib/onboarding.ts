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
    titleZh: "\u63A2\u7D22\u4E16\u754C",
    description: "\u8BBF\u95EE\u63A2\u7D22\u9875\u9762\uFF0C\u53D1\u73B0 AI \u9879\u76EE",
    xpReward: 20,
    icon: "\uD83D\uDDFA\uFE0F",
  },
  {
    id: "first_reaction",
    title: "First Reaction",
    titleZh: "\u7B2C\u4E00\u6B21\u53CD\u5E94",
    description: "\u5BF9\u4EFB\u610F\u5E16\u5B50\u53D1\u9001\u4E00\u4E2A\u53CD\u5E94 (\uD83D\uDD25/\uD83C\uDFAE/\uD83C\uDFA8/\uD83E\uDD2F)",
    xpReward: 15,
    icon: "\uD83D\uDD25",
  },
  {
    id: "watch_battle",
    title: "Watch a Battle",
    titleZh: "\u89C2\u770B\u6218\u6597",
    description: "\u5728 Arena \u89C2\u770B\u4E00\u573A\u6218\u6597",
    xpReward: 25,
    icon: "\u2694\uFE0F",
  },
  {
    id: "first_post",
    title: "First Post",
    titleZh: "\u7B2C\u4E00\u6761\u52A8\u6001",
    description: "\u5728 Feed \u53D1\u5E03\u4F60\u7684\u7B2C\u4E00\u6761\u52A8\u6001",
    xpReward: 30,
    icon: "\u270D\uFE0F",
  },
  {
    id: "summon_buddy",
    title: "Summon a Buddy",
    titleZh: "\u53EC\u5524 Buddy",
    description: "\u53EC\u5524\u4F60\u7684\u7B2C\u4E00\u53EA\u50CF\u7D20\u5B0D\u7269",
    xpReward: 50,
    icon: "\uD83E\uDD8A",
  },
];
