"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLang } from "@/lib/i18n";
import {
  computeUserLevel,
  summonBuddy,
  EXP_REWARDS,
  BUDDY_TYPES,
  RARITY_CONFIG,
  getEvolutionStage,
  canEvolve,
  type SummonResult,
} from "@/lib/buddy-system";
import { BuddyCard } from "@/components/buddy-card";
import { BuddySprite } from "@/components/buddy-sprite";

/* ─── Summon levels reference ─── */
const SUMMON_LEVELS = [3, 5, 8, 10, 13, 15, 18, 20, 25, 30];

/* ─── Terminal Line ─── */
function TermLine({
  prefix = ">",
  color = "#39FF14",
  children,
  delay = 0,
}: {
  prefix?: string;
  color?: string;
  children: React.ReactNode;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, duration: 0.15 }}
      className="font-retro"
      style={{ fontSize: "18px", lineHeight: "1.6", color: "#E8E8EC" }}
    >
      <span style={{ color, marginRight: 8 }}>{prefix}</span>
      {children}
    </motion.div>
  );
}

/* ─── Pixel Bar ─── */
function PixelBar({
  label,
  value,
  max,
  color,
}: {
  label: string;
  value: number;
  max: number;
  color: string;
}) {
  const pct = Math.min(100, (value / max) * 100);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <span className="font-pixel" style={{ fontSize: 7, color, width: 28 }}>
        {label}
      </span>
      <div
        style={{
          flex: 1,
          height: 14,
          background: "#0A0A0C",
          border: "2px solid #2A2A30",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          style={{
            height: "100%",
            background: color,
            position: "relative",
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "repeating-linear-gradient(90deg, transparent 0, transparent 5px, rgba(0,0,0,0.3) 5px, rgba(0,0,0,0.3) 7px)",
            }}
          />
        </motion.div>
      </div>
      <span className="font-pixel" style={{ fontSize: 7, color: "#8888A0", width: 70, textAlign: "right" }}>
        {value}/{max}
      </span>
    </div>
  );
}

/* ─── EXP Rewards Table ─── */
const EXP_TABLE_ROWS: { action: string; key: keyof typeof EXP_REWARDS; icon: string }[] = [
  { action: "发布项目", key: "publishProject", icon: "🚀" },
  { action: "发布 Demo", key: "publishDemo", icon: "🎮" },
  { action: "提交创意", key: "publishIdea", icon: "💡" },
  { action: "发布文章", key: "postArticle", icon: "📝" },
  { action: "分享内容", key: "shareContent", icon: "📤" },
  { action: "被点赞", key: "receiveUpvote", icon: "👍" },
  { action: "发表评论", key: "giveComment", icon: "💬" },
  { action: "收到评论", key: "receiveComment", icon: "📩" },
  { action: "赢得战斗", key: "winBattle", icon: "⚔️" },
  { action: "输掉战斗", key: "loseBattle", icon: "🛡️" },
  { action: "平局", key: "drawBattle", icon: "🤝" },
  { action: "每日登录", key: "dailyLogin", icon: "📅" },
  { action: "被关注", key: "getFollowed", icon: "👥" },
  { action: "复刻项目", key: "forkProject", icon: "🔀" },
  { action: "运行 Agent", key: "runAgent", icon: "🤖" },
  { action: "创建工作流", key: "createWorkflow", icon: "🔧" },
  { action: "完善资料", key: "completeProfile", icon: "📋" },
  { action: "首个项目", key: "firstProject", icon: "⭐" },
  { action: "首次战斗", key: "firstBattle", icon: "🏆" },
  { action: "首个 Buddy", key: "firstBuddy", icon: "🎁" },
];

/* ═══ Main Buddy Page ═══ */
export default function BuddyPage() {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { t } = useLang();

  // Mock user state
  const [totalExp] = useState(2500);
  const [ownedBuddyIds, setOwnedBuddyIds] = useState<string[]>(["pixel-fox", "neon-slime"]);
  const [activeBuddyId, setActiveBuddyId] = useState<string>("pixel-fox");
  const [totalUpvotes] = useState(85);

  // Summon state
  const [summonPhase, setSummonPhase] = useState<"idle" | "flash" | "reveal">("idle");
  const [summonResult, setSummonResult] = useState<SummonResult | null>(null);

  // Evolution state — tracks per-buddy evolution stage (0 = base)
  const [buddyStages, setBuddyStages] = useState<Record<string, number>>({});
  const [evolvingId, setEvolvingId] = useState<string | null>(null);

  const userLevel = computeUserLevel(totalExp);

  // Find next summon level
  const nextSummonLevel = SUMMON_LEVELS.find((lv) => lv > userLevel.level) ?? null;

  const handleSummon = useCallback(() => {
    if (!userLevel.canSummon) return;

    setSummonPhase("flash");

    setTimeout(() => {
      const result = summonBuddy(userLevel.level, totalUpvotes, ownedBuddyIds);
      setSummonResult(result);

      if (result.isNew && !ownedBuddyIds.includes(result.buddy.id)) {
        setOwnedBuddyIds((prev) => [...prev, result.buddy.id]);
      }

      setSummonPhase("reveal");
    }, 1000);
  }, [userLevel, totalUpvotes, ownedBuddyIds]);

  // Mock buddy levels (in real app, from DB)
  const buddyLevels: Record<string, number> = {
    "pixel-fox": 10,
    "neon-slime": 8,
    "byte-owl": 5,
    "code-dragon": 3,
    "crystal-phoenix": 1,
  };

  // Mock buddy metadata (in real app, from DB)
  const buddyMeta: Record<string, { obtainedAt: string; energy: number }> = {
    "pixel-fox": { obtainedAt: "2026-03-01", energy: 85 },
    "neon-slime": { obtainedAt: "2026-03-15", energy: 62 },
    "byte-owl": { obtainedAt: "2026-03-20", energy: 90 },
    "code-dragon": { obtainedAt: "2026-04-01", energy: 45 },
    "crystal-phoenix": { obtainedAt: "2026-04-05", energy: 100 },
  };

  /** Compute days since a date string */
  const daysSince = (dateStr: string): number => {
    const diff = Date.now() - new Date(dateStr).getTime();
    return Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));
  };

  const handleEvolve = useCallback((buddyId: string) => {
    setEvolvingId(buddyId);
    // Flash + morph animation
    setTimeout(() => {
      setBuddyStages((prev) => ({
        ...prev,
        [buddyId]: (prev[buddyId] ?? getEvolutionStage(buddyId, buddyLevels[buddyId] ?? 1).stage) + 1,
      }));
      setEvolvingId(null);
    }, 1200);
  }, [buddyLevels]);

  const ownedBuddies = BUDDY_TYPES.filter((b) => ownedBuddyIds.includes(b.id));

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
      {/* ═══ Flash Overlay ═══ */}
      <AnimatePresence>
        {summonPhase === "flash" && (
          <motion.div
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 9999,
              background: "white",
              pointerEvents: "none",
            }}
            animate={{ opacity: [0, 1, 0, 1, 0, 0.8, 0] }}
            transition={{ duration: 1, times: [0, 0.12, 0.2, 0.32, 0.4, 0.52, 0.6] }}
          />
        )}
      </AnimatePresence>

      {/* ═══ Terminal Header ═══ */}
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
          VIBEX://BUDDY-LAB
        </span>
        <span className="font-pixel" style={{ fontSize: 7, color: "#333" }}>
          ━━━
        </span>
      </div>

      {/* ═══ Main Terminal Body ═══ */}
      <div
        className="rpgui-container framed"
        style={{
          minHeight: "70vh",
          padding: 20,
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Scanline effect */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "repeating-linear-gradient(0deg, transparent 0, transparent 2px, rgba(0,0,0,0.08) 2px, rgba(0,0,0,0.08) 4px)",
            pointerEvents: "none",
            zIndex: 1,
          }}
        />

        <div style={{ position: "relative", zIndex: 2 }}>
          {/* Boot lines */}
          <TermLine color="#555" prefix="$" delay={0}>
            vibecode-buddy --mode lab
          </TermLine>
          <TermLine color="#39FF14" prefix=">" delay={0.1}>
            <span style={{ color: "#39FF14" }}>BUDDY LAB</span>
            <span style={{ color: "#555" }}> // Summon &amp; Collect</span>
          </TermLine>
          <div style={{ height: 16 }} />

          {/* ═══ a) My Level & EXP ═══ */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            style={{
              border: "2px solid #9D00FF40",
              background: "#9D00FF08",
              padding: 16,
              marginBottom: 24,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
              {/* Level badge */}
              <div
                className="font-pixel"
                style={{
                  fontSize: 14,
                  color: "#0D0D0D",
                  background: "#9D00FF",
                  padding: "4px 12px",
                  fontWeight: "bold",
                }}
              >
                Lv {userLevel.level}
              </div>

              {/* Title */}
              <span className="font-pixel" style={{ fontSize: 9, color: "#9D00FF" }}>
                {userLevel.title}
              </span>

              {/* Can summon indicator */}
              {userLevel.canSummon && (
                <span
                  className="font-pixel"
                  style={{
                    fontSize: 7,
                    color: "#FFD700",
                    background: "#FFD70015",
                    padding: "2px 8px",
                    border: "1px solid #FFD70040",
                    animation: "blink-cursor 1.2s step-end infinite",
                  }}
                >
                  可以召唤!
                </span>
              )}
            </div>

            {/* EXP bar */}
            <div style={{ marginTop: 10, maxWidth: 500 }}>
              <PixelBar
                label="EXP"
                value={userLevel.currentExp}
                max={userLevel.expToNextLevel}
                color="#9D00FF"
              />
            </div>

            {/* Next summon hint */}
            <div style={{ marginTop: 6 }}>
              <span className="font-pixel" style={{ fontSize: 7, color: "#8888A0" }}>
                Total EXP: {userLevel.totalExp}
                {nextSummonLevel && !userLevel.canSummon && (
                  <span style={{ color: "#FACC15", marginLeft: 12 }}>
                    距离下次召唤: Lv {nextSummonLevel}
                  </span>
                )}
              </span>
            </div>
          </motion.div>

          {/* ═══ b) My Buddies ═══ */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            style={{ marginBottom: 24 }}
          >
            <TermLine color="#39FF14" prefix="[">
              我的伙伴 ]
            </TermLine>

            <div className="rpgui-container framed" style={{ padding: 16, marginTop: 8 }}>
              {ownedBuddies.length === 0 ? (
                <span className="font-pixel" style={{ fontSize: 7, color: "#555" }}>
                  还没有伙伴... 升级后去召唤吧!
                </span>
              ) : (
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 12,
                  }}
                >
                  {ownedBuddies.map((buddy) => {
                    const level = buddyLevels[buddy.id] ?? 1;
                    const evo = getEvolutionStage(buddy.id, level);
                    const evolveReady = canEvolve(buddy.id, level) && (buddyStages[buddy.id] ?? evo.stage) < evo.stage + 1;
                    const isEvolving = evolvingId === buddy.id;

                    return (
                      <div key={buddy.id} style={{ position: "relative" }}>
                        {/* Evolution flash overlay */}
                        <AnimatePresence>
                          {isEvolving && (
                            <motion.div
                              style={{
                                position: "absolute",
                                inset: -4,
                                zIndex: 10,
                                background: "#FFD700",
                                borderRadius: 4,
                              }}
                              animate={{ opacity: [0, 1, 0, 1, 0.6, 0] }}
                              transition={{ duration: 1.2, times: [0, 0.15, 0.3, 0.45, 0.7, 1] }}
                            />
                          )}
                        </AnimatePresence>

                        <div onClick={() => setActiveBuddyId(buddy.id)}>
                          <BuddyCard
                            buddy={{
                              ...buddy,
                              emoji: isEvolving ? "✨" : evo.emoji,
                              name: evo.name,
                              nameZh: evo.nameZh,
                            }}
                            owned
                            active={buddy.id === activeBuddyId}
                            size="md"
                          />
                        </div>

                        {/* Evolution badge + button */}
                        {evolveReady && !isEvolving && (
                          <div style={{ textAlign: "center", marginTop: 4 }}>
                            <span
                              className="nes-badge"
                              style={{
                                animation: "pulse-evo 1.5s ease-in-out infinite",
                              }}
                            >
                              <span className="is-warning font-pixel" style={{ fontSize: 6 }}>
                                可进化!
                              </span>
                            </span>
                            <div style={{ marginTop: 4 }}>
                              <button
                                className="nes-btn is-warning"
                                style={{ fontSize: 7, padding: "2px 10px" }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEvolve(buddy.id);
                                }}
                              >
                                进化
                              </button>
                            </div>
                          </div>
                        )}

                        {/* Show current evo info */}
                        {evo.stage > 0 && !isEvolving && (
                          <div
                            className="font-pixel"
                            style={{ fontSize: 6, color: "#FACC15", textAlign: "center", marginTop: 2 }}
                          >
                            {evo.nameZh} (Stage {evo.stage})
                          </div>
                        )}

                        {/* Age & Energy stats (PixPet style) */}
                        {(() => {
                          const meta = buddyMeta[buddy.id];
                          if (!meta) return null;
                          return (
                            <div style={{ marginTop: 4, display: "flex", flexDirection: "column", gap: 2, alignItems: "center" }}>
                              <span className="font-pixel" style={{ fontSize: 6, color: "#8888A0" }}>
                                📅 {daysSince(meta.obtainedAt)}天 · ⚡ {meta.energy}/100
                              </span>
                            </div>
                          );
                        })()}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>

          {/* ═══ c) Summon Buddy ═══ */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            style={{ marginBottom: 24 }}
          >
            <TermLine color="#FFD700" prefix="★">
              召唤 Buddy
            </TermLine>

            <div className="rpgui-container framed-golden" style={{ padding: 20, marginTop: 8 }}>
              {/* Summon button */}
              <div style={{ textAlign: "center", marginBottom: 16 }}>
                <button
                  className="nes-btn is-warning"
                  disabled={!userLevel.canSummon || summonPhase === "flash"}
                  onClick={handleSummon}
                  style={{
                    fontSize: 12,
                    padding: "12px 32px",
                    opacity: userLevel.canSummon ? 1 : 0.4,
                  }}
                >
                  {summonPhase === "flash" ? "召唤中..." : "★ 召唤新伙伴!"}
                </button>
                {!userLevel.canSummon && (
                  <div className="font-pixel" style={{ fontSize: 7, color: "#FF4500", marginTop: 8 }}>
                    需要达到召唤等级: {SUMMON_LEVELS.join(", ")}
                  </div>
                )}
              </div>

              {/* Summon result reveal */}
              <AnimatePresence>
                {summonPhase === "reveal" && summonResult && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                    style={{
                      textAlign: "center",
                      padding: 24,
                      border: `3px solid ${RARITY_CONFIG[summonResult.buddy.rarity].color}`,
                      background: `${RARITY_CONFIG[summonResult.buddy.rarity].color}10`,
                      boxShadow: `0 0 40px ${RARITY_CONFIG[summonResult.buddy.rarity].color}30, 0 0 80px ${RARITY_CONFIG[summonResult.buddy.rarity].color}10`,
                      position: "relative",
                    }}
                  >
                    {/* NEW badge */}
                    {summonResult.isNew && (
                      <motion.div
                        initial={{ rotate: -15, scale: 0 }}
                        animate={{ rotate: -15, scale: 1 }}
                        transition={{ delay: 0.3, type: "spring" }}
                        className="font-pixel"
                        style={{
                          position: "absolute",
                          top: -12,
                          right: -8,
                          fontSize: 10,
                          color: "#0D0D0D",
                          background: "#FF4500",
                          padding: "4px 12px",
                          zIndex: 3,
                        }}
                      >
                        NEW!
                      </motion.div>
                    )}

                    {/* Buddy pixel sprite */}
                    <div style={{ display: "flex", justifyContent: "center", marginBottom: 12 }}>
                      <BuddySprite buddyTypeId={summonResult.buddy.id} size="lg" animated />
                    </div>

                    {/* Name */}
                    <div className="font-pixel" style={{ fontSize: 14, color: "#E8E8EC", marginBottom: 4 }}>
                      {summonResult.buddy.nameZh}
                    </div>
                    <div className="font-pixel" style={{ fontSize: 8, color: "#8888A0", marginBottom: 8 }}>
                      {summonResult.buddy.name}
                    </div>

                    {/* Rarity */}
                    <span
                      className="font-pixel"
                      style={{
                        fontSize: 9,
                        color: RARITY_CONFIG[summonResult.buddy.rarity].color,
                        background: `${RARITY_CONFIG[summonResult.buddy.rarity].color}15`,
                        padding: "3px 12px",
                        border: `2px solid ${RARITY_CONFIG[summonResult.buddy.rarity].color}40`,
                      }}
                    >
                      {RARITY_CONFIG[summonResult.buddy.rarity].labelZh} ·{" "}
                      {summonResult.buddy.element}
                    </span>

                    {/* Passive */}
                    <div className="font-pixel" style={{ fontSize: 7, color: "#FACC15", marginTop: 10 }}>
                      被动: {summonResult.buddy.passiveZh}
                    </div>

                    {/* Bonus info */}
                    <div className="font-pixel" style={{ fontSize: 6, color: "#555", marginTop: 8 }}>
                      加成: {summonResult.bonusApplied}
                    </div>

                    {/* Close button */}
                    <button
                      className="nes-btn is-primary"
                      style={{ fontSize: 8, padding: "6px 16px", marginTop: 16 }}
                      onClick={() => setSummonPhase("idle")}
                    >
                      确认
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* ═══ d) EXP Guide ═══ */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            style={{ marginBottom: 24 }}
          >
            <TermLine color="#06B6D4" prefix="?">
              经验值指南
            </TermLine>

            <div className="rpgui-container framed" style={{ padding: 16, marginTop: 8 }}>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr>
                      {["图标", "行为", "经验值"].map((h) => (
                        <th
                          key={h}
                          className="font-pixel"
                          style={{
                            fontSize: 7,
                            color: "#06B6D4",
                            textAlign: "left",
                            padding: "6px 8px",
                            borderBottom: "2px solid #2A2A30",
                          }}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {EXP_TABLE_ROWS.map((row) => (
                      <tr key={row.key} style={{ borderBottom: "1px solid #1A1A1E" }}>
                        <td style={{ padding: "4px 8px", fontSize: 16 }}>{row.icon}</td>
                        <td
                          className="font-pixel"
                          style={{ padding: "4px 8px", fontSize: 7, color: "#E8E8EC" }}
                        >
                          {row.action}
                        </td>
                        <td
                          className="font-pixel"
                          style={{ padding: "4px 8px", fontSize: 7, color: "#39FF14" }}
                        >
                          +{EXP_REWARDS[row.key]}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>

          {/* ═══ e) Buddy Pokedex ═══ */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            style={{ marginBottom: 24 }}
          >
            <TermLine color="#FF4500" prefix="📖">
              Buddy 图鉴
            </TermLine>

            <div style={{ marginTop: 8 }}>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
                  gap: 12,
                }}
              >
                {BUDDY_TYPES.map((buddy) => {
                  const isOwned = ownedBuddyIds.includes(buddy.id);
                  const rarity = RARITY_CONFIG[buddy.rarity];

                  return (
                    <div
                      key={buddy.id}
                      style={{
                        border: `2px solid ${isOwned ? rarity.color : "#2A2A30"}`,
                        background: isOwned ? `${rarity.color}08` : "#111114",
                        padding: 14,
                        filter: isOwned ? "none" : "grayscale(1) brightness(0.5)",
                        display: "flex",
                        flexDirection: "column",
                        gap: 6,
                      }}
                    >
                      {/* Pixel sprite */}
                      <div style={{ display: "flex", justifyContent: "center" }}>
                        {isOwned ? (
                          <BuddySprite buddyTypeId={buddy.id} size="sm" animated />
                        ) : (
                          <span style={{ fontSize: 36 }}>❓</span>
                        )}
                      </div>

                      {/* Name */}
                      <div
                        className="font-pixel"
                        style={{ fontSize: 8, color: isOwned ? "#E8E8EC" : "#555", textAlign: "center" }}
                      >
                        {isOwned ? buddy.nameZh : "???"}
                      </div>
                      <div
                        className="font-pixel"
                        style={{ fontSize: 6, color: isOwned ? "#8888A0" : "#333", textAlign: "center" }}
                      >
                        {isOwned ? buddy.name : "???"}
                      </div>

                      {/* Rarity + Element */}
                      <div style={{ display: "flex", justifyContent: "center", gap: 6 }}>
                        <span
                          className="font-pixel"
                          style={{
                            fontSize: 6,
                            color: isOwned ? rarity.color : "#444",
                            background: isOwned ? `${rarity.color}15` : "#1A1A1E",
                            padding: "1px 6px",
                            border: `1px solid ${isOwned ? rarity.color + "40" : "#2A2A30"}`,
                          }}
                        >
                          {isOwned ? rarity.labelZh : "??"}
                        </span>
                        <span
                          className="font-pixel"
                          style={{ fontSize: 6, color: isOwned ? buddy.color : "#444" }}
                        >
                          {isOwned ? buddy.element : "??"}
                        </span>
                      </div>

                      {/* Min level */}
                      <div
                        className="font-pixel"
                        style={{ fontSize: 6, color: "#555", textAlign: "center" }}
                      >
                        最低等级: Lv {buddy.minLevel}
                      </div>

                      {/* Passive */}
                      {isOwned && (
                        <div
                          className="font-pixel"
                          style={{ fontSize: 6, color: "#FACC15", textAlign: "center" }}
                        >
                          {buddy.passiveZh}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>

          {/* Terminal cursor */}
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

      {/* Cursor blink keyframes */}
      <style>{`
        @keyframes blink-cursor {
          50% { opacity: 0; }
        }
        @keyframes pulse-evo {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.15); opacity: 0.8; }
        }
      `}</style>
    </div>
  );
}
