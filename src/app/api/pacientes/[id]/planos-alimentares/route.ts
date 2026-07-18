import { NextRequest, NextResponse } from "next/server";
import {
  AUTH_API_URL,
  applyAuthenticationState,
  fetchAuthenticatedUpstream,
  readResponseBody,
  sanitizeAuthPayload,
} from "@/src/app/api/auth/_utils";
import { dietPlanRequestSchema } from "@/src/features/diet-plan/schemas/dietPlan.schemas";

interface DietPlansRouteContext {
  params: Promise<{
    id: string;
  }>;
}

function invalidPlanResponse() {
  return NextResponse.json(
    {
      message: "Dados do plano alimentar invalidos.",
      error: true,
      statusCode: 400,
    },
    { status: 400 },
  );
}

function getPlansUrl(patientId: string) {
  return new URL(
    `/pacientes/${encodeURIComponent(patientId)}/planos-alimentares`,
    AUTH_API_URL,
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

export async function GET(request: NextRequest, context: DietPlansRouteContext) {
  const { id } = await context.params;

  try {
    const result = await fetchAuthenticatedUpstream(
      request,
      getPlansUrl(id),
      { method: "GET" },
    );

    return toNextResponse(result);
  } catch (error) {
    console.error("Erro ao buscar planos alimentares:", error);

    return NextResponse.json(
      {
        message: "Nao foi possivel buscar os planos alimentares.",
        error: true,
        statusCode: 502,
      },
      { status: 502 },
    );
  }
}

export async function POST(request: NextRequest, context: DietPlansRouteContext) {
  let requestBody: unknown;

  try {
    requestBody = await request.json();
  } catch {
    return invalidPlanResponse();
  }

  const parsedBody = dietPlanRequestSchema.safeParse(requestBody);

  if (!parsedBody.success) {
    return invalidPlanResponse();
  }

  const { id } = await context.params;

  try {
    const result = await fetchAuthenticatedUpstream(
      request,
      getPlansUrl(id),
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planoAlimentar: parsedBody.data }),
      },
    );

    return toNextResponse(result);
  } catch (error) {
    console.error("Erro ao cadastrar plano alimentar:", error);

    return NextResponse.json(
      {
        message: "Nao foi possivel cadastrar o plano alimentar.",
        error: true,
        statusCode: 502,
      },
      { status: 502 },
    );
  }
}
