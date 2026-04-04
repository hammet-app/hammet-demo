import type {
  LoginRequest,
  LoginResponse,
  RegisterSchoolRequest,
  RegisterSchoolResponse,
  ClaimAccountRequest,
  ClaimAccountResponse,
  ResendVerificationRequest,
  ResendVerificationResponse,
  LogoutResponse,
} from "@/types/api";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1";

async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json", ...options.headers },
    credentials: "include", // for httpOnly refresh cookie
    ...options,
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: "Request failed" }));
    throw new Error(error.detail ?? "Request failed");
  }

  return res.json() as Promise<T>;
}

// In-memory token store — never localStorage
let _accessToken: string | null = null;

export function setAccessToken(token: string) {
  _accessToken = token;
}

export function getAccessToken(): string | null {
  return _accessToken;
}

export function clearAccessToken() {
  _accessToken = null;
}

export function authHeaders(): Record<string, string> {
  return _accessToken ? { Authorization: `Bearer ${_accessToken}` } : {};
}

// ─── Auth routes ──────────────────────────────────────────────

export async function login(body: LoginRequest): Promise<LoginResponse> {
  const data = await apiFetch<LoginResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify(body),
  });
  setAccessToken(data.access_token);
  return data;
}

export async function logout(): Promise<LogoutResponse> {
  const data = await apiFetch<LogoutResponse>("/auth/logout", {
    method: "POST",
    headers: authHeaders(),
  });
  clearAccessToken();
  return data;
}

export async function refreshToken(): Promise<string> {
  const data = await apiFetch<{ access_token: string }>("/auth/refresh", {
    method: "POST",
  });
  setAccessToken(data.access_token);
  return data.access_token;
}

export async function claimAccount(
  body: ClaimAccountRequest
): Promise<ClaimAccountResponse> {
  const data = await apiFetch<ClaimAccountResponse>("/auth/claim", {
    method: "POST",
    body: JSON.stringify(body),
  });
  setAccessToken(data.access_token);
  return data;
}

export async function resendVerification(
  body: ResendVerificationRequest
): Promise<ResendVerificationResponse> {
  return apiFetch<ResendVerificationResponse>("/auth/resend-verification", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function registerSchool(
  body: RegisterSchoolRequest
): Promise<RegisterSchoolResponse> {
  return apiFetch<RegisterSchoolResponse>("/auth/register/school", {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(body),
  });
}

// ─── Role-based redirect ───────────────────────────────────────

export function getDashboardPath(roles: string[]): string {
  if (roles.includes("hammet_admin")) return "/hammet/dashboard";
  if (roles.includes("school_admin")) return "/admin/dashboard";
  if (roles.includes("teacher")) return "/teacher/dashboard";
  return "/student/dashboard";
}
