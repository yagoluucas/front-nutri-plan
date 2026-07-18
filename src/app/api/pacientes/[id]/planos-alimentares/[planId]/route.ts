import { NextRequest, NextResponse } from "next/server";
import {
  AUTH_API_URL,
  applyAuthenticationState,
  fetchAuthenticatedUpstream,
  readResponseBody,
  sanitizeAuthPayload,
} from "@/src/app/api/auth/_utils";
import { dietPlanRequestSchema } from "@/src/features/diet-plan/schemas/dietPlan.schemas";
import { z } from "zod";

interface DietPlanRouteContext {
  params: Promise<{
    id: string;
    planId: string;
  }>;
}

const dietPlanRouteParamsSchema = z.object({
  id: z.string().trim().min(1).max(100),
  planId: z.string().trim().min(1).max(100),
}).strict();

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

function getPlanUrl(patientId: string, planId: string) {
  return new URL(
    `/pacientes/${encodeURIComponent(patientId)}/planos-alimentares/${encodeURIComponent(planId)}`,
    AUTH_API_URL,
  );
}

async function toNextResponse(
  result: Awaited<ReturnType<typeof fetchAuthenticatedUpstream>>,
) {
  const payload = await readResponseBody(result.upstreamResponse);
  const response = result.upstreamResponse.status === 204
    ? new NextResponse(null, { status: 204 })
    : NextResponse.json(sanitizeAuthPayload(payload), {
        status: result.upstreamResponse.status,
      });

  return applyAuthenticationState(response, result);
}

export async function PATCH(request: NextRequest, context: DietPlanRouteContext) {
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

  const { id, planId } = await context.params;

  try {
    const result = await fetchAuthenticatedUpstream(
      request,
      getPlanUrl(id, planId),
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planoAlimentar: parsedBody.data }),
      },
    );

    return toNextResponse(result);
  } catch (error) {
    console.error("Erro ao atualizar plano alimentar:", error);

    return NextResponse.json(
      {
        message: "Nao foi possivel atualizar o plano alimentar.",
        error: true,
        statusCode: 502,
      },
      { status: 502 },
    );
  }
}

export async function DELETE(request: NextRequest, context: DietPlanRouteContext) {
  const parsedParams = dietPlanRouteParamsSchema.safeParse(await context.params);

  if (!parsedParams.success) {
    return invalidPlanResponse();
  }

  const { id, planId } = parsedParams.data;

  try {
    const result = await fetchAuthenticatedUpstream(
      request,
      getPlanUrl(id, planId),
      { method: "DELETE" },
    );

    return toNextResponse(result);
  } catch (error) {
    console.error("Erro ao excluir plano alimentar:", error);

    return NextResponse.json(
      {
        message: "Nao foi possivel excluir o plano alimentar.",
        error: true,
        statusCode: 502,
      },
      { status: 502 },
    );
  }
}
