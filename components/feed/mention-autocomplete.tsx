"use client";

import { useState, useEffect, useRef, useCallback } from "react";

interface MentionUser {
  id: string;
  name: string;
}

// Mock users for demo mode
const MOCK_USERS: MentionUser[] = [
  { id: "u1", name: "PixelMaster" },
  { id: "u2", name: "CodeWizard" },
  { id: "u3", name: "NeonHacker" },
  { id: "u4", name: "RetroQueen" },
  { id: "u5", name: "AITrainer" },
  { id: "u6", name: "SpriteKing" },
];

interface MentionAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onMentionsChange: (mentions: string[]) => void;
  placeholder?: string;
  disabled?: boolean;
  maxLength?: number;
}

export function MentionAutocomplete({
  value,
  onChange,
  onMentionsChange,
  placeholder,
  disabled,
  maxLength = 500,
}: MentionAutocompleteProps) {
  const [suggestions, setSuggestions] = useState<MentionUser[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Extract current @mention query from cursor position
  const getMentionQuery = useCallback((): string | null => {
    const textarea = textareaRef.current;
    if (!textarea) return null;

    const cursorPos = textarea.selectionStart;
    const textBefore = value.slice(0, cursorPos);
    const match = textBefore.match(/@(\w*)$/);
    return match ? match[1] : null;
  }, [value]);

  // Search users on mention query change
  useEffect(() => {
    const query = getMentionQuery();
    if (query === null) {
      setShowSuggestions(false);
      return;
    }

    const filtered = MOCK_USERS.filter((u) =>
      u.name.toLowerCase().includes(query.toLowerCase()),
    ).slice(0, 5);

    setSuggestions(filtered);
    setShowSuggestions(filtered.length > 0);
    setSelectedIndex(0);
  }, [value, getMentionQuery]);

  // Extract all @mentions from content
  useEffect(() => {
    const mentions = Array.from(value.matchAll(/@(\w+)/g)).map((m) => m[1]);
    onMentionsChange(mentions);
  }, [value, onMentionsChange]);

  const insertMention = useCallback(
    (user: MentionUser) => {
      const textarea = textareaRef.current;
      if (!textarea) return;

      const cursorPos = textarea.selectionStart;
      const textBefore = value.slice(0, cursorPos);
      const textAfter = value.slice(cursorPos);
      const beforeMention = textBefore.replace(/@\w*$/, "");
      const newValue = `${beforeMention}@${user.name} ${textAfter}`;

      if (newValue.length <= maxLength) {
        onChange(newValue);
      }
      setShowSuggestions(false);

      // Restore focus
      setTimeout(() => {
        const newPos = beforeMention.length + user.name.length + 2;
        textarea.focus();
        textarea.setSelectionRange(newPos, newPos);
      }, 0);
    },
    [value, onChange, maxLength],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!showSuggestions) return;

      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((i) => Math.min(i + 1, suggestions.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((i) => Math.max(i - 1, 0));
      } else if (e.key === "Enter" && suggestions[selectedIndex]) {
        e.preventDefault();
        insertMention(suggestions[selectedIndex]);
      } else if (e.key === "Escape") {
        setShowSuggestions(false);
      }
    },
    [showSuggestions, suggestions, selectedIndex, insertMention],
  );

  return (
    <div style={{ position: "relative" }}>
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => {
          if (e.target.value.length <= maxLength) onChange(e.target.value);
        }}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        className="font-retro"
        style={{
          width: "100%",
          minHeight: 80,
          background: "#0A0A0C",
          border: "2px solid #2A2A30",
          padding: "10px 12px",
          fontSize: 14,
          lineHeight: 1.5,
          color: "#E8E8EC",
          resize: "vertical",
          outline: "none",
          fontFamily: "var(--font-retro)",
          opacity: disabled ? 0.5 : 1,
        }}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = "#9D00FF60";
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = "#2A2A30";
          // Delay hiding so click on suggestion works
          setTimeout(() => setShowSuggestions(false), 200);
        }}
      />

      {/* Autocomplete dropdown */}
      {showSuggestions && (
        <div
          style={{
            position: "absolute",
            bottom: "100%",
            left: 0,
            right: 0,
            background: "#0D0D10",
            border: "2px solid #2A2A30",
            zIndex: 10,
            maxHeight: 160,
            overflow: "auto",
          }}
        >
          {suggestions.map((user, i) => (
            <button
              key={user.id}
              onMouseDown={(e) => {
                e.preventDefault();
                insertMention(user);
              }}
              className="font-pixel"
              style={{
                display: "block",
                width: "100%",
                padding: "6px 10px",
                fontSize: 8,
                color: i === selectedIndex ? "#FACC15" : "#E8E8EC",
                background: i === selectedIndex ? "#2A2A30" : "transparent",
                border: "none",
                textAlign: "left",
                cursor: "pointer",
              }}
            >
              @{user.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
