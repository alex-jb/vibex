"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, Send } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useLang } from "@/lib/i18n";

interface ChatMessage {
  role: "user" | "ai" | "system";
  text: string;
}

const CANNED_AI_RESPONSES = [
  "That's a great question! Based on the data I've analyzed, I can provide a detailed breakdown. Let me walk you through it step by step.",
  "I've processed your request and found some interesting patterns. Here's what stands out from the analysis...",
  "Absolutely! I can help with that. Let me generate a comprehensive response based on the latest information available.",
  "Interesting perspective! I've cross-referenced multiple sources and here's what I've found that might be useful.",
  "Great input! Processing now... I've identified several key insights that could be valuable for your use case.",
  "I appreciate the follow-up. Based on our conversation so far, here's my recommendation with supporting context.",
];

interface ChatDemoProps {
  projectTitle: string;
}

export function ChatDemo({ projectTitle }: ChatDemoProps) {
  const { t } = useLang();
  const initialMessages: ChatMessage[] = [
    { role: "system", text: t("demo.welcome") },
    { role: "user", text: "Can you translate this with the right emotional tone?" },
    {
      role: "ai",
      text: "Absolutely. I detected a warm, conversational tone in your text. Here's the translation preserving that feeling...",
    },
    { role: "user", text: "That's exactly the nuance I needed. Can you do formal Japanese next?" },
    {
      role: "ai",
      text: "Of course! Switching to keigo (formal Japanese). The translation maintains respect markers while preserving your intent.",
    },
  ];

  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed || isTyping) return;

    const userMsg: ChatMessage = { role: "user", text: trimmed };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    setTimeout(() => {
      const response = CANNED_AI_RESPONSES[Math.floor(Math.random() * CANNED_AI_RESPONSES.length)];
      const aiMsg: ChatMessage = { role: "ai", text: response };
      setMessages((prev) => [...prev, aiMsg]);
      setIsTyping(false);
    }, 1000);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full min-h-64 sm:min-h-80 md:min-h-[400px] bg-black/20">
      {/* Chat header */}
      <div className="flex items-center gap-3 border-b border-white/5 px-5 py-3">
        <div className="flex size-8 items-center justify-center rounded-full bg-violet-600/20">
          <Bot className="size-4 text-violet-400" />
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-medium">{projectTitle}</span>
          <div className="flex items-center gap-1.5">
            <div className="size-1.5 rounded-full bg-emerald-400" />
            <span className="text-[10px] text-emerald-400">{t("demo.online")}</span>
          </div>
        </div>
        <Badge className="ml-auto bg-violet-500/10 text-violet-400 border-violet-500/20 text-[10px]">
          {t("demo.poweredByAI")}
        </Badge>
      </div>

      {/* Messages */}
      <div
        ref={scrollRef}
        role="log"
        aria-live="polite"
        className="flex-1 overflow-y-auto p-5 space-y-3 max-h-[320px]"
      >
        {messages.map((msg, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className={`flex ${
              msg.role === "user" ? "justify-end" : msg.role === "system" ? "justify-center" : "justify-start"
            }`}
          >
            {msg.role === "system" ? (
              <div className="rounded-full bg-white/5 px-4 py-2 text-xs text-muted-foreground/60">{msg.text}</div>
            ) : (
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                  msg.role === "user"
                    ? "bg-violet-600/30 text-violet-100 border border-violet-500/20"
                    : "bg-white/5 text-foreground border border-white/5"
                }`}
              >
                {msg.text}
              </div>
            )}
          </motion.div>
        ))}

        {/* Typing indicator */}
        <AnimatePresence>
          {isTyping && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex justify-start">
              <div className="bg-white/5 border border-white/5 rounded-2xl px-4 py-3 flex items-center gap-1.5">
                <div className="size-2 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                <div className="size-2 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                <div className="size-2 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Input */}
      <div className="border-t border-white/5 p-4">
        <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t("demo.typeMessage")}
            aria-label="Chat input"
            className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground/60 outline-none"
          />
          <button
            aria-label="Send message"
            onClick={handleSend}
            disabled={!input.trim() || isTyping}
            className="flex size-8 items-center justify-center transition-opacity hover:opacity-90 disabled:opacity-40"
            style={{
              background: "#F97316",
              border: "2px solid #FFE27D",
              color: "#1A0F00",
              boxShadow: "2px 2px 0 #000",
            }}
          >
            <Send className="size-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
