"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, X, Send, ChevronDown, Minus } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useLang } from "@/lib/i18n";

interface ChatMessage {
  id: string;
  sender: string;
  text: string;
  time: string;
  isOwn: boolean;
}

interface ChatThread {
  id: string;
  name: string;
  avatar: string;
  lastMessage: string;
  time: string;
  unread: number;
  online: boolean;
  isAgent: boolean;
}

const mockThreads: ChatThread[] = [
  { id: "t1", name: "CodeReviewer Pro", avatar: "CR", lastMessage: "Your PR looks good!", time: "2m", unread: 1, online: true, isAgent: true },
  { id: "t2", name: "AlphaSignal", avatar: "AS", lastMessage: "BTC signal detected...", time: "15m", unread: 0, online: true, isAgent: true },
  { id: "t3", name: "TaskPilot", avatar: "TP", lastMessage: "Workflow completed", time: "1h", unread: 0, online: true, isAgent: true },
  { id: "t4", name: "StudyBuddy", avatar: "SB", lastMessage: "Quiz results ready", time: "3h", unread: 2, online: true, isAgent: true },
  { id: "t5", name: "Mika Tanaka", avatar: "MT", lastMessage: "Let me know when you're free", time: "5h", unread: 1, online: true, isAgent: false },
  { id: "t6", name: "DevOps Sentinel", avatar: "DS", lastMessage: "Deploy #89 succeeded", time: "6h", unread: 0, online: false, isAgent: true },
  { id: "t7", name: "Jordan Lee", avatar: "JL", lastMessage: "Great collab yesterday!", time: "1d", unread: 0, online: false, isAgent: false },
  { id: "t8", name: "PixelForge AI", avatar: "PF", lastMessage: "Your sprite sheet is ready", time: "2d", unread: 3, online: true, isAgent: true },
];

const mockMessages: Record<string, ChatMessage[]> = {
  t1: [
    { id: "m1", sender: "CodeReviewer Pro", text: "I've reviewed PR #482", time: "10:30", isOwn: false },
    { id: "m2", sender: "You", text: "Any issues found?", time: "10:32", isOwn: true },
    { id: "m3", sender: "CodeReviewer Pro", text: "Your PR looks good! Just one minor suggestion on the error handling.", time: "10:33", isOwn: false },
  ],
  t2: [
    { id: "m4", sender: "AlphaSignal", text: "BTC signal detected: RSI divergence on 4h", time: "09:45", isOwn: false },
  ],
  t3: [
    { id: "m5", sender: "TaskPilot", text: "Workflow completed", time: "08:00", isOwn: false },
    { id: "m6", sender: "You", text: "Thanks!", time: "08:05", isOwn: true },
  ],
  t4: [
    { id: "m7", sender: "StudyBuddy", text: "Your calculus quiz is ready!", time: "Yesterday", isOwn: false },
    { id: "m8", sender: "StudyBuddy", text: "Quiz results ready - you scored 85%!", time: "06:00", isOwn: false },
  ],
  t5: [
    { id: "m9", sender: "Mika Tanaka", text: "Hey! Saw your agent on the marketplace", time: "14:00", isOwn: false },
    { id: "m10", sender: "You", text: "Thanks! Still tweaking the prompts", time: "14:05", isOwn: true },
    { id: "m11", sender: "Mika Tanaka", text: "Let me know when you're free to pair on it", time: "14:07", isOwn: false },
  ],
  t6: [
    { id: "m12", sender: "DevOps Sentinel", text: "Deploy #89 succeeded. All health checks green.", time: "11:30", isOwn: false },
  ],
  t7: [
    { id: "m13", sender: "Jordan Lee", text: "Our agent combo crushed the leaderboard!", time: "Yesterday", isOwn: false },
    { id: "m14", sender: "You", text: "We should enter the next tournament", time: "Yesterday", isOwn: true },
    { id: "m15", sender: "Jordan Lee", text: "Great collab yesterday!", time: "Yesterday", isOwn: false },
  ],
  t8: [
    { id: "m16", sender: "PixelForge AI", text: "Processing your sprite request...", time: "2d ago", isOwn: false },
    { id: "m17", sender: "PixelForge AI", text: "Your sprite sheet is ready - 32x32 tileset with 64 frames", time: "2d ago", isOwn: false },
    { id: "m18", sender: "PixelForge AI", text: "Want me to generate walk cycle animations too?", time: "2d ago", isOwn: false },
  ],
};

