"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, Heart, Reply, Send } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { useLang } from "@/lib/i18n";

interface Comment {
  id: string;
  project_id: string;
  user_id: string;
  user_name: string;
  content: string;
  parent_id: string | null;
  likes: number;
  created_at: string;
}

const INITIAL_MOCK: Comment[] = [
  {
    id: "c1",
    project_id: "",
    user_id: "u1",
    user_name: "PixelMaster",
    content: "This project is amazing! The AI integration is seamless.",
    parent_id: null,
    likes: 12,
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "c2",
    project_id: "",
    user_id: "u2",
    user_name: "CodeWizard",
    content: "Love the vibe coding approach. How did you handle the prompt engineering?",
    parent_id: null,
    likes: 8,
    created_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "c3",
    project_id: "",
    user_id: "u3",
    user_name: "AITrainer",
    content: "Great question! I used chain-of-thought prompting with few-shot examples.",
    parent_id: "c2",
    likes: 3,
    created_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "c4",
    project_id: "",
    user_id: "u4",
    user_name: "NeonHacker",
    content: "Shipped this to my team, everyone loved it. Keep building!",
    parent_id: null,
    likes: 5,
    created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  },
];

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function getAvatarColor(name: string): string {
  const colors = [
    "bg-violet-500/30 text-violet-300",
    "bg-blue-500/30 text-blue-300",
    "bg-emerald-500/30 text-emerald-300",
    "bg-orange-500/30 text-orange-300",
    "bg-pink-500/30 text-pink-300",
    "bg-cyan-500/30 text-cyan-300",
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

function relativeTime(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diffMs = now - then;
  const minutes = Math.floor(diffMs / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m`;
  if (hours < 24) return `${hours}h`;
  if (days < 30) return `${days}d`;
  return `${Math.floor(days / 30)}mo`;
}

interface CommentItemProps {
  comment: Comment;
  replies: Comment[];
  onReply: (parentId: string) => void;
  onLike: (commentId: string) => void;
  replyingTo: string | null;
  replyText: string;
  onReplyTextChange: (text: string) => void;
  onSubmitReply: () => void;
}

function CommentItem({
  comment,
  replies,
  onReply,
  onLike,
  replyingTo,
  replyText,
  onReplyTextChange,
  onSubmitReply,
}: CommentItemProps) {
  return (
    <div className="group">
      <div className="flex gap-3">
        <div
          className={`size-8 shrink-0 rounded-full flex items-center justify-center text-xs font-bold ${getAvatarColor(comment.user_name)}`}
        >
          {getInitials(comment.user_name)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-medium text-foreground truncate">
              {comment.user_name}
            </span>
            <span className="text-xs text-muted-foreground">
              {relativeTime(comment.created_at)}
            </span>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {comment.content}
          </p>
          <div className="flex items-center gap-4 mt-2">
            <button
              onClick={() => onLike(comment.id)}
              aria-label={`Like comment by ${comment.user_name}`}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-pink-400 transition-colors"
            >
              <Heart className="size-3.5" />
              <span>{comment.likes > 0 ? comment.likes : ""}</span>
            </button>
            <button
              onClick={() => onReply(comment.id)}
              aria-label={`Reply to ${comment.user_name}`}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-[#FF4500] transition-colors"
            >
              <Reply className="size-3.5" />
              <span>Reply</span>
            </button>
          </div>

          <AnimatePresence>
            {replyingTo === comment.id && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-3 overflow-hidden"
              >
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={replyText}
                    onChange={(e) => onReplyTextChange(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && replyText.trim()) onSubmitReply();
                    }}
                    placeholder={`Reply to ${comment.user_name}...`}
                    aria-label={`Reply to ${comment.user_name}`}
                    className="flex-1 rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-[#FF4500]/60"
                  />
                  <button
                    onClick={onSubmitReply}
                    disabled={!replyText.trim()}
                    aria-label="Send reply"
                    className="font-pixel px-3 py-2 text-[10px] tracking-widest hover:-translate-x-0.5 hover:-translate-y-0.5 transition-transform disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-x-0 disabled:hover:translate-y-0"
                    style={{
                      background: "#FF4500",
                      border: "2px solid #FFE27D",
                      color: "#1A0F00",
                      boxShadow: "2px 2px 0 #000",
                    }}
                  >
                    <Send className="size-3.5" />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {replies.length > 0 && (
            <div className="mt-3 ml-2 pl-3 border-l border-white/[0.06] space-y-3">
              {replies.map((reply) => (
                <div key={reply.id} className="flex gap-3">
                  <div
                    className={`size-6 shrink-0 rounded-full flex items-center justify-center text-[10px] font-bold ${getAvatarColor(reply.user_name)}`}
                  >
                    {getInitials(reply.user_name)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-xs font-medium text-foreground truncate">
                        {reply.user_name}
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        {relativeTime(reply.created_at)}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {reply.content}
                    </p>
                    <button
                      onClick={() => onLike(reply.id)}
                      aria-label={`Like reply by ${reply.user_name}`}
                      className="flex items-center gap-1 mt-1 text-[10px] text-muted-foreground hover:text-pink-400 transition-colors"
                    >
                      <Heart className="size-3" />
                      <span>{reply.likes > 0 ? reply.likes : ""}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function CommentSection({ projectId }: { projectId: string }) {
  const { user } = useAuth();
  const { t } = useLang();
  void t; // i18n available for future use

  const [comments, setComments] = useState<Comment[]>(() =>
    INITIAL_MOCK.map((c) => ({ ...c, project_id: projectId })),
  );
  const [newComment, setNewComment] = useState("");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");

  const topLevelComments = comments.filter((c) => c.parent_id === null);
  const getReplies = (parentId: string) =>
    comments.filter((c) => c.parent_id === parentId);

  const handleSubmit = useCallback(() => {
    if (!newComment.trim() || !user) return;

    const displayName =
      (user.user_metadata?.full_name as string) ??
      (user.user_metadata?.name as string) ??
      user.email?.split("@")[0] ??
      "Trainer";

    const comment: Comment = {
      id: `local-${Date.now()}`,
      project_id: projectId,
      user_id: user.id,
      user_name: displayName,
      content: newComment.trim(),
      parent_id: null,
      likes: 0,
      created_at: new Date().toISOString(),
    };

    setComments((prev) => [comment, ...prev]);
    setNewComment("");
  }, [newComment, user, projectId]);

  const handleReply = useCallback(
    (parentId: string) => {
      setReplyingTo((prev) => (prev === parentId ? null : parentId));
      setReplyText("");
    },
    [],
  );

  const handleSubmitReply = useCallback(() => {
    if (!replyText.trim() || !replyingTo || !user) return;

    const displayName =
      (user.user_metadata?.full_name as string) ??
      (user.user_metadata?.name as string) ??
      user.email?.split("@")[0] ??
      "Trainer";

    const reply: Comment = {
      id: `local-${Date.now()}`,
      project_id: projectId,
      user_id: user.id,
      user_name: displayName,
      content: replyText.trim(),
      parent_id: replyingTo,
      likes: 0,
      created_at: new Date().toISOString(),
    };

    setComments((prev) => [...prev, reply]);
    setReplyingTo(null);
    setReplyText("");
  }, [replyText, replyingTo, user, projectId]);

  const handleLike = useCallback((commentId: string) => {
    setComments((prev) =>
      prev.map((c) =>
        c.id === commentId ? { ...c, likes: c.likes + 1 } : c,
      ),
    );
  }, []);

  return (
    <div className="glass-card-strong rounded-2xl border border-white/[0.08] p-6 noise-bg">
      {/* Header */}
      <div className="flex items-center gap-2 mb-6">
        <MessageSquare className="size-5" style={{ color: "#FF4500" }} />
        <h3 className="text-lg font-semibold text-foreground">
          {t("comment.comments")} ({comments.length})
        </h3>
      </div>

      {/* New comment input */}
      {user ? (
        <div className="flex gap-3 mb-6">
          <div
            className={`size-8 shrink-0 rounded-full flex items-center justify-center text-xs font-bold ${getAvatarColor(
              (user.user_metadata?.full_name as string) ??
                user.email ??
                "U",
            )}`}
          >
            {getInitials(
              (user.user_metadata?.full_name as string) ??
                (user.user_metadata?.name as string) ??
                user.email?.split("@")[0] ??
                "U",
            )}
          </div>
          <div className="flex-1 flex gap-2">
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && newComment.trim()) handleSubmit();
              }}
              placeholder={t("comment.placeholder")}
              aria-label={t("comment.placeholder")}
              className="flex-1 rounded-lg border border-white/[0.08] bg-white/[0.03] px-4 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-[#FF4500]/60 transition-colors"
            />
            <button
              onClick={handleSubmit}
              disabled={!newComment.trim()}
              aria-label={t("comment.send")}
              className="font-pixel flex items-center gap-1.5 px-4 py-2 text-[10px] tracking-widest hover:-translate-x-0.5 hover:-translate-y-0.5 transition-transform disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-x-0 disabled:hover:translate-y-0"
              style={{
                background: "#FF4500",
                border: "2px solid #FFE27D",
                color: "#1A0F00",
                boxShadow: "3px 3px 0 #000, inset 0 5px 0 rgba(255,255,255,0.12), inset 0 -5px 0 rgba(0,0,0,0.2)",
              }}
            >
              <Send className="size-4" />
              <span>{t("comment.send")}</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="mb-6 rounded-lg border border-white/[0.06] bg-white/[0.02] p-4 text-center">
          <p className="text-sm text-muted-foreground">
            <Link
              href="/login"
              className="underline underline-offset-2 transition-colors hover:opacity-80"
              style={{ color: "#FF4500", textShadow: "0 0 4px rgba(255,69,0,0.4)" }}
            >
              {t("comment.signIn")}
            </Link>
            {t("comment.toComment")}
          </p>
        </div>
      )}

      {/* Comments list */}
      <div className="space-y-5">
        {topLevelComments.map((comment) => (
          <motion.div
            key={comment.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <CommentItem
              comment={comment}
              replies={getReplies(comment.id)}
              onReply={handleReply}
              onLike={handleLike}
              replyingTo={replyingTo}
              replyText={replyText}
              onReplyTextChange={setReplyText}
              onSubmitReply={handleSubmitReply}
            />
          </motion.div>
        ))}
      </div>

      {topLevelComments.length === 0 && (
        <div className="text-center py-8 text-muted-foreground text-sm">
          {t("comment.empty")}
        </div>
      )}
    </div>
  );
}
