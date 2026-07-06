import { NextRequest, NextResponse } from "next/server";
import { AUTH_TOKEN_COOKIE_NAME } from "@/src/features/auth/constants";
import {
  AUTH_API_URL,
  readResponseBody,
  sanitizeAuthPayload,
} from "@/src/app/api/auth/_utils";
import { patientFormSchema } from "@/src/features/patients/schemas/patient.schemas";

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

export async function GET(request: NextRequest) {
  const token = request.cookies.get(AUTH_TOKEN_COOKIE_NAME)?.value.trim();

  if (!token) {
    return unauthorizedResponse();
  }

  try {
    const upstreamResponse = await fetch(new URL("/pacientes", AUTH_API_URL), {
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
    console.error("Erro ao buscar pacientes:", error);

    return NextResponse.json(
      {
        message: "Nao foi possivel buscar os pacientes.",
        error: true,
        statusCode: 502,
      },
      { status: 502 },
    );
  }
}

export async function POST(request: NextRequest) {
  const token = request.cookies.get(AUTH_TOKEN_COOKIE_NAME)?.value.trim();

  if (!token) {
    return unauthorizedResponse();
  }

  let requestBody: unknown;

  try {
    requestBody = await request.json();
  } catch {
    return NextResponse.json(
      {
        message: "Dados do paciente invalidos.",
        error: true,
        statusCode: 400,
      },
      { status: 400 },
    );
  }

  const parsedPatient = patientFormSchema.safeParse(requestBody);

  if (!parsedPatient.success) {
    return NextResponse.json(
      {
        message: parsedPatient.error.issues[0]?.message || "Dados do paciente invalidos.",
        error: true,
        statusCode: 400,
      },
      { status: 400 },
    );
  }

  try {
    const upstreamResponse = await fetch(new URL("/pacientes", AUTH_API_URL), {
      method: "POST",
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
    console.error("Erro ao cadastrar paciente:", error);

    return NextResponse.json(
      {
        message: "Nao foi possivel cadastrar o paciente.",
        error: true,
        statusCode: 502,
      },
      { status: 502 },
    );
  }
}
