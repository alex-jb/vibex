"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useLang } from "@/lib/i18n";

export function ApiKeyPanel() {
  const { t } = useLang();
  const [copiedKey, setCopiedKey] = useState(false);
  const mockApiKey = "vx-pk-a3f8••••••••••••7b2e";

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedKey(true);
      setTimeout(() => setCopiedKey(false), 1500);
    });
  };

  return (
    <section>
      <span className="font-pixel" style={{ fontSize: 9, color: "#9D00FF" }}>
        {">"} API Key {t("dev.management")}
      </span>
      <div className="rpgui-container framed" style={{ marginTop: 12, padding: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <span className="font-pixel" style={{ fontSize: 7, color: "#8888A0" }}>
            {t("dev.yourKey")}:
          </span>
          <span
            className="font-mono"
            style={{
              fontSize: 13,
              color: "#E8E8EC",
              background: "#0A0A0C",
              padding: "4px 10px",
              border: "1px solid #2A2A30",
              letterSpacing: 1,
            }}
          >
            {mockApiKey}
          </span>
          <button
            className="nes-btn is-primary"
            style={{ fontSize: 9, padding: "6px 12px" }}
            aria-label={t("dev.copy") + " API Key"}
            onClick={() => copyToClipboard("vx-pk-a3f8xxxxxxxxxxxx7b2e")}
          >
            {copiedKey ? "✓" : t("dev.copy")}
          </button>
          <div title="Coming soon">
            <button
              className="nes-btn is-warning"
              style={{ fontSize: 9, padding: "6px 12px", opacity: 0.5, cursor: "not-allowed" }}
              disabled
            >
              {t("dev.regenerate")}
            </button>
          </div>
          <button className="nes-btn is-success" style={{ fontSize: 9, padding: "6px 12px" }}>
            {t("dev.createKey")}
          </button>
        </div>

        <div style={{ marginTop: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
            <span className="font-pixel" style={{ fontSize: 7, color: "#8888A0" }}>
              {t("dev.requests")}: 1,247 / {t("dev.limit")} 10,000
            </span>
            <span className="font-pixel" style={{ fontSize: 7, color: "#39FF14" }}>
              12.5%
            </span>
          </div>
          <div
            style={{
              height: 14,
              background: "#0A0A0C",
              border: "2px solid #2A2A30",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: "12.5%" }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              style={{ height: "100%", background: "#39FF14", position: "relative" }}
            >
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background: "repeating-linear-gradient(90deg, transparent 0, transparent 5px, rgba(0,0,0,0.3) 5px, rgba(0,0,0,0.3) 7px)",
                }}
              />
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
