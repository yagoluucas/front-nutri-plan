import { NextRequest, NextResponse } from "next/server";
import { AUTH_API_URL, readResponseBody, sanitizeAuthPayload } from "@/src/app/api/auth/_utils";
import { AUTH_TOKEN_COOKIE_NAME } from "@/src/features/auth/constants";
import { profileUpdateApiSchema } from "@/src/features/profile/schemas/profile.schemas";

function unauthorizedResponse() {
  return NextResponse.json(
    {
      message: "Nao autorizado",
      error: true,
      statusCode: 401,
    },
    { status: 401 },
  );
}

function invalidProfileResponse(message = "Dados do perfil invalidos.") {
  return NextResponse.json(
    {
      message,
      error: true,
      statusCode: 400,
    },
    { status: 400 },
  );
}

function getToken(request: NextRequest) {
  return request.cookies.get(AUTH_TOKEN_COOKIE_NAME)?.value.trim();
}

export async function GET(request: NextRequest) {
  const token = getToken(request);

  if (!token) {
    return unauthorizedResponse();
  }

  try {
    const upstreamResponse = await fetch(new URL("/nutricionista/perfil", AUTH_API_URL), {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });
    const payload = await readResponseBody(upstreamResponse);

    return NextResponse.json(sanitizeAuthPayload(payload), {
      status: upstreamResponse.status,
    });
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
  const token = getToken(request);

  if (!token) {
    return unauthorizedResponse();
  }

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
    const upstreamResponse = await fetch(new URL("/nutricionista", AUTH_API_URL), {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(parsedBody.data),
      cache: "no-store",
    });
    const payload = await readResponseBody(upstreamResponse);

    return NextResponse.json(sanitizeAuthPayload(payload), {
      status: upstreamResponse.status,
    });
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
  const token = getToken(request);

  if (!token) {
    return unauthorizedResponse();
  }

  try {
    const upstreamResponse = await fetch(new URL("/nutricionista", AUTH_API_URL), {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });
    const payload = await readResponseBody(upstreamResponse);
    const response = NextResponse.json(sanitizeAuthPayload(payload), {
      status: upstreamResponse.status,
    });

    if (upstreamResponse.ok) {
      response.cookies.set(AUTH_TOKEN_COOKIE_NAME, "", {
        maxAge: 0,
        path: "/",
      });
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
