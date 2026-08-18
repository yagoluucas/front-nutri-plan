import { NextRequest, NextResponse } from "next/server";
import { AUTH_TOKEN_COOKIE_NAME } from "@/src/features/auth/constants";
import { AUTH_API_URL, clearAuthCookies } from "../_utils";

export async function POST(request: NextRequest) {
  const accessToken = request.cookies
    .get(AUTH_TOKEN_COOKIE_NAME)
    ?.value.trim();

  if (accessToken) {
    try {
      await fetch(`${AUTH_API_URL}/auth/logout`, {
        method: "POST",
        headers: { Authorization: `Bearer ${accessToken}` },
        cache: "no-store",
      });
    } catch (error) {
      console.error("Erro ao revogar sessao no servidor:", error);
    }
  }

  return clearAuthCookies(
    NextResponse.json({
      message: "Logout realizado com sucesso.",
    }),
  );
}
