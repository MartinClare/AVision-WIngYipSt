import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { apiFetch, getStoredToken, setStoredToken } from "@/lib/api";
import type { AuthUser } from "@/lib/types";

type AuthContextValue = {
  user: AuthUser | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ ok: true } | { ok: false; message: string }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  isAdmin: boolean;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    const stored = await getStoredToken();
    if (!stored) {
      setUser(null);
      setToken(null);
      return;
    }
    const res = await apiFetch<{ user: AuthUser }>("/api/mobile/me", { token: stored });
    if (!res.ok) {
      await setStoredToken(null);
      setUser(null);
      setToken(null);
      return;
    }
    setToken(stored);
    setUser(res.data.user);
  }, []);

  useEffect(() => {
    void (async () => {
      try {
        await refreshUser();
      } finally {
        setLoading(false);
      }
    })();
  }, [refreshUser]);

  const login = useCallback(async (email: string, password: string) => {
    const res = await apiFetch<{ accessToken: string; user: AuthUser }>("/api/mobile/auth/login", {
      method: "POST",
      body: JSON.stringify({ email: email.trim(), password }),
      token: null,
    });
    if (!res.ok) return { ok: false as const, message: res.error.message };
    await setStoredToken(res.data.accessToken);
    setToken(res.data.accessToken);
    setUser(res.data.user);
    return { ok: true as const };
  }, []);

  const logout = useCallback(async () => {
    await setStoredToken(null);
    setToken(null);
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      token,
      loading,
      login,
      logout,
      refreshUser,
      isAdmin: user?.role === "admin",
    }),
    [user, token, loading, login, logout, refreshUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
