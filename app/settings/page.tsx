"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Globe,
  Palette,
  Bell,
  Heart,
  MessageCircle,
  UserPlus,
  Monitor,
  Mail,
  Lock,
  Trash2,
  Settings,
} from "lucide-react";
import { useLang, type Lang } from "@/lib/i18n";

/* ─── Fade-in wrapper ─────────────────────────────────────────────────────── */

function FadeIn({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ─── Toggle switch ───────────────────────────────────────────────────────── */

function Toggle({
  enabled,
  onChange,
}: {
  enabled: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      role="switch"
      aria-checked={enabled}
      onClick={() => onChange(!enabled)}
      className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full border border-white/10 transition-colors ${
        enabled ? "bg-violet-600" : "bg-white/10"
      }`}
    >
      <span
        className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform ${
          enabled ? "translate-x-6" : "translate-x-1"
        }`}
      />
    </button>
  );
}

/* ─── Section card ────────────────────────────────────────────────────────── */

function SectionCard({
  icon: Icon,
  title,
  children,
}: {
  icon: typeof Settings;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="glass-card-strong rounded-xl border border-white/[0.06] bg-white/[0.03] p-6">
      <div className="mb-4 flex items-center gap-2.5">
        <Icon className="size-5 text-violet-400" />
        <h2 className="text-base font-semibold text-foreground">{title}</h2>
      </div>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

/* ─── Main page ───────────────────────────────────────────────────────────── */

export default function SettingsPage() {
  const { lang, setLang } = useLang();

  const [notifications, setNotifications] = useState({
    likes: true,
    comments: true,
    follows: false,
    system: true,
  });

  function updateNotification(key: keyof typeof notifications) {
    setNotifications((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  return (
    <div className="relative mx-auto max-w-2xl px-4 sm:px-6 py-16">
      {/* Background gradient orb */}
      <div className="pointer-events-none absolute -top-32 left-1/2 -translate-x-1/2 h-[400px] w-[400px] rounded-full bg-violet-600/8 blur-[120px]" />

      <FadeIn>
        <h1 className="mb-8 text-2xl font-bold text-foreground">设置</h1>
      </FadeIn>

      <div className="space-y-6">
        {/* Language */}
        <FadeIn delay={0.05}>
          <SectionCard icon={Globe} title="语言偏好">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">界面语言</p>
              <div className="flex gap-2">
                {(["zh", "en"] as const).map((l) => (
                  <button
                    key={l}
                    onClick={() => setLang(l)}
                    className={`rounded-lg px-4 py-1.5 text-sm font-medium transition-colors ${
                      lang === l
                        ? "bg-violet-600 text-white"
                        : "bg-white/[0.06] text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {l === "zh" ? "中文" : "English"}
                  </button>
                ))}
              </div>
            </div>
          </SectionCard>
        </FadeIn>

        {/* Theme */}
        <FadeIn delay={0.1}>
          <SectionCard icon={Palette} title="主题">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Monitor className="size-4 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">当前主题：暗色</p>
              </div>
              <span className="text-xs text-muted-foreground/60">更多主题即将推出</span>
            </div>
          </SectionCard>
        </FadeIn>

        {/* Notifications */}
        <FadeIn delay={0.15}>
          <SectionCard icon={Bell} title="通知偏好">
            {[
              { key: "likes" as const, icon: Heart, label: "点赞通知" },
              { key: "comments" as const, icon: MessageCircle, label: "评论通知" },
              { key: "follows" as const, icon: UserPlus, label: "关注通知" },
              { key: "system" as const, icon: Monitor, label: "系统通知" },
            ].map(({ key, icon: NIcon, label }) => (
              <div key={key} className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <NIcon className="size-4 text-muted-foreground" />
                  <p className="text-sm text-foreground">{label}</p>
                </div>
                <Toggle
                  enabled={notifications[key]}
                  onChange={() => updateNotification(key)}
                />
              </div>
            ))}
          </SectionCard>
        </FadeIn>

        {/* Account */}
        <FadeIn delay={0.2}>
          <SectionCard icon={Settings} title="账户">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Mail className="size-4 text-muted-foreground" />
                <p className="text-sm text-foreground">邮箱</p>
              </div>
              <p className="text-sm text-muted-foreground">user@vibex.app</p>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Lock className="size-4 text-muted-foreground" />
                <p className="text-sm text-foreground">修改密码</p>
              </div>
              <button
                disabled
                className="rounded-lg bg-white/[0.06] px-4 py-1.5 text-sm text-muted-foreground/50 cursor-not-allowed"
              >
                修改
              </button>
            </div>

            <div className="border-t border-white/[0.06] pt-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Trash2 className="size-4 text-red-400/60" />
                  <p className="text-sm text-red-400/80">删除账户</p>
                </div>
                <button
                  disabled
                  className="rounded-lg bg-red-500/10 px-4 py-1.5 text-sm text-red-400/50 cursor-not-allowed"
                >
                  删除
                </button>
              </div>
            </div>
          </SectionCard>
        </FadeIn>
      </div>
    </div>
  );
}
