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
import {
  persistSession,
  getPersistedSession,
  clearPersistedSession,
} from "@/lib/db";
import { toRefreshResponse } from "../api/types";

// ─── Types ────────────────────────────────────────────────────

interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  isLoading: boolean;
  isResolved: boolean;
  /**
   * True when the user was hydrated from IndexedDB and the network
   * refresh either failed or hasn't resolved yet. Pages that need
   * live data can use this to show a "offline mode" indicator.
   */
  isOffline: boolean;
}

interface AuthContextValue extends AuthState {
  setSession: (user: AuthUser, accessToken: string) => void;
  logout: () => Promise<void>;
  refreshToken: () => Promise<string | null>;
}

// ─── Context ──────────────────────────────────────────────────

const AuthContext = createContext<AuthContextValue | null>(null);

// ─── Constants ────────────────────────────────────────────────

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "";
const REFRESH_INTERVAL_MS = 55 * 60 * 1000;

// ─── Provider ─────────────────────────────────────────────────

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    accessToken: null,
    isLoading: true,
    isResolved: false,
    isOffline: false,
  });

  const refreshTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  let refreshPromise: Promise<string | null> | null = null;

  const scheduleRefresh = useCallback(() => {
    if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);
    refreshTimerRef.current = setTimeout(async () => {
      await refreshToken();
    }, REFRESH_INTERVAL_MS);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const refreshToken = useCallback(async (): Promise<string | null> => {
    if (localStorage.getItem("logged_out") === "true") return null;
    if (refreshPromise) return refreshPromise;

    refreshPromise = (async () => {
      try {
        const res = await fetch(`${API_BASE}/auth/refresh`, {
          method: "POST",
          credentials: "include",
        });

        if (!res.ok) {
          // Network reached but token is invalid — genuinely logged out.
          // Clear the persisted session so we don't resurrect a dead session.
          await clearPersistedSession();
          setState({
            user: null,
            accessToken: null,
            isLoading: false,
            isResolved: true,
            isOffline: false,
          });
          return null;
        }

        const response = await res.json();

        const data = toRefreshResponse(response)

        // Persist fresh session to IndexedDB for next offline load
        await persistSession(data.user, data.accessToken);

        setState((prev) => ({
          ...prev,
          accessToken: data.accessToken,
          user: data.user,
          isLoading: false,
          isResolved: true,
          isOffline: false,
        }));

        scheduleRefresh();
        return data.accessToken;
      } catch {
        // Network error (offline, timeout, etc.)
        // Don't wipe the user — keep whatever is in state (may be from IndexedDB).
        // Just mark as resolved + offline so the UI can adapt.
        setState((prev) => ({
          ...prev,
          isLoading: false,
          isResolved: true,
          isOffline: true,
        }));
        return null;
      } finally {
        refreshPromise = null;
      }
    })();

    return refreshPromise;
  }, [scheduleRefresh]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Silent refresh on mount ──
  // Step 1: hydrate from IndexedDB immediately (no skeleton if cached)
  // Step 2: attempt network refresh in background
  useEffect(() => {
    let cancelled = false;

    // Step 1 — try IndexedDB first
    const SESSION_MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000 // 30 days

    async function init() {
      const cached = await getPersistedSession()

      if (cached) {
        const age = Date.now() - new Date(cached.cachedAt).getTime()

        if (age > SESSION_MAX_AGE_MS) {
          // Session too old — clear it and fall through to network refresh
          // If that fails too, user goes to login
          await clearPersistedSession()
        } else {
          // Fresh enough — hydrate immediately
          setState({
            user: cached.user,
            accessToken: cached.accessToken,
            isLoading: false,
            isResolved: true,
            isOffline: true,
          })
        }
      }
      // Step 2 — attempt network refresh regardless
      // If it succeeds: updates state + clears isOffline
      // If it fails + we have a cached session: user stays logged in (isOffline stays true)
      // If it fails + no cached session: user goes to login
      if (!cancelled) {
        await refreshToken()
      }
    }

    init();

    return () => {
      cancelled = true;
      if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const setSession = useCallback(
    (user: AuthUser, accessToken: string) => {
      persistSession(user, accessToken); // fire-and-forget
      localStorage.removeItem("logged_out");
      setState({ user, accessToken, isLoading: false, isResolved: true, isOffline: false });
      scheduleRefresh();
    },
    [scheduleRefresh]
  );

  const logout = useCallback(async () => {
    localStorage.setItem("logged_out", "true");
    await clearPersistedSession();
    try {
      await fetch(`${API_BASE}/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch {
      // ignore
    } finally {
      if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);
      setState({ user: null, accessToken: null, isLoading: false, isResolved: true, isOffline: false });
    }
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, setSession, logout, refreshToken }}>
      {children}
    </AuthContext.Provider>
  );
}

// ─── Hooks ────────────────────────────────────────────────────

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}

export function useAccessToken(): string | null {
  return useAuth().accessToken;
}