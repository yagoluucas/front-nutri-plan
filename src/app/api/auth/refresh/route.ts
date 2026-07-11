import { NextRequest, NextResponse } from "next/server";
import { AUTH_REFRESH_COOKIE_NAME } from "@/src/features/auth/constants";
import {
  AUTH_API_URL,
  applySessionCookies,
  authErrorResponse,
  clearAuthCookies,
  getSessionTokens,
  readResponseBody,
  sanitizeAuthPayload,
} from "../_utils";

function missingRefreshTokenResponse() {
  return clearAuthCookies(
    NextResponse.json(
      {
        message: "Sessao expirada. Entre novamente.",
        error: true,
        statusCode: 401,
      },
      { status: 401 },
    ),
  );
}

export async function POST(request: NextRequest) {
  const refreshToken = request.cookies
    .get(AUTH_REFRESH_COOKIE_NAME)
    ?.value.trim();

  if (!refreshToken) {
    return missingRefreshTokenResponse();
  }

  try {
    const upstreamResponse = await fetch(`${AUTH_API_URL}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
      cache: "no-store",
    });
    const payload = await readResponseBody(upstreamResponse);

    if (!upstreamResponse.ok) {
      const response = authErrorResponse(
        payload,
        upstreamResponse.status,
        "Nao foi possivel renovar a sessao.",
      );

      if ([401, 403].includes(upstreamResponse.status)) {
        clearAuthCookies(response);
      }

      return response;
    }

    const tokens = getSessionTokens(upstreamResponse.headers);

    if (!tokens) {
      return NextResponse.json(
        {
          message: "Resposta invalida do servidor de autenticacao.",
          error: true,
          statusCode: 502,
        },
        { status: 502 },
      );
    }

    const response = NextResponse.json(sanitizeAuthPayload(payload), {
      status: 200,
    });

    return applySessionCookies(response, tokens);
  } catch (error) {
    console.error("Erro ao renovar sessao:", error);

    return NextResponse.json(
      {
        message: "Nao foi possivel conectar ao servidor de autenticacao.",
        error: true,
        statusCode: 502,
      },
      { status: 502 },
    );
  }
}
