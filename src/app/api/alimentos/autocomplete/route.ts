import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  AUTH_API_URL,
  applyAuthenticationState,
  fetchAuthenticatedUpstream,
  readResponseBody,
  sanitizeAuthPayload,
} from "@/src/app/api/auth/_utils";

const foodAutocompleteSearchParamsSchema = z
  .object({
    foodName: z.string().trim().min(2).max(100),
    page: z.coerce.number().int().min(1).default(1),
  })
  .strict();

export async function GET(request: NextRequest) {
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
    const result = await fetchAuthenticatedUpstream(request, upstreamUrl, {
      method: "GET",
    });
    const payload = await readResponseBody(result.upstreamResponse);
    const response = NextResponse.json(sanitizeAuthPayload(payload), {
      status: result.upstreamResponse.status,
    });

    return applyAuthenticationState(response, result);
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
