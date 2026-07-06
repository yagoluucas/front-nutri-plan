import { NextRequest, NextResponse } from "next/server";
import { AUTH_API_URL, readResponseBody, sanitizeAuthPayload } from "@/src/app/api/auth/_utils";
import { AUTH_TOKEN_COOKIE_NAME } from "@/src/features/auth/constants";

interface DietPlansRouteContext {
  params: Promise<{
    id: string;
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

function getPlansUrl(patientId: string) {
  return new URL(`/pacientes/${encodeURIComponent(patientId)}/planos-alimentares`, AUTH_API_URL);
}

export async function GET(request: NextRequest, context: DietPlansRouteContext) {
  const token = getToken(request);

  if (!token) {
    return unauthorizedResponse();
  }

  const { id } = await context.params;

  try {
    const upstreamResponse = await fetch(getPlansUrl(id), {
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
    console.error("Erro ao buscar planos alimentares:", error);

    return NextResponse.json(
      { message: "Nao foi possivel buscar os planos alimentares.", error: true, statusCode: 502 },
      { status: 502 },
    );
  }
}

export async function POST(request: NextRequest, context: DietPlansRouteContext) {
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

  const { id } = await context.params;

  try {
    const upstreamResponse = await fetch(getPlansUrl(id), {
      method: "POST",
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
    console.error("Erro ao cadastrar plano alimentar:", error);

    return NextResponse.json(
      { message: "Nao foi possivel cadastrar o plano alimentar.", error: true, statusCode: 502 },
      { status: 502 },
    );
  }
}
