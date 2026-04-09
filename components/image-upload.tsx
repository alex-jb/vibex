"use client";

import { useState, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import { Upload, X, Loader2, ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ImageUploadProps {
  type: "avatar" | "thumbnail";
  targetId?: string; // projectId for thumbnails
  currentUrl?: string;
  onUpload: (url: string) => void;
  className?: string;
  size?: "sm" | "md" | "lg";
}

const SIZE_MAP = {
  sm: { w: "w-20", h: "h-20", icon: 16, text: "6px" },
  md: { w: "w-32", h: "h-32", icon: 24, text: "7px" },
  lg: { w: "w-full", h: "h-48", icon: 32, text: "8px" },
};

export function ImageUpload({
  type,
  targetId,
  currentUrl,
  onUpload,
  className = "",
  size = "md",
}: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(currentUrl ?? null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const s = SIZE_MAP[size];

  const handleFile = useCallback(
    async (file: File) => {
      setError(null);

      // Client-side validation
      if (!file.type.startsWith("image/")) {
        setError("Please select an image file");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setError("File too large (max 5MB)");
        return;
      }

      // Show preview immediately
      const objectUrl = URL.createObjectURL(file);
      setPreview(objectUrl);

      // Upload
      setUploading(true);
      try {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("type", type);
        if (targetId) formData.append("targetId", targetId);

        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Upload failed");
        }

        const { url } = await res.json();
        setPreview(url);
        onUpload(url);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Upload failed");
        setPreview(currentUrl ?? null);
      } finally {
        setUploading(false);
        URL.revokeObjectURL(objectUrl);
      }
    },
    [type, targetId, currentUrl, onUpload]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const clearImage = useCallback(() => {
    setPreview(null);
    setError(null);
    if (inputRef.current) inputRef.current.value = "";
  }, []);

  return (
    <div className={className}>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/gif,image/webp"
        onChange={handleChange}
        className="hidden"
      />

      {preview ? (
        <div className={`relative ${s.w} ${s.h} group`}>
          <img
            src={preview}
            alt={type === "avatar" ? "Avatar" : "Thumbnail"}
            className={`${s.w} ${s.h} object-cover rounded-lg border border-white/[0.08]`}
          />
          {uploading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-lg">
              <Loader2 className="size-5 animate-spin text-violet-400" />
            </div>
          )}
          {!uploading && (
            <div className="absolute inset-0 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 rounded-lg">
              <Button
                size="icon-xs"
                variant="ghost"
                className="text-white hover:bg-white/20"
                onClick={() => inputRef.current?.click()}
              >
                <Upload className="size-3" />
              </Button>
              <Button
                size="icon-xs"
                variant="ghost"
                className="text-white hover:bg-red-500/20"
                onClick={clearImage}
              >
                <X className="size-3" />
              </Button>
            </div>
          )}
        </div>
      ) : (
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => inputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          className={`${s.w} ${s.h} flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-white/[0.08] bg-white/[0.02] hover:border-violet-500/30 hover:bg-violet-500/5 transition-all cursor-pointer`}
        >
          <ImageIcon className="text-muted-foreground/40" style={{ width: s.icon, height: s.icon }} />
          <span className="font-pixel text-muted-foreground/40" style={{ fontSize: s.text }}>
            {type === "avatar" ? "Upload Avatar" : "Upload Cover"}
          </span>
          <span className="text-[10px] text-muted-foreground/30">
            Drop or click (max 5MB)
          </span>
        </motion.button>
      )}

      {error && (
        <p className="mt-1.5 text-xs text-red-400">{error}</p>
      )}
    </div>
  );
}