const autoReplies: Record<string, string[]> = {
  t1: ["Looking at the diff now...", "LGTM! Ship it.", "One more nit on line 42."],
  t2: ["New signal: ETH breakout forming", "Confidence level: 87%", "Setting stop-loss alert."],
  t3: ["Starting next batch...", "Pipeline queued.", "ETA: 3 minutes."],
  t4: ["Generating new quiz...", "Hint: review chapter 7!", "Your streak is 5 days!"],
  t5: ["Sounds good!", "I'm free after 3pm", "Let's do it!"],
  t6: ["Running diagnostics...", "All systems nominal.", "Next deploy window: 6pm."],
  t7: ["For sure!", "Let's practice Thursday", "I'll set up the lobby."],
  t8: ["Rendering frames...", "Added parallax layers.", "Palette: 16 colors retro."],
};

const QUICK_EMOJIS = ["\u{1F525}", "\u{1F44D}", "\u{2764}\u{FE0F}", "\u{1F680}"];

function getInitials(name: string): string {
  return name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
}

function TypingIndicator() {
  return (
    <div className="flex justify-start">
      <div
        className="flex items-center gap-1 rounded-xl px-3 py-2"
        style={{ background: "rgba(255,255,255,0.06)" }}
      >
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="block size-[6px] rounded-full bg-violet-400"
            animate={{ y: [0, -6, 0] }}
            transition={{
              duration: 0.6,
              repeat: Infinity,
              delay: i * 0.15,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>
    </div>
  );
}

function StatusDot({ online }: { online: boolean }) {
  return (
    <span
      className="absolute bottom-0 right-0 block size-[10px] rounded-full border-2 border-black/80"
      style={{ background: online ? "#22c55e" : "#6b7280" }}
    />
  );
}

function NotificationPulse() {
  return (
    <span className="absolute -top-1 -right-1 flex size-3">
      <motion.span
        className="absolute inline-flex size-full rounded-full bg-red-400"
        animate={{ scale: [1, 1.8], opacity: [0.7, 0] }}
        transition={{ duration: 1.2, repeat: Infinity, ease: "easeOut" }}
      />
      <span className="relative inline-flex size-3 rounded-full bg-red-500" />
    </span>
  );
}

export function ChatWidget() {
  const { user } = useAuth();
  const { t } = useLang();
  const [open, setOpen] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [activeThread, setActiveThread] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState(mockMessages);
  const [threads, setThreads] = useState(mockThreads);
  const [isTyping, setIsTyping] = useState(false);
  const [hasNewMessage, setHasNewMessage] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const replyIndexRef = useRef<Record<string, number>>({});

  const totalUnread = threads.reduce((s, th) => s + th.unread, 0);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeThread, messages, isTyping]);

  const simulateReply = useCallback((threadId: string) => {
    setIsTyping(true);

    const timer = setTimeout(() => {
      const replies = autoReplies[threadId] || ["Got it!", "Thanks!", "On it."];
      const idx = replyIndexRef.current[threadId] ?? 0;
      const replyText = replies[idx % replies.length];
      replyIndexRef.current[threadId] = idx + 1;

      const threadData = mockThreads.find((th) => th.id === threadId);
      const senderName = threadData?.name ?? "Agent";

      const replyMsg: ChatMessage = {
        id: `m-reply-${Date.now()}`,
        sender: senderName,
        text: replyText,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        isOwn: false,
      };

      setIsTyping(false);
      setMessages((prev) => ({
        ...prev,
        [threadId]: [...(prev[threadId] || []), replyMsg],
      }));

      setThreads((prev) =>
        prev.map((th) =>
          th.id === threadId ? { ...th, lastMessage: replyText, time: "now" } : th
        )
      );

      setHasNewMessage(true);
      const clearTimer = setTimeout(() => setHasNewMessage(false), 3000);
      return () => clearTimeout(clearTimer);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  if (!user) return null;

  const handleSend = (text?: string) => {
    const msgText = (text ?? input).trim();
    if (!msgText || !activeThread) return;

    const newMsg: ChatMessage = {
      id: `m-${Date.now()}`,
      sender: "You",
      text: msgText,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      isOwn: true,
    };

    setMessages((prev) => ({
      ...prev,
      [activeThread]: [...(prev[activeThread] || []), newMsg],
    }));

    setThreads((prev) =>
      prev.map((th) =>
        th.id === activeThread ? { ...th, lastMessage: msgText, time: "now" } : th
      )
    );

    setInput("");
    simulateReply(activeThread);
  };

  const handleOpenThread = (threadId: string) => {
    setActiveThread(threadId);
    setThreads((prev) =>
      prev.map((th) =>
        th.id === threadId ? { ...th, unread: 0 } : th
      )
    );
  };

  const thread = activeThread ? threads.find((th) => th.id === activeThread) : null;
  const threadMessages = activeThread ? messages[activeThread] || [] : [];

  return (
    <>
      {/* Floating button with glow pulse */}
      <AnimatePresence>
        {!open && (
          <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            onClick={() => { setOpen(true); setMinimized(false); }}
            className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-full px-4 py-3 text-white shadow-lg transition-shadow"
            style={{
              background: "linear-gradient(135deg, #7c3aed, #c026d3)",
              fontFamily: "var(--font-pixel), monospace",
              animation: "chatGlowPulse 2s ease-in-out infinite",
            }}
          >
            <MessageSquare className="size-5" />
            <span className="text-sm font-medium hidden sm:inline">{t("chat.messaging")}</span>
            {totalUnread > 0 && (
              <span className="absolute -top-1.5 -right-1.5 flex items-center justify-center size-5 rounded-full bg-red-500 text-[10px] font-bold text-white">
                {totalUnread}
              </span>
            )}
            {hasNewMessage && <NotificationPulse />}
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
              height: minimized ? 48 : 480,
            }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.25 }}
            className="fixed bottom-6 right-6 z-50 w-[360px] flex flex-col glass-card-strong rounded-2xl border border-white/[0.08] shadow-2xl overflow-hidden"
          >
            {/* Header - clickable to minimize */}
            <div
              onClick={() => setMinimized((prev) => !prev)}
              className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06] bg-background/80 cursor-pointer select-none shrink-0"
              style={{ fontFamily: "var(--font-pixel), monospace" }}
            >
              <div className="flex items-center gap-2">
                {activeThread && !minimized && (
                  <button
                    onClick={(e) => { e.stopPropagation(); setActiveThread(null); }}
                    className="text-muted-foreground hover:text-foreground transition-colors mr-1"
                  >
                    <ChevronDown className="size-4 rotate-90" />
                  </button>
                )}
                <MessageSquare className="size-4 text-violet-400" />
                <span className="text-[9px] text-violet-400 uppercase tracking-wider text-gradient">
                  {activeThread && !minimized ? thread?.name : t("chat.messaging")}
                </span>
                {activeThread && !minimized && thread && (
                  <span
                    className="inline-block size-2 rounded-full ml-1"
                    style={{ background: thread.online ? "#22c55e" : "#6b7280" }}
                  />
                )}
              </div>
              <div className="flex items-center gap-1">
                {totalUnread > 0 && minimized && (
                  <span className="flex items-center justify-center size-5 rounded-full bg-violet-500 text-[10px] font-bold text-white mr-1">
                    {totalUnread}
                  </span>
                )}
                <button
                  onClick={(e) => { e.stopPropagation(); setMinimized((prev) => !prev); }}
                  className="text-muted-foreground hover:text-foreground transition-colors p-0.5"
                >
                  <Minus className="size-4" />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); setOpen(false); setActiveThread(null); setMinimized(false); }}
                  className="text-muted-foreground hover:text-foreground transition-colors p-0.5"
                >
                  <X className="size-4" />
                </button>
              </div>
            </div>

            {/* Content - hidden when minimized */}
            {!minimized && (
              <>
                {!activeThread ? (
                  /* Thread list */
                  <div className="flex-1 overflow-y-auto">
                    {threads.map((th) => (
                      <button
                        key={th.id}
                        onClick={() => handleOpenThread(th.id)}
                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/[0.04] transition-colors text-left border-b border-white/[0.03]"
                      >
                        <div className="relative shrink-0">
                          <div
                            className="size-10 rounded-full flex items-center justify-center text-[10px] font-bold text-white"
                            style={{
                              background: th.isAgent
                                ? "linear-gradient(135deg, #7c3aed, #c026d3)"
                                : "linear-gradient(135deg, #0ea5e9, #06b6d4)",
                            }}
                          >
                            {th.avatar}
                          </div>
                          <StatusDot online={th.online} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span
                              className="text-sm font-medium truncate"
                              style={{ fontFamily: "var(--font-pixel), monospace", fontSize: "10px" }}
                            >
                              {th.name}
                            </span>
                            <span
                              className="text-[10px] text-muted-foreground shrink-0 ml-2"
                              style={{ fontFamily: "var(--font-pixel), monospace" }}
                            >
                              {th.time}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground truncate mt-0.5">
                            {th.lastMessage}
                          </p>
                        </div>
                        {th.unread > 0 && (
                          <div className="relative shrink-0">
                            <span className="flex items-center justify-center size-5 rounded-full bg-violet-500 text-[10px] font-bold text-white">
                              {th.unread}
                            </span>
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                ) : (
                  /* Messages view */
                  <>
                    <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
                      {threadMessages.map((msg) => (
                        <div
                          key={msg.id}
                          className={`flex ${msg.isOwn ? "justify-end" : "justify-start"}`}
                        >
                          <div
                            className={`max-w-[80%] rounded-xl px-3 py-2 text-sm ${
                              msg.isOwn
                                ? "bg-violet-600/30 text-foreground"
                                : "bg-white/[0.06] text-foreground"
                            }`}
                          >
                            <p>{msg.text}</p>
                            <p className={`text-[10px] mt-1 ${msg.isOwn ? "text-violet-300/60" : "text-muted-foreground/50"}`}>
                              {msg.time}
                            </p>
                          </div>
                        </div>
                      ))}
                      {isTyping && <TypingIndicator />}
                      <div ref={messagesEndRef} />
                    </div>

                    {/* Emoji quick-select */}
                    <div className="px-3 pt-1 flex items-center gap-1">
                      {QUICK_EMOJIS.map((emoji) => (
                        <button
                          key={emoji}
                          type="button"
                          onClick={() => handleSend(emoji)}
                          className="px-2 py-1 rounded-md hover:bg-white/[0.08] transition-colors text-base"
                          title={`Send ${emoji}`}
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>

                    {/* Input with pixel-art border */}
                    <div className="px-3 py-2 border-t border-white/[0.06]">
                      <form
                        onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                        className="flex items-center gap-2"
                      >
                        <input
                          value={input}
                          onChange={(e) => setInput(e.target.value)}
                          placeholder={t("chat.placeholder")}
                          className="flex-1 bg-white/5 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-violet-500/40"
                          style={{
                            fontFamily: "var(--font-pixel), monospace",
                            fontSize: "11px",
                            border: "3px solid transparent",
                            borderImage: "repeating-linear-gradient(90deg, #7c3aed 0px, #7c3aed 3px, #c026d3 3px, #c026d3 6px) 3",
                            imageRendering: "pixelated",
                            borderRadius: "0px",
                          }}
                        />
                        <button
                          type="submit"
                          disabled={!input.trim()}
                          className="flex items-center justify-center size-9 rounded-lg bg-violet-600 text-white hover:bg-violet-500 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          <Send className="size-4" />
                        </button>
                      </form>
                    </div>
                  </>
                )}
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Glow pulse keyframes */}
      <style jsx global>{`
        @keyframes chatGlowPulse {
          0%, 100% {
            box-shadow: 0 0 8px rgba(124, 58, 237, 0.4), 0 0 20px rgba(192, 38, 211, 0.2);
          }
          50% {
            box-shadow: 0 0 16px rgba(124, 58, 237, 0.7), 0 0 40px rgba(192, 38, 211, 0.4);
          }
        }
      `}</style>
    </>
  );
}
