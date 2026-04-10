import { type NextRequest, NextResponse } from "next/server";

/**
 * Protected path prefixes.
 * Any route starting with these requires a valid refresh token cookie.
 */
const PROTECTED_PREFIXES = ["/student", "/teacher", "/admin", "/hammet"];

/**
 * Auth routes — logged-in users should not see these.
 */
const AUTH_PREFIXES = ["/claim", "/login", "/check-email"];

/** The name of the httpOnly refresh token cookie set by FastAPI. */
const REFRESH_COOKIE = "refresh_token";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasRefreshToken = request.cookies.has(REFRESH_COOKIE);

  const isProtected = PROTECTED_PREFIXES.some((p) => pathname.startsWith(p));
  const isAuthRoute = AUTH_PREFIXES.some((p) => pathname.startsWith(p));

  // ── Has cookie + hitting auth page → redirect to dashboard ──
  // The dashboard page will do the role-based redirect from there.
  /**
  if (isAuthRoute && hasRefreshToken) {
    const dashboardUrl = request.nextUrl.clone();
    dashboardUrl.pathname = "/dashboard";
    dashboardUrl.search = "";
    return NextResponse.redirect(dashboardUrl);
  }
    */

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all routes except:
     * - _next/static (static files)
     * - _next/image (image optimisation)
     * - favicon.ico
     * - public files (images, fonts etc.)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff2?)$).*)",
  ],
};
