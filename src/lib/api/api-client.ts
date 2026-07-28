import { BulkError } from "./types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "";

type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

interface RequestOptions {
  token?: string | null;
  /** Pass a refreshToken fn so the client can retry once on 401 */
  onRefresh?: () => Promise<string | null>;
}
async function buildApiError(
    response: Response
): Promise<ApiError> {
  const error = await response
    .json()
    .catch(() => ({
      success: false,
      error: {
        code: "UNKNOWN",
        message: "Request failed",
      },
    }));

  return new ApiError(
    response.status,
    error,
    error.error?.message ?? "Request failed",
  );
}

async function requestForm<T>(
  method: HttpMethod,
  path: string,
  formData: FormData,
  options: RequestOptions = {}
): Promise<T> {
  const { token, onRefresh } = options;

  const headers: Record<string, string> = {};

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const makeRequest = (authToken?: string | null) =>
    fetch(`${API_BASE}${path}`, {
      method,
      credentials: "include",
      headers: authToken
        ? { Authorization: `Bearer ${authToken}` }
        : headers,
      body: formData, // 🚨 NO JSON.stringify, NO content-type
    });

  let res = await makeRequest(token);

  // ── retry on 401 ──
  if (res.status === 401 && onRefresh) {
    const newToken = await onRefresh();
    if (newToken) {
      res = await makeRequest(newToken);
    } else {
      throw new ApiError(401, null, "Session expired");
    }
  }

  if (!res.ok) {
    throw await buildApiError(res)
  }

  if (res.status === 204) return undefined as T;

  return res.json() as Promise<T>;
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
        throw await buildApiError(retryRes)
      }

      return retryRes.json() as Promise<T>;
    }

    // Refresh failed — throw so the dashboard guard can redirect to login
    throw new ApiError(401, null, "Session expired");
  }

  if (!res.ok) {
    throw await buildApiError(res);
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

  delete: <T>(path: string, body?: unknown, token?: string | null, options?: RequestOptions) =>
    request<T>("DELETE", path, body, { token, ...options }),

  postForm: <T>(path: string, form: FormData, token?: string | null, options?: RequestOptions) => 
    requestForm<T>("POST", path, form, { token, ...options }),

  putForm: <T>(path: string, form: FormData, token?: string | null, options?: RequestOptions) => 
    requestForm<T>("PUT", path, form, { token, ...options }),

  patch: <T>(path: string, body?: unknown, token?: string | null, options?: RequestOptions) =>
    request<T>("PATCH", path, body, { token, ...options }),
  };

// ─── ApiError ────────────────────────────────────────────────
interface ApiErrorResponse {
  success: false;

  error: {
    code: string;
    message: string;
    details?: ApiErrorDetails;
  };
}

export type ApiErrorDetails =
    | BulkError[]
    | Record<string, unknown>
    | Record<string, unknown>[]
    | string
    | null;


export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly data: ApiErrorResponse | null,
    message: string,
    
  ) {
    super(message);
    this.name = "ApiError";
  }

  get details(): ApiErrorDetails {
    return this.data?.error?.details ?? null;
  }

  get code() {
    return this.data?.error?.code;
  }
  get unauthorized() {
    return this.status === 401;
  }

  get notFound() {
    return this.status === 404;
  }

  is(status: number) {
      return this.status === status;
  }

  get forbidden() {
      return this.status === 403;
  }

  get validation() {
      return this.status === 422;
  }

  get conflict() {
      return this.status === 409;
  }

  get internal() {
      return this.status >= 500;
  }

  get success() {
    return (
        this.data as ApiErrorResponse
    )?.success ?? false;
  } 
}

