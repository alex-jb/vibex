"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Lock, ArrowLeft, Loader2, UserPlus, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { useLang } from "@/lib/i18n";

/* ═══════════════════════════════════════════════════════════════════════════
   REGISTER — "NEW PLAYER" arcade sign-up terminal.
   Matches /login visual language. All auth logic preserved.
   ═══════════════════════════════════════════════════════════════════════════ */

const pixelEase = [0.22, 1, 0.36, 1] as const;

export default function RegisterPage() {
  const { t } = useLang();
  const { signInWithGitHub, signInWithGoogle, signUpWithEmail } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const result = await signUpWithEmail(email, password);
    setLoading(false);

    if (result.error) {
      setError(result.error);
    } else {
      setSuccess(true);
    }
  };

  return (
    <div
      className="relative min-h-screen overflow-hidden flex items-center justify-center px-4 py-10"
      style={{ background: "var(--bg-deep)" }}
    >
      {/* Ambient effects (same recipe as /login) */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-30"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(57,255,20,0.04) 2px, rgba(57,255,20,0.04) 3px)",
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(57,255,20,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(57,255,20,0.3) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
          maskImage:
            "radial-gradient(ellipse at center, black 30%, transparent 80%)",
          WebkitMaskImage:
            "radial-gradient(ellipse at center, black 30%, transparent 80%)",
        }}
      />
      <div className="pointer-events-none absolute -top-40 right-1/3 h-[500px] w-[500px] rounded-full bg-emerald-600/12 blur-[140px]" />
      <div className="pointer-events-none absolute bottom-0 left-1/4 h-[300px] w-[300px] rounded-full bg-cyan-600/10 blur-[100px]" />

      {/* Corner brackets */}
      {(["tl", "tr", "bl", "br"] as const).map((pos) => {
        const isTop = pos.startsWith("t");
        const isLeft = pos.endsWith("l");
        return (
          <div
            key={pos}
            aria-hidden="true"
            className="pointer-events-none absolute hidden sm:block"
            style={{
              [isTop ? "top" : "bottom"]: 16,
              [isLeft ? "left" : "right"]: 16,
              width: 28,
              height: 28,
            }}
          >
            <div
              style={{
                position: "absolute",
                [isTop ? "top" : "bottom"]: 0,
                [isLeft ? "left" : "right"]: 0,
                width: 28,
                height: 3,
                background: "var(--neon-green)",
                boxShadow: "0 0 8px rgba(57,255,20,0.6)",
              }}
            />
            <div
              style={{
                position: "absolute",
                [isTop ? "top" : "bottom"]: 0,
                [isLeft ? "left" : "right"]: 0,
                width: 3,
                height: 28,
                background: "var(--neon-green)",
                boxShadow: "0 0 8px rgba(57,255,20,0.6)",
              }}
            />
          </div>
        );
      })}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: pixelEase }}
        className="relative z-10 w-full max-w-md"
      >
        {/* Back link */}
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 mb-6 font-pixel hover:text-white transition-colors"
          style={{
            fontSize: 8,
            letterSpacing: 2,
            color: "#A7F3D0",
          }}
        >
          <ArrowLeft className="size-3" />
          BACK TO SHOWCASE
        </Link>

        <div
          className="relative p-6 sm:p-8"
          style={{
            background:
              "linear-gradient(180deg, #081f0f 0%, #0a2515 50%, #061a0c 100%)",
            border: "3px solid var(--neon-green)",
            boxShadow:
              "0 0 0 1px #000, 0 0 0 5px #0a2515, 0 0 32px rgba(57,255,20,0.25), 0 16px 48px rgba(0,0,0,0.8)",
          }}
        >
          {/* Terminal header */}
          <div
            className="flex items-center justify-between mb-6 px-3 py-1.5"
            style={{
              background:
                "linear-gradient(90deg, #0a2515 0%, #10351f 50%, #0a2515 100%)",
              borderBottom: "2px solid var(--neon-green)",
              marginLeft: -24,
              marginRight: -24,
              marginTop: -24,
              paddingLeft: 24,
              paddingRight: 24,
              paddingTop: 12,
              paddingBottom: 12,
            }}
          >
            <div className="flex items-center gap-2">
              <span
                className="inline-block"
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: "#39FF14",
                  boxShadow: "0 0 6px #39FF14",
                  animation: "pulse 1.5s ease-in-out infinite",
                }}
              />
              <span
                className="font-pixel"
                style={{ fontSize: 7, letterSpacing: 2, color: "#A7F3D0" }}
              >
                VIBEX://AUTH_V1
              </span>
            </div>
            <span
              className="font-pixel"
              style={{ fontSize: 7, letterSpacing: 1, color: "#39FF14" }}
            >
              REGISTER
            </span>
          </div>

          {success ? (
            <SuccessPanel />
          ) : (
            <>
              {/* Title */}
              <div className="text-center mb-6">
                <h1
                  className="font-pixel mb-2 inline-flex items-center gap-2"
                  style={{
                    fontSize: 16,
                    color: "#FFF",
                    letterSpacing: 2,
                    textShadow:
                      "2px 2px 0 var(--neon-green), -1px -1px 0 rgba(6,182,212,0.5), 0 0 20px rgba(57,255,20,0.5)",
                  }}
                >
                  <UserPlus className="size-4" style={{ color: "var(--neon-green)" }} />
                  NEW PLAYER
                </h1>
                <p
                  className="font-retro"
                  style={{ fontSize: 14, color: "#A7F3D0", letterSpacing: 0.5 }}
                >
                  {t("login.signUpStart")}
                </p>
              </div>

              {/* OAuth */}
              <div className="grid grid-cols-2 gap-3 mb-5">
                <button
                  type="button"
                  onClick={signInWithGitHub}
                  className="flex items-center justify-center gap-2 px-3 py-2.5 font-pixel transition-transform hover:scale-[1.03] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-green-500/50"
                  style={{
                    background: "rgba(0,0,0,0.5)",
                    border: "2px solid rgba(57,255,20,0.5)",
                    boxShadow: "2px 2px 0 #000",
                    color: "#A7F3D0",
                    minHeight: "42px",
                    fontSize: 8,
                    letterSpacing: 1,
                    cursor: "pointer",
                  }}
                >
                  <svg className="size-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
                  </svg>
                  GITHUB
                </button>
                <button
                  type="button"
                  onClick={signInWithGoogle}
                  className="flex items-center justify-center gap-2 px-3 py-2.5 font-pixel transition-transform hover:scale-[1.03] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-green-500/50"
                  style={{
                    background: "rgba(0,0,0,0.5)",
                    border: "2px solid rgba(57,255,20,0.5)",
                    boxShadow: "2px 2px 0 #000",
                    color: "#A7F3D0",
                    minHeight: "42px",
                    fontSize: 8,
                    letterSpacing: 1,
                    cursor: "pointer",
                  }}
                >
                  <svg className="size-4" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                  GOOGLE
                </button>
              </div>

              <div className="flex items-center gap-3 mb-4">
                <div className="flex-1 h-px" style={{ background: "rgba(57,255,20,0.3)" }} />
                <span
                  className="font-pixel"
                  style={{ fontSize: 6, letterSpacing: 2, color: "#5A8B6E" }}
                >
                  OR EMAIL
                </span>
                <div className="flex-1 h-px" style={{ background: "rgba(57,255,20,0.3)" }} />
              </div>

              {/* Email form */}
              <form onSubmit={handleRegister} className="space-y-3">
                <RetroInput
                  icon={<Mail className="size-4" />}
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                  autoComplete="email"
                />
                <RetroInput
                  icon={<Lock className="size-4" />}
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="PASSWORD (MIN 6 CHARS)"
                  required
                  minLength={6}
                  autoComplete="new-password"
                />

                {error && (
                  <div
                    role="alert"
                    className="px-3 py-2 font-pixel"
                    style={{
                      fontSize: 8,
                      letterSpacing: 1,
                      color: "#FFB3C5",
                      background: "rgba(255,0,77,0.1)",
                      border: "1px solid rgba(255,0,77,0.5)",
                    }}
                  >
                    ⚠ {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 font-pixel transition-transform hover:scale-[1.02] disabled:opacity-60 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-green-500/50"
                  style={{
                    background:
                      "linear-gradient(135deg, var(--neon-green) 0%, #22C55E 100%)",
                    border: "2px solid #FFF",
                    boxShadow: "3px 3px 0 #000, 0 0 20px rgba(57,255,20,0.5)",
                    color: "#0A2500",
                    minHeight: "48px",
                    fontSize: 9,
                    letterSpacing: 2,
                    cursor: loading ? "wait" : "pointer",
                  }}
                >
                  {loading ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      CREATING ACCOUNT...
                    </>
                  ) : (
                    "▶ CREATE ACCOUNT"
                  )}
                </button>
              </form>

              <div className="text-center mt-5">
                <Link
                  href="/login"
                  className="font-pixel transition-colors hover:text-white"
                  style={{
                    fontSize: 8,
                    letterSpacing: 1.5,
                    color: "var(--neon-purple)",
                    textShadow: "0 0 6px rgba(157,0,255,0.4)",
                  }}
                >
                  ▸ HAVE AN ACCOUNT? SIGN IN ◂
                </Link>
              </div>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}

function SuccessPanel() {
  const { t } = useLang();
  return (
    <div className="text-center py-4">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 15 }}
        className="inline-flex items-center justify-center mb-5"
        style={{
          width: 64,
          height: 64,
          background: "rgba(57,255,20,0.15)",
          border: "3px solid var(--neon-green)",
          boxShadow: "0 0 24px rgba(57,255,20,0.5)",
        }}
      >
        <CheckCircle2 className="size-8" style={{ color: "var(--neon-green)" }} />
      </motion.div>
      <h3
        className="font-pixel mb-3"
        style={{
          fontSize: 14,
          color: "#FFF",
          letterSpacing: 2,
          textShadow: "2px 2px 0 var(--neon-green), 0 0 20px rgba(57,255,20,0.5)",
        }}
      >
        EMAIL SENT
      </h3>
      <p
        className="font-retro mb-5"
        style={{ fontSize: 14, color: "#A7F3D0", letterSpacing: 0.3, lineHeight: 1.5 }}
      >
        {t("login.checkEmail")}
      </p>
      <Link
        href="/login"
        className="inline-block font-pixel transition-colors hover:text-white"
        style={{
          fontSize: 8,
          letterSpacing: 1.5,
          color: "var(--neon-purple)",
          textShadow: "0 0 6px rgba(157,0,255,0.4)",
        }}
      >
        ▸ BACK TO SIGN IN ◂
      </Link>
    </div>
  );
}

function RetroInput({
  icon,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { icon: React.ReactNode }) {
  return (
    <div className="relative">
      <span
        aria-hidden="true"
        className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
        style={{ color: "var(--neon-green)" }}
      >
        {icon}
      </span>
      <input
        {...props}
        className="w-full font-retro pl-10 pr-3 py-2.5 outline-none focus:ring-2 focus:ring-green-500/50 transition-shadow"
        style={{
          background: "rgba(0,0,0,0.6)",
          border: "2px solid rgba(57,255,20,0.4)",
          boxShadow: "inset 0 2px 4px rgba(0,0,0,0.6)",
          color: "#E8E8EC",
          fontSize: 15,
          letterSpacing: 0.5,
          minHeight: "44px",
        }}
      />
    </div>
  );
}
