"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { useLang } from "@/lib/i18n";
import { prepare, layout, type PreparedHandle } from "@/lib/pretext";

/**
 * Value Hero: 3-second value proposition.
 * Shows AFTER boot sequence, BEFORE the rest of the page.
 *
 * Text layout uses Pretext to measure and size the headline so it reflows
 * correctly at every width without a hardcoded <br />. Critical for EN/ZH
 * parity: Press Start 2P renders wider than VT323, and Chinese glyph widths
 * differ again, so a CSS-only break would misfire on one locale or the other.
 */
export function ValueHero() {
  const { t, lang } = useLang();

  const headlineRef = useRef<HTMLHeadingElement | null>(null);
  const subheadRef = useRef<HTMLParagraphElement | null>(null);

  const headline1 = t("valuehero.headline1");
  const headline2 = t("valuehero.headline2");
  const subheadText = t("valuehero.subheadline");

  useEffect(() => {
    const headlineEl = headlineRef.current;
    const subheadEl = subheadRef.current;
    if (!headlineEl || !subheadEl) return;

    const fontOf = (el: HTMLElement) => {
      const cs = getComputedStyle(el);
      return `${cs.fontStyle} ${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
    };
    const lineHeightOf = (el: HTMLElement) => {
      const cs = getComputedStyle(el);
      const lh = parseFloat(cs.lineHeight);
      return Number.isFinite(lh) ? lh : parseFloat(cs.fontSize) * 1.4;
    };

    const headlineText = `${headline1} ${headline2}`;

    let headlineHandle: PreparedHandle | null = null;
    let subheadHandle: PreparedHandle | null = null;

    const reprepare = () => {
      headlineHandle = prepare(headlineText, fontOf(headlineEl));
      subheadHandle = prepare(subheadText, fontOf(subheadEl));
    };

    const relayout = () => {
      if (!headlineHandle || !subheadHandle) return;
      const headW = headlineEl.clientWidth;
      const subW = subheadEl.clientWidth;
      if (headW > 0) {
        const { height } = layout(headlineHandle, headW, lineHeightOf(headlineEl));
        headlineEl.style.height = `${height}px`;
      }
      if (subW > 0) {
        const { height } = layout(subheadHandle, subW, lineHeightOf(subheadEl));
        subheadEl.style.height = `${height}px`;
      }
    };

    let cancelled = false;
    const boot = async () => {
      try {
        await document.fonts.ready;
      } catch {}
      if (cancelled) return;
      reprepare();
      relayout();
    };
    boot();

    const ro = new ResizeObserver(() => relayout());
    ro.observe(headlineEl);
    ro.observe(subheadEl);

    const onFontsLoaded = () => {
      reprepare();
      relayout();
    };
    document.fonts?.addEventListener?.("loadingdone", onFontsLoaded);

    return () => {
      cancelled = true;
      ro.disconnect();
      document.fonts?.removeEventListener?.("loadingdone", onFontsLoaded);
    };
  }, [headline1, headline2, subheadText, lang]);

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
        {/* Main headline — no hardcoded <br />, Pretext measures and sets height */}
        <motion.h1
          ref={headlineRef}
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
          {headline1}{" "}
          <span style={{ color: "#FACC15" }}>{headline2}</span>
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          ref={subheadRef}
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
          {subheadText}
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
              aria-label={t("valuehero.launch")}
              style={{ fontSize: 10, padding: "8px 24px" }}
            >
              {t("valuehero.launch")}
            </button>
          </Link>
          <Link href="/discover">
            <button
              className="nes-btn"
              aria-label={t("valuehero.explore")}
              style={{ fontSize: 10, padding: "8px 24px" }}
            >
              {t("valuehero.explore")}
            </button>
          </Link>
          <Link href="/insights/growth">
            <button
              className="nes-btn"
              aria-label={t("valuehero.growth")}
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
