import { NextRequest, NextResponse } from "next/server";
import {
  AUTH_API_URL,
  applyAuthenticationState,
  fetchAuthenticatedUpstream,
  readResponseBody,
  sanitizeAuthPayload,
} from "@/src/app/api/auth/_utils";
import { patientFormSchema } from "@/src/features/patients/schemas/patient.schemas";

interface PatientRouteContext {
  params: Promise<{
    id: string;
  }>;
}

function invalidPatientResponse(message = "Dados do paciente invalidos.") {
  return NextResponse.json(
    { message, error: true, statusCode: 400 },
    { status: 400 },
  );
}

function getPatientUrl(patientId: string) {
  return new URL(`/pacientes/${encodeURIComponent(patientId)}`, AUTH_API_URL);
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

export async function GET(request: NextRequest, context: PatientRouteContext) {
  const { id } = await context.params;

  try {
    const result = await fetchAuthenticatedUpstream(
      request,
      getPatientUrl(id),
      { method: "GET" },
    );

    return toNextResponse(result);
  } catch (error) {
    console.error("Erro ao buscar paciente:", error);

    return NextResponse.json(
      {
        message: "Nao foi possivel buscar o paciente.",
        error: true,
        statusCode: 502,
      },
      { status: 502 },
    );
  }
}

export async function PATCH(request: NextRequest, context: PatientRouteContext) {
  let requestBody: unknown;

  try {
    requestBody = await request.json();
  } catch {
    return invalidPatientResponse();
  }

  const parsedPatient = patientFormSchema.safeParse(requestBody);

  if (!parsedPatient.success) {
    return invalidPatientResponse(
      parsedPatient.error.issues[0]?.message || "Dados do paciente invalidos.",
    );
  }

  const { id } = await context.params;

  try {
    const result = await fetchAuthenticatedUpstream(
      request,
      getPatientUrl(id),
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paciente: parsedPatient.data }),
      },
    );

    return toNextResponse(result);
  } catch (error) {
    console.error("Erro ao atualizar paciente:", error);

    return NextResponse.json(
      {
        message: "Nao foi possivel atualizar o paciente.",
        error: true,
        statusCode: 502,
      },
      { status: 502 },
    );
  }
}

export async function DELETE(request: NextRequest, context: PatientRouteContext) {
  const { id } = await context.params;

  try {
    const result = await fetchAuthenticatedUpstream(
      request,
      getPatientUrl(id),
      { method: "DELETE" },
    );

    return toNextResponse(result);
  } catch (error) {
    console.error("Erro ao excluir paciente:", error);

    return NextResponse.json(
      {
        message: "Nao foi possivel excluir o paciente.",
        error: true,
        statusCode: 502,
      },
      { status: 502 },
    );
  }
}
