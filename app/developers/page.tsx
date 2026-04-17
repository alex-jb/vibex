"use client";

import { useState } from "react";
import { useLang } from "@/lib/i18n";
import { motion } from "framer-motion";
import { EndpointDocs } from "@/components/dev/endpoint-docs";
import { ApiKeyPanel } from "@/components/dev/api-key-panel";
import { CodeExamples } from "@/components/dev/code-examples";
import { RateLimits } from "@/components/dev/rate-limits";
import { WebhookPanel } from "@/components/dev/webhook-panel";

/* ─── Main Developer Platform Page ─── */
export default function DevelopersPage() {
  const { t } = useLang();
  const [copiedSdk, setCopiedSdk] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedSdk(id);
      setTimeout(() => setCopiedSdk(null), 1500);
    });
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
      {/* Terminal Header */}
      <div
        style={{
          background: "#0A0A0C",
          padding: "8px 12px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: "2px solid #2A2A30",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ width: 10, height: 10, background: "#FF4500", display: "inline-block" }} />
          <span style={{ width: 10, height: 10, background: "#FACC15", display: "inline-block" }} />
          <span style={{ width: 10, height: 10, background: "#39FF14", display: "inline-block" }} />
        </div>
        <span className="font-pixel" style={{ fontSize: 8, color: "#555", letterSpacing: 2 }}>
          VIBEX://DEV-PORTAL v2.0
        </span>
        <span className="font-pixel" style={{ fontSize: 7, color: "#333" }}>
          ━━━
        </span>
      </div>

      {/* Main Terminal Body */}
      <div
        className="rpgui-container framed"
        style={{ minHeight: "70vh", padding: 20, position: "relative", overflow: "hidden" }}
      >
        {/* Scanline overlay */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "repeating-linear-gradient(0deg, transparent 0, transparent 2px, rgba(0,0,0,0.08) 2px, rgba(0,0,0,0.08) 4px)",
            pointerEvents: "none",
            zIndex: 1,
          }}
        />

        <div style={{ position: "relative", zIndex: 2 }}>
          {/* sr-only H1 so crawlers + screen readers get a proper page heading.
              Visual title below is a non-semantic <span> because the animated
              boot-log effect needs motion.div, not a heading element. */}
          <h1 className="sr-only">{t("dev.title")}</h1>
          {/* Title */}
          <motion.div initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}>
            <span className="font-pixel" style={{ fontSize: 7, color: "#555" }}>$ vibex --dev-portal</span>
          </motion.div>
          <motion.div initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
            <span
              className="font-pixel"
              style={{ fontSize: 14, color: "#39FF14", textShadow: "0 0 20px rgba(57,255,20,0.3)" }}
            >
              {">"} {t("dev.title")}
            </span>
          </motion.div>

          <div style={{ height: 24 }} />

          {/* API Overview */}
          <section>
            <span className="font-pixel" style={{ fontSize: 9, color: "#9D00FF" }}>
              {">"} API {t("dev.overview")}
            </span>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4" style={{ marginTop: 12 }}>
              {[
                { icon: "🌐", title: "REST API", desc: t("dev.restDesc"), color: "#39FF14" },
                { icon: "⚡", title: "Streaming", desc: t("dev.streamDesc"), color: "#06B6D4" },
                { icon: "🔔", title: "Webhooks", desc: t("dev.webhookDesc"), color: "#FACC15" },
              ].map((card) => (
                <div
                  key={card.title}
                  className="retro-border"
                  style={{ padding: 16, background: "#0A0A0C", border: `2px solid ${card.color}30` }}
                >
                  <div style={{ fontSize: 24, marginBottom: 8 }}>{card.icon}</div>
                  <div className="font-pixel" style={{ fontSize: 9, color: card.color, marginBottom: 6 }}>
                    {card.title}
                  </div>
                  <div className="font-pixel" style={{ fontSize: 7, color: "#8888A0", lineHeight: 1.6 }}>
                    {card.desc}
                  </div>
                </div>
              ))}
            </div>
          </section>

          <div style={{ height: 32 }} />

          {/* Endpoint Documentation */}
          <EndpointDocs />

          <div style={{ height: 32 }} />

          {/* API Key Management */}
          <ApiKeyPanel />

          <div style={{ height: 32 }} />

          {/* SDK Downloads */}
          <section>
            <span className="font-pixel" style={{ fontSize: 9, color: "#9D00FF" }}>
              {">"} SDK {t("dev.download")}
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4" style={{ marginTop: 12 }}>
              {[
                { id: "ts", label: "TypeScript SDK", cmd: "npm install @vibex/sdk", color: "#06B6D4" },
                { id: "py", label: "Python SDK", cmd: "pip install vibex-sdk", color: "#FACC15" },
                {
                  id: "curl",
                  label: "cURL",
                  cmd: 'curl -H "Authorization: Bearer vx-pk-..." https://vibexforge.com/api/...',
                  color: "#39FF14",
                },
              ].map((sdk) => (
                <div
                  key={sdk.id}
                  className="retro-border"
                  style={{ padding: 16, background: "#0A0A0C", border: `2px solid ${sdk.color}30` }}
                >
                  <div className="font-pixel" style={{ fontSize: 8, color: sdk.color, marginBottom: 8 }}>
                    {sdk.label}
                  </div>
                  <div
                    style={{
                      background: "#050508",
                      border: "1px solid #2A2A30",
                      padding: "8px 10px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 8,
                      position: "relative",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        position: "absolute",
                        inset: 0,
                        background: "repeating-linear-gradient(0deg, transparent 0, transparent 2px, rgba(0,0,0,0.06) 2px, rgba(0,0,0,0.06) 4px)",
                        pointerEvents: "none",
                      }}
                    />
                    <code
                      className="font-mono"
                      style={{
                        fontSize: 11,
                        color: "#E8E8EC",
                        position: "relative",
                        zIndex: 1,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {sdk.cmd}
                    </code>
                    <button
                      className="nes-btn is-primary"
                      style={{ fontSize: 8, padding: "4px 8px", position: "relative", zIndex: 1, flexShrink: 0 }}
                      aria-label={`${t("dev.copy")} ${sdk.label}`}
                      onClick={() => copyToClipboard(sdk.cmd, sdk.id)}
                    >
                      {copiedSdk === sdk.id ? "✓" : t("dev.copy")}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <div style={{ height: 32 }} />

          {/* Code Examples */}
          <CodeExamples />

          <div style={{ height: 32 }} />

          {/* Webhook Management */}
          <WebhookPanel />

          <div style={{ height: 32 }} />

          {/* Rate Limits */}
          <RateLimits />

          {/* Terminal prompt */}
          <div style={{ marginTop: 24 }}>
            <span className="font-retro" style={{ color: "#39FF14", fontSize: 18 }}>
              {">"}{" "}
            </span>
            <span
              style={{
                display: "inline-block",
                width: 8,
                height: 16,
                background: "#39FF14",
                animation: "blink-cursor 0.8s step-end infinite",
                verticalAlign: "middle",
              }}
            />
          </div>
        </div>
      </div>

      <style>{`
        @keyframes blink-cursor {
          50% { opacity: 0; }
        }
      `}</style>
    </div>
  );
}
