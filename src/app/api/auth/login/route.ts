import { NextResponse } from "next/server";
import { loginSchema } from "@/src/features/auth/schemas/auth.schemas";
import {
  AUTH_API_URL,
  authErrorResponse,
  authSuccessResponse,
  getBearerToken,
  readResponseBody,
} from "../_utils";

export async function POST(request: Request) {
  let requestBody: unknown;

  try {
    requestBody = await request.json();
  } catch {
    return NextResponse.json(
      { message: "Dados de login inválidos." },
      { status: 400 },
    );
  }

  const parsedCredentials = loginSchema.safeParse(requestBody);

  if (!parsedCredentials.success) {
    return NextResponse.json(
      { message: parsedCredentials.error.issues[0]?.message || "Dados de login inválidos." },
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

    return authSuccessResponse(
      payload,
      getBearerToken(upstreamResponse.headers.get("authorization")),
    );
  } catch (error) {
    console.error("Erro ao conectar com o serviço de login:", error);

    return NextResponse.json(
      { message: "Não foi possível conectar ao servidor de autenticação." },
      { status: 502 },
    );
  }
}
