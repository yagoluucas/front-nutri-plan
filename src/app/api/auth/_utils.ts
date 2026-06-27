import { NextResponse } from "next/server";
import { AUTH_TOKEN_COOKIE_NAME } from "@/src/features/auth/constants";

export const AUTH_API_URL =
  process.env.API_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "https://api-nutri-plan.onrender.com";

const TOKEN_KEYS = ["token", "accessToken", "access_token", "jwt"];
const TOKEN_PARENT_KEYS = ["data", "result", "session", "auth", "user"];

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

export function getAuthToken(payload: unknown): string | null {
  if (!isRecord(payload)) {
    return null;
  }

  for (const key of TOKEN_KEYS) {
    const value = payload[key];

    if (typeof value === "string" && value.trim()) {
      return value;
    }
  }

  for (const key of TOKEN_PARENT_KEYS) {
    const token = getAuthToken(payload[key]);

    if (token) {
      return token;
    }
  }

  return null;
}

export function getBearerToken(authorizationHeader: string | null): string | null {
  if (!authorizationHeader) {
    return null;
  }

  const [scheme, token] = authorizationHeader.split(" ");
  return scheme?.toLowerCase() === "bearer" && token ? token : null;
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
  if (isRecord(payload)) {
    return NextResponse.json(payload, { status });
  }

  return NextResponse.json(
    { message: getResponseMessage(payload, fallbackMessage) },
    { status },
  );
}

export function authSuccessResponse(payload: unknown, headerToken?: string | null) {
  const token = getAuthToken(payload) || headerToken || null;
  const body = isRecord(payload)
    ? { ...payload, ...(token ? { token } : {}) }
    : { data: payload, ...(token ? { token } : {}) };
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
