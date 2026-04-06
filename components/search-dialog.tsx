"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, Folder, User, Lightbulb } from "lucide-react";
import { useRouter } from "next/navigation";
import { projects, creators, ideas } from "@/lib/mock-data";

interface SearchResult {
  type: "project" | "creator" | "idea";
  id: string;
  title: string;
  subtitle: string;
  href: string;
}

const TYPE_LABELS: Record<SearchResult["type"], string> = {
  project: "项目",
  creator: "创作者",
  idea: "创意",
};

const TYPE_ICONS: Record<SearchResult["type"], typeof Folder> = {
  project: Folder,
  creator: User,
  idea: Lightbulb,
};

interface SearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SearchDialog({ open, onOpenChange }: SearchDialogProps) {
  const [query, setQuery] = useState("");
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

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onOpenChange(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onOpenChange]);

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
            className="fixed left-1/2 top-[15%] z-[101] w-full max-w-lg -translate-x-1/2 rounded-xl border border-white/10 bg-background/80 backdrop-blur-2xl shadow-2xl shadow-violet-500/5"
          >
            {/* Input */}
            <div className="flex items-center gap-3 border-b border-white/[0.06] px-4 py-3">
              <Search className="size-4 shrink-0 text-muted-foreground" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="搜索项目、创作者、创意..."
                className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
              />
              <button onClick={() => onOpenChange(false)} className="text-muted-foreground hover:text-foreground transition-colors">
                <X className="size-4" />
              </button>
            </div>

            {/* Results */}
            <div className="max-h-[50vh] overflow-y-auto p-2">
              {query.trim() && results.length === 0 && (
                <p className="px-3 py-8 text-center text-sm text-muted-foreground">无结果</p>
              )}

              {Array.from(grouped.entries()).map(([type, items]) => {
                const Icon = TYPE_ICONS[type];
                return (
                  <div key={type} className="mb-2">
                    <p className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                      {TYPE_LABELS[type]}
                    </p>
                    {items.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => handleSelect(item.href)}
                        className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition-colors hover:bg-white/[0.06]"
                      >
                        <Icon className="size-4 shrink-0 text-violet-400" />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-foreground">{item.title}</p>
                          <p className="truncate text-xs text-muted-foreground">{item.subtitle}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                );
              })}

              {!query.trim() && (
                <p className="px-3 py-8 text-center text-xs text-muted-foreground">输入关键词开始搜索</p>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
