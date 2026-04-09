"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { supabase } from "./supabase";
import type { User, Session } from "@supabase/supabase-js";
import React from "react";

/** Demo user for showcasing the app without Supabase */
const DEMO_USER = {
  id: "demo-user-001",
  email: "trainer@vibexforge.com",
  user_metadata: {
    full_name: "VibeX Trainer",
    avatar_url: undefined,
  },
  app_metadata: {},
  aud: "authenticated",
  created_at: "2026-01-01T00:00:00Z",
} as unknown as User;

const DEMO_SESSION_KEY = "vibex-demo-session";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signInWithGitHub: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<{ error: string | null }>;
  signUpWithEmail: (email: string, password: string) => Promise<{ error: string | null }>;
  signInDemo: () => void;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  signInWithGitHub: async () => {},
  signInWithGoogle: async () => {},
  signInWithEmail: async () => ({ error: null }),
  signUpWithEmail: async () => ({ error: null }),
  signInDemo: () => {},
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for demo session first
    if (typeof window !== "undefined" && sessionStorage.getItem(DEMO_SESSION_KEY)) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setUser(DEMO_USER);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSession({ user: DEMO_USER } as unknown as Session);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLoading(false);
      return;
    }

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signInDemo = useCallback(() => {
    sessionStorage.setItem(DEMO_SESSION_KEY, "1");
    setUser(DEMO_USER);
    setSession({ user: DEMO_USER } as unknown as Session);
  }, []);

  const signInWithGitHub = useCallback(async () => {
    await supabase.auth.signInWithOAuth({
      provider: "github",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
  }, []);

  const signInWithGoogle = useCallback(async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
  }, []);

  const signInWithEmail = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error?.message ?? null };
  }, []);

  const signUpWithEmail = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    });
    return { error: error?.message ?? null };
  }, []);

  const signOut = useCallback(async () => {
    sessionStorage.removeItem(DEMO_SESSION_KEY);
    setUser(null);
    setSession(null);
    await supabase.auth.signOut();
  }, []);

  return React.createElement(
    AuthContext.Provider,
    {
      value: {
        user,
        session,
        loading,
        signInWithGitHub,
        signInWithGoogle,
        signInWithEmail,
        signUpWithEmail,
        signInDemo,
        signOut,
      },
    },
    children
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
