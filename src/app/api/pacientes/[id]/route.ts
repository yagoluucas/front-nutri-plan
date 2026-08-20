import { NextRequest, NextResponse } from "next/server";
import {
  AUTH_API_URL,
  applyAuthenticationState,
  fetchAuthenticatedUpstream,
  readResponseBody,
  sanitizeAuthPayload,
} from "@/src/app/api/auth/_utils";
import { patientUpdateRequestSchema } from "@/src/features/patients/schemas/patient.schemas";
import { z } from "zod";

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

const patientRouteParamsSchema = z.object({
  id: z.string().trim().min(1).max(100),
}).strict();

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

  const parsedPatient = patientUpdateRequestSchema.safeParse(requestBody);

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
  const parsedParams = patientRouteParamsSchema.safeParse(await context.params);

  if (!parsedParams.success) {
    return invalidPatientResponse("Paciente invalido.");
  }

  const { id } = parsedParams.data;

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
