"use client";

import Link from "next/link";
import { useLang } from "@/lib/i18n";

export default function NotFound() {
  const { t } = useLang();
  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center relative overflow-hidden">
      {/* Scanline overlay */}
      <div
        className="pointer-events-none fixed inset-0 z-50"
        style={{
          background:
            "repeating-linear-gradient(0deg, rgba(0,255,0,0.03) 0px, rgba(0,255,0,0.03) 1px, transparent 1px, transparent 3px)",
        }}
      />

      <div className="rpgui-container framed" style={{ maxWidth: 540, width: "90%" }}>
        {/* Terminal header */}
        <div className="flex items-center gap-2 mb-4 pb-2 border-b border-green-900">
          <span className="inline-block w-3 h-3 rounded-full bg-red-500" />
          <span className="inline-block w-3 h-3 rounded-full bg-yellow-500" />
          <span className="inline-block w-3 h-3 rounded-full bg-green-500" />
          <span className="ml-2 text-green-400 font-mono text-sm tracking-widest">
            VIBEX://ERROR 404
          </span>
        </div>

        {/* Glitch title */}
        <h1
          className="text-4xl md:text-5xl font-bold text-center mb-6 tracking-wider"
          style={{
            fontFamily: "Press Start 2P, monospace",
            color: "#ff004d",
            textShadow: "2px 2px #00e436, -2px -2px #29adff",
            animation: "pulse 2s infinite",
          }}
        >
          PAGE NOT FOUND
        </h1>

        {/* Pixel sad face */}
        <pre className="text-green-400 text-center text-xs leading-tight mb-6 font-mono">
{`    ████████
  ██        ██
██  ██  ██    ██
██            ██
██    ████    ██
██  ██    ██  ██
  ██        ██
    ████████`}
        </pre>

        <p className="text-green-300 font-mono text-center mb-6 text-sm">
          &gt; {t("notFound.message")}
        </p>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/">
            <button className="nes-btn is-primary w-full">{t("notFound.home")}</button>
          </Link>
          <Link href="/discover">
            <button className="nes-btn w-full">{t("notFound.explore")}</button>
          </Link>
        </div>
      </div>
    </div>
  );
}
