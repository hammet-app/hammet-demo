"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  type ReactNode,
} from "react";
import type { AuthUser } from "@/lib/utils/roles";

// ─── Types ────────────────────────────────────────────────────

interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  /** True while the initial silent refresh is in flight */
  isLoading: boolean;
  /** True once the initial refresh attempt has resolved (success or fail) */
  isResolved: boolean;
}

interface AuthContextValue extends AuthState {
  /** Called by the login page after a successful POST /auth/login */
  setSession: (user: AuthUser, accessToken: string) => void;
  /** Clears context and calls POST /auth/logout */
  logout: () => Promise<void>;
  /** Imperatively refresh the access token — used by the API client */
  refreshToken: () => Promise<string | null>;
}

// ─── Context ──────────────────────────────────────────────────

const AuthContext = createContext<AuthContextValue | null>(null);

// ─── Constants ────────────────────────────────────────────────

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "";
/** Refresh 5 minutes before the 60-min access token expires */
const REFRESH_INTERVAL_MS = 55 * 60 * 1000;

// ─── Provider ─────────────────────────────────────────────────

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    accessToken: null,
    isLoading: true,
    isResolved: false,
  });

  const refreshTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Schedule proactive token refresh ──
  const scheduleRefresh = useCallback(() => {
    if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);
    refreshTimerRef.current = setTimeout(async () => {
      await refreshToken();
    }, REFRESH_INTERVAL_MS);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Core refresh call ──
 let refreshPromise: Promise<string | null> | null = null;

const refreshToken = useCallback(async (): Promise<string | null> => {
  if (refreshPromise) {
    return refreshPromise; // reuse ongoing refresh
  }

  refreshPromise = (async () => {
    try {
      const res = await fetch(`${API_BASE}/auth/refresh`, {
        method: "POST",
        credentials: "include",
      });

      if (!res.ok) {
        console.log("Refresh failed — keeping existing session");
        setState((prev) => ({
          ...prev,
          isLoading: false,
          isResolved: true,
        }));
        return null;
      }

      const data = await res.json();

      setState((prev) => ({
        ...prev,
        accessToken: data.access_token,
        user: data.user,
        isLoading: false,
        isResolved: true,
      }));

      scheduleRefresh();
      return data.access_token;
    } catch {
      console.log("Offline — skipping refresh");

      setState((prev) => ({
        ...prev,
        isLoading: false,
        isResolved: true,
      }));

      return null;
    } finally {
      refreshPromise = null; // release lock
    }
  })();

  return refreshPromise;
}, [scheduleRefresh]);

  // ── Silent refresh on mount ──
  useEffect(() => {
    const cached = localStorage.getItem("cached_user");

    if (cached) {
      const user = JSON.parse(cached);

      setState({
        user,
        accessToken: null,
        isLoading: false,
        isResolved: true,
      });
    }

    refreshToken();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Set session after login ──
  const setSession = useCallback(
    (user: AuthUser, accessToken: string) => {
      localStorage.setItem("cached_user", JSON.stringify(user)); // ADD THIS

      setState({ user, accessToken, isLoading: false, isResolved: true });
      scheduleRefresh();
    },
    [scheduleRefresh]
  );

  // ── Logout ──
  const logout = useCallback(async () => {
    try {
      await fetch(`${API_BASE}/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch {
      // Ignore network errors — clear session regardless
    } finally {
      localStorage.removeItem("cached_user"); // ADD THIS

      if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);
      setState({ user: null, accessToken: null, isLoading: false, isResolved: true });
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{ ...state, setSession, logout, refreshToken }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}

/**
 * Returns just the access token getter — useful in the API client
 * where you don't need the full auth state.
 */
export function useAccessToken(): string | null {
  return useAuth().accessToken;
}
