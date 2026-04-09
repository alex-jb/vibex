"use client";

import { motion } from "framer-motion";
import {
  Calendar,
  MapPin,
  Globe,
  Users,
  Crown,
  Sparkles,
  Lock,
  ArrowRight,
  ExternalLink,
} from "lucide-react";
import { useEvents } from "@/lib/use-data";
import type { Event } from "@/lib/types";
import { SectionHeader } from "@/components/section-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useLang } from "@/lib/i18n";

const typeColors: Record<Event["type"], string> = {
  hackathon: "bg-violet-500/10 text-violet-400 border-violet-500/20",
  salon: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  meetup: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  "demo-day": "bg-blue-500/10 text-blue-400 border-blue-500/20",
};

const typeAccent: Record<Event["type"], string> = {
  hackathon: "from-violet-500 to-fuchsia-500",
  salon: "from-amber-500 to-orange-500",
  meetup: "from-emerald-500 to-teal-500",
  "demo-day": "from-blue-500 to-cyan-500",
};

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
};

function FeaturedEventCard({
  event,
  index,
}: {
  event: Event;
  index: number;
}) {
  const { t } = useLang();
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.12, ease: "easeOut" }}
      className="glass-card-strong noise-bg group relative flex flex-col overflow-hidden"
    >
      {/* Top accent bar */}
      <div
        className={`h-0.5 w-full bg-gradient-to-r ${typeAccent[event.type]}`}
      />

      <div className="flex flex-1 flex-col p-6">
        {/* Badges row */}
        <div className="flex items-center gap-2">
          <span
            className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize ${typeColors[event.type]}`}
          >
            {event.type.replace("-", " ")}
          </span>
          {event.isOnline && (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-0.5 text-xs font-medium text-emerald-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse-slow" />
              {t("events.online")}
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className="mt-4 text-xl font-bold tracking-tight text-white/95">
          {event.title}
        </h3>

        {/* Date + Location */}
        <div className="mt-4 flex flex-col gap-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-2.5">
            <Calendar className="h-4 w-4 shrink-0 text-white/30" />
            <span>{event.date}</span>
          </div>
          <div className="flex items-center gap-2.5">
            {event.isOnline ? (
              <Globe className="h-4 w-4 shrink-0 text-white/30" />
            ) : (
              <MapPin className="h-4 w-4 shrink-0 text-white/30" />
            )}
            <span>{event.location}</span>
          </div>
        </div>

        {/* Organizer */}
        <div className="mt-3 flex items-center gap-2.5 text-sm text-muted-foreground/70">
          <Users className="h-4 w-4 shrink-0 text-white/20" />
          <span>{event.organizer}</span>
        </div>

        {/* Description */}
        <p className="mt-4 text-sm leading-relaxed text-muted-foreground/80">
          {event.description}
        </p>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Register button */}
        <Button
          className="mt-6 w-full bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-lg shadow-violet-500/20 transition-all duration-300 hover:shadow-violet-500/40 hover:brightness-110 border-0"
          size="default"
        >
          <Sparkles className="mr-2 h-4 w-4" />
          {t("events.register")}
          <ArrowRight className="ml-auto h-4 w-4 opacity-60 transition-transform group-hover:translate-x-0.5" />
        </Button>
      </div>
    </motion.div>
  );
}

function CompactEventCard({
  event,
  index,
}: {
  event: Event;
  index: number;
}) {
  const { t } = useLang();
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.08, ease: "easeOut" }}
      className="glass-card group relative overflow-hidden"
    >
      {/* Thin top accent */}
      <div
        className={`h-px w-full bg-gradient-to-r ${typeAccent[event.type]} opacity-60`}
      />

      <div className="p-5">
        {/* Badges */}
        <div className="flex items-center gap-2">
          <span
            className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium capitalize ${typeColors[event.type]}`}
          >
            {event.type.replace("-", " ")}
          </span>
          {event.isOnline && (
            <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400/80">
              <span className="h-1 w-1 rounded-full bg-emerald-400" />
              {t("events.online")}
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className="mt-3 font-semibold text-white/90">{event.title}</h3>

        {/* Meta */}
        <div className="mt-3 flex flex-col gap-1.5 text-xs text-muted-foreground/70">
          <div className="flex items-center gap-2">
            <Calendar className="h-3.5 w-3.5 shrink-0" />
            <span>{event.date}</span>
          </div>
          <div className="flex items-center gap-2">
            {event.isOnline ? (
              <Globe className="h-3.5 w-3.5 shrink-0" />
            ) : (
              <MapPin className="h-3.5 w-3.5 shrink-0" />
            )}
            <span>{event.location}</span>
          </div>
        </div>

        {/* Register */}
        <Button
          variant="outline"
          size="sm"
          className="mt-4 w-full border-white/[0.06] bg-white/[0.02] text-xs hover:bg-white/[0.06] hover:border-white/10 transition-all duration-300"
        >
          <ExternalLink className="mr-1.5 h-3 w-3 opacity-50" />
          {t("events.register")}
        </Button>
      </div>
    </motion.div>
  );
}

