"use client";

import { useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { identifyUser, resetUser } from "@/lib/analytics";

export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      identifyUser(user.id, {
        email: user.email,
        name: user.user_metadata?.full_name,
      });
    } else {
      resetUser();
    }
  }, [user]);

  return <>{children}</>;
}
