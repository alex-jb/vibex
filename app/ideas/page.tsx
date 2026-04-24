"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Lightbulb,
  Search,
  Rocket,
  Filter,
} from "lucide-react";
import { categories } from "@/lib/mock-data";
import { useIdeas } from "@/lib/use-data";
import { Input } from "@/components/ui/input";
import { useLang } from "@/lib/i18n";
import Link from "next/link";
import { IdeaCard } from "@/components/ideas/idea-card";
import { IdeaSubmitForm } from "@/components/ideas/idea-submit-form";
import { statusConfig } from "@/components/ideas/idea-helpers";

/* ─── page ─── */

export default function IdeasPage() {
  const { t } = useLang();
  const { data: ideas } = useIdeas();
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
      {/* Forge ember glow — matches /launch / /creators / /hunt */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 h-[360px] w-[520px] rounded-full"
        style={{ background: "radial-gradient(closest-side, rgba(255,69,0,0.14), transparent 70%)" }}
      />

      {/* Page Hero — pixel treatment matching /home + /creators */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative text-center mb-12"
      >
        <div
          className="font-ui inline-flex items-center gap-2 mb-4"
          style={{
            fontSize: 11,
            color: "var(--neon-green)",
            letterSpacing: 3,
            textShadow: "0 0 4px rgba(57,255,20,0.8)",
          }}
        >
          <Lightbulb className="size-3.5" />
          ▸ VIBEXFORGE://IDEAS · {t("ideas.badge").toUpperCase()}
        </div>
        <h1
          className="font-pixel font-pixel-hero text-[28px] sm:text-[38px] md:text-[48px]"
          style={{
            letterSpacing: 3,
            lineHeight: 1.25,
            background:
              "linear-gradient(180deg, #FFE27D 0%, #FFD700 40%, #B8860B 100%)",
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            WebkitTextFillColor: "transparent",
            filter:
              "drop-shadow(2px 2px 0 #000) drop-shadow(3px 3px 0 #000) drop-shadow(0 0 20px rgba(250,204,21,0.5))",
          }}
        >
          {t("ideas.title")} {t("ideas.titleHighlight")}
        </h1>
        <p
          className="font-retro mt-4 max-w-lg mx-auto text-[16px] sm:text-[18px] md:text-[20px]"
          style={{
            color: "rgba(232,232,236,0.85)",
            textShadow: "0 2px 0 rgba(0,0,0,0.7)",
          }}
        >
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

      {/* Submit CTA — retro frame matching ForgeCtaBlock on /home */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="mt-16 relative overflow-hidden max-w-2xl mx-auto px-6 py-8 sm:px-10 sm:py-10 text-center"
        style={{
          background:
            "linear-gradient(135deg, var(--neon-purple) 0%, #9333EA 40%, var(--neon-pink) 100%)",
          border: "3px solid #FFF",
          boxShadow: "8px 8px 0 #000, 0 0 60px rgba(157,0,255,0.4)",
        }}
      >
        <div
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "repeating-linear-gradient(0deg, transparent 0, transparent 3px, rgba(0,0,0,0.1) 3px, rgba(0,0,0,0.1) 4px)",
          }}
        />
        <div className="relative">
          <Lightbulb className="mx-auto size-8 text-white mb-4" />
          <div
            className="font-ui mb-2"
            style={{
              fontSize: 11,
              color: "var(--neon-yellow)",
              letterSpacing: 3,
              textShadow: "0 0 6px rgba(250,204,21,0.8)",
            }}
          >
            ▸ READY TO SHIP?
          </div>
          <h2
            className="font-pixel mb-3 text-[18px] sm:text-[22px] md:text-[24px]"
            style={{
              color: "#FFF",
              letterSpacing: 2,
              lineHeight: 1.4,
              textShadow: "3px 3px 0 rgba(0,0,0,0.5)",
            }}
          >
            {t("ideas.haveAnIdea")}
          </h2>
          <p
            className="font-retro mb-6 text-[15px] sm:text-[18px] md:text-[20px]"
            style={{
              color: "rgba(255,255,255,0.9)",
              maxWidth: 480,
              margin: "0 auto 24px",
            }}
          >
            {t("ideas.ctaDesc")}
          </p>
          <Link href="/launch">
            <button
              className="font-ui uppercase cursor-pointer text-[12px] sm:text-[14px] inline-flex items-center gap-2 px-5 py-3 sm:px-7 sm:py-4"
              style={{
                background: "var(--neon-yellow)",
                color: "#000",
                border: "3px solid #000",
                boxShadow: "5px 5px 0 #000",
                letterSpacing: 2,
              }}
            >
              <Rocket className="size-4" />
              {t("ideas.submitIdea")}
            </button>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
