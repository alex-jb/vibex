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
      "\u9A8C\u8BC1\u95EE\u9898\u662F\u5426\u771F\u5B9E\u5B58\u5728",
      "\u7814\u7A76\u7ADE\u54C1\u548C\u5DEE\u5F02\u5316",
      "\u5B9A\u4E49\u76EE\u6807\u7528\u6237",
      "\u83B7\u53D6\u65E9\u671F\u53CD\u9988 (5+ \u4EBA)",
    ],
  },
  mvp: {
    label: "MVP",
    emoji: "\uD83D\uDD28",
    color: "#06B6D4",
    tasks: [
      "\u6784\u5EFA\u6700\u5C0F\u53EF\u7528\u4EA7\u54C1",
      "\u4F7F\u7528 Launch Copilot \u751F\u6210\u53D1\u5E03\u5305",
      "\u5728 3 \u4E2A\u5E73\u53F0\u53D1\u5E03",
      "\u6536\u96C6\u524D 20 \u4E2A\u7528\u6237\u53CD\u9988",
    ],
  },
  growth: {
    label: "Growth",
    emoji: "\uD83D\uDCC8",
    color: "#39FF14",
    tasks: [
      "\u5206\u6790\u6570\u636E\u8FFD\u8E2A\u9762\u677F",
      "\u4F18\u5316\u8F6C\u5316\u7387",
      "\u5EFA\u7ACB\u793E\u533A\u548C\u7528\u6237\u7FA4",
      "\u8FFE\u4EE3\u4EA7\u54C1\u57FA\u4E8E\u7528\u6237\u53CD\u9988",
    ],
  },
  scaling: {
    label: "Scaling",
    emoji: "\uD83D\uDE80",
    color: "#9D00FF",
    tasks: [
      "\u5EFA\u7ACB\u53D8\u73B0\u6A21\u5F0F",
      "\u5BFB\u627E\u6295\u8D44/\u5408\u4F5C",
      "\u6269\u5C55\u56E2\u961F",
      "\u56FD\u9645\u5316\u6269\u5C55",
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
        {stage.emoji} {"\u5F53\u524D\u9636\u6BB5: "}{stage.label}
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