export default function EventsPage() {
  const { t } = useLang();
  const { data: events } = useEvents();
  const featuredEvents = events.filter((e) => e.featured);
  const otherEvents = events.filter((e) => !e.featured);

  return (
    <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-16">
      {/* Background gradient orbs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 left-1/4 h-72 w-72 rounded-full bg-violet-600/8 blur-[120px]" />
        <div className="absolute top-48 right-1/6 h-56 w-56 rounded-full bg-fuchsia-600/6 blur-[100px]" />
        <div className="absolute bottom-32 left-1/3 h-48 w-48 rounded-full bg-blue-600/5 blur-[100px]" />
      </div>

      {/* Page Hero */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative"
      >
        <SectionHeader
          badge={t("events.community")}
          title={`${t("events.title")} ${t("events.titleHighlight")}`}
          description={t("events.description")}
        />
        {/* Override title with gradient */}
        <div className="mt-[-2.1rem] sm:mt-[-2.4rem]">
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            {t("events.title")}{" "}
            <span className="text-gradient">{t("events.titleHighlight")}</span>
          </h1>
        </div>
      </motion.div>

      {/* Featured Events */}
      <section className="relative mt-16">
        <motion.h2
          {...fadeUp}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="mb-8 flex items-center gap-2.5 text-sm font-semibold uppercase tracking-widest text-muted-foreground/60"
        >
          <Crown className="h-4 w-4 text-amber-400/80" />
          {t("events.featured")}
        </motion.h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredEvents.map((event, index) => (
            <FeaturedEventCard key={event.id} event={event} index={index} />
          ))}
        </div>
      </section>

      {/* Separator */}
      <Separator className="my-16 bg-white/[0.04]" />

      {/* All Events */}
      <section className="relative">
        <motion.h2
          {...fadeUp}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="mb-8 flex items-center gap-2.5 text-sm font-semibold uppercase tracking-widest text-muted-foreground/60"
        >
          {t("events.all")}
        </motion.h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {otherEvents.map((event, index) => (
            <CompactEventCard key={event.id} event={event} index={index} />
          ))}
        </div>
      </section>

      {/* Host an Event */}
      <section className="relative mt-20">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="border-glow noise-bg relative overflow-hidden rounded-2xl p-10 sm:p-12"
        >
          {/* Interior gradient orbs */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-2xl">
            <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-violet-600/10 blur-[80px]" />
            <div className="absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-fuchsia-600/8 blur-[70px]" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-32 w-32 rounded-full bg-violet-500/5 blur-[60px]" />
          </div>

          <div className="relative flex flex-col items-center text-center">
            {/* Lock icon with gradient ring */}
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 ring-1 ring-white/[0.06]">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-violet-500/30 to-fuchsia-500/30">
                <Lock className="h-5 w-5 text-violet-300/90" />
              </div>
            </div>

            {/* Title */}
            <h3 className="mt-6 text-2xl font-bold tracking-tight text-white/95">
              {t("events.hostTitle")}
            </h3>

            {/* Description */}
            <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground/70">
              {t("events.hostDesc")}
            </p>

            {/* Pro badge */}
            <Badge className="mt-5 border-0 bg-gradient-to-r from-violet-500/20 to-fuchsia-500/20 text-violet-300 ring-1 ring-violet-500/20 px-4 py-1 text-xs font-semibold">
              <Sparkles className="mr-1.5 h-3 w-3" />
              {t("events.pro")}
            </Badge>

            {/* Disabled button */}
            <Button
              variant="outline"
              className="mt-6 border-white/[0.06] bg-white/[0.02] text-muted-foreground/50 cursor-not-allowed opacity-70 hover:bg-white/[0.02]"
              disabled
            >
              <Lock className="mr-2 h-3.5 w-3.5" />
              {t("events.upgradeToPro")}
            </Button>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
