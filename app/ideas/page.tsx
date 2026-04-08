"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Lightbulb,
  Search,
  Rocket,
  Filter,
} from "lucide-react";
import { ideas, categories } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLang } from "@/lib/i18n";
import Link from "next/link";
import { IdeaCard } from "@/components/ideas/idea-card";
import { IdeaSubmitForm } from "@/components/ideas/idea-submit-form";
import { statusConfig } from "@/components/ideas/idea-helpers";

/* ─── page ─── */

export default function IdeasPage() {
  const { t } = useLang();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const statuses = ["all", "idea", "in-progress", "launched"] as const;

  const filteredIdeas = ideas.filter((idea) => {
    const matchesCategory =
      selectedCategory === "All" || idea.category === selectedCategory;
    const matchesStatus =
      selectedStatus === "all" || idea.status === selectedStatus;
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      query === "" ||
      idea.title.toLowerCase().includes(query) ||
      idea.description.toLowerCase().includes(query);
    return matchesCategory && matchesStatus && matchesSearch;
  });

  return (
    <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-16">
      {/* Background gradient orb */}
      <div className="pointer-events-none absolute -top-32 left-1/2 -translate-x-1/2 h-[480px] w-[480px] rounded-full bg-violet-600/8 blur-[120px]" />

      {/* Page Hero */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative text-center mb-12"
      >
        <div className="inline-flex items-center gap-2 rounded-full border border-violet-500/20 bg-violet-500/10 px-4 py-1.5 mb-5">
          <Lightbulb className="size-3.5 text-violet-400" />
          <span className="text-xs font-medium text-violet-400 tracking-wide">
            {t("ideas.badge")}
          </span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">
          {t("ideas.title")}{" "}
          <span className="text-gradient">{t("ideas.titleHighlight")}</span>
        </h1>
        <p className="mt-3 text-muted-foreground max-w-lg mx-auto text-sm leading-relaxed">
          {t("ideas.description")}
        </p>
      </motion.div>

      {/* Search & Filters */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="relative glass-card-strong rounded-xl p-1 mb-6"
      >
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder={t("ideas.searchPlaceholder")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-12 bg-transparent border-none pl-11 pr-4 text-sm placeholder:text-muted-foreground/60 focus-visible:ring-0 focus-visible:ring-offset-0"
          />
        </div>
      </motion.div>

      {/* Category Pills */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.15 }}
        className="flex flex-wrap gap-2 mb-4"
      >
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition-all duration-200 border ${
              selectedCategory === cat
                ? "bg-violet-500/15 text-violet-300 border-violet-500/30"
                : "bg-white/[0.03] text-muted-foreground border-white/[0.06] hover:bg-white/[0.06] hover:text-foreground"
            }`}
          >
            {cat}
          </button>
        ))}
      </motion.div>

      {/* Status Filter */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="flex items-center gap-2 mb-10"
      >
        <Filter className="size-3.5 text-muted-foreground" />
        <span className="text-xs text-muted-foreground mr-1">{t("ideas.statusLabel")}</span>
        {statuses.map((s) => {
          const cfg =
            s === "all"
              ? { label: t("ideas.statusAll"), color: "text-foreground bg-white/[0.06] border-white/[0.08]" }
              : statusConfig(s, t);
          return (
            <button
              key={s}
              onClick={() => setSelectedStatus(s)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-all duration-200 border ${
                selectedStatus === s
                  ? s === "all"
                    ? "bg-white/10 text-foreground border-white/20"
                    : cfg!.color
                  : "bg-transparent text-muted-foreground border-white/[0.06] hover:bg-white/[0.04]"
              }`}
            >
              {cfg!.label}
            </button>
          );
        })}
      </motion.div>

      {/* Ideas List */}
      <AnimatePresence mode="popLayout">
        {filteredIdeas.length === 0 ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center py-20"
          >
            <Lightbulb className="mx-auto size-10 text-muted-foreground/40 mb-4" />
            <p className="text-muted-foreground text-sm">
              {t("ideas.noResults")}
            </p>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {filteredIdeas.map((idea, i) => (
              <IdeaCard
                key={idea.id}
                idea={idea}
                index={i}
                isExpanded={expandedId === idea.id}
                onToggle={() => setExpandedId(expandedId === idea.id ? null : idea.id)}
              />
            ))}
          </div>
        )}
      </AnimatePresence>

      {/* AI Evaluate: Submit New Idea */}
      <IdeaSubmitForm />

      {/* Submit CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="mt-16 text-center"
      >
        <div className="glass-card-strong rounded-2xl border border-white/[0.06] p-8 sm:p-12 max-w-2xl mx-auto">
          <Lightbulb className="mx-auto size-8 text-violet-400 mb-4" />
          <h2 className="text-2xl font-bold mb-2">
            {t("ideas.haveAnIdea")}
          </h2>
          <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
            {t("ideas.ctaDesc")}
          </p>
          <Link href="/launch">
            <Button className="bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white hover:from-violet-500 hover:to-fuchsia-500 shadow-lg shadow-violet-500/10">
              <Rocket className="mr-2 size-4" />
              {t("ideas.submitIdea")}
            </Button>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
