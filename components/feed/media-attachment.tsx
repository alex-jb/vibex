"use client";

import { useState } from "react";

interface MediaAttachmentProps {
  url: string;
  type: "image" | "gif";
}

export function MediaAttachment({ url, type }: MediaAttachmentProps) {
  const [loaded, setLoaded] = useState(false);
  const [errored, setErrored] = useState(false);

  if (errored) return null;

  return (
    <div
      className="retro-card"
      style={{
        position: "relative",
        overflow: "hidden",
        marginBottom: 10,
        background: "#0A0A0C",
        border: "2px solid #2A2A30",
      }}
    >
      {/* Scanline overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "repeating-linear-gradient(0deg, transparent 0, transparent 2px, rgba(0,0,0,0.1) 2px, rgba(0,0,0,0.1) 4px)",
          pointerEvents: "none",
          zIndex: 2,
        }}
      />

      {/* Loading placeholder */}
      {!loaded && (
        <div
          style={{
            width: "100%",
            height: 200,
            background: "#1A1A1E",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <span className="font-pixel" style={{ fontSize: 8, color: "#555" }}>
            LOADING...
          </span>
        </div>
      )}

      {/* Image */}
      {/* User-uploaded media from external URLs -- next/image requires explicit domain allowlisting */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={url}
        alt={type === "gif" ? "GIF attachment" : "Image attachment"}
        onLoad={() => setLoaded(true)}
        onError={() => setErrored(true)}
        style={{
          width: "100%",
          maxHeight: 400,
          objectFit: "cover",
          display: loaded ? "block" : "none",
          imageRendering: "auto",
        }}
      />

      {/* Type badge */}
      <span
        className="font-pixel"
        style={{
          position: "absolute",
          top: 6,
          right: 6,
          fontSize: 7,
          color: "#0D0D0D",
          background: type === "gif" ? "#FACC15" : "#9D00FF",
          padding: "1px 6px",
          zIndex: 3,
        }}
      >
        {type.toUpperCase()}
      </span>
    </div>
  );
}
