import { NextRequest, NextResponse } from "next/server";
import {
  AUTH_REFRESH_COOKIE_NAME,
  AUTH_TOKEN_COOKIE_NAME,
} from "@/src/features/auth/constants";

export const AUTH_API_URL =
  process.env.API_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  (process.env.NODE_ENV === "production"
    ? "https://api-nutri-plan.onrender.com"
    : "http://localhost:5000");

const DEFAULT_ACCESS_TOKEN_MAX_AGE = 15 * 60;
const DEFAULT_REFRESH_TOKEN_MAX_AGE = 7 * 24 * 60 * 60;
const TOKEN_KEYS = new Set([
  "token",
  "accesstoken",
  "access_token",
  "refreshtoken",
  "refresh_token",
  "jwt",
]);

export interface SessionTokens {
  accessToken: string;
  refreshToken: string;
  accessTokenMaxAge: number;
  refreshTokenMaxAge: number;
}

export interface AuthenticatedUpstreamResult {
  upstreamResponse: Response;
  refreshedTokens?: SessionTokens;
  clearSession?: boolean;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export async function readResponseBody(response: Response): Promise<unknown> {
  const text = await response.text();

  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text);
  } catch {
    return { message: text };
  }
}

function isTokenKey(key: string) {
  return TOKEN_KEYS.has(key.toLowerCase());
}

export function sanitizeAuthPayload(payload: unknown): unknown {
  if (Array.isArray(payload)) {
    return payload.map(sanitizeAuthPayload);
  }

  if (!isRecord(payload)) {
    return payload;
  }

  return Object.fromEntries(
    Object.entries(payload)
      .filter(([key]) => !isTokenKey(key))
      .map(([key, value]) => [key, sanitizeAuthPayload(value)]),
  );
}

export function getBearerToken(authorizationHeader: string | null): string | null {
  if (!authorizationHeader) {
    return null;
  }

  const [scheme, token] = authorizationHeader.trim().split(/\s+/);
  return scheme?.toLowerCase() === "bearer" && token?.trim()
    ? token.trim()
    : null;
}

function parseMaxAge(value: string | null, fallback: number) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

export function getSessionTokens(headers: Headers): SessionTokens | null {
  const accessToken = getBearerToken(headers.get("authorization"));
  const refreshToken = headers.get("x-refresh-token")?.trim();

  if (!accessToken || !refreshToken) {
    return null;
  }

  return {
    accessToken,
    refreshToken,
    accessTokenMaxAge: parseMaxAge(
      headers.get("x-access-token-expires-in"),
      DEFAULT_ACCESS_TOKEN_MAX_AGE,
    ),
    refreshTokenMaxAge: parseMaxAge(
      headers.get("x-refresh-token-expires-in"),
      DEFAULT_REFRESH_TOKEN_MAX_AGE,
    ),
  };
}

function cookieOptions(maxAge: number) {
  return {
    httpOnly: true,
    maxAge,
    path: "/",
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
  };
}

export function applySessionCookies(
  response: NextResponse,
  tokens: SessionTokens,
) {
  response.cookies.set(
    AUTH_TOKEN_COOKIE_NAME,
    tokens.accessToken,
    cookieOptions(tokens.accessTokenMaxAge),
  );
  response.cookies.set(
    AUTH_REFRESH_COOKIE_NAME,
    tokens.refreshToken,
    cookieOptions(tokens.refreshTokenMaxAge),
  );

  return response;
}

export function clearAuthCookies(response: NextResponse) {
  response.cookies.set(AUTH_TOKEN_COOKIE_NAME, "", cookieOptions(0));
  response.cookies.set(AUTH_REFRESH_COOKIE_NAME, "", cookieOptions(0));
  return response;
}

function withBearerToken(init: RequestInit | undefined, token: string): RequestInit {
  const headers = new Headers(init?.headers);
  headers.set("Authorization", `Bearer ${token}`);

  return {
    ...init,
    headers,
    cache: "no-store",
  };
}

async function requestNewSessionTokens(refreshToken: string) {
  const refreshResponse = await fetch(`${AUTH_API_URL}/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken }),
    cache: "no-store",
  });

  if (!refreshResponse.ok) {
    return {
      tokens: null,
      invalid: [401, 403].includes(refreshResponse.status),
    };
  }

  return {
    tokens: getSessionTokens(refreshResponse.headers),
    invalid: false,
  };
}

export async function fetchAuthenticatedUpstream(
  request: NextRequest,
  input: URL | string,
  init?: RequestInit,
): Promise<AuthenticatedUpstreamResult> {
  const accessToken = request.cookies
    .get(AUTH_TOKEN_COOKIE_NAME)
    ?.value.trim();
  const refreshToken = request.cookies
    .get(AUTH_REFRESH_COOKIE_NAME)
    ?.value.trim();

  if (accessToken) {
    const firstResponse = await fetch(input, withBearerToken(init, accessToken));

    if (firstResponse.status !== 401) {
      return { upstreamResponse: firstResponse };
    }
  }

  if (!refreshToken) {
    return {
      upstreamResponse: new Response(
        JSON.stringify({
          message: "Sessao expirada. Entre novamente.",
          error: true,
          statusCode: 401,
        }),
        { status: 401, headers: { "Content-Type": "application/json" } },
      ),
      clearSession: true,
    };
  }

  const refreshed = await requestNewSessionTokens(refreshToken);

  if (!refreshed.tokens) {
    return {
      upstreamResponse: new Response(
        JSON.stringify({
          message: refreshed.invalid
            ? "Sessao expirada. Entre novamente."
            : "Nao foi possivel renovar a sessao.",
          error: true,
          statusCode: refreshed.invalid ? 401 : 503,
        }),
        {
          status: refreshed.invalid ? 401 : 503,
          headers: { "Content-Type": "application/json" },
        },
      ),
      clearSession: refreshed.invalid,
    };
  }

  const retryResponse = await fetch(
    input,
    withBearerToken(init, refreshed.tokens.accessToken),
  );

  return {
    upstreamResponse: retryResponse,
    refreshedTokens: refreshed.tokens,
    clearSession: retryResponse.status === 401,
  };
}

export function applyAuthenticationState(
  response: NextResponse,
  result: AuthenticatedUpstreamResult,
) {
  if (result.refreshedTokens) {
    applySessionCookies(response, result.refreshedTokens);
  }

  if (result.clearSession) {
    clearAuthCookies(response);
  }

  return response;
}

export function getResponseMessage(payload: unknown, fallback: string): string {
  if (!isRecord(payload)) {
    return fallback;
  }

  const message = payload.message || payload.error;
  return typeof message === "string" && message.trim() ? message : fallback;
}

export function authErrorResponse(
  payload: unknown,
  status: number,
  fallbackMessage: string,
) {
  const safePayload = sanitizeAuthPayload(payload);

  if (isRecord(safePayload)) {
    return NextResponse.json(safePayload, { status });
  }

  return NextResponse.json(
    { message: getResponseMessage(payload, fallbackMessage) },
    { status },
  );
}

export function authSuccessResponse(
  payload: unknown,
  tokens: SessionTokens,
) {
  const body = isRecord(payload)
    ? sanitizeAuthPayload(payload)
    : { data: sanitizeAuthPayload(payload) };
  const response = NextResponse.json(body);

  return applySessionCookies(response, tokens);
}
