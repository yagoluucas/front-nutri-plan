import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  AUTH_API_URL,
  applyAuthenticationState,
  fetchAuthenticatedUpstream,
  readResponseBody,
  sanitizeAuthPayload,
} from "@/src/app/api/auth/_utils";

const foodDetailSearchParamsSchema = z
  .object({
    foodCode: z.string().trim().min(1).max(100),
  })
  .strict();

export async function GET(request: NextRequest) {
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
    const result = await fetchAuthenticatedUpstream(request, upstreamUrl, {
      method: "GET",
    });
    const payload = await readResponseBody(result.upstreamResponse);
    const response = NextResponse.json(sanitizeAuthPayload(payload), {
      status: result.upstreamResponse.status,
    });

    return applyAuthenticationState(response, result);
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
