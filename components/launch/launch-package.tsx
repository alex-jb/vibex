"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import type { LaunchPackage } from "@/lib/ai";

function CopyButton({ text, label }: { text: string; label: string }) {
  const [copied, setCopied] = useState(false);

  return (
    <button
      className="nes-btn"
      onClick={() => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }}
      style={{ fontSize: 7, padding: "2px 8px", minWidth: "auto" }}
    >
      {copied ? "\u2714" : `\u{1F4CB} ${label}`}
    </button>
  );
}

function Section({ title, color, children }: { title: string; color: string; children: React.ReactNode }) {
  return (
    <div className="retro-card l-corner" style={{ padding: 14, marginBottom: 12 }}>
      <div className="font-pixel" style={{ fontSize: 9, color, marginBottom: 8 }}>
        {title}
      </div>
      {children}
    </div>
  );
}

interface LaunchPackageDisplayProps {
  pkg: LaunchPackage;
}

export function LaunchPackageDisplay({ pkg }: LaunchPackageDisplayProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Positioning */}
      <Section title={"Product Positioning"} color="#9D00FF">
        <div style={{ marginBottom: 8 }}>
          <div className="font-pixel" style={{ fontSize: 7, color: "#888" }}>One-liner</div>
          <div className="font-retro" style={{ fontSize: 14, color: "#FACC15", marginBottom: 4 }}>
            {pkg.positioning.oneLiner}
          </div>
          <CopyButton text={pkg.positioning.oneLiner} label="Copy" />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          <div>
            <div className="font-pixel" style={{ fontSize: 7, color: "#888" }}>{"Target Audience"}</div>
            <div className="font-retro" style={{ fontSize: 12, color: "#E8E8EC" }}>{pkg.positioning.targetAudience}</div>
          </div>
          <div>
            <div className="font-pixel" style={{ fontSize: 7, color: "#888" }}>{"Problem Solved"}</div>
            <div className="font-retro" style={{ fontSize: 12, color: "#E8E8EC" }}>{pkg.positioning.problemSolved}</div>
          </div>
        </div>
      </Section>

      {/* Copy */}
      <Section title={"Launch Copy"} color="#39FF14">
        <div style={{ marginBottom: 10 }}>
          <div className="font-pixel" style={{ fontSize: 7, color: "#888" }}>Product Hunt</div>
          <div className="font-retro" style={{ fontSize: 12, color: "#E8E8EC", lineHeight: 1.5, marginBottom: 4 }}>
            {pkg.copy.productHuntDescription}
          </div>
          <CopyButton text={pkg.copy.productHuntDescription} label="PH Copy" />
        </div>
        <div>
          <div className="font-pixel" style={{ fontSize: 7, color: "#888" }}>Elevator Pitch</div>
          <div className="font-retro" style={{ fontSize: 12, color: "#E8E8EC", lineHeight: 1.5, marginBottom: 4 }}>
            {pkg.copy.elevatorPitch}
          </div>
          <CopyButton text={pkg.copy.elevatorPitch} label="Pitch" />
        </div>
      </Section>

      {/* Social */}
      <Section title={"Social Media Content"} color="#06B6D4">
        {/* Twitter thread */}
        <div style={{ marginBottom: 10 }}>
          <div className="font-pixel" style={{ fontSize: 7, color: "#888" }}>Twitter/X Thread</div>
          {pkg.social.twitterThread.map((tweet, i) => (
            <div key={i} style={{ padding: "6px 0", borderBottom: "1px solid #1A1A1E" }}>
              <span className="font-pixel" style={{ fontSize: 7, color: "#06B6D4" }}>{i + 1}/{pkg.social.twitterThread.length}</span>
              <div className="font-retro" style={{ fontSize: 12, color: "#E8E8EC", marginTop: 2 }}>{tweet}</div>
            </div>
          ))}
          <CopyButton text={pkg.social.twitterThread.join("\n\n---\n\n")} label="Twitter" />
        </div>
        {/* Reddit */}
        <div style={{ marginBottom: 10 }}>
          <div className="font-pixel" style={{ fontSize: 7, color: "#888" }}>Reddit</div>
          <div className="font-retro" style={{ fontSize: 13, color: "#FACC15", marginBottom: 2 }}>
            {pkg.social.redditTitle}
          </div>
          <div className="font-retro" style={{ fontSize: 12, color: "#E8E8EC", lineHeight: 1.5 }}>
            {pkg.social.redditBody}
          </div>
          <CopyButton text={`${pkg.social.redditTitle}\n\n${pkg.social.redditBody}`} label="Reddit" />
        </div>
        {/* LinkedIn */}
        <div>
          <div className="font-pixel" style={{ fontSize: 7, color: "#888" }}>LinkedIn</div>
          <div className="font-retro" style={{ fontSize: 12, color: "#E8E8EC", lineHeight: 1.5, marginBottom: 4 }}>
            {pkg.social.linkedinPost}
          </div>
          <CopyButton text={pkg.social.linkedinPost} label="LinkedIn" />
        </div>
      </Section>

      {/* Distribution */}
      <Section title={"Distribution Strategy"} color="#FACC15">
        <div className="font-pixel" style={{ fontSize: 7, color: "#888", marginBottom: 4 }}>
          {"Best launch time: "}{pkg.distribution.timing}
        </div>
        {pkg.distribution.channels.map((ch, i) => (
          <div key={i} style={{ display: "flex", gap: 8, alignItems: "center", padding: "4px 0", borderBottom: "1px solid #1A1A1E" }}>
            <span
              className="font-pixel"
              style={{
                fontSize: 6,
                color: "#0D0D0D",
                background: ch.priority === "high" ? "#FF4500" : ch.priority === "medium" ? "#FACC15" : "#39FF14",
                padding: "0 5px",
              }}
            >
              {ch.priority.toUpperCase()}
            </span>
            <span className="font-pixel" style={{ fontSize: 8, color: "#E8E8EC" }}>{ch.name}</span>
            <span className="font-retro" style={{ fontSize: 11, color: "#888", flex: 1 }}>{ch.reason}</span>
          </div>
        ))}
        {pkg.distribution.targetCommunities.length > 0 && (
          <div style={{ marginTop: 8 }}>
            <div className="font-pixel" style={{ fontSize: 7, color: "#888" }}>{"Target Communities"}</div>
            <div className="font-retro" style={{ fontSize: 11, color: "#9D00FF" }}>
              {pkg.distribution.targetCommunities.join(" \u2022 ")}
            </div>
          </div>
        )}
      </Section>

      {/* Investor Pitch */}
      <Section title={"Investor Pitch"} color="#FF4500">
        {Object.entries(pkg.investorPitch).map(([key, val]) => (
          <div key={key} style={{ marginBottom: 6 }}>
            <span className="font-pixel" style={{ fontSize: 7, color: "#FF4500" }}>
              {key.toUpperCase()}:
            </span>
            <div className="font-retro" style={{ fontSize: 12, color: "#E8E8EC", marginLeft: 8 }}>{val}</div>
          </div>
        ))}
        <CopyButton
          text={Object.entries(pkg.investorPitch).map(([k, v]) => `${k.toUpperCase()}: ${v}`).join("\n\n")}
          label="Pitch"
        />
      </Section>

      {/* Competitors */}
      {pkg.competitors.length > 0 && (
        <Section title={"Competitor Comparison"} color="#FF69B4">
          {pkg.competitors.map((c, i) => (
            <div key={i} style={{ padding: "4px 0", borderBottom: "1px solid #1A1A1E" }}>
              <span className="font-pixel" style={{ fontSize: 8, color: "#FF69B4" }}>{c.name}</span>
              <div className="font-retro" style={{ fontSize: 11, color: "#888" }}>{c.difference}</div>
            </div>
          ))}
        </Section>
      )}

      {/* Demo Script */}
      <Section title={"\uD83C\uDFAC Demo Script (30s)"} color="#06B6D4">
        <div className="font-retro" style={{ fontSize: 12, color: "#E8E8EC", lineHeight: 1.6, whiteSpace: "pre-wrap" }}>
          {pkg.demoScript}
        </div>
        <CopyButton text={pkg.demoScript} label="Script" />
      </Section>
    </motion.div>
  );
}
