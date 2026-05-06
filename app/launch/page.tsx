"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { upload } from "@vercel/blob/client";
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
  Upload,
  Film,
} from "lucide-react";

import { useLang } from "@/lib/i18n";
import { trackEvent } from "@/lib/analytics";
import { triggerQuestComplete } from "@/lib/onboarding";
import type { LaunchPackage } from "@/lib/ai";
import { PHDayBanner } from "@/components/launch/ph-day-banner";
import { categories } from "@/lib/mock-data";
import { HeroCard, type HeroCardData } from "@/components/home/hero-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Lazy: only mounted after AI generation completes (LaunchPackageDisplay)
// or after user picks a demoType (DemoGenerator). Both are far below the
// fold and gated behind state — no point shipping their JS in the first
// paint of a 2200-line page.
const LaunchPackageDisplay = dynamic(
  () => import("@/components/launch/launch-package").then((m) => ({ default: m.LaunchPackageDisplay })),
  { ssr: false },
);
const DemoGenerator = dynamic(
  () => import("@/components/demo/demo-generator").then((m) => ({ default: m.DemoGenerator })),
  { ssr: false },
);

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
  const [demoVideoUrl, setDemoVideoUrl] = useState("");
  const [videoUploading, setVideoUploading] = useState(false);
  const [videoUploadPercent, setVideoUploadPercent] = useState(0);
  const [videoUploadError, setVideoUploadError] = useState<string | null>(null);
  const [videoDropActive, setVideoDropActive] = useState(false);
  const videoFileInputRef = useRef<HTMLInputElement | null>(null);
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
        demoVideoUrl?: string;
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
      if (draft.demoVideoUrl) setDemoVideoUrl(draft.demoVideoUrl);
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
            demoVideoUrl,
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
    demoVideoUrl,
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
    setDemoVideoUrl("");
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

  const handleVideoUpload = useCallback(async (file: File) => {
    // Client-side guards — the server route also enforces these, but
    // failing fast here avoids a pointless round-trip for an obviously
    // bad file.
    if (!/^video\/(mp4|webm)$/i.test(file.type)) {
      setVideoUploadError("MP4 or WebM only.");
      return;
    }
    if (file.size > 25 * 1024 * 1024) {
      setVideoUploadError("File must be 25 MB or less.");
      return;
    }
    setVideoUploadError(null);
    setVideoUploading(true);
    setVideoUploadPercent(0);
    try {
      const suffix = file.name.replace(/[^a-zA-Z0-9.-]/g, "-").slice(-40);
      const blob = await upload(`demo-videos/${Date.now()}-${suffix}`, file, {
        access: "public",
        handleUploadUrl: "/api/blob/upload-video",
        onUploadProgress: (event) => {
          setVideoUploadPercent(Math.max(0, Math.min(100, Math.round(event.percentage))));
        },
      });
      setDemoVideoUrl(blob.url);
      setVideoUploadPercent(100);
    } catch (e) {
      setVideoUploadError(
        e instanceof Error ? e.message : "Upload failed — try again.",
      );
    } finally {
      setVideoUploading(false);
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
    trackEvent("project_submit_started", {
      category,
      hasVideo: Boolean(demoVideoUrl.trim()),
      demoType: demoType || "preview",
    });
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
          demoVideoUrl: demoVideoUrl.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        trackEvent("project_submit_failed", {
          category,
          reason: data?.error ?? `http_${res.status}`,
        });
        setSubmitError(data?.error ?? "Submit failed");
        setSubmitLoading(false);
        return;
      }

      trackEvent("project_submit_completed", {
        projectId: data.id,
        category,
        persisted: Boolean(data.persisted),
      });

      // Clear the autosaved draft so returning to /launch starts fresh.
      try { localStorage.removeItem(DRAFT_KEY); } catch { /* ignore */ }

      // Quest auto-complete: "First Post". Drops a self-notification
      // that the realtime toast surfaces. Idempotent via localStorage
      // dedup — re-submitting won't re-toast. Fire-and-forget so the
      // submit redirect isn't blocked.
      triggerQuestComplete("first_post").catch(() => {});

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
        router.push(`/project/${encodeURIComponent(data.id)}?forged=1`);
      }, 650);
    } catch (err) {
      console.error("[launch] submit failed", err);
      trackEvent("project_submit_failed", { category, reason: "network" });
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
            "radial-gradient(ellipse at 50% 45%, rgba(255,69,0,0.22), transparent 55%), radial-gradient(ellipse at 50% 45%, rgba(255,226,125,0.06), transparent 75%), var(--bg-deep)",
        }}
      >
        {/* Floating ember particles — forge palette only */}
        {[
          { top: "30%", left: "22%", color: "#FF4500", delay: 0 },
          { top: "70%", left: "75%", color: "#FFE27D", delay: 1 },
          { top: "22%", right: "25%", color: "#FF4500", delay: 2 },
          { top: "68%", left: "20%", color: "#FFE27D", delay: 0.5 },
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
          {/* Forge ember glow behind */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute"
            style={{
              inset: "-120px -80px",
              background:
                "radial-gradient(ellipse, rgba(255,69,0,0.45) 0%, rgba(255,226,125,0.15) 35%, transparent 70%)",
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
                "0 0 14px rgba(232,232,236,0.35), 0 0 30px rgba(255,69,0,0.35)",
            }}
          >
            PASTE YOUR AI PROJECT.
            <br />
            <span
              style={{
                color: "#FF4500",
                textShadow: "0 0 14px rgba(255,69,0,0.7), 3px 3px 0 #000",
              }}
            >
              WE FORGE THE REST.
            </span>
          </h1>

          {/* 3-step onboarding primer — only shows on empty hero (first-visit).
              Smith-idle + three pixel-font tips so new creators see the
              loop before they even paste a URL. */}
          <div className="flex items-center justify-center gap-5 mb-6 sm:mb-8">
            <Image
              src="/generated/smith-idle.png"
              alt=""
              width={80}
              height={80}
              unoptimized
              className="hidden sm:block shrink-0"
              style={{
                imageRendering: "pixelated",
                filter: "drop-shadow(0 0 8px rgba(255,69,0,0.5))",
              }}
            />
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 text-left">
              {[
                { step: "1", text: "DROP A URL" },
                { step: "2", text: "CLAUDE SCORES 0–100" },
                { step: "3", text: "WATCH IT EVOLVE" },
              ].map((t, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2"
                  style={{
                    fontFamily: "var(--font-press-start), monospace",
                    fontSize: 9,
                    letterSpacing: 1.5,
                  }}
                >
                  <span
                    style={{
                      padding: "4px 7px",
                      background: "#FF4500",
                      color: "#0A0A0C",
                      border: "1.5px solid #FFE27D",
                      boxShadow: "2px 2px 0 #000",
                    }}
                  >
                    {t.step}
                  </span>
                  <span style={{ color: "#FFE27D" }}>{t.text}</span>
                </div>
              ))}
            </div>
          </div>

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
                border: "3px solid rgba(255,69,0,0.65)",
                color: "var(--text)",
                fontFamily: "var(--font-vt323), monospace",
                letterSpacing: 0.5,
                boxShadow:
                  "inset 0 4px 8px rgba(0,0,0,0.7), 0 0 30px rgba(255,69,0,0.3), 0 0 60px rgba(255,69,0,0.15)",
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
                background: "#FF4500",
                color: "#0A0A0C",
                fontFamily: "var(--font-press-start), monospace",
                border: "3px solid #FFE27D",
                boxShadow: "3px 3px 0 #000, 0 0 20px rgba(255,69,0,0.7)",
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
      {/* Forge ember glow — single orange pulse replaces the old violet/fuchsia orbs */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 h-[360px] w-[520px] rounded-full"
        style={{ background: "radial-gradient(closest-side, rgba(255,69,0,0.18), transparent 70%)" }}
      />

      {/* PH-day live banner — renders countdown / live state / nothing */}
      <PHDayBanner />

      {/* Mobile sticky preview strip — lg:hidden so desktop uses the right-column
          full HeroCard preview instead. Shows sprite + name + compound placeholder
          + forge state label. Hidden when form is submitted (redirect incoming). */}
      {!submitted && (filledFieldCount > 0 || showForm) && (
        <div
          className="lg:hidden sticky top-2 z-40 -mx-2 sm:-mx-4 mb-5"
          style={{ backdropFilter: "blur(6px)" }}
        >
          <div
            className="mx-2 sm:mx-4 flex items-center gap-3 px-3 py-2"
            style={{
              background: "rgba(13,13,13,0.88)",
              border: submitLoading ? "2px solid #FF4500" : "2px solid #3A3A42",
              boxShadow: submitLoading
                ? "3px 3px 0 #000, 0 0 24px rgba(255,69,0,0.4)"
                : "3px 3px 0 #000",
              transition: "border-color 0.3s ease, box-shadow 0.3s ease",
            }}
          >
            <Image
              src="/generated/evo-1-seed.png"
              alt=""
              width={44}
              height={44}
              style={{
                imageRendering: "pixelated",
                filter: submitLoading
                  ? "drop-shadow(0 0 8px #FF4500)"
                  : "drop-shadow(0 0 4px rgba(212,212,216,0.4))",
                flexShrink: 0,
              }}
            />
            <div className="flex-1 min-w-0">
              <div
                className="font-pixel truncate"
                style={{
                  fontSize: 10,
                  letterSpacing: 0.5,
                  color: "#FFFCEB",
                  textShadow: "1px 1px 0 #000",
                }}
              >
                {title || "—"}
              </div>
              <motion.div
                className="font-ui"
                style={{
                  fontSize: 7,
                  letterSpacing: 2,
                  color: submitLoading ? "#FF4500" : "#8B7AA0",
                  marginTop: 2,
                }}
                animate={submitLoading ? { opacity: [1, 0.5, 1] } : { opacity: 1 }}
                transition={{ duration: 0.8, repeat: submitLoading ? Infinity : 0 }}
              >
                {submitLoading
                  ? "🔨 FORGING · CLAUDE REVIEWING"
                  : "SEED · PENDING CLAUDE"}
              </motion.div>
            </div>
            <div className="flex flex-col items-end" style={{ flexShrink: 0 }}>
              <span
                className="font-ui"
                style={{ fontSize: 7, letterSpacing: 1.5, color: "#8B7AA0" }}
              >
                COMPOUND
              </span>
              <span
                className="font-pixel"
                style={{
                  fontSize: 18,
                  color: "#FACC15",
                  lineHeight: 0.9,
                  textShadow: "1px 1px 0 #000, 0 0 6px rgba(250,204,21,0.4)",
                  marginTop: 2,
                }}
              >
                ??
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Page Hero */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative text-center mb-14"
      >
        <div
          className="inline-flex items-center gap-2 px-4 py-1.5 mb-5"
          style={{
            border: "1px solid rgba(255,69,0,0.35)",
            background: "rgba(255,69,0,0.08)",
          }}
        >
          <Rocket className="size-3.5" style={{ color: "#FF4500" }} />
          <span
            className="font-ui text-[11px] tracking-[3px]"
            style={{ color: "#FF4500" }}
          >
            {t("launch.badge")}
          </span>
        </div>
        <h1
          className="font-pixel text-[22px] sm:text-[30px] md:text-[36px]"
          style={{
            color: "#FFFCEB",
            letterSpacing: 3,
            lineHeight: 1.25,
            textShadow:
              "-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000, 4px 4px 0 #000, 0 0 28px rgba(255,69,0,0.35)",
          }}
        >
          {t("launch.title")}{" "}
          <span
            style={{
              background:
                "linear-gradient(180deg, #FFE27D 0%, #FF4500 70%, #B8380B 100%)",
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            {t("launch.titleHighlight")}
          </span>
        </h1>
        <p
          className="font-retro mt-4 max-w-lg mx-auto text-[17px] sm:text-[20px]"
          style={{
            color: "rgba(232,232,236,0.85)",
            lineHeight: 1.35,
            textShadow: "0 2px 0 rgba(0,0,0,0.7)",
          }}
        >
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
                className="pl-10 bg-white/5 border-white/[0.12] focus-visible:border-[color:var(--neon-orange)] focus-visible:ring-[var(--neon-orange)]/30 h-11"
              />
            </div>
            <Button
              onClick={handleQuickScrape}
              disabled={scrapeLoading || !quickUrl.trim()}
              className="font-pixel h-11 px-6 shrink-0 border-0 hover:-translate-x-0.5 hover:-translate-y-0.5 transition-transform disabled:hover:translate-x-0 disabled:hover:translate-y-0"
              style={{
                background: "#FF4500",
                border: "2px solid #FFE27D",
                color: "#1A0F00",
                boxShadow: "3px 3px 0 #000, inset 0 8px 0 rgba(255,255,255,0.12), inset 0 -8px 0 rgba(0,0,0,0.2)",
                fontSize: 11,
                letterSpacing: 2,
              }}
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
              <FormField label={t("launch.projectTitle")} filled={!!title.trim()}>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={t("launch.titlePlaceholder")}
                  className="bg-white/5 border-white/[0.08] focus-visible:border-[color:var(--neon-orange)] focus-visible:ring-[var(--neon-orange)]/30"
                />
              </FormField>

              <FormField label={t("launch.tagline")} filled={!!tagline.trim()}>
                <Input
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  placeholder={t("launch.taglinePlaceholder")}
                  className="bg-white/5 border-white/[0.08] focus-visible:border-[color:var(--neon-orange)] focus-visible:ring-[var(--neon-orange)]/30"
                />
              </FormField>
            </div>

            <Separator className="my-6 bg-white/[0.06]" />

            {/* Section: Details */}
            <SectionLabel>{t("launch.details")}</SectionLabel>
            <div className="flex flex-col gap-5 mt-3">
              <FormField label={t("launch.descriptionLabel")} filled={!!description.trim()}>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder={t("launch.descriptionPlaceholder")}
                  rows={6}
                  className="bg-white/5 border-white/[0.08] focus-visible:border-[color:var(--neon-orange)] focus-visible:ring-[var(--neon-orange)]/30"
                />
              </FormField>

              <FormField label={t("launch.category")} filled={!!category}>
                <Select
                  value={category}
                  onValueChange={(v) => setCategory(v ?? "")}
                >
                  <SelectTrigger className="w-full bg-white/5 border-white/[0.08] focus-visible:border-[color:var(--neon-orange)]">
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

              <FormField label={t("launch.demoType")} filled={!!demoType}>
                <Select
                  value={demoType}
                  onValueChange={(v) => setDemoType(v ?? "")}
                >
                  <SelectTrigger className="w-full bg-white/5 border-white/[0.08] focus-visible:border-[color:var(--neon-orange)]">
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
              <FormField label={t("launch.demoLink")} filled={!!demoLink.trim()}>
                <Input
                  value={demoLink}
                  onChange={(e) => setDemoLink(e.target.value)}
                  placeholder="https://..."
                  className="bg-white/5 border-white/[0.08] focus-visible:border-[color:var(--neon-orange)] focus-visible:ring-[var(--neon-orange)]/30"
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

              <FormField label={t("launch.thumbnailUrl")} filled={!!thumbnailUrl.trim()}>
                <Input
                  value={thumbnailUrl}
                  onChange={(e) => setThumbnailUrl(e.target.value)}
                  placeholder="https://..."
                  className="bg-white/5 border-white/[0.08] focus-visible:border-[color:var(--neon-orange)] focus-visible:ring-[var(--neon-orange)]/30"
                />
              </FormField>

              {/* Optional demo video — direct upload to Vercel Blob (MP4/WebM
                  ≤25MB) or paste an existing https:// URL. Renders inside
                  HeroCard in place of the static evo sprite. */}
              <FormField
                label="Demo video (MP4/WebM, ≤25 MB, optional)"
                filled={!!demoVideoUrl.trim()}
              >
                <div
                  onDragOver={(e) => {
                    if (videoUploading) return;
                    // Only treat as a video drop if the drag carries a file
                    // (prevents highlighting on stray text drags).
                    if (!Array.from(e.dataTransfer.items).some((i) => i.kind === "file")) return;
                    e.preventDefault();
                    setVideoDropActive(true);
                  }}
                  onDragLeave={(e) => {
                    // Only clear when the cursor leaves the outer box, not
                    // when it crosses a child element.
                    if (e.currentTarget.contains(e.relatedTarget as Node)) return;
                    setVideoDropActive(false);
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    setVideoDropActive(false);
                    if (videoUploading) return;
                    const f = e.dataTransfer.files?.[0];
                    if (f) handleVideoUpload(f);
                  }}
                  className="flex flex-col gap-2 p-3 transition-colors"
                  style={{
                    border: videoDropActive
                      ? "2px dashed #FF4500"
                      : "2px dashed rgba(255,69,0,0.25)",
                    background: videoDropActive ? "rgba(255,69,0,0.08)" : "transparent",
                  }}
                >
                  <div
                    className="font-pixel text-center"
                    style={{
                      fontSize: 8,
                      letterSpacing: 2,
                      color: videoDropActive ? "#FFE27D" : "rgba(255,226,125,0.55)",
                      textShadow: videoDropActive ? "0 0 6px #FF4500" : "none",
                      transition: "color 120ms, text-shadow 120ms",
                    }}
                  >
                    {videoDropActive ? "▼ DROP TO FORGE ▼" : "▸ DRAG MP4 HERE OR PICK A FILE ◂"}
                  </div>
                  <input
                    ref={videoFileInputRef}
                    type="file"
                    accept="video/mp4,video/webm"
                    className="sr-only"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) handleVideoUpload(f);
                      // Reset so picking the same file again re-triggers.
                      e.target.value = "";
                    }}
                  />
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => videoFileInputRef.current?.click()}
                      disabled={videoUploading}
                      className="flex items-center gap-2 px-3 py-2 font-pixel text-xs transition-colors hover:bg-[color:var(--neon-orange)]/10 disabled:opacity-60"
                      style={{
                        background: "rgba(0,0,0,0.35)",
                        border: "2px solid rgba(255,69,0,0.5)",
                        color: "#FFE27D",
                        letterSpacing: 1.5,
                        minHeight: 40,
                        cursor: videoUploading ? "wait" : "pointer",
                      }}
                    >
                      {videoUploading ? (
                        <>
                          <Loader2 className="size-3.5 animate-spin" />
                          UPLOADING…
                        </>
                      ) : (
                        <>
                          <Upload className="size-3.5" />
                          UPLOAD MP4
                        </>
                      )}
                    </button>
                    <Input
                      value={demoVideoUrl}
                      onChange={(e) => setDemoVideoUrl(e.target.value)}
                      placeholder="https://... .mp4 or .webm (or drop file above)"
                      className="flex-1 bg-white/5 border-white/[0.08] focus-visible:border-[color:var(--neon-orange)] focus-visible:ring-[var(--neon-orange)]/30"
                    />
                  </div>
                  {videoUploading && (
                    <div className="flex items-center gap-2">
                      <div
                        className="relative flex-1 overflow-hidden"
                        style={{
                          height: 10,
                          background: "#0A0A0C",
                          border: "1.5px solid rgba(255,69,0,0.5)",
                        }}
                      >
                        <div
                          className="absolute top-0 left-0 h-full"
                          style={{
                            width: `${videoUploadPercent}%`,
                            background: "linear-gradient(90deg, #FF4500, #FFE27D)",
                            boxShadow: "0 0 8px rgba(255,69,0,0.8)",
                            transition: "width 160ms ease-out",
                          }}
                        />
                      </div>
                      <span
                        className="font-pixel"
                        style={{ fontSize: 8, color: "#FFE27D", letterSpacing: 1.5, minWidth: 36 }}
                      >
                        {videoUploadPercent}%
                      </span>
                    </div>
                  )}
                  {videoUploadError && (
                    <div
                      className="font-retro text-xs px-2 py-1"
                      style={{
                        color: "#FF6B6B",
                        background: "rgba(255,0,77,0.1)",
                        border: "1px solid rgba(255,0,77,0.35)",
                      }}
                    >
                      <AlertCircle className="inline size-3 mr-1" />
                      {videoUploadError}
                    </div>
                  )}
                  {demoVideoUrl.trim() && !videoUploading && (
                    <div className="flex flex-col gap-2">
                      <div
                        className="flex items-center gap-2 font-retro text-xs"
                        style={{ color: "#FFE27D" }}
                      >
                        <Film className="size-3" style={{ color: "#FF4500" }} />
                        <span className="truncate" title={demoVideoUrl}>
                          {demoVideoUrl.length > 60
                            ? demoVideoUrl.slice(0, 30) + "…" + demoVideoUrl.slice(-24)
                            : demoVideoUrl}
                        </span>
                      </div>
                      {/* Render a small looping preview so the creator sees
                          exactly what's about to be embedded on their card. */}
                      <video
                        src={demoVideoUrl}
                        autoPlay
                        muted
                        loop
                        playsInline
                        preload="metadata"
                        style={{
                          width: 160,
                          height: 96,
                          objectFit: "cover",
                          background: "#0A0A0C",
                          border: "2px solid rgba(255,69,0,0.6)",
                          boxShadow: "2px 2px 0 #000",
                          imageRendering: "pixelated",
                        }}
                      />
                    </div>
                  )}
                </div>
              </FormField>
            </div>

            <Separator className="my-6 bg-white/[0.06]" />

            {/* Section: Creator */}
            <SectionLabel>{t("launch.creator")}</SectionLabel>
            <div className="flex flex-col gap-5 mt-3">
              <FormField label={t("launch.creatorName")} filled={!!creatorName.trim()}>
                <Input
                  value={creatorName}
                  onChange={(e) => setCreatorName(e.target.value)}
                  placeholder={t("launch.creatorPlaceholder")}
                  className="bg-white/5 border-white/[0.08] focus-visible:border-[color:var(--neon-orange)] focus-visible:ring-[var(--neon-orange)]/30"
                />
              </FormField>

              <FormField label={t("launch.tags")} filled={!!tags.trim()}>
                <Input
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder={t("launch.tagsPlaceholder")}
                  className="bg-white/5 border-white/[0.08] focus-visible:border-[color:var(--neon-orange)] focus-visible:ring-[var(--neon-orange)]/30"
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
              <div
                className="mt-8 flex flex-col items-center gap-3 p-6 text-center"
                style={{
                  background: "#0A0A0C",
                  border: "3px solid #FF4500",
                  boxShadow: "6px 6px 0 #000, 0 0 32px rgba(255,69,0,0.45)",
                }}
              >
                <Image
                  src="/generated/smith-happy.png"
                  alt=""
                  width={128}
                  height={128}
                  unoptimized
                  style={{
                    imageRendering: "pixelated",
                    filter: "drop-shadow(0 0 12px rgba(255,69,0,0.6))",
                  }}
                />
                <p
                  className="font-pixel"
                  style={{
                    fontSize: 14,
                    letterSpacing: 2,
                    color: "#FFE27D",
                    textShadow: "2px 2px 0 #000, 0 0 10px rgba(255,69,0,0.8)",
                  }}
                >
                  ⚒ HERO FORGED ⚒
                </p>
                <p
                  className="font-retro"
                  style={{ fontSize: 13, color: "#8A7B9A", letterSpacing: 0.5 }}
                >
                  Taking you to your page…
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

        {/* Right: Live Preview + AI Assistant Panel (2/5) */}
        <motion.div
          className="lg:col-span-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <div className="sticky top-24 flex flex-col gap-5">
            {/* Live HeroCard preview — Direction A. Seed-locked pre-submit:
                frame / sprite / rank / compound stay Seed until Claude runs.
                Only user-owned fields (name, creator, category) react live.
                During submitLoading, the card "forges" — shakes on hammer hits
                + emits pixel sparks + eyebrow pulses between orange + yellow. */}
            <div className="hidden lg:flex flex-col items-center gap-2">
              <motion.div
                className="font-ui"
                style={{
                  fontSize: 10,
                  letterSpacing: 3,
                  color: "#FF4500",
                  textShadow: "0 0 4px rgba(255,69,0,0.5)",
                }}
                animate={
                  submitLoading
                    ? { color: ["#FF4500", "#FACC15", "#FF4500"] }
                    : { color: "#FF4500" }
                }
                transition={{
                  duration: 0.6,
                  repeat: submitLoading ? Infinity : 0,
                }}
              >
                {submitLoading ? "🔨 FORGING HERO…" : "▸ LIVE FORGE PREVIEW"}
              </motion.div>
              <motion.div
                className="relative"
                animate={
                  submitLoading
                    ? { x: [0, -3, 4, -2, 3, 0], rotate: [0, -0.3, 0.4, -0.2, 0] }
                    : { x: 0, rotate: 0 }
                }
                transition={{
                  duration: 0.45,
                  repeat: submitLoading ? Infinity : 0,
                  ease: "easeInOut",
                }}
                style={{
                  filter: submitLoading
                    ? "drop-shadow(0 0 24px rgba(255,69,0,0.55))"
                    : "none",
                  transition: "filter 0.3s ease",
                }}
              >
                <HeroCard
                  data={
                    {
                      id: "preview",
                      name: title || "—",
                      creator: creatorName || "newuser",
                      category: (category || "—").toUpperCase(),
                      evolutionStage: "Seed",
                      compound: 0,
                      topAttrs: [
                        { code: "ORG", label: "Originality", value: 0 },
                        { code: "CLR", label: "Clarity", value: 0 },
                      ],
                      traction: { kind: "plays", value: 0 },
                      newChip: true,
                    } satisfies HeroCardData
                  }
                />
                {/* Forge sparks — only visible during submitLoading. 6 pixel dots
                    radiating from center, staggered, looping. */}
                {submitLoading && (
                  <div
                    aria-hidden
                    className="pointer-events-none absolute inset-0 flex items-center justify-center"
                  >
                    {[
                      { x: -80, y: -60, delay: 0, color: "#FFE27D" },
                      { x: 70, y: -50, delay: 0.1, color: "#FF4500" },
                      { x: -50, y: 70, delay: 0.2, color: "#FACC15" },
                      { x: 90, y: 40, delay: 0.3, color: "#FF4500" },
                      { x: -90, y: 10, delay: 0.4, color: "#FFE27D" },
                      { x: 60, y: -80, delay: 0.5, color: "#FACC15" },
                    ].map((s, i) => (
                      <motion.span
                        key={i}
                        style={{
                          position: "absolute",
                          width: 4,
                          height: 4,
                          background: s.color,
                          boxShadow: `0 0 6px ${s.color}`,
                        }}
                        initial={{ x: 0, y: 0, opacity: 0, scale: 0 }}
                        animate={{
                          x: [0, s.x * 0.3, s.x],
                          y: [0, s.y * 0.3, s.y],
                          opacity: [0, 1, 0],
                          scale: [0, 1.3, 0],
                        }}
                        transition={{
                          duration: 1.1,
                          delay: s.delay,
                          repeat: Infinity,
                          ease: "easeOut",
                        }}
                      />
                    ))}
                  </div>
                )}
              </motion.div>
              <motion.div
                className="font-ui"
                style={{
                  fontSize: 8,
                  letterSpacing: 2,
                  color: "#8B7AA0",
                  marginTop: 2,
                }}
                animate={
                  submitLoading ? { opacity: [1, 0.4, 1] } : { opacity: 1 }
                }
                transition={{
                  duration: 0.8,
                  repeat: submitLoading ? Infinity : 0,
                }}
              >
                {submitLoading
                  ? "⏱ CLAUDE REVIEWING · ATTRIBUTES FORGING"
                  : "⏳ PENDING CLAUDE · STRIKE ANVIL TO FORGE"}
              </motion.div>
            </div>

            <div className="glass-card-strong border-glow noise-bg rounded-xl border border-white/[0.06] p-6 overflow-hidden">
              {/* Header */}
              <div className="flex items-center gap-3 mb-1">
                <div
                  className="flex size-9 items-center justify-center"
                  style={{
                    background: "#FF4500",
                    border: "2px solid #FFE27D",
                    boxShadow: "2px 2px 0 #000",
                  }}
                >
                  <Sparkles className="size-4" style={{ color: "#1A0F00" }} />
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
                  className="font-pixel w-full h-10 border-0 hover:-translate-x-0.5 hover:-translate-y-0.5 transition-transform disabled:hover:translate-x-0 disabled:hover:translate-y-0"
                  style={{
                    background: "#FF4500",
                    border: "2px solid #FFE27D",
                    color: "#1A0F00",
                    boxShadow: "3px 3px 0 #000, inset 0 6px 0 rgba(255,255,255,0.12), inset 0 -6px 0 rgba(0,0,0,0.2)",
                    fontSize: 10,
                    letterSpacing: 2,
                  }}
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
                <div
                  className="mt-4 p-4"
                  style={{
                    border: "1px solid rgba(255,69,0,0.35)",
                    background: "rgba(255,69,0,0.06)",
                  }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="size-3.5" style={{ color: "#FF4500" }} />
                    <span className="font-ui text-xs uppercase" style={{ color: "#FF4500", letterSpacing: 2 }}>
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
    <div
      className="font-ui flex items-center gap-2"
      style={{
        fontSize: 10,
        letterSpacing: 3,
        color: "var(--neon-green)",
        textShadow: "0 0 4px rgba(57,255,20,0.6)",
      }}
    >
      <span aria-hidden style={{ display: "inline-block", width: 8, height: 8, background: "#FF4500", boxShadow: "0 0 6px rgba(255,69,0,0.8)" }} />
      <h3 className="m-0 uppercase">{children}</h3>
    </div>
  );
}

/**
 * FormField — Direction A "forge plate".
 * Grey/orange 2px frame, pixel eyebrow label, bottom heat-gradient strip that
 * glows orange when the input has content. Wraps existing shadcn primitives
 * so we don't have to restyle every Input/Textarea/Select internal — the plate
 * provides the chrome, the primitives provide the behavior.
 */
function FormField({
  label,
  filled,
  children,
}: {
  label: string;
  filled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div
      className="relative transition-colors"
      style={{
        border: filled ? "2px solid rgba(255,69,0,0.55)" : "2px solid #3A3A42",
        background: "#0D0D0D",
        boxShadow: filled
          ? "inset 0 0 24px rgba(255,69,0,0.08), 2px 2px 0 #000"
          : "2px 2px 0 #000",
      }}
    >
      <label
        className="font-ui block"
        style={{
          fontSize: 9,
          letterSpacing: 3,
          color: filled ? "#FF4500" : "#8B7AA0",
          padding: "10px 14px 2px",
          textShadow: filled ? "0 0 4px rgba(255,69,0,0.4)" : "none",
        }}
      >
        ▸ {label.toUpperCase()}
      </label>
      <div className="px-2.5 pb-2.5 pt-1">{children}</div>
      <div
        aria-hidden
        style={{
          height: 2,
          background: filled
            ? "linear-gradient(90deg, transparent 0%, rgba(255,69,0,0.85) 50%, transparent 100%)"
            : "linear-gradient(90deg, transparent 0%, rgba(139,122,160,0.3) 50%, transparent 100%)",
          transition: "background 0.3s ease",
        }}
      />
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
