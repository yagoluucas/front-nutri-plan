import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { AUTH_TOKEN_COOKIE_NAME } from "@/src/features/auth/constants";
import {
  AUTH_API_URL,
  readResponseBody,
  sanitizeAuthPayload,
} from "@/src/app/api/auth/_utils";

const foodAutocompleteSearchParamsSchema = z.object({
  foodName: z.string().trim().min(2).max(100),
  page: z.coerce.number().int().min(1).default(1),
}).strict();

function unauthorizedResponse() {
  return NextResponse.json(
    {
      message: "Não autorizado",
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

  const parsedSearchParams = foodAutocompleteSearchParamsSchema.safeParse(
    Object.fromEntries(request.nextUrl.searchParams.entries()),
  );

  if (!parsedSearchParams.success) {
    return NextResponse.json(
      {
        message: "Parametro foodName invalido.",
        error: true,
        statusCode: 400,
      },
      { status: 400 },
    );
  }

  const upstreamUrl = new URL("/alimentos/autocomplete", AUTH_API_URL);
  upstreamUrl.searchParams.set("foodName", parsedSearchParams.data.foodName);
  upstreamUrl.searchParams.set("page", String(parsedSearchParams.data.page));

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
    console.error("Erro ao buscar autocomplete de alimentos:", error);

    return NextResponse.json(
      {
        message: "Nao foi possivel buscar alimentos.",
        error: true,
        statusCode: 502,
      },
      { status: 502 },
    );
  }
}
