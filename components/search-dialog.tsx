"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, Folder, User, Lightbulb, Bot, GitBranch } from "lucide-react";
import { useRouter } from "next/navigation";
import { useProjects, useCreators, useIdeas } from "@/lib/use-data";
import { agents } from "@/lib/mock-data/agents";
import { workflows } from "@/lib/mock-data/workflows";
import { useLang } from "@/lib/i18n";

interface SearchResult {
  type: "project" | "creator" | "idea" | "agent" | "workflow";
  id: string;
  title: string;
  subtitle: string;
  href: string;
}

// Labels resolved at render time via useLang
const TYPE_LABEL_KEYS: Record<SearchResult["type"], "search.project" | "search.creator" | "search.idea" | "search.agent" | "search.workflow"> = {
  project: "search.project",
  creator: "search.creator",
  idea: "search.idea",
  agent: "search.agent",
  workflow: "search.workflow",
};

const TYPE_ICONS: Record<SearchResult["type"], typeof Folder> = {
  project: Folder,
  creator: User,
  idea: Lightbulb,
  agent: Bot,
  workflow: GitBranch,
};

interface SearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SearchDialog({ open, onOpenChange }: SearchDialogProps) {
  const { t } = useLang();
  const { data: projects } = useProjects();
  const { data: creators } = useCreators();
  const { data: ideas } = useIdeas();
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (open) {
      setQuery("");
      // Small delay so the dialog renders before focus
      const id = setTimeout(() => inputRef.current?.focus(), 50);
      return () => clearTimeout(id);
    }
  }, [open]);

  const results = useMemo<SearchResult[]>(() => {
    const q = query.toLowerCase().trim();
    if (!q) return [];

    const matched: SearchResult[] = [];

    for (const p of projects) {
      if (p.title.toLowerCase().includes(q) || p.tagline.toLowerCase().includes(q)) {
        matched.push({
          type: "project",
          id: p.id,
          title: p.title,
          subtitle: p.tagline,
          href: `/project/${p.id}`,
        });
      }
    }

    for (const c of creators) {
      if (c.name.toLowerCase().includes(q) || c.bio.toLowerCase().includes(q)) {
        matched.push({
          type: "creator",
          id: c.id,
          title: c.name,
          subtitle: c.bio.slice(0, 60),
          href: `/creators/${c.id}`,
        });
      }
    }

    for (const i of ideas) {
      if (i.title.toLowerCase().includes(q) || i.description.toLowerCase().includes(q)) {
        matched.push({
          type: "idea",
          id: i.id,
          title: i.title,
          subtitle: i.description.slice(0, 60),
          href: `/ideas/${i.id}`,
        });
      }
    }

    for (const a of agents) {
      if (a.name.toLowerCase().includes(q) || a.description.toLowerCase().includes(q)) {
        matched.push({
          type: "agent",
          id: a.id,
          title: a.name,
          subtitle: a.description.slice(0, 60),
          href: `/agents/${a.id}`,
        });
      }
    }

    for (const w of workflows) {
      if (w.name.toLowerCase().includes(q) || w.description.toLowerCase().includes(q)) {
        matched.push({
          type: "workflow",
          id: w.id,
          title: w.name,
          subtitle: w.description.slice(0, 60),
          href: `/workflows/${w.id}`,
        });
      }
    }

    return matched.slice(0, 20);
  }, [query]);

  const grouped = useMemo(() => {
    const map = new Map<SearchResult["type"], SearchResult[]>();
    for (const r of results) {
      const list = map.get(r.type) ?? [];
      list.push(r);
      map.set(r.type, list);
    }
    return map;
  }, [results]);

  // Reset selectedIndex when query changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  // Keyboard navigation: Escape, ArrowDown, ArrowUp, Enter
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onOpenChange(false);
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((i) => Math.min(i + 1, results.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((i) => Math.max(i - 1, 0));
      } else if (e.key === "Enter" && results[selectedIndex]) {
        e.preventDefault();
        router.push(results[selectedIndex].href);
        onOpenChange(false);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onOpenChange, results, selectedIndex, router]);

  function handleSelect(href: string) {
    onOpenChange(false);
    router.push(href);
  }

  if (!open) return null;

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm"
            onClick={() => onOpenChange(false)}
          />

          {/* Dialog */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ duration: 0.2 }}
            role="dialog"
            aria-label="Search"
            className="fixed left-1/2 top-[15%] z-[101] w-full max-w-lg -translate-x-1/2 rounded-xl border border-white/10 bg-background/80 backdrop-blur-2xl shadow-2xl shadow-violet-500/5"
          >
            {/* Input */}
            <div className="flex items-center gap-3 border-b border-white/[0.06] px-4 py-3">
              <Search className="size-4 shrink-0 text-muted-foreground" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t("search.placeholder")}
                aria-label={t("search.placeholder")}
                className="flex-1 bg-transparent text-foreground placeholder:text-muted-foreground outline-none"
                style={{ fontFamily: "var(--font-pixel), monospace", fontSize: 11 }}
              />
              <button onClick={() => onOpenChange(false)} aria-label="Close search" className="text-muted-foreground hover:text-foreground transition-colors">
                <X className="size-4" />
              </button>
            </div>

            {/* Results */}
            <div className="max-h-[50vh] overflow-y-auto p-2">
              {query.trim() && results.length === 0 && (
                <p className="px-3 py-8 text-center text-sm text-muted-foreground">{t("search.noResults")}</p>
              )}

              {(() => {
                let flatIndex = 0;
                return Array.from(grouped.entries()).map(([type, items]) => {
                  const Icon = TYPE_ICONS[type];
                  return (
                    <div key={type} className="mb-2">
                      <p className="px-3 py-1.5 font-pixel text-[8px] uppercase tracking-wider text-muted-foreground">
                        {t(TYPE_LABEL_KEYS[type])}
                      </p>
                      {items.map((item) => {
                        const idx = flatIndex++;
                        const isSelected = idx === selectedIndex;
                        return (
                          <button
                            key={item.id}
                            onClick={() => handleSelect(item.href)}
                            onMouseEnter={() => setSelectedIndex(idx)}
                            className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition-colors ${
                              isSelected ? "bg-white/[0.1]" : "hover:bg-white/[0.06]"
                            }`}
                          >
                            <Icon className="size-4 shrink-0 text-violet-400" />
                            <div className="min-w-0 flex-1">
                              <p className="truncate font-pixel text-[10px] text-foreground">{item.title}</p>
                              <p className="truncate text-[9px] text-muted-foreground">{item.subtitle}</p>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  );
                });
              })()}

              {!query.trim() && (
                <p className="px-3 py-8 text-center text-xs text-muted-foreground">{t("search.startSearch")}</p>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
