"use client";

export type ProjectStage = "idea" | "mvp" | "growth" | "scaling";

interface StageConfig {
  label: string;
  emoji: string;
  color: string;
  tasks: string[];
}

const STAGES: Record<ProjectStage, StageConfig> = {
  idea: {
    label: "Idea",
    emoji: "\uD83D\uDCA1",
    color: "#FACC15",
    tasks: [
      "Validate the problem is real",
      "Research competitors and differentiation",
      "Define target users",
      "Get early feedback (5+ people)",
    ],
  },
  mvp: {
    label: "MVP",
    emoji: "\uD83D\uDD28",
    color: "#06B6D4",
    tasks: [
      "Build minimum viable product",
      "Use Launch Copilot to generate launch package",
      "Launch on 3 platforms",
      "Collect first 20 user feedback",
    ],
  },
  growth: {
    label: "Growth",
    emoji: "\uD83D\uDCC8",
    color: "#39FF14",
    tasks: [
      "Analyze data tracking dashboard",
      "Optimize conversion rate",
      "Build community and user groups",
      "Iterate product based on user feedback",
    ],
  },
  scaling: {
    label: "Scaling",
    emoji: "\uD83D\uDE80",
    color: "#9D00FF",
    tasks: [
      "Establish monetization model",
      "Seek investment/partnerships",
      "Expand team",
      "International expansion",
    ],
  },
};

const STAGE_ORDER: ProjectStage[] = ["idea", "mvp", "growth", "scaling"];

interface StageTrackerProps {
  currentStage: ProjectStage;
  completedTasks?: Record<string, boolean>;
}

export function StageTracker({ currentStage, completedTasks = {} }: StageTrackerProps) {
  const currentIndex = STAGE_ORDER.indexOf(currentStage);
  const stage = STAGES[currentStage];

  return (
    <div className="rpgui-container framed" style={{ padding: 16 }}>
      {/* Stage progress bar */}
      <div style={{ display: "flex", gap: 4, marginBottom: 16 }}>
        {STAGE_ORDER.map((s, i) => {
          const cfg = STAGES[s];
          const isActive = i === currentIndex;
          const isPast = i < currentIndex;
          return (
            <div key={s} style={{ flex: 1, textAlign: "center" }}>
              <div
                style={{
                  height: 6,
                  background: isPast ? cfg.color : isActive ? cfg.color : "#2A2A30",
                  opacity: isActive ? 1 : isPast ? 0.6 : 0.3,
                  marginBottom: 4,
                }}
              />
              <div className="font-pixel" style={{
                fontSize: 7,
                color: isActive ? cfg.color : isPast ? cfg.color : "#555",
                opacity: isActive ? 1 : 0.6,
              }}>
                {cfg.emoji} {cfg.label}
              </div>
            </div>
          );
        })}
      </div>

      {/* Current stage details */}
      <div className="font-pixel" style={{ fontSize: 10, color: stage.color, marginBottom: 10 }}>
        {stage.emoji} {"Current Stage: "}{stage.label}
      </div>

      {/* Task checklist */}
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {stage.tasks.map((task, i) => {
          const key = `${currentStage}-${i}`;
          const done = completedTasks[key] ?? false;
          return (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "4px 8px",
                background: done ? `${stage.color}10` : "transparent",
                border: `1px solid ${done ? stage.color + "30" : "#1A1A1E"}`,
              }}
            >
              <span className="font-pixel" style={{ fontSize: 9, color: done ? stage.color : "#555" }}>
                {done ? "\u2611" : "\u2610"}
              </span>
              <span
                className="font-retro"
                style={{
                  fontSize: 12,
                  color: done ? "#E8E8EC" : "#888",
                  textDecoration: done ? "line-through" : "none",
                }}
              >
                {task}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
