import { NextRequest, NextResponse } from "next/server";
import { AUTH_REFRESH_COOKIE_NAME } from "@/src/features/auth/constants";
import { AUTH_API_URL, clearAuthCookies } from "../_utils";

export async function POST(request: NextRequest) {
  const refreshToken = request.cookies
    .get(AUTH_REFRESH_COOKIE_NAME)
    ?.value.trim();

  if (refreshToken) {
    try {
      await fetch(`${AUTH_API_URL}/auth/logout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
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
