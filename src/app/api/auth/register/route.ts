import { NextResponse } from "next/server";
import { registerSchema } from "@/src/features/auth/schemas/auth.schemas";
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
      { message: "Dados de cadastro inválidos." },
      { status: 400 },
    );
  }

  const parsedRegistration = registerSchema.safeParse(requestBody);

  if (!parsedRegistration.success) {
    return NextResponse.json(
      { message: parsedRegistration.error.issues[0]?.message || "Dados de cadastro inválidos." },
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

    return authSuccessResponse(
      payload,
      getBearerToken(upstreamResponse.headers.get("authorization")),
    );
  } catch (error) {
    console.error("Erro ao conectar com o serviço de cadastro:", error);

    return NextResponse.json(
      { message: "Não foi possível conectar ao servidor de autenticação." },
      { status: 502 },
    );
  }
}
