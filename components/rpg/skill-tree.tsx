"use client";

import { motion } from "framer-motion";
import {
  Layout, GitBranch, Network, Shield, Brain, Zap,
  Paintbrush, Wrench, Heart, Sparkles, Hammer, Crown,
  Wand2, RefreshCw, BookOpen, Dices, Eye, Globe,
  FlaskConical, Repeat, Flame, Atom, Telescope, Gem,
  ShieldCheck, Activity, Gauge, Lock, Maximize, Infinity,
} from "lucide-react";
import type { SkillNode } from "@/lib/types";

const ICON_MAP: Record<string, React.ElementType> = {
  Layout, GitBranch, Network, Shield, Brain, Zap,
  Paintbrush, Wrench, Heart, Sparkles, Hammer, Crown,
  Wand2, RefreshCw, BookOpen, Dices, Eye, Globe,
  FlaskConical, Repeat, Flame, Atom, Telescope, Gem,
  ShieldCheck, Activity, Gauge, Lock, Maximize, Infinity,
};

interface SkillTreeProps {
  skills: SkillNode[];
  className?: string;
}

export function SkillTree({ skills, className = "" }: SkillTreeProps) {
  const tiers = [1, 2, 3] as const;

  return (
    <div className={`relative ${className}`}>
      <div className="flex flex-col items-center gap-6">
        {tiers.map((tier) => {
          const tierSkills = skills.filter((s) => s.tier === tier);
          return (
            <div key={tier} className="flex flex-col items-center gap-2">
              {/* Tier label */}
              <span className="font-pixel text-[7px] text-muted-foreground uppercase tracking-widest">
                Tier {tier}
              </span>

              {/* Nodes */}
              <div className="flex items-center gap-4">
                {tierSkills.map((skill, i) => {
                  const Icon = ICON_MAP[skill.icon] || Zap;

                  return (
                    <motion.div
                      key={skill.id}
                      className="relative group"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: tier * 0.1 + i * 0.05, duration: 0.3 }}
                    >
                      {/* Connection line to parent */}
                      {skill.parentNodeId && (
                        <div className="absolute left-1/2 -top-6 w-px h-6 bg-gradient-to-b from-transparent to-violet-500/40" />
                      )}

                      {/* Node */}
                      <div
                        className={`relative flex items-center justify-center w-12 h-12 border-2 transition-all duration-300 ${
                          skill.unlocked
                            ? "border-violet-500 bg-violet-500/15 evolution-glow"
                            : "border-gray-600 bg-gray-800/50 opacity-40"
                        }`}
                        title={`${skill.name}: ${skill.description}\n${skill.effect}\nRequired: Lv ${skill.requiredLevel}`}
                      >
                        <Icon
                          size={18}
                          className={
                            skill.unlocked
                              ? "text-violet-400"
                              : "text-gray-500"
                          }
                        />

                        {/* Lock icon for locked skills */}
                        {!skill.unlocked && (
                          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-gray-700 border border-gray-600 flex items-center justify-center">
                            <Lock size={8} className="text-gray-400" />
                          </div>
                        )}
                      </div>

                      {/* Skill name */}
                      <div className="mt-1 text-center">
                        <span
                          className={`font-pixel text-[6px] leading-tight block ${
                            skill.unlocked
                              ? "text-foreground"
                              : "text-muted-foreground/50"
                          }`}
                        >
                          {skill.name}
                        </span>
                        <span className="font-pixel text-[5px] text-muted-foreground/40 block">
                          Lv {skill.requiredLevel}
                        </span>
                      </div>

                      {/* Tooltip on hover */}
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20">
                        <div className="retro-dialog p-2 min-w-[140px]">
                          <p className="font-pixel text-[7px] text-foreground mb-1">
                            {skill.name}
                          </p>
                          <p className="font-retro text-xs text-muted-foreground mb-1">
                            {skill.description}
                          </p>
                          <p className="font-pixel text-[6px] text-violet-400">
                            {skill.effect}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
