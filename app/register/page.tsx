"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, Mail, Lock, ArrowLeft, Loader2, UserPlus } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/lib/auth";
import { useLang } from "@/lib/i18n";

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
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {/* Back link */}
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft className="size-4" />
          {t("project.backToExplore")}
        </Link>

        {/* Card */}
        <div className="glass-card-strong border-glow rounded-2xl p-8 noise-bg">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center size-12 rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-500 shadow-lg shadow-emerald-500/25 mb-4">
              <UserPlus className="size-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold">
              {t("login.joinAdventure")}
            </h1>
            <p className="text-sm text-muted-foreground mt-2">
              {t("login.signUpStart")}
            </p>
          </div>

          {success ? (
            <div className="text-center py-6">
              <div className="size-16 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-4">
                <Mail className="size-8 text-emerald-400" />
              </div>
              <h3 className="font-semibold text-lg">{t("login.verifyEmailSent")}</h3>
              <p className="text-sm text-muted-foreground mt-2">
                {t("login.checkEmail")}
              </p>
              <Link
                href="/login"
                className="inline-block mt-6 text-sm text-violet-400 hover:text-violet-300 transition-colors"
              >
                {t("login.hasAccount")}
              </Link>
            </div>
          ) : (
            <>
              {/* OAuth Buttons */}
              <div className="space-y-3 mb-6">
                <Button
                  onClick={signInWithGitHub}
                  variant="outline"
                  className="w-full h-11 gap-3 border-white/10 hover:bg-white/5 text-sm"
                >
                  <svg className="size-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/></svg>
                  {t("login.github")}
                </Button>
                <Button
                  onClick={signInWithGoogle}
                  variant="outline"
                  className="w-full h-11 gap-3 border-white/10 hover:bg-white/5 text-sm"
                >
                  <svg className="size-4" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                  {t("login.google")}
                </Button>
              </div>

              {/* Divider */}
              <div className="flex items-center gap-3 mb-6">
                <div className="flex-1 h-px bg-white/10" />
                <span className="text-xs text-muted-foreground">{t("login.orEmail")}</span>
                <div className="flex-1 h-px bg-white/10" />
              </div>

              {/* Email form */}
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="space-y-1.5">
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your@email.com"
                      required
                      className="pl-10 h-11 bg-white/5 border-white/[0.08]"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                    <Input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder={t("login.password")}
                      required
                      minLength={6}
                      className="pl-10 h-11 bg-white/5 border-white/[0.08]"
                    />
                  </div>
                </div>

                {error && (
                  <p className="text-sm text-red-400 bg-red-500/10 rounded-lg px-3 py-2">
                    {error}
                  </p>
                )}

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-11 bg-gradient-to-r from-emerald-600 to-cyan-600 text-white hover:from-emerald-500 hover:to-cyan-500"
                >
                  {loading ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    t("login.signUp")
                  )}
                </Button>
              </form>

              {/* Link to login */}
              <div className="text-center mt-6">
                <Link
                  href="/login"
                  className="text-sm text-violet-400 hover:text-violet-300 transition-colors"
                >
                  {t("login.hasAccount")}
                </Link>
              </div>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}
