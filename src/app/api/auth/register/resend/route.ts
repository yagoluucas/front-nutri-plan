import { NextResponse } from "next/server";
import {
  pendingRegistrationResponseSchema,
  resendRegistrationSchema,
} from "@/src/features/auth/schemas/auth.schemas";
import {
  AUTH_API_URL,
  authErrorResponse,
  copySafeRateLimitHeaders,
  readResponseBody,
} from "../../_utils";

export async function POST(request: Request) {
  let requestBody: unknown;

  try {
    requestBody = await request.json();
  } catch {
    return NextResponse.json(
      { message: "E-mail invalido." },
      { status: 400 },
    );
  }

  const parsedResend = resendRegistrationSchema.safeParse(requestBody);

  if (!parsedResend.success) {
    return NextResponse.json(
      {
        message:
          parsedResend.error.issues[0]?.message ||
          "E-mail invalido.",
      },
      { status: 400 },
    );
  }

  try {
    const upstreamResponse = await fetch(`${AUTH_API_URL}/auth/register/resend`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(parsedResend.data),
      cache: "no-store",
    });
    const payload = await readResponseBody(upstreamResponse);

    if (!upstreamResponse.ok) {
      return copySafeRateLimitHeaders(authErrorResponse(
        payload,
        upstreamResponse.status,
        "Nao foi possivel reenviar o link.",
      ), upstreamResponse.headers);
    }

    const parsedResponse = pendingRegistrationResponseSchema.safeParse(payload);

    if (!parsedResponse.success || upstreamResponse.status !== 202) {
      return NextResponse.json(
        { message: "Resposta invalida do servidor de autenticacao." },
        { status: 502 },
      );
    }

    return copySafeRateLimitHeaders(
      NextResponse.json(parsedResponse.data, { status: 202 }),
      upstreamResponse.headers,
    );
  } catch (error) {
    console.error("Erro ao conectar com o servico de reenvio de confirmacao:", error);

    return NextResponse.json(
      { message: "Nao foi possivel reenviar o link." },
      { status: 502 },
    );
  }
}
