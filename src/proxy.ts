import { NextRequest, NextResponse } from "next/server";
import {
  AUTH_REFRESH_COOKIE_NAME,
  AUTH_TOKEN_COOKIE_NAME,
  DEFAULT_AUTH_REDIRECT,
  LOGIN_ROUTE,
} from "@/src/features/auth/constants";
import {
  AUTH_API_URL,
  applySessionCookies,
  clearAuthCookies,
  getSessionTokens,
} from "@/src/app/api/auth/_utils";

const PROTECTED_ROUTES = ["/dashboard", "/meu-perfil", "/pacientes", "/plano"];

function getLoginRedirect(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const loginUrl = new URL(LOGIN_ROUTE, request.url);
  loginUrl.searchParams.set("redirectTo", `${pathname}${search}`);
  return loginUrl;
}

async function refreshFromProxy(
  request: NextRequest,
  refreshToken: string,
): Promise<NextResponse> {
  try {
    const upstreamResponse = await fetch(`${AUTH_API_URL}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
      cache: "no-store",
    });

    if (upstreamResponse.ok) {
      const tokens = getSessionTokens(upstreamResponse.headers);

      if (tokens) {
        return applySessionCookies(NextResponse.next(), tokens);
      }
    }

    if ([401, 403].includes(upstreamResponse.status)) {
      return clearAuthCookies(
        NextResponse.redirect(getLoginRedirect(request)),
      );
    }

    return NextResponse.next();
  } catch {
    return NextResponse.next();
  }
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const accessToken = request.cookies.get(AUTH_TOKEN_COOKIE_NAME)?.value;
  const refreshToken = request.cookies.get(AUTH_REFRESH_COOKIE_NAME)?.value;
  const isProtectedRoute = PROTECTED_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );

  if (isProtectedRoute && !accessToken && !refreshToken) {
    return NextResponse.redirect(getLoginRedirect(request));
  }

  if (isProtectedRoute && !accessToken && refreshToken) {
    return refreshFromProxy(request, refreshToken);
  }

  if (pathname === LOGIN_ROUTE && accessToken) {
    return NextResponse.redirect(new URL(DEFAULT_AUTH_REDIRECT, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/meu-perfil/:path*",
    "/pacientes/:path*",
    "/plano/:path*",
    "/login",
  ],
};
