import { NextRequest, NextResponse } from "next/server";
import {
  AUTH_TOKEN_COOKIE_NAME,
  DEFAULT_AUTH_REDIRECT,
  LOGIN_ROUTE,
} from "@/src/features/auth/constants";

const PROTECTED_ROUTES = ["/dashboard", "/meu-perfil", "/pacientes", "/plano"];

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const token = request.cookies.get(AUTH_TOKEN_COOKIE_NAME)?.value;
  const isProtectedRoute = PROTECTED_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );

  if (isProtectedRoute && !token) {
    const loginUrl = new URL(LOGIN_ROUTE, request.url);
    loginUrl.searchParams.set("redirectTo", `${pathname}${search}`);

    return NextResponse.redirect(loginUrl);
  }

  if (pathname === LOGIN_ROUTE && token) {
    return NextResponse.redirect(new URL(DEFAULT_AUTH_REDIRECT, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/meu-perfil/:path*", "/pacientes/:path*", "/plano/:path*", "/login"],
};
