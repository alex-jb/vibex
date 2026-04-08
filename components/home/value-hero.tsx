"use client";

import { motion } from "framer-motion";
import Link from "next/link";

/**
 * Value Hero: 3-second value proposition.
 * Shows AFTER boot sequence, BEFORE the rest of the page.
 * Answers: "What is this and why should I care?"
 */
export function ValueHero() {
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
          Launch your AI product.
          <br />
          <span style={{ color: "#FACC15" }}>Get growth.</span>
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
          AI{"\u00A0"}feedback, distribution strategy, growth tracking{" "}
          — in one platform.
          <br />
          <span style={{ color: "#9D00FF" }}>
            AI{"\u00A0"}{"\u53CD\u9988 + \u5206\u53D1\u7B56\u7565 + \u589E\u957F\u8FFD\u8E2A"}{" "}
            — {"\u4E00\u7AD9\u5F0F\u5E73\u53F0\u3002"}
          </span>
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
              {"\uD83D\uDE80 Launch Project"}
            </button>
          </Link>
          <Link href="/explore">
            <button
              className="nes-btn"
              style={{ fontSize: 10, padding: "8px 24px" }}
            >
              {"\uD83D\uDD0D Explore"}
            </button>
          </Link>
          <Link href="/insights/growth">
            <button
              className="nes-btn"
              style={{ fontSize: 10, padding: "8px 24px" }}
            >
              {"\uD83D\uDCC8 Growth Intel"}
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
          {"\u2B50 AI-NATIVE CREATORS \u2022 50 LEVEL PROGRESSION \u2022 GROWTH ENGINE \u2022 OPEN PLATFORM"}
        </motion.div>
      </div>
    </section>
  );
}
