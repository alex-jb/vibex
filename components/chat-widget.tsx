"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, X, Send, ChevronDown } from "lucide-react";
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
  lastMessage: string;
  time: string;
  unread: number;
}

const mockThreads: ChatThread[] = [
  { id: "t1", name: "CodeReviewer Pro", lastMessage: "Your PR looks good!", time: "2m", unread: 1 },
  { id: "t2", name: "AlphaSignal", lastMessage: "BTC signal detected...", time: "15m", unread: 0 },
  { id: "t3", name: "TaskPilot", lastMessage: "Workflow completed", time: "1h", unread: 0 },
  { id: "t4", name: "StudyBuddy", lastMessage: "Quiz results ready", time: "3h", unread: 2 },
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
};

function getInitials(name: string): string {
  return name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
}

export function ChatWidget() {
  const { user } = useAuth();
  const { t } = useLang();
  const [open, setOpen] = useState(false);
  const [activeThread, setActiveThread] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState(mockMessages);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const totalUnread = mockThreads.reduce((s, t) => s + t.unread, 0);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeThread, messages]);

  if (!user) return null;

  const handleSend = () => {
    if (!input.trim() || !activeThread) return;
    const newMsg: ChatMessage = {
      id: `m-${Date.now()}`,
      sender: "You",
      text: input.trim(),
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      isOwn: true,
    };
    setMessages((prev) => ({
      ...prev,
      [activeThread]: [...(prev[activeThread] || []), newMsg],
    }));
    setInput("");
  };

  const thread = activeThread ? mockThreads.find((t) => t.id === activeThread) : null;
  const threadMessages = activeThread ? messages[activeThread] || [] : [];

  return (
    <>
      {/* Floating button */}
      <AnimatePresence>
        {!open && (
          <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            onClick={() => setOpen(true)}
            className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-600 px-4 py-3 text-white shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 transition-shadow"
          >
            <MessageSquare className="size-5" />
            <span className="text-sm font-medium hidden sm:inline">{t("chat.messaging")}</span>
            {totalUnread > 0 && (
              <span className="absolute -top-1.5 -right-1.5 flex items-center justify-center size-5 rounded-full bg-red-500 text-[10px] font-bold text-white">
                {totalUnread}
              </span>
            )}
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-6 right-6 z-50 w-[360px] h-[480px] flex flex-col glass-card-strong rounded-2xl border border-white/[0.08] shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06] bg-background/80">
              <div className="flex items-center gap-2">
                {activeThread && (
                  <button
                    onClick={() => setActiveThread(null)}
                    className="text-muted-foreground hover:text-foreground transition-colors mr-1"
                  >
                    <ChevronDown className="size-4 rotate-90" />
                  </button>
                )}
                <MessageSquare className="size-4 text-violet-400" />
                <span className="font-pixel text-[9px] text-violet-400 uppercase tracking-wider">
                  {activeThread ? thread?.name : t("chat.messaging")}
                </span>
              </div>
              <button
                onClick={() => { setOpen(false); setActiveThread(null); }}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="size-4" />
              </button>
            </div>

            {/* Content */}
            {!activeThread ? (
              /* Thread list */
              <div className="flex-1 overflow-y-auto">
                {mockThreads.map((thread) => (
                  <button
                    key={thread.id}
                    onClick={() => setActiveThread(thread.id)}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/[0.04] transition-colors text-left border-b border-white/[0.03]"
                  >
                    <div className="size-10 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center text-[10px] font-bold text-white shrink-0">
                      {getInitials(thread.name)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium truncate">{thread.name}</span>
                        <span className="text-[10px] text-muted-foreground shrink-0 ml-2">{thread.time}</span>
                      </div>
                      <p className="text-xs text-muted-foreground truncate mt-0.5">{thread.lastMessage}</p>
                    </div>
                    {thread.unread > 0 && (
                      <span className="flex items-center justify-center size-5 rounded-full bg-violet-500 text-[10px] font-bold text-white shrink-0">
                        {thread.unread}
                      </span>
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
                  <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="px-3 py-2 border-t border-white/[0.06]">
                  <form
                    onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                    className="flex items-center gap-2"
                  >
                    <input
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder={t("chat.placeholder")}
                      className="flex-1 bg-white/5 border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-violet-500/40"
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
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
