"use client";

import Link from "next/link";

export interface TalentNode {
  creatorId: string;
  name: string;
  projectCount: number;
  totalUpvotes: number;
  successRate: number; // percentage of projects with score > 80
  topCategory: string;
  connections: number; // how many other creators they've collaborated with / forked from
}

interface TalentGraphProps {
  talents: TalentNode[];
}

function getTierColor(successRate: number): string {
  if (successRate >= 80) return "#39FF14";
  if (successRate >= 60) return "#FACC15";
  if (successRate >= 40) return "#06B6D4";
  return "#71717a";
}

function getTierLabel(successRate: number): string {
  if (successRate >= 80) return "S";
  if (successRate >= 60) return "A";
  if (successRate >= 40) return "B";
  return "C";
}

export function TalentGraph({ talents }: TalentGraphProps) {
  return (
    <div className="space-y-2">
      {talents.map((talent) => {
        const color = getTierColor(talent.successRate);
        const tier = getTierLabel(talent.successRate);

        return (
          <Link
            key={talent.creatorId}
            href={`/profile/${talent.creatorId}`}
            className="group flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-white/[0.04]"
          >
            {/* Tier badge */}
            <div
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg font-pixel text-[10px] font-bold border"
              style={{ color, borderColor: `${color}40`, background: `${color}10` }}
            >
              {tier}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold truncate group-hover:text-violet-400 transition-colors">
                  {talent.name}
                </span>
                <span className="font-pixel text-[7px] text-muted-foreground/50">
                  {talent.topCategory}
                </span>
              </div>
              <div className="flex items-center gap-3 mt-0.5 text-[11px] text-muted-foreground/60">
                <span>{talent.projectCount} projects</span>
                <span>{talent.totalUpvotes.toLocaleString()} upvotes</span>
                <span>{talent.connections} connections</span>
              </div>
            </div>

            {/* Success rate bar */}
            <div className="flex flex-col items-end gap-1 shrink-0">
              <span className="font-mono text-xs font-bold" style={{ color }}>
                {talent.successRate}%
              </span>
              <div className="w-16 h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{ width: `${talent.successRate}%`, background: color }}
                />
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
