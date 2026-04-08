"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export interface DealFlowEntry {
  projectId: string;
  title: string;
  creatorName: string;
  category: string;
  score: number;
  investorCuriosity: number;
  growth: number; // percentage
  stage: string;
}

interface DealFlowTableProps {
  entries: DealFlowEntry[];
}

function getScoreColor(score: number): string {
  if (score >= 85) return "#39FF14";
  if (score >= 70) return "#FACC15";
  if (score >= 50) return "#06B6D4";
  return "#71717a";
}

export function DealFlowTable({ entries }: DealFlowTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left" style={{ borderCollapse: "separate", borderSpacing: "0 4px" }}>
        <thead>
          <tr className="font-pixel text-[7px] uppercase tracking-widest text-muted-foreground/60">
            <th className="px-3 py-2">#</th>
            <th className="px-3 py-2">Project</th>
            <th className="px-3 py-2">Creator</th>
            <th className="px-3 py-2">Category</th>
            <th className="px-3 py-2 text-right">AI Score</th>
            <th className="px-3 py-2 text-right">VC Signal</th>
            <th className="px-3 py-2 text-right">Growth</th>
            <th className="px-3 py-2"></th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry, i) => (
            <tr
              key={entry.projectId}
              className="group transition-colors hover:bg-white/[0.03] rounded-lg"
            >
              <td className="px-3 py-3 font-pixel text-[9px] text-muted-foreground/40">
                {String(i + 1).padStart(2, "0")}
              </td>
              <td className="px-3 py-3">
                <span className="font-semibold text-sm group-hover:text-violet-400 transition-colors">
                  {entry.title}
                </span>
              </td>
              <td className="px-3 py-3 text-xs text-muted-foreground">
                {entry.creatorName}
              </td>
              <td className="px-3 py-3">
                <Badge variant="secondary" className="text-[10px] bg-white/5 border-white/10">
                  {entry.category}
                </Badge>
              </td>
              <td className="px-3 py-3 text-right">
                <span className="font-mono text-sm font-bold" style={{ color: getScoreColor(entry.score) }}>
                  {entry.score}
                </span>
              </td>
              <td className="px-3 py-3 text-right">
                <span className="font-mono text-sm font-bold" style={{ color: getScoreColor(entry.investorCuriosity) }}>
                  {entry.investorCuriosity}
                </span>
              </td>
              <td className="px-3 py-3 text-right">
                <span className={`font-mono text-xs font-bold ${entry.growth >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                  {entry.growth >= 0 ? "+" : ""}{entry.growth}%
                </span>
              </td>
              <td className="px-3 py-3">
                <Link
                  href={`/project/${entry.projectId}`}
                  className="rounded-md p-1.5 transition-all hover:bg-white/10"
                >
                  <ArrowUpRight className="size-3.5 text-muted-foreground group-hover:text-foreground" />
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
