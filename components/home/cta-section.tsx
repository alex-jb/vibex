"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Swords, Eye } from "lucide-react";
import { useLang } from "@/lib/i18n";
import type { WeeklyWinner } from "@/lib/types";

const pixelEase = [0.22, 1, 0.36, 1] as const;

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-40px" },
  transition: { duration: 0.5, ease: pixelEase },
};

interface CtaSectionProps {
  weeklyWinners: WeeklyWinner[];
}

export function CtaSection({ weeklyWinners }: CtaSectionProps) {
  const { t } = useLang();

  return (
    <section className="py-16 lg:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <motion.div {...fadeUp}>
          <div
            className="retro-dialog text-center py-16 px-6 sm:px-12"
            style={{ boxShadow: "0 0 40px rgba(157,0,255,0.1), 4px 4px 0 #000" }}
          >
            <div className="font-pixel text-[8px] mb-6 tracking-widest" style={{ color: "var(--neon-cyan)" }}>
              {t("cta.transmission")}
            </div>

            <h2
              className="font-pixel text-sm sm:text-base lg:text-lg mb-4"
              style={{ color: "var(--neon-yellow)", textShadow: "0 0 20px rgba(250,204,21,0.3)" }}
            >
              {t("cta.heading1")}
              <br />
              {t("cta.heading2")}
            </h2>

            <p className="font-retro text-base sm:text-lg max-w-xl mx-auto mb-8" style={{ color: "#888" }}>
              {t("cta.description")}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/launch">
                <button className="retro-button retro-button--primary flex items-center gap-2 mx-auto sm:mx-0">
                  <Swords size={14} />
                  <span>{t("cta.beginQuest")}</span>
                </button>
              </Link>
              <Link href="/explore">
                <button className="retro-button retro-button--danger flex items-center gap-2 mx-auto sm:mx-0">
                  <Eye size={14} />
                  <span>{t("cta.spectate")}</span>
                </button>
              </Link>
            </div>

            {weeklyWinners.length > 0 && (
              <div className="mt-10 pt-6 font-pixel text-[7px]" style={{ borderTop: "2px solid var(--border-metal)" }}>
                <span style={{ color: "#555" }}>{t("cta.lastWeekChampion")}</span>
                <span style={{ color: "var(--neon-yellow)" }}>{weeklyWinners[0].projectTitle}</span>
                <span style={{ color: "#555" }}>{t("cta.by")}</span>
                <span style={{ color: "var(--neon-green)" }}>{weeklyWinners[0].creatorName}</span>
                <span style={{ color: "#555" }}>
                  {t("cta.score")}
                  {weeklyWinners[0].score})
                </span>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
