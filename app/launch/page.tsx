"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
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
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const router = useRouter();
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

  // URL Paste Hero — when true, hide the hero and show the full form
  // (per /design-shotgun 2026-04-13 approved "Launch URL Paste Hero" direction)
  const [showForm, setShowForm] = useState(false);

  const { t } = useLang();

  const abortControllerRef = useRef<AbortController | null>(null);

  /* ─── Autosave: restore draft on mount, save on change ─── */
  const DRAFT_KEY = "vibex.launchDraft.v1";

  // Hydrate from localStorage + URL seed param once on mount.
  // URL seed takes precedence over draft when both are present, because
  // it means the user just came from landing with a fresh idea.
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      // Priority 1 — URL seed param (from landing InteractiveDemo)
      const params = new URLSearchParams(window.location.search);
      const seed = params.get("seed");
      if (seed && seed.trim()) {
        const seedTrimmed = seed.trim().slice(0, 200);
        // Use the seed as both a title (truncated) and description starter
        setTitle(seedTrimmed.slice(0, 60));
        setDescription(seedTrimmed);
        // Tell the user we filled the form from their landing idea
        setDraftRestoredToast(true);
        setTimeout(() => setDraftRestoredToast(false), 3500);
        // Seed means user came in with intent — skip the URL hero
        setShowForm(true);
        hasHydratedRef.current = true;
        return;
      }

      // Priority 2 — localStorage draft
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
        // Draft exists — skip the URL hero, go straight to the form
        setShowForm(true);
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
      // After a successful scrape, leave the URL Paste Hero and go to the form
      setShowForm(true);
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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitError(null);
    setSubmitLoading(true);
    try {
      const tagList = tags
        .split(",")
        .map((s) => s.trim())
        .filter((s) => s.length > 0);

      const res = await fetch("/api/projects/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          tagline,
          description,
          category,
          tags: tagList,
          creatorName,
          demoType: demoType || "preview",
          demoUrl: demoLink,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setSubmitError(data?.error ?? "Submit failed");
        setSubmitLoading(false);
        return;
      }

      // Clear the autosaved draft so returning to /launch starts fresh.
      try { localStorage.removeItem(DRAFT_KEY); } catch { /* ignore */ }

      setSubmitted(true);

      // Invalidate the App Router cache so the next time the user lands
      // on /home, the JUST LAUNCHED row reflects the new project. Without
      // this, Next.js serves the cached /home tree and useProjects()
      // wouldn't refetch on client-side back navigation.
      router.refresh();

      // Redirect into the new project detail page so the user sees the
      // full Launch Feedback Loop payoff. If the row was actually persisted
      // (persisted: true), the /project/[id] route will find it via
      // useProjects(). For the mock/fallback path, /project/[id] shows
      // LOADING HERO... then 404 — which is still better than staying
      // stuck on the form. Use a small delay so the success flash is
      // visible before navigating.
      setTimeout(() => {
        router.push(`/project/${encodeURIComponent(data.id)}`);
      }, 650);
    } catch (err) {
      console.error("[launch] submit failed", err);
      setSubmitError("Network error — please try again");
      setSubmitLoading(false);
    }
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

  // === URL PASTE HERO ===
  // When nothing is filled and user hasn't submitted, show a full-viewport
  // URL-first landing. Approved /design-shotgun direction 2026-04-13.
  // Typing a URL + hitting GO triggers handleQuickScrape, which flips showForm.
  const showHero = !showForm && filledFieldCount === 0 && !submitted;

  if (showHero) {
    return (
      <div
        className="relative min-h-[calc(100vh-64px)] overflow-hidden flex items-center justify-center"
        style={{
          background:
            "radial-gradient(ellipse at 50% 45%, rgba(157,0,255,0.2), transparent 55%), radial-gradient(ellipse at 50% 45%, rgba(6,182,212,0.08), transparent 75%), var(--bg-deep)",
        }}
      >
        {/* Floating ambient particles */}
        {[
          { top: "30%", left: "22%", color: "#FACC15", delay: 0 },
          { top: "70%", left: "75%", color: "#06B6D4", delay: 1 },
          { top: "22%", right: "25%", color: "#EC4899", delay: 2 },
          { top: "68%", left: "20%", color: "#9D00FF", delay: 0.5 },
        ].map((p, i) => (
          <motion.div
            key={i}
            aria-hidden="true"
            className="pointer-events-none fixed hidden md:block"
            style={{
              ...(p as Record<string, unknown>),
              width: 4,
              height: 4,
              background: p.color,
              boxShadow: `0 0 8px ${p.color}`,
              zIndex: 35,
            }}
            animate={{ y: [0, -16, 0], opacity: [0.3, 1, 0.3] }}
            transition={{
              duration: 4,
              delay: p.delay,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative z-40 text-center px-6"
          style={{ width: "min(820px, calc(100vw - 48px))" }}
        >
          {/* Portal glow behind */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute"
            style={{
              inset: "-120px -80px",
              background:
                "radial-gradient(ellipse, rgba(157,0,255,0.35) 0%, rgba(236,72,153,0.15) 35%, transparent 70%)",
              filter: "blur(40px)",
              zIndex: -1,
            }}
          />

          {/* Forge portal illustration — pixel art anvil + flames + card
              materializing above, generated via scripts/gen.mjs. Gives the
              URL-paste hero a visual anchor instead of pure text on gradient. */}
          <motion.div
            className="mx-auto mb-5 sm:mb-6 relative"
            style={{
              width: "min(260px, 55vw)",
              aspectRatio: "1 / 1",
            }}
            animate={{ y: [0, -4, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          >
            <Image
              src="/generated/launch-forge.png"
              alt="VibeX forge with a glowing golden anvil and a hero card materializing in the flames"
              fill
              sizes="(max-width: 640px) 55vw, 260px"
              priority
              style={{
                imageRendering: "pixelated",
                objectFit: "contain",
                filter: "drop-shadow(0 0 40px rgba(250,204,21,0.35))",
              }}
            />
          </motion.div>

          <div
            className="mb-5"
            style={{
              fontFamily: "var(--font-press-start), monospace",
              fontSize: 11,
              color: "var(--neon-green)",
              letterSpacing: 3,
              textShadow: "0 0 4px rgba(57,255,20,0.8)",
            }}
          >
            ▸ VIBEXFORGE://LAUNCH_V1 · ZERO CONFIG
          </div>

          <h1
            className="mb-3 text-[18px] sm:text-[24px] md:text-[30px]"
            style={{
              fontFamily: "var(--font-press-start), monospace",
              color: "var(--text)",
              letterSpacing: 3,
              lineHeight: 1.5,
              textShadow:
                "0 0 14px rgba(232,232,236,0.35), 0 0 30px rgba(157,0,255,0.3)",
            }}
          >
            PASTE YOUR AI PROJECT.
            <br />
            <span
              style={{
                color: "var(--neon-yellow)",
                textShadow: "0 0 14px rgba(250,204,21,0.7)",
              }}
            >
              WE DO THE REST.
            </span>
          </h1>

          <p
            className="mb-8 sm:mb-10 text-[16px] sm:text-[19px] md:text-[22px]"
            style={{
              fontFamily: "var(--font-vt323), monospace",
              color: "var(--text-muted)",
            }}
          >
            URL in, Hero Card out. 10 seconds. No form, no typing, no friction.
          </p>

          {/* Mega URL input */}
          <div className="relative mb-5">
            <span
              className="absolute text-[11px] sm:text-[13px] md:text-[14px] left-4 sm:left-5 md:left-[22px]"
              style={{
                top: "50%",
                transform: "translateY(-50%)",
                fontFamily: "var(--font-press-start), monospace",
                color: "var(--neon-green)",
                textShadow: "0 0 6px rgba(57,255,20,0.9)",
                zIndex: 2,
                pointerEvents: "none",
              }}
            >
              ▸
            </span>
            <input
              type="text"
              value={quickUrl}
              onChange={(e) => setQuickUrl(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && quickUrl.trim() && !scrapeLoading) {
                  handleQuickScrape();
                }
              }}
              placeholder="https://   paste a repo or demo URL"
              className="w-full outline-none text-[16px] sm:text-[19px] md:text-[22px] py-4 sm:py-5 md:py-[26px] pl-12 sm:pl-[52px] md:pl-[60px] pr-16 sm:pr-[80px] md:pr-[90px]"
              style={{
                background: "rgba(0,0,0,0.75)",
                border: "3px solid rgba(157,0,255,0.6)",
                color: "var(--text)",
                fontFamily: "var(--font-vt323), monospace",
                letterSpacing: 0.5,
                boxShadow:
                  "inset 0 4px 8px rgba(0,0,0,0.7), 0 0 30px rgba(157,0,255,0.25), 0 0 60px rgba(157,0,255,0.15)",
              }}
            />
            <button
              type="button"
              onClick={handleQuickScrape}
              disabled={scrapeLoading || !quickUrl.trim()}
              aria-label={scrapeLoading ? "Scraping" : "Launch from URL"}
              className="absolute flex items-center justify-center disabled:opacity-60 right-2 sm:right-[10px] w-11 h-11 sm:w-12 sm:h-12 md:w-14 md:h-14 text-[14px] sm:text-[16px] md:text-[18px]"
              style={{
                top: "50%",
                transform: "translateY(-50%)",
                background:
                  "linear-gradient(135deg, var(--neon-purple), #C026D3)",
                color: "#FFF",
                fontFamily: "var(--font-press-start), monospace",
                border: "3px solid #FFF",
                boxShadow: "3px 3px 0 #000, 0 0 20px rgba(157,0,255,0.7)",
                cursor: scrapeLoading ? "wait" : "pointer",
              }}
            >
              {scrapeLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                "▶"
              )}
            </button>
          </div>

          {scrapeError && (
            <div
              className="mb-4"
              style={{
                fontFamily: "var(--font-vt323), monospace",
                fontSize: 16,
                color: "var(--neon-orange)",
              }}
            >
              ▸ {scrapeError}
            </div>
          )}

          <div
            className="mb-6 sm:mb-8 text-[13px] sm:text-[15px] md:text-[17px]"
            style={{
              fontFamily: "var(--font-vt323), monospace",
              color: "var(--text-muted)",
            }}
          >
            ... or{" "}
            <span
              style={{
                display: "inline-block",
                padding: "4px 10px",
                border: "1.5px dashed var(--text-dim, #555)",
                color: "var(--text)",
              }}
            >
              DRAG &amp; DROP
            </span>{" "}
            a repo zip, GIF, or screenshot.
          </div>

          {/* Benefit chips */}
          <div className="flex justify-center gap-3 mb-8 flex-wrap">
            {[
              { label: "AI-AUTOFILL TITLE + DESCRIPTION", hi: null },
              { label: "AUTO-DETECT CATEGORY + RARITY", hi: "RARITY" },
              { label: "FORGE CARD IN 10s", hi: "10s" },
            ].map((c, i) => (
              <div
                key={i}
                className="flex items-center gap-2"
                style={{
                  fontFamily: "var(--font-press-start), monospace",
                  fontSize: 9,
                  padding: "10px 14px",
                  background: "rgba(0,0,0,0.5)",
                  color: "var(--text-muted)",
                  border: "1.5px solid var(--border-metal)",
                  letterSpacing: 1.5,
                }}
              >
                <span
                  className="inline-block"
                  style={{
                    width: 7,
                    height: 7,
                    background: "var(--neon-green)",
                    boxShadow: "0 0 6px var(--neon-green)",
                  }}
                />
                {c.hi
                  ? c.label
                      .split(c.hi)
                      .flatMap((part, j, arr) =>
                        j < arr.length - 1
                          ? [part, <span key={j} style={{ color: "var(--neon-yellow)" }}>{c.hi}</span>]
                          : [part],
                      )
                  : c.label}
              </div>
            ))}
          </div>

          <div
            style={{
              fontFamily: "var(--font-vt323), monospace",
              fontSize: 17,
              color: "var(--dim, #555)",
            }}
          >
            prefer manual control?{" "}
            <button
              type="button"
              onClick={() => setShowForm(true)}
              className="cursor-pointer"
              style={{
                color: "var(--neon-cyan)",
                background: "transparent",
                border: "none",
                borderBottom: "1.5px dashed rgba(6,182,212,0.4)",
                padding: 0,
                paddingBottom: 1,
                fontFamily: "inherit",
                fontSize: "inherit",
              }}
            >
              → switch to advanced launch
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

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

      {/* Vibe Templates — Aippy-inspired, one-click starting points */}
      {!submitted && filledFieldCount === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.08 }}
          className="mx-auto max-w-3xl mb-8"
        >
          <div className="flex items-center gap-2 mb-3 px-1">
            <Sparkles className="h-4 w-4" style={{ color: "var(--neon-yellow)" }} />
            <span
              className="font-pixel uppercase"
              style={{
                fontSize: 10,
                letterSpacing: 2,
                color: "var(--neon-yellow)",
                textShadow: "0 0 6px rgba(250,204,21,0.4)",
              }}
            >
              START FROM A VIBE
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
            {[
              {
                label: "GAME IDEA",
                emoji: "🎮",
                title: "Tiny arcade game",
                description:
                  "A simple one-button arcade game you can pick up and play in 30 seconds. Describe the core mechanic, the goal, and what makes it satisfying.",
                category: "AI Game",
                tags: "arcade, casual, one-tap",
              },
              {
                label: "AI TOOL",
                emoji: "🤖",
                title: "AI utility",
                description:
                  "A single-purpose AI tool that solves one annoying problem in under a minute. Describe the input, the output, and why it beats doing it manually.",
                category: "AI Tool",
                tags: "ai, utility, productivity",
              },
              {
                label: "VISUAL TOY",
                emoji: "🎨",
                title: "Generative visual toy",
                description:
                  "An interactive visual experience driven by gestures, motion, or sound. Describe the feedback loop and what makes it mesmerizing.",
                category: "Experimental",
                tags: "visual, generative, interactive",
              },
              {
                label: "DASHBOARD",
                emoji: "📊",
                title: "Live data dashboard",
                description:
                  "A dashboard that surfaces one specific insight that was hard to see before. Describe the data source, the metric, and the decision it unlocks.",
                category: "AI Utility",
                tags: "data, dashboard, analytics",
              },
              {
                label: "SHARE MEME",
                emoji: "📤",
                title: "Shareable one-liner",
                description:
                  "A tiny interactive that generates something worth screenshotting. Describe the trigger, the output, and why people would share it.",
                category: "Demo",
                tags: "meme, social, viral",
              },
            ].map((tpl) => (
              <button
                key={tpl.label}
                type="button"
                onClick={() => {
                  setTitle(tpl.title);
                  setDescription(tpl.description);
                  setCategory(tpl.category);
                  setTags(tpl.tags);
                }}
                className="flex flex-col items-center gap-2 px-3 py-3 font-pixel transition-transform hover:scale-[1.04] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-violet-500/50"
                style={{
                  background: "rgba(0,0,0,0.5)",
                  border: "2px solid rgba(157,0,255,0.4)",
                  boxShadow: "3px 3px 0 #000",
                  color: "#C9B8E8",
                  minHeight: 80,
                  cursor: "pointer",
                }}
                aria-label={`Start from template: ${tpl.label}`}
              >
                <span aria-hidden="true" style={{ fontSize: 22 }}>
                  {tpl.emoji}
                </span>
                <span
                  style={{
                    fontSize: 10,
                    letterSpacing: 1,
                  }}
                >
                  {tpl.label}
                </span>
              </button>
            ))}
          </div>
        </motion.div>
      )}

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
            {submitError && (
              <div className="mt-8 rounded-lg border border-red-500/40 bg-red-500/10 p-4 text-center">
                <p className="font-ui text-red-300 text-xs tracking-wider">
                  <AlertCircle className="inline size-4 mr-2" />
                  {submitError}
                </p>
              </div>
            )}
            {submitted && (
              <div className="mt-8 rpgui-container framed p-4 text-center" style={{ padding: 16 }}>
                <p className="font-pixel text-emerald-400" style={{ fontSize: 12, textShadow: "0 0 10px rgba(57,255,20,0.3)" }}>
                  <CheckCircle2 className="inline size-4 mr-2" />
                  Hero forged! Taking you to your page…
                </p>
              </div>
            )}
            {!submitted && (
              <button
                type="submit"
                disabled={submitLoading}
                className="font-pixel w-full mt-8 relative flex items-center justify-center transition-transform hover:-translate-x-0.5 hover:-translate-y-0.5 disabled:opacity-60 disabled:hover:translate-x-0 disabled:hover:translate-y-0"
                style={{
                  height: 60,
                  fontSize: 14,
                  letterSpacing: 3,
                  color: "#1A0F00",
                  background: "#FF4500",
                  border: "4px solid #FFE27D",
                  boxShadow: "6px 6px 0 #000, inset 0 0 0 1px rgba(0,0,0,0.3), inset 0 12px 0 rgba(255,255,255,0.15), inset 0 -12px 0 rgba(0,0,0,0.25)",
                  textShadow: "0 1px 0 rgba(255,255,255,0.4)",
                }}
              >
                {submitLoading ? (
                  <>
                    <Loader2 className="size-4 mr-3 animate-spin" />
                    {t("launch.forging")}
                  </>
                ) : (
                  t("launch.submit")
                )}
              </button>
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
