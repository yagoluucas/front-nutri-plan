import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { AUTH_TOKEN_COOKIE_NAME } from "@/src/features/auth/constants";
import {
  AUTH_API_URL,
  readResponseBody,
  sanitizeAuthPayload,
} from "@/src/app/api/auth/_utils";

const foodDetailSearchParamsSchema = z.object({
  foodCode: z.string().trim().min(1).max(100),
}).strict();

function unauthorizedResponse() {
  return NextResponse.json(
    {
      message: "N\u00e3o autorizado",
      error: true,
      statusCode: 401,
    },
    { status: 401 },
  );
}

export async function GET(request: NextRequest) {
  const token = request.cookies.get(AUTH_TOKEN_COOKIE_NAME)?.value.trim();

  if (!token) {
    return unauthorizedResponse();
  }

  const parsedSearchParams = foodDetailSearchParamsSchema.safeParse(
    Object.fromEntries(request.nextUrl.searchParams.entries()),
  );

  if (!parsedSearchParams.success) {
    return NextResponse.json(
      {
        message: "Parametro foodCode invalido.",
        error: true,
        statusCode: 400,
      },
      { status: 400 },
    );
  }

  const upstreamUrl = new URL("/alimentos", AUTH_API_URL);
  upstreamUrl.searchParams.set("foodCode", parsedSearchParams.data.foodCode);

  try {
    const upstreamResponse = await fetch(upstreamUrl, {
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
    console.error("Erro ao buscar alimento:", error);

    return NextResponse.json(
      {
        message: "Nao foi possivel buscar o alimento.",
        error: true,
        statusCode: 502,
      },
      { status: 502 },
    );
  }
}
