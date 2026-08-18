import { NextResponse } from "next/server";
import {
  confirmedRegistrationResponseSchema,
  confirmRegistrationSchema,
} from "@/src/features/auth/schemas/auth.schemas";
import {
  AUTH_API_URL,
  authErrorResponse,
  readResponseBody,
} from "../../_utils";

export async function POST(request: Request) {
  let requestBody: unknown;

  try {
    requestBody = await request.json();
  } catch {
    return NextResponse.json(
      { message: "Token de confirmacao invalido." },
      { status: 400 },
    );
  }

  const parsedConfirmation = confirmRegistrationSchema.safeParse(requestBody);

  if (!parsedConfirmation.success) {
    return NextResponse.json(
      {
        message:
          parsedConfirmation.error.issues[0]?.message ||
          "Token de confirmacao invalido.",
      },
      { status: 400 },
    );
  }

  try {
    const upstreamResponse = await fetch(`${AUTH_API_URL}/auth/register/confirm`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(parsedConfirmation.data),
      cache: "no-store",
    });
    const payload = await readResponseBody(upstreamResponse);

    if (!upstreamResponse.ok) {
      return authErrorResponse(
        payload,
        upstreamResponse.status,
        "Link de confirmacao invalido ou expirado.",
      );
    }

    const parsedResponse = confirmedRegistrationResponseSchema.safeParse(payload);

    if (!parsedResponse.success || upstreamResponse.status !== 201) {
      return NextResponse.json(
        { message: "Resposta invalida do servidor de autenticacao." },
        { status: 502 },
      );
    }

    return NextResponse.json(parsedResponse.data, { status: 201 });
  } catch (error) {
    console.error("Erro ao conectar com o servico de confirmacao de cadastro:", error);

    return NextResponse.json(
      { message: "Nao foi possivel confirmar o e-mail." },
      { status: 502 },
    );
  }
}
