"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  TrendingUp,
  Users,
  Zap,
  ChevronUp,
  Eye,
  Shield,
  Loader2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { VCRadarChart } from "@/components/vc/radar-chart";
import { DealFlowTable, type DealFlowEntry } from "@/components/vc/deal-flow-table";
import { TalentGraph, type TalentNode } from "@/components/vc/talent-graph";

interface DashboardData {
  summary: {
    totalProjects: number;
    totalCreators: number;
    avgScore: number;
    totalUpvotes: number;
    totalPlays: number;
  };
  platformRadar: {
    growthRate: number;
    userRetention: number;
    aiInnovation: number;
    marketTiming: number;
    teamSignal: number;
    revenuePotential: number;
  };
  dealFlow: DealFlowEntry[];
  talents: TalentNode[];
}

const fadeIn = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

function StatCard({
  label,
  value,
  icon: Icon,
  color,
}: {
  label: string;
  value: string | number;
  icon: typeof TrendingUp;
  color: string;
}) {
  return (
    <div className="rpgui-container framed" style={{ padding: 12 }}>
      <div className="flex items-center gap-2 mb-1">
        <Icon className="size-3.5" style={{ color }} />
        <span className="font-pixel text-[7px] uppercase tracking-wider text-muted-foreground/60">
          {label}
        </span>
      </div>
      <span className="text-2xl font-bold" style={{ color }}>
        {typeof value === "number" ? value.toLocaleString() : value}
      </span>
    </div>
  );
}

export default function VCDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/vc/dashboard")
      .then((res) => res.json())
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="size-8 animate-spin text-violet-400" />
          <span className="font-pixel text-[8px] text-muted-foreground">
            LOADING INVESTOR DATA...
          </span>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <span className="font-pixel text-[10px] text-red-400">
          Failed to load dashboard data
        </span>
      </div>
    );
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={stagger}
      className="mx-auto max-w-7xl px-4 py-12 sm:px-6"
    >
      {/* Header */}
      <motion.div variants={fadeIn} className="mb-10">
        <div className="flex items-center gap-3 mb-2">
          <Shield className="size-5 text-violet-400" />
          <Badge
            variant="secondary"
            className="text-[9px] bg-gradient-to-r from-violet-600/20 to-fuchsia-600/20 text-violet-300 border-violet-500/20"
          >
            Beta
          </Badge>
        </div>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Investor <span className="text-gradient">Intelligence</span>
        </h1>
        <p className="mt-2 text-base text-muted-foreground max-w-xl">
          AI-scored deal flow, creator talent graph, and platform health metrics.
        </p>
      </motion.div>

      {/* Summary Stats */}
      <motion.div variants={fadeIn} className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-8">
        <StatCard label="Projects" value={data.summary.totalProjects} icon={Zap} color="#39FF14" />
        <StatCard label="Creators" value={data.summary.totalCreators} icon={Users} color="#06B6D4" />
        <StatCard label="Avg Score" value={data.summary.avgScore} icon={TrendingUp} color="#FACC15" />
        <StatCard label="Upvotes" value={data.summary.totalUpvotes} icon={ChevronUp} color="#8b5cf6" />
        <StatCard label="Total Plays" value={data.summary.totalPlays} icon={Eye} color="#EC4899" />
      </motion.div>

      {/* Main Grid: Radar + Talent */}
      <motion.div variants={fadeIn} className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Platform Radar */}
        <div className="rpgui-container framed lg:col-span-1" style={{ padding: 16 }}>
          <h2 className="font-pixel text-[8px] uppercase tracking-widest text-violet-400 mb-4">
            Platform Health Radar
          </h2>
          <div className="flex items-center justify-center">
            <VCRadarChart data={data.platformRadar} size={220} />
          </div>
        </div>

        {/* Talent Graph */}
        <div className="rpgui-container framed lg:col-span-2" style={{ padding: 16 }}>
          <h2 className="font-pixel text-[8px] uppercase tracking-widest text-violet-400 mb-4">
            Top Creator Talent
          </h2>
          <TalentGraph talents={data.talents} />
        </div>
      </motion.div>

      <Separator className="my-8 bg-white/[0.06]" />

      {/* Deal Flow Table */}
      <motion.div variants={fadeIn}>
        <div className="rpgui-container framed" style={{ padding: 16 }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-pixel text-[8px] uppercase tracking-widest text-violet-400">
              Deal Flow — Top Projects by Investor Signal
            </h2>
            <Badge variant="secondary" className="text-[9px] bg-white/5 border-white/10 text-muted-foreground">
              {data.dealFlow.length} projects
            </Badge>
          </div>
          <DealFlowTable entries={data.dealFlow} />
        </div>
      </motion.div>
    </motion.div>
  );
}
