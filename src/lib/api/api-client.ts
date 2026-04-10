/**
 * Authenticated API client.
 *
 * Usage:
 *   import { apiClient } from "@/lib/api-client";
 *
 *   // In a component or server action
 *   const data = await apiClient.get<StudentProgress>("/students/me/progress", token);
 *   const result = await apiClient.post<LoginResponse>("/auth/login", body);
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "";

type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

interface RequestOptions {
  token?: string | null;
  /** Pass a refreshToken fn so the client can retry once on 401 */
  onRefresh?: () => Promise<string | null>;
}

async function request<T>(
  method: HttpMethod,
  path: string,
  body?: unknown,
  options: RequestOptions = {}
): Promise<T> {
  const { token, onRefresh } = options;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    credentials: "include", // always send cookies (refresh token)
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  // ── 401: try silent refresh once then retry ──
  if (res.status === 401 && onRefresh) {
    const newToken = await onRefresh();
    if (newToken) {
      const retryRes = await fetch(`${API_BASE}${path}`, {
        method,
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${newToken}`,
        },
        body: body !== undefined ? JSON.stringify(body) : undefined,
      });

      if (!retryRes.ok) {
        const err = await retryRes.json().catch(() => ({ detail: "Request failed" }));
        throw new ApiError(retryRes.status, err.detail ?? "Request failed");
      }

      return retryRes.json() as Promise<T>;
    }

    // Refresh failed — throw so the dashboard guard can redirect to login
    throw new ApiError(401, "Session expired");
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Request failed" }));
    throw new ApiError(res.status, (err.message ||err.detail) ?? "Request failed");
  }

  // 204 No Content
  if (res.status === 204) return undefined as T;

  return res.json() as Promise<T>;
}

export const apiClient = {
  get: <T>(path: string, token?: string | null, options?: RequestOptions) =>
    request<T>("GET", path, undefined, { token, ...options }),

  post: <T>(path: string, body?: unknown, token?: string | null, options?: RequestOptions) =>
    request<T>("POST", path, body, { token, ...options }),

  put: <T>(path: string, body?: unknown, token?: string | null, options?: RequestOptions) =>
    request<T>("PUT", path, body, { token, ...options }),

  delete: <T>(path: string, token?: string | null, options?: RequestOptions) =>
    request<T>("DELETE", path, undefined, { token, ...options }),
};

// ─── ApiError ────────────────────────────────────────────────

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string
  ) {
    super(message);
    this.name = "ApiError";
  }
}
