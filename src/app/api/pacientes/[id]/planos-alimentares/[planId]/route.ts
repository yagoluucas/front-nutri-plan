import { NextRequest, NextResponse } from "next/server";
import { AUTH_API_URL, readResponseBody, sanitizeAuthPayload } from "@/src/app/api/auth/_utils";
import { AUTH_TOKEN_COOKIE_NAME } from "@/src/features/auth/constants";

interface DietPlanRouteContext {
  params: Promise<{
    id: string;
    planId: string;
  }>;
}

function unauthorizedResponse() {
  return NextResponse.json(
    { message: "Nao autorizado", error: true, statusCode: 401 },
    { status: 401 },
  );
}

function invalidPlanResponse() {
  return NextResponse.json(
    { message: "Dados do plano alimentar invalidos.", error: true, statusCode: 400 },
    { status: 400 },
  );
}

function getToken(request: NextRequest) {
  return request.cookies.get(AUTH_TOKEN_COOKIE_NAME)?.value.trim();
}

function getPlanUrl(patientId: string, planId: string) {
  return new URL(
    `/pacientes/${encodeURIComponent(patientId)}/planos-alimentares/${encodeURIComponent(planId)}`,
    AUTH_API_URL,
  );
}

export async function PATCH(request: NextRequest, context: DietPlanRouteContext) {
  const token = getToken(request);

  if (!token) {
    return unauthorizedResponse();
  }

  let requestBody: unknown;

  try {
    requestBody = await request.json();
  } catch {
    return invalidPlanResponse();
  }

  const { id, planId } = await context.params;

  try {
    const upstreamResponse = await fetch(getPlanUrl(id, planId), {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ planoAlimentar: requestBody }),
      cache: "no-store",
    });
    const payload = await readResponseBody(upstreamResponse);

    return NextResponse.json(sanitizeAuthPayload(payload), {
      status: upstreamResponse.status,
    });
  } catch (error) {
    console.error("Erro ao atualizar plano alimentar:", error);

    return NextResponse.json(
      { message: "Nao foi possivel atualizar o plano alimentar.", error: true, statusCode: 502 },
      { status: 502 },
    );
  }
}
