import { NextRequest, NextResponse } from "next/server";
import { AUTH_TOKEN_COOKIE_NAME } from "@/src/features/auth/constants";
import {
  AUTH_API_URL,
  readResponseBody,
  sanitizeAuthPayload,
} from "@/src/app/api/auth/_utils";
import { patientFormSchema } from "@/src/features/patients/schemas/patient.schemas";

interface PatientRouteContext {
  params: Promise<{
    id: string;
  }>;
}

function unauthorizedResponse() {
  return NextResponse.json(
    {
      message: "Nao autorizado",
      error: true,
      statusCode: 401,
    },
    { status: 401 },
  );
}

function invalidPatientResponse(message = "Dados do paciente invalidos.") {
  return NextResponse.json(
    {
      message,
      error: true,
      statusCode: 400,
    },
    { status: 400 },
  );
}

function getPatientUrl(patientId: string) {
  return new URL(`/pacientes/${encodeURIComponent(patientId)}`, AUTH_API_URL);
}

export async function GET(request: NextRequest, context: PatientRouteContext) {
  const token = request.cookies.get(AUTH_TOKEN_COOKIE_NAME)?.value.trim();

  if (!token) {
    return unauthorizedResponse();
  }

  const { id } = await context.params;

  try {
    const upstreamResponse = await fetch(getPatientUrl(id), {
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
  const token = request.cookies.get(AUTH_TOKEN_COOKIE_NAME)?.value.trim();

  if (!token) {
    return unauthorizedResponse();
  }

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
    const upstreamResponse = await fetch(getPatientUrl(id), {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        paciente: parsedPatient.data,
      }),
      cache: "no-store",
    });
    const payload = await readResponseBody(upstreamResponse);

    return NextResponse.json(sanitizeAuthPayload(payload), {
      status: upstreamResponse.status,
    });
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
  const token = request.cookies.get(AUTH_TOKEN_COOKIE_NAME)?.value.trim();

  if (!token) {
    return unauthorizedResponse();
  }

  const { id } = await context.params;

  try {
    const upstreamResponse = await fetch(getPatientUrl(id), {
      method: "DELETE",
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
