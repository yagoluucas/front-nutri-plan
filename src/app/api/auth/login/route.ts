import { NextResponse } from "next/server";
import { loginSchema } from "@/src/features/auth/schemas/auth.schemas";
import {
  AUTH_API_URL,
  authErrorResponse,
  authSuccessResponse,
  getSessionTokens,
  readResponseBody,
} from "../_utils";

export async function POST(request: Request) {
  let requestBody: unknown;

  try {
    requestBody = await request.json();
  } catch {
    return NextResponse.json(
      { message: "Dados de login invalidos." },
      { status: 400 },
    );
  }

  const parsedCredentials = loginSchema.safeParse(requestBody);

  if (!parsedCredentials.success) {
    return NextResponse.json(
      {
        message:
          parsedCredentials.error.issues[0]?.message ||
          "Dados de login invalidos.",
      },
      { status: 400 },
    );
  }

  try {
    const upstreamResponse = await fetch(`${AUTH_API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userLogin: parsedCredentials.data }),
      cache: "no-store",
    });
    const payload = await readResponseBody(upstreamResponse);

    if (!upstreamResponse.ok) {
      return authErrorResponse(
        payload,
        upstreamResponse.status,
        "Erro ao realizar login.",
      );
    }

    const tokens = getSessionTokens(upstreamResponse.headers);

    if (!tokens) {
      return NextResponse.json(
        { message: "Resposta invalida do servidor de autenticacao." },
        { status: 502 },
      );
    }

    return authSuccessResponse(payload, tokens);
  } catch (error) {
    console.error("Erro ao conectar com o servico de login:", error);

    return NextResponse.json(
      { message: "Nao foi possivel conectar ao servidor de autenticacao." },
      { status: 502 },
    );
  }
}
