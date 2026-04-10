"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Rocket,
  Sparkles,
  Lightbulb,
  Wand2,
  CheckCircle2,
  Zap,
  TrendingUp,
  AlertCircle,
  Loader2,
  Link2,
  ArrowRight,
} from "lucide-react";

import { useLang } from "@/lib/i18n";
import type { LaunchPackage } from "@/lib/ai";
import { LaunchPackageDisplay } from "@/components/launch/launch-package";
import { categories } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { DemoGenerator } from "@/components/demo/demo-generator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const CATEGORY_TRENDS: Record<string, { label: string; rising: boolean }> = {
  "AI Agent": { label: "Rising rapidly", rising: true },
  "AI Tool": { label: "Stable, competitive", rising: false },
  "AI Game": { label: "Rising", rising: true },
  "AI Workflow": { label: "Rising", rising: true },
  "AI Utility": { label: "Stable", rising: false },
  Experimental: { label: "Opportunity zone", rising: true },
  Demo: { label: "Growing interest", rising: true },
};

export default function LaunchPage() {
  const [title, setTitle] = useState("");
  const [tagline, setTagline] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [demoType, setDemoType] = useState("");
  const [demoLink, setDemoLink] = useState("");
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [creatorName, setCreatorName] = useState("");
  const [tags, setTags] = useState("");
  const [aiResponse, setAiResponse] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [launchPkg, setLaunchPkg] = useState<LaunchPackage | null>(null);
  const [pkgLoading, setPkgLoading] = useState(false);
  const [pkgError, setPkgError] = useState<string | null>(null);

  // URL Quick Start state
  const [quickUrl, setQuickUrl] = useState("");
  const [scrapeLoading, setScrapeLoading] = useState(false);
  const [scrapeError, setScrapeError] = useState<string | null>(null);
  const [scrapeSuccess, setScrapeSuccess] = useState(false);

  // Autosave / draft restore state
  const [draftLoaded, setDraftLoaded] = useState(false);
  const [draftRestoredToast, setDraftRestoredToast] = useState(false);
  const hasHydratedRef = useRef(false);

  const { t } = useLang();

  const abortControllerRef = useRef<AbortController | null>(null);

  /* ─── Autosave: restore draft on mount, save on change ─── */
  const DRAFT_KEY = "vibex.launchDraft.v1";

  // Hydrate from localStorage once on mount
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (!raw) {
        hasHydratedRef.current = true;
        return;
      }
      const draft = JSON.parse(raw) as {
        title?: string;
        tagline?: string;
        description?: string;
        category?: string;
        demoType?: string;
        demoLink?: string;
        thumbnailUrl?: string;
        creatorName?: string;
        tags?: string;
      };
      if (draft.title) setTitle(draft.title);
      if (draft.tagline) setTagline(draft.tagline);
      if (draft.description) setDescription(draft.description);
      if (draft.category) setCategory(draft.category);
      if (draft.demoType) setDemoType(draft.demoType);
      if (draft.demoLink) setDemoLink(draft.demoLink);
      if (draft.thumbnailUrl) setThumbnailUrl(draft.thumbnailUrl);
      if (draft.creatorName) setCreatorName(draft.creatorName);
      if (draft.tags) setTags(draft.tags);
      const hasAnyField =
        draft.title || draft.tagline || draft.description || draft.category;
      if (hasAnyField) {
        setDraftLoaded(true);
        setDraftRestoredToast(true);
        setTimeout(() => setDraftRestoredToast(false), 3500);
      }
    } catch {
      // Corrupted draft — ignore and start fresh
    } finally {
      hasHydratedRef.current = true;
    }
  }, []);

  // Debounced save on any field change
  useEffect(() => {
    if (!hasHydratedRef.current) return;
    if (submitted) return;
    if (typeof window === "undefined") return;

    const timer = setTimeout(() => {
      try {
        localStorage.setItem(
          DRAFT_KEY,
          JSON.stringify({
            title,
            tagline,
            description,
            category,
            demoType,
            demoLink,
            thumbnailUrl,
            creatorName,
            tags,
          }),
        );
      } catch {
        // Storage quota / private mode — swallow silently
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [
    title,
    tagline,
    description,
    category,
    demoType,
    demoLink,
    thumbnailUrl,
    creatorName,
    tags,
    submitted,
  ]);

  // Clear draft on successful submit
  useEffect(() => {
    if (!submitted) return;
    if (typeof window === "undefined") return;
    try {
      localStorage.removeItem(DRAFT_KEY);
    } catch {
      // ignore
    }
  }, [submitted]);

  const clearDraft = useCallback(() => {
    setTitle("");
    setTagline("");
    setDescription("");
    setCategory("");
    setDemoType("");
    setDemoLink("");
    setThumbnailUrl("");
    setCreatorName("");
    setTags("");
    setDraftLoaded(false);
    if (typeof window !== "undefined") {
      try {
        localStorage.removeItem(DRAFT_KEY);
      } catch {
        // ignore
      }
    }
  }, []);

  // Completion progress — how many of the 9 fields have content
  const requiredFields = [
    title,
    tagline,
    description,
    category,
    demoType,
    demoLink,
    thumbnailUrl,
    creatorName,
    tags,
  ];
  const filledFieldCount = requiredFields.filter((f) => f.trim().length > 0).length;
  const completionPct = Math.round((filledFieldCount / requiredFields.length) * 100);

  const handleQuickScrape = useCallback(async () => {
    if (scrapeLoading || !quickUrl.trim()) return;
    setScrapeLoading(true);
    setScrapeError(null);
    setScrapeSuccess(false);
    try {
      const res = await fetch("/api/scrape", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: quickUrl.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to scrape URL");
      }
      if (data.title) setTitle(data.title);
      if (data.description) {
        // Use description as both tagline (truncated) and full description
        const desc = data.description as string;
        if (desc.length < 120) {
          setTagline(desc);
        } else {
          setTagline(desc.slice(0, 120).trim() + "...");
        }
        setDescription(desc);
      }
      if (data.image) setThumbnailUrl(data.image);
      if (data.url) setDemoLink(data.url);
      if (data.siteName && !creatorName) setCreatorName(data.siteName);
      setScrapeSuccess(true);
    } catch (err) {
      setScrapeError(err instanceof Error ? err.message : "Failed to scrape");
    } finally {
      setScrapeLoading(false);
    }
  }, [scrapeLoading, quickUrl, creatorName]);

  const generatePackage = useCallback(async () => {
    if (pkgLoading || !title.trim() || !description.trim()) return;
    setPkgLoading(true);
    setPkgError(null);
    try {
      const res = await fetch("/api/ai/launch-package", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          tagline: tagline.trim(),
          description: description.trim(),
          category: category || "AI Tool",
          tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
          demoUrl: demoLink || undefined,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Generation failed");
      }
      const pkg = await res.json();
      setLaunchPkg(pkg);
    } catch (err) {
      setPkgError(err instanceof Error ? err.message : "Failed to generate");
    } finally {
      setPkgLoading(false);
    }
  }, [pkgLoading, title, tagline, description, category, tags, demoLink]);

  const fetchAIFeedback = useCallback(async () => {
    if (aiLoading) return;

    // Abort any in-flight request
    abortControllerRef.current?.abort();
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setAiLoading(true);
    setAiResponse("");

    try {
      const response = await fetch("/api/ai/launch-assist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, tagline, description, category }),
        signal: controller.signal,
      });

      if (!response.ok) {
        const errorText = await response.text();
        setAiResponse(`Error: ${response.status} - ${errorText || "Request failed, please try again later"}`);
        setAiLoading(false);
        return;
      }

      const reader = response.body?.getReader();
      if (!reader) {
        setAiResponse("Error: Unable to read response stream");
        setAiLoading(false);
        return;
      }

      const decoder = new TextDecoder();
      let accumulated = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        accumulated += chunk;
        setAiResponse(accumulated);
      }
    } catch (error: unknown) {
      if (error instanceof DOMException && error.name === "AbortError") {
        return;
      }
      setAiResponse("Error: Network error, please check your connection and try again");
    } finally {
      setAiLoading(false);
    }
  }, [aiLoading, title, tagline, description, category]);

  const proTips = [t("launch.tip1"), t("launch.tip2"), t("launch.tip3")];

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
  }

  // Suggestion helpers
  const titleStatus =
    title.length >= 10
      ? { text: t("launch.strongTitle"), color: "emerald", icon: "check" as const }
      : title.length > 5
        ? { text: t("launch.couldBeStronger"), color: "amber", icon: "alert" as const }
        : title.length > 0
          ? { text: t("launch.keepGoing"), color: "zinc", icon: "alert" as const }
          : null;

  const taglineStatus =
    tagline.length >= 20
      ? { text: t("launch.compellingHook"), color: "emerald", icon: "check" as const }
      : tagline.length > 0
        ? { text: t("launch.expandHook"), color: "amber", icon: "alert" as const }
        : null;

  const categoryTrend = category ? CATEGORY_TRENDS[category] : null;

  const descriptionStatus =
    description.length >= 200
      ? { text: t("launch.richDetail"), color: "emerald", icon: "check" as const }
      : description.length >= 100
        ? { text: t("launch.goodStart"), color: "amber", icon: "alert" as const }
        : description.length > 0
          ? { text: t("launch.addMoreContext"), color: "zinc", icon: "alert" as const }
          : null;

  const hasAnySuggestion = titleStatus || taglineStatus || categoryTrend || descriptionStatus;

  return (
    <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-16">
      {/* Background gradient orbs */}
      <div className="pointer-events-none absolute -top-40 left-1/4 h-[400px] w-[400px] rounded-full bg-violet-600/8 blur-[120px]" />
      <div className="pointer-events-none absolute -top-20 right-1/4 h-[300px] w-[300px] rounded-full bg-fuchsia-600/6 blur-[100px]" />

      {/* Page Hero */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative text-center mb-14"
      >
        <div className="inline-flex items-center gap-2 rounded-full border border-violet-500/20 bg-violet-500/10 px-4 py-1.5 mb-5">
          <Rocket className="size-3.5 text-violet-400" />
          <span className="text-xs font-medium text-violet-400 tracking-wide">
            {t("launch.badge")}
          </span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">
          {t("launch.title")}{" "}
          <span className="text-gradient">{t("launch.titleHighlight")}</span>
        </h1>
        <p className="mt-3 text-muted-foreground max-w-md mx-auto text-sm leading-relaxed">
          {t("launch.description")}
        </p>
      </motion.div>

      {/* Completion progress + draft controls — only visible when form has content */}
      {filledFieldCount > 0 && !submitted && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mx-auto max-w-3xl mb-6 px-4 py-3"
          style={{
            background: "rgba(0,0,0,0.5)",
            border: "2px solid rgba(157,0,255,0.4)",
            boxShadow: "3px 3px 0 #000",
          }}
        >
          <div className="flex items-center justify-between gap-3 mb-2">
            <span
              className="font-pixel"
              style={{
                fontSize: 10,
                letterSpacing: 1.5,
                color: "#E9BDFF",
              }}
            >
              ▸ PROGRESS {filledFieldCount}/{requiredFields.length} FIELDS
            </span>
            <div className="flex items-center gap-3">
              <span
                className="font-pixel"
                style={{
                  fontSize: 10,
                  color:
                    completionPct >= 100
                      ? "var(--neon-green)"
                      : completionPct >= 50
                      ? "var(--neon-yellow)"
                      : "#C9B8E8",
                }}
              >
                {completionPct}%
              </span>
              {draftLoaded && (
                <button
                  type="button"
                  onClick={clearDraft}
                  className="font-pixel hover:text-white transition-colors"
                  style={{
                    fontSize: 10,
                    letterSpacing: 1,
                    color: "#FF4500",
                    background: "transparent",
                    border: "1px solid rgba(255,69,0,0.4)",
                    padding: "4px 8px",
                    cursor: "pointer",
                  }}
                  aria-label="Clear saved draft"
                >
                  CLEAR DRAFT
                </button>
              )}
            </div>
          </div>
          <div
            className="h-2"
            style={{
              background: "rgba(0,0,0,0.6)",
              border: "1px solid rgba(157,0,255,0.3)",
            }}
          >
            <motion.div
              className="h-full"
              style={{
                background:
                  completionPct >= 100
                    ? "linear-gradient(90deg, var(--neon-green), #22C55E)"
                    : "linear-gradient(90deg, var(--neon-purple), #C026D3)",
                boxShadow:
                  completionPct >= 100
                    ? "0 0 8px rgba(57,255,20,0.6)"
                    : "0 0 8px rgba(157,0,255,0.5)",
              }}
              initial={{ width: 0 }}
              animate={{ width: `${completionPct}%` }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            />
          </div>
          <span
            className="font-retro block mt-2"
            style={{
              fontSize: 12,
              color: "#8B7AA0",
              letterSpacing: 0.3,
            }}
          >
            Draft auto-saves every keystroke. Close the tab and come back anytime.
          </span>
        </motion.div>
      )}

      {/* Draft-restored toast */}
      <AnimatePresence>
        {draftRestoredToast && (
          <motion.div
            key="draft-toast"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-50 px-4 py-3"
            style={{
              background: "rgba(10,37,21,0.95)",
              border: "2px solid var(--neon-green)",
              boxShadow:
                "4px 4px 0 #000, 0 0 24px rgba(57,255,20,0.4)",
              backdropFilter: "blur(8px)",
            }}
            role="status"
            aria-live="polite"
          >
            <span
              className="font-pixel"
              style={{
                fontSize: 10,
                letterSpacing: 1.5,
                color: "var(--neon-green)",
                textShadow: "0 0 6px rgba(57,255,20,0.6)",
              }}
            >
              ✓ DRAFT RESTORED FROM LAST SESSION
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* URL Quick Start — paste URL, auto-fill form */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="relative mb-12"
      >
        <div
          className="mx-auto max-w-3xl rounded-xl p-6 sm:p-8"
          style={{
            background:
              "linear-gradient(135deg, rgba(157,0,255,0.10), rgba(57,255,20,0.05))",
            border: "2px solid rgba(157,0,255,0.35)",
            boxShadow: "0 0 40px rgba(157,0,255,0.15)",
          }}
        >
          <div className="flex items-center gap-2 mb-3">
            <Zap className="h-4 w-4 text-violet-400" />
            <span
              className="font-pixel text-[9px] tracking-widest text-violet-300 uppercase"
            >
              Quick Start — paste URL, auto-fill everything
            </span>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              <Input
                value={quickUrl}
                onChange={(e) => {
                  setQuickUrl(e.target.value);
                  setScrapeError(null);
                  setScrapeSuccess(false);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleQuickScrape();
                  }
                }}
                placeholder="https://your-ai-project.com"
                disabled={scrapeLoading}
                className="pl-10 bg-white/5 border-white/[0.12] focus-visible:border-violet-500/50 focus-visible:ring-violet-500/20 h-11"
              />
            </div>
            <Button
              onClick={handleQuickScrape}
              disabled={scrapeLoading || !quickUrl.trim()}
              className="bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white h-11 px-6 shrink-0"
            >
              {scrapeLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Scraping...
                </>
              ) : (
                <>
                  <Wand2 className="mr-2 h-4 w-4" />
                  Auto-Fill
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </div>
          {scrapeError && (
            <div className="mt-3 flex items-center gap-2 text-xs text-red-400">
              <AlertCircle className="h-3.5 w-3.5" />
              {scrapeError}
            </div>
          )}
          {scrapeSuccess && (
            <div className="mt-3 flex items-center gap-2 text-xs text-emerald-400">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Form auto-filled below. Review and click &quot;Generate Launch Package&quot;.
            </div>
          )}
          <p className="mt-3 text-xs text-muted-foreground leading-relaxed">
            Works with GitHub repos, landing pages, live demos, or any public URL.
            We extract the title, description, and image from meta tags.
          </p>
        </div>
      </motion.div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Left: Submission Form (3/5) */}
        <motion.div
          className="lg:col-span-3"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <form
            onSubmit={handleSubmit}
            className="glass-card-strong noise-bg rounded-xl border border-white/[0.06] p-6 sm:p-8"
          >
            {/* Section: Project Identity */}
            <SectionLabel>{t("launch.identity")}</SectionLabel>
            <div className="flex flex-col gap-5 mt-3">
              <FormField label={t("launch.projectTitle")}>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={t("launch.titlePlaceholder")}
                  className="bg-white/5 border-white/[0.08] focus-visible:border-violet-500/50 focus-visible:ring-violet-500/20"
                />
              </FormField>

              <FormField label={t("launch.tagline")}>
                <Input
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  placeholder={t("launch.taglinePlaceholder")}
                  className="bg-white/5 border-white/[0.08] focus-visible:border-violet-500/50 focus-visible:ring-violet-500/20"
                />
              </FormField>
            </div>

            <Separator className="my-6 bg-white/[0.06]" />

            {/* Section: Details */}
            <SectionLabel>{t("launch.details")}</SectionLabel>
            <div className="flex flex-col gap-5 mt-3">
              <FormField label={t("launch.descriptionLabel")}>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder={t("launch.descriptionPlaceholder")}
                  rows={6}
                  className="bg-white/5 border-white/[0.08] focus-visible:border-violet-500/50 focus-visible:ring-violet-500/20"
                />
              </FormField>

              <FormField label={t("launch.category")}>
                <Select
                  value={category}
                  onValueChange={(v) => setCategory(v ?? "")}
                >
                  <SelectTrigger className="w-full bg-white/5 border-white/[0.08] focus-visible:border-violet-500/50">
                    <SelectValue placeholder={t("launch.categoryPlaceholder")} />
                  </SelectTrigger>
                  <SelectContent>
                    {categories
                      .filter((c) => c !== "All")
                      .map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </FormField>

              <FormField label={t("launch.demoType")}>
                <Select
                  value={demoType}
                  onValueChange={(v) => setDemoType(v ?? "")}
                >
                  <SelectTrigger className="w-full bg-white/5 border-white/[0.08] focus-visible:border-violet-500/50">
                    <SelectValue placeholder={t("launch.demoTypePlaceholder")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="chat">{t("launch.chat")}</SelectItem>
                    <SelectItem value="sandbox">{t("launch.sandbox")}</SelectItem>
                    <SelectItem value="preview">{t("launch.preview")}</SelectItem>
                    <SelectItem value="embedded">{t("launch.embedded")}</SelectItem>
                  </SelectContent>
                </Select>
              </FormField>
            </div>

            <Separator className="my-6 bg-white/[0.06]" />

            {/* Section: Assets */}
            <SectionLabel>{t("launch.assets")}</SectionLabel>
            <div className="flex flex-col gap-5 mt-3">
              <FormField label={t("launch.demoLink")}>
                <Input
                  value={demoLink}
                  onChange={(e) => setDemoLink(e.target.value)}
                  placeholder="https://..."
                  className="bg-white/5 border-white/[0.08] focus-visible:border-violet-500/50 focus-visible:ring-violet-500/20"
                />
              </FormField>

              {/* Auto Demo Generator */}
              <DemoGenerator
                projectId={title.toLowerCase().replace(/\s+/g, "-").slice(0, 20) || undefined}
                onGenerated={(gifUrl) => {
                  setThumbnailUrl(gifUrl);
                  if (!demoLink) setDemoLink(gifUrl);
                }}
              />

              <FormField label={t("launch.thumbnailUrl")}>
                <Input
                  value={thumbnailUrl}
                  onChange={(e) => setThumbnailUrl(e.target.value)}
                  placeholder="https://..."
                  className="bg-white/5 border-white/[0.08] focus-visible:border-violet-500/50 focus-visible:ring-violet-500/20"
                />
              </FormField>
            </div>

            <Separator className="my-6 bg-white/[0.06]" />

            {/* Section: Creator */}
            <SectionLabel>{t("launch.creator")}</SectionLabel>
            <div className="flex flex-col gap-5 mt-3">
              <FormField label={t("launch.creatorName")}>
                <Input
                  value={creatorName}
                  onChange={(e) => setCreatorName(e.target.value)}
                  placeholder={t("launch.creatorPlaceholder")}
                  className="bg-white/5 border-white/[0.08] focus-visible:border-violet-500/50 focus-visible:ring-violet-500/20"
                />
              </FormField>

              <FormField label={t("launch.tags")}>
                <Input
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder={t("launch.tagsPlaceholder")}
                  className="bg-white/5 border-white/[0.08] focus-visible:border-violet-500/50 focus-visible:ring-violet-500/20"
                />
              </FormField>
            </div>

            {/* Submit */}
            {submitted && (
              <div className="mt-8 rpgui-container framed p-4 text-center" style={{ padding: 16 }}>
                <p className="font-pixel text-emerald-400" style={{ fontSize: 12, textShadow: "0 0 10px rgba(57,255,20,0.3)" }}>
                  <CheckCircle2 className="inline size-4 mr-2" />
                  Project submitted! (MVP - mock)
                </p>
              </div>
            )}
            {!submitted && (
              <Button
                type="submit"
                className="w-full mt-8 h-12 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white text-base font-semibold shadow-lg shadow-violet-500/20 transition-all duration-200 hover:shadow-violet-500/30 glow-violet"
              >
                <Rocket className="size-4 mr-2" />
                {t("launch.submit")}
              </Button>
            )}
          </form>
        </motion.div>

        {/* Right: AI Assistant Panel (2/5) */}
        <motion.div
          className="lg:col-span-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <div className="sticky top-24">
            <div className="glass-card-strong border-glow noise-bg rounded-xl border border-white/[0.06] p-6 overflow-hidden">
              {/* Header */}
              <div className="flex items-center gap-3 mb-1">
                <div className="flex size-9 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 shadow-lg shadow-violet-500/25">
                  <Sparkles className="size-4 text-white" />
                </div>
                <div className="flex-1">
                  <h2 className="text-base font-semibold">{t("launch.aiAssistant")}</h2>
                </div>
                <Badge
                  variant="outline"
                  className="border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-[10px] gap-1.5"
                >
                  <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse-slow" />
                  {t("launch.aiLive")}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground/60 mb-5 ml-12">
                {t("launch.aiHint")}
              </p>

              <Separator className="mb-5 bg-white/[0.06]" />

              {/* Dynamic Suggestions */}
              <div className="flex flex-col gap-3">
                {titleStatus && (
                  <SuggestionRow
                    icon={titleStatus.icon}
                    color={titleStatus.color}
                    label={t("launch.titleAnalysis")}
                    text={titleStatus.text}
                  />
                )}

                {taglineStatus && (
                  <SuggestionRow
                    icon={taglineStatus.icon}
                    color={taglineStatus.color}
                    label={t("launch.taglineHook")}
                    text={taglineStatus.text}
                  />
                )}

                {categoryTrend && (
                  <SuggestionRow
                    icon={categoryTrend.rising ? "trending" : "stable"}
                    color={categoryTrend.rising ? "emerald" : "amber"}
                    label={t("launch.categoryTrend")}
                    text={categoryTrend.label}
                  />
                )}

                {descriptionStatus && (
                  <SuggestionRow
                    icon={descriptionStatus.icon}
                    color={descriptionStatus.color}
                    label={t("launch.descriptionDepth")}
                    text={descriptionStatus.text}
                  />
                )}

                {!hasAnySuggestion && (
                  <div className="flex items-center gap-3 rounded-lg border border-white/[0.04] bg-white/[0.02] p-4">
                    <Wand2 className="size-4 text-violet-400/50 shrink-0" />
                    <p className="text-sm text-muted-foreground/50 italic">
                      {t("launch.formHint")}
                    </p>
                  </div>
                )}
              </div>

              {/* AI Deep Analysis Button */}
              <div className="mt-4">
                <Button
                  type="button"
                  onClick={fetchAIFeedback}
                  disabled={aiLoading}
                  className="w-full h-10 bg-gradient-to-r from-violet-600/80 to-fuchsia-600/80 hover:from-violet-500 hover:to-fuchsia-500 text-white text-sm font-medium shadow-md shadow-violet-500/15 transition-all duration-200 hover:shadow-violet-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {aiLoading ? (
                    <Loader2 className="size-4 mr-2 animate-spin" />
                  ) : (
                    <Sparkles className="size-4 mr-2" />
                  )}
                  {aiLoading ? "Analyzing..." : "AI Deep Analysis"}
                </Button>
              </div>

              {/* AI Response */}
              {(aiResponse || aiLoading) && (
                <div className="mt-4 rounded-lg border border-violet-500/20 bg-violet-500/5 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="size-3.5 text-violet-400" />
                    <span className="text-xs font-semibold text-violet-400 uppercase tracking-wider">
                      AI Analysis Result
                    </span>
                  </div>
                  {aiLoading && !aiResponse && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground/60">
                      <Loader2 className="size-3.5 animate-spin text-violet-400" />
                      <span>Analyzing your project...</span>
                    </div>
                  )}
                  {aiResponse && (
                    <p className="text-sm text-muted-foreground/80 leading-relaxed whitespace-pre-wrap">
                      {aiResponse}
                    </p>
                  )}
                </div>
              )}

              {/* Generate Launch Package Button */}
              <div className="mt-4">
                <Button
                  type="button"
                  onClick={generatePackage}
                  disabled={pkgLoading || !title.trim() || !description.trim()}
                  className="w-full h-10 bg-gradient-to-r from-amber-600/80 to-orange-600/80 hover:from-amber-500 hover:to-orange-500 text-white text-sm font-medium shadow-md shadow-amber-500/15 transition-all duration-200 hover:shadow-amber-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {pkgLoading ? (
                    <Loader2 className="size-4 mr-2 animate-spin" />
                  ) : (
                    <Rocket className="size-4 mr-2" />
                  )}
                  {pkgLoading ? "Generating..." : "Generate Launch Package"}
                </Button>
                <p className="text-[10px] text-muted-foreground/40 mt-1 text-center">
                  {"Positioning + Copy + Tweets + Distribution Strategy + Investor Pitch"}
                </p>
              </div>

              {/* Launch Package Error */}
              {pkgError && (
                <div className="mt-3 rounded-lg border border-red-500/20 bg-red-500/5 p-3">
                  <p className="text-xs text-red-400">{pkgError}</p>
                </div>
              )}

              {/* Launch Package Result */}
              {launchPkg && (
                <div className="mt-4">
                  <LaunchPackageDisplay pkg={launchPkg} />
                </div>
              )}

              <Separator className="my-5 bg-white/[0.06]" />

              {/* Pro Tips */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 mb-2">
                  <Lightbulb className="size-4 text-amber-400" />
                  <span className="text-xs font-semibold uppercase tracking-wider text-amber-400/80">
                    {t("launch.proTips")}
                  </span>
                </div>
                {proTips.map((tip, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-2.5 pl-1"
                  >
                    <Zap className="size-3 text-amber-400/40 mt-0.5 shrink-0" />
                    <p className="text-xs text-muted-foreground/60 leading-relaxed">
                      {tip}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

/* ---------- Sub-components ---------- */

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground/50">
      {children}
    </h3>
  );
}

function FormField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col">
      <label className="text-sm font-medium text-muted-foreground mb-1.5">
        {label}
      </label>
      {children}
    </div>
  );
}

function SuggestionRow({
  icon,
  color,
  label,
  text,
}: {
  icon: "check" | "alert" | "trending" | "stable";
  color: string;
  label: string;
  text: string;
}) {
  const borderColor =
    color === "emerald"
      ? "border-l-emerald-500"
      : color === "amber"
        ? "border-l-amber-500"
        : "border-l-zinc-500";

  const textColor =
    color === "emerald"
      ? "text-emerald-400"
      : color === "amber"
        ? "text-amber-400"
        : "text-zinc-400";

  const IconComponent =
    icon === "check"
      ? CheckCircle2
      : icon === "trending"
        ? TrendingUp
        : icon === "stable"
          ? AlertCircle
          : AlertCircle;

  const iconColor =
    color === "emerald"
      ? "text-emerald-400"
      : color === "amber"
        ? "text-amber-400"
        : "text-zinc-500";

  return (
    <div
      className={`border-l-2 ${borderColor} rounded-r-lg bg-white/[0.02] px-4 py-3 transition-all duration-200`}
    >
      <div className="flex items-center gap-2">
        <IconComponent className={`size-3.5 ${iconColor} shrink-0`} />
        <span className="text-xs font-medium text-foreground/80">{label}</span>
      </div>
      <p className={`text-xs mt-0.5 ml-[22px] ${textColor}`}>{text}</p>
    </div>
  );
}
