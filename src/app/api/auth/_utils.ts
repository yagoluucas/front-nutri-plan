import { NextResponse } from "next/server";
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
