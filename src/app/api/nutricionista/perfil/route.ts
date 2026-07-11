import { NextRequest, NextResponse } from "next/server";
import {
  AUTH_API_URL,
  applyAuthenticationState,
  clearAuthCookies,
  fetchAuthenticatedUpstream,
  readResponseBody,
  sanitizeAuthPayload,
} from "@/src/app/api/auth/_utils";
import { profileUpdateApiSchema } from "@/src/features/profile/schemas/profile.schemas";

function invalidProfileResponse(message = "Dados do perfil invalidos.") {
  return NextResponse.json(
    { message, error: true, statusCode: 400 },
    { status: 400 },
  );
}

async function toNextResponse(
  result: Awaited<ReturnType<typeof fetchAuthenticatedUpstream>>,
) {
  const payload = await readResponseBody(result.upstreamResponse);
  const response = NextResponse.json(sanitizeAuthPayload(payload), {
    status: result.upstreamResponse.status,
  });

  return applyAuthenticationState(response, result);
}

export async function GET(request: NextRequest) {
  try {
    const result = await fetchAuthenticatedUpstream(
      request,
      new URL("/nutricionista/perfil", AUTH_API_URL),
      { method: "GET" },
    );

    return toNextResponse(result);
  } catch (error) {
    console.error("Erro ao buscar perfil do nutricionista:", error);

    return NextResponse.json(
      {
        message: "Nao foi possivel buscar o perfil.",
        error: true,
        statusCode: 502,
      },
      { status: 502 },
    );
  }
}

export async function PATCH(request: NextRequest) {
  let requestBody: unknown;

  try {
    requestBody = await request.json();
  } catch {
    return invalidProfileResponse();
  }

  const parsedBody = profileUpdateApiSchema.safeParse(requestBody);

  if (!parsedBody.success) {
    return invalidProfileResponse(
      parsedBody.error.issues[0]?.message || "Dados do perfil invalidos.",
    );
  }

  try {
    const result = await fetchAuthenticatedUpstream(
      request,
      new URL("/nutricionista", AUTH_API_URL),
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsedBody.data),
      },
    );

    return toNextResponse(result);
  } catch (error) {
    console.error("Erro ao atualizar perfil do nutricionista:", error);

    return NextResponse.json(
      {
        message: "Nao foi possivel atualizar o perfil.",
        error: true,
        statusCode: 502,
      },
      { status: 502 },
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const result = await fetchAuthenticatedUpstream(
      request,
      new URL("/nutricionista", AUTH_API_URL),
      { method: "DELETE" },
    );
    const payload = await readResponseBody(result.upstreamResponse);
    const response = NextResponse.json(sanitizeAuthPayload(payload), {
      status: result.upstreamResponse.status,
    });

    applyAuthenticationState(response, result);

    if (result.upstreamResponse.ok) {
      clearAuthCookies(response);
    }

    return response;
  } catch (error) {
    console.error("Erro ao excluir perfil do nutricionista:", error);

    return NextResponse.json(
      {
        message: "Nao foi possivel excluir o perfil.",
        error: true,
        statusCode: 502,
      },
      { status: 502 },
    );
  }
}
