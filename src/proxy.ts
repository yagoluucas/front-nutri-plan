import { NextRequest, NextResponse } from "next/server";
import {
  AUTH_TOKEN_COOKIE_NAME,
  DEFAULT_AUTH_REDIRECT,
  LOGIN_ROUTE,
} from "@/src/features/auth/constants";

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const token = request.cookies.get(AUTH_TOKEN_COOKIE_NAME)?.value;

  if (pathname.startsWith(DEFAULT_AUTH_REDIRECT) && !token) {
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
  matcher: ["/plano/:path*", "/login"],
};
