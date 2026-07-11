import { NextRequest, NextResponse } from "next/server";
import {
  applyAuthenticationState,
  fetchAuthenticatedUpstream,
  readResponseBody,
  sanitizeAuthPayload,
} from "@/src/app/api/auth/_utils";
import { patientFormSchema } from "@/src/features/patients/schemas/patient.schemas";

function invalidPatientResponse(message = "Dados do paciente invalidos.") {
  return NextResponse.json(
    { message, error: true, statusCode: 400 },
    { status: 400 },
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

export async function GET(request: NextRequest) {
  try {
    const result = await fetchAuthenticatedUpstream(
      request,
      new URL("/pacientes", process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || (process.env.NODE_ENV === "production" ? "https://api-nutri-plan.onrender.com" : "http://localhost:5000")),
      { method: "GET" },
    );

    return toNextResponse(result);
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

  try {
    const result = await fetchAuthenticatedUpstream(
      request,
      new URL("/pacientes", process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || (process.env.NODE_ENV === "production" ? "https://api-nutri-plan.onrender.com" : "http://localhost:5000")),
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paciente: parsedPatient.data }),
      },
    );

    return toNextResponse(result);
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
