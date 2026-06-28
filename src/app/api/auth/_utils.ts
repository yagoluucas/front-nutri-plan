import { NextResponse } from "next/server";
import { AUTH_TOKEN_COOKIE_NAME } from "@/src/features/auth/constants";

export const AUTH_API_URL =
  process.env.API_URL ||
  "https://api-nutri-plan.onrender.com";

const TOKEN_KEYS = new Set(["token", "accesstoken", "access_token", "jwt"]);

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
  return scheme?.toLowerCase() === "bearer" && token?.trim() ? token.trim() : null;
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

export function authSuccessResponse(payload: unknown, headerToken?: string | null) {
  const token = headerToken?.trim() || null;
  const body = isRecord(payload)
    ? sanitizeAuthPayload(payload)
    : { data: sanitizeAuthPayload(payload) };
  const response = NextResponse.json(body);

  if (token) {
    response.cookies.set(AUTH_TOKEN_COOKIE_NAME, token, {
      httpOnly: true,
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });
  }

  return response;
}
