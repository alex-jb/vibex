"use client";

import type { Project } from "@/lib/types";
import { CLASS_CONFIG } from "@/lib/rpg-utils";
import { useLang } from "@/lib/i18n";
import { TermLine } from "./battle-narrative";

export function ProjectRoster({
  available,
  challenger,
  defender,
  onSelect,
}: {
  available: Project[];
  challenger: Project | null;
  defender: Project | null;
  onSelect: (project: Project) => void;
}) {
  const { t } = useLang();

  return (
    <div style={{ marginTop: 24 }}>
      <TermLine color="#9D00FF" prefix="[">
        {`${t("arena.roster")} ]`}
      </TermLine>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
          gap: 6,
          marginTop: 8,
        }}
      >
        {available.map((p) => {
          const hero = p.hero!;
          const cls = CLASS_CONFIG[hero.heroClass];
          const selected = p.id === challenger?.id || p.id === defender?.id;

          return (
            <button
              key={p.id}
              onClick={() => {
                if (!selected) onSelect(p);
              }}
              style={{
                background: selected ? `${cls.color}15` : "#111114",
                border: `2px solid ${selected ? cls.color : "#2A2A30"}`,
                padding: "8px 10px",
                textAlign: "left",
                cursor: selected ? "default" : "pointer",
                display: "flex",
                alignItems: "center",
                gap: 8,
                transition: "border-color 0.15s",
              }}
              onMouseEnter={(e) => {
                if (!selected) (e.currentTarget.style.borderColor = cls.color);
              }}
              onMouseLeave={(e) => {
                if (!selected) (e.currentTarget.style.borderColor = "#2A2A30");
              }}
            >
              <span
                className="font-pixel"
                style={{ fontSize: 7, color: "#0D0D0D", background: cls.color, padding: "1px 4px" }}
              >
                {hero.level}
              </span>
              <span className="font-pixel" style={{ fontSize: 7, color: "#E8E8EC", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {p.title}
              </span>
              <span className="font-pixel" style={{ fontSize: 6, color: cls.color }}>
                {hero.heroClass.slice(0, 3).toUpperCase()}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
