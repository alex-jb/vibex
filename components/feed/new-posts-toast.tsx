"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useLang } from "@/lib/i18n";

interface NewPostsToastProps {
  count: number;
  onClick: () => void;
}

export function NewPostsToast({ count, onClick }: NewPostsToastProps) {
  const { t } = useLang();
  return (
    <AnimatePresence>
      {count > 0 && (
        <motion.button
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.25 }}
          onClick={onClick}
          className="nes-btn is-primary"
          style={{
            position: "fixed",
            top: 80,
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 50,
            fontSize: 9,
            padding: "6px 16px",
            display: "flex",
            alignItems: "center",
            gap: 6,
            boxShadow: "0 4px 20px rgba(157, 0, 255, 0.4)",
          }}
        >
          <span style={{ fontSize: 12 }}>{"\u2191"}</span>
          <span className="font-pixel" style={{ fontSize: 8 }}>
            {count}{t("feed.newPosts")}
          </span>
        </motion.button>
      )}
    </AnimatePresence>
  );
}
