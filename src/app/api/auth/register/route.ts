import { NextResponse } from "next/server";
import { registerSchema } from "@/src/features/auth/schemas/auth.schemas";
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
      { message: "Dados de cadastro invalidos." },
      { status: 400 },
    );
  }

  const parsedRegistration = registerSchema.safeParse(requestBody);

  if (!parsedRegistration.success) {
    return NextResponse.json(
      {
        message:
          parsedRegistration.error.issues[0]?.message ||
          "Dados de cadastro invalidos.",
      },
      { status: 400 },
    );
  }

  const registration = parsedRegistration.data;
  const nutricionista = {
    nome: registration.nome,
    sobrenome: registration.sobrenome,
    email: registration.email,
    dataNascimento: registration.dataNascimento.toISOString(),
    crn: registration.crn,
    senha: registration.senha,
  };

  try {
    const upstreamResponse = await fetch(`${AUTH_API_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nutricionista }),
      cache: "no-store",
    });
    const payload = await readResponseBody(upstreamResponse);

    if (!upstreamResponse.ok) {
      return authErrorResponse(
        payload,
        upstreamResponse.status,
        "Erro ao cadastrar.",
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
    console.error("Erro ao conectar com o servico de cadastro:", error);

    return NextResponse.json(
      { message: "Nao foi possivel conectar ao servidor de autenticacao." },
      { status: 502 },
    );
  }
}
