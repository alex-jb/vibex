"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useLang } from "@/lib/i18n";

/**
 * Value Hero: 3-second value proposition.
 * Shows AFTER boot sequence, BEFORE the rest of the page.
 */
export function ValueHero() {
  const { t } = useLang();

  return (
    <section
      style={{
        textAlign: "center",
        padding: "48px 20px 40px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Subtle grid background */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse at center, #9D00FF08 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      <div style={{ position: "relative", zIndex: 2, maxWidth: 640, margin: "0 auto" }}>
        {/* Main headline */}
        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="font-pixel"
          style={{
            fontSize: 18,
            color: "#E8E8EC",
            lineHeight: 1.4,
            marginBottom: 12,
            letterSpacing: 1,
          }}
        >
          {t("valuehero.headline1")}
          <br />
          <span style={{ color: "#FACC15" }}>{t("valuehero.headline2")}</span>
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="font-retro"
          style={{
            fontSize: 16,
            color: "#888",
            lineHeight: 1.6,
            marginBottom: 24,
          }}
        >
          {t("valuehero.subheadline")}
        </motion.p>

        {/* CTA buttons */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          style={{ display: "flex", justifyContent: "center", gap: 12, flexWrap: "wrap" }}
        >
          <Link href="/launch">
            <button
              className="nes-btn is-primary"
              style={{ fontSize: 10, padding: "8px 24px" }}
            >
              {t("valuehero.launch")}
            </button>
          </Link>
          <Link href="/discover">
            <button
              className="nes-btn"
              style={{ fontSize: 10, padding: "8px 24px" }}
            >
              {t("valuehero.explore")}
            </button>
          </Link>
          <Link href="/insights/growth">
            <button
              className="nes-btn"
              style={{ fontSize: 10, padding: "8px 24px" }}
            >
              {t("valuehero.growth")}
            </button>
          </Link>
        </motion.div>

        {/* Social proof line */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="font-pixel"
          style={{
            fontSize: 7,
            color: "#555",
            marginTop: 20,
            letterSpacing: 1,
          }}
        >
          {t("valuehero.social")}
        </motion.div>
      </div>
    </section>
  );
}
