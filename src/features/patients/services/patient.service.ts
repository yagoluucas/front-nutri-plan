import { z } from "zod";
import {
    patientFormSchema,
    patientSchema,
    patientSummarySchema,
    type PatientFormValues,
} from "../schemas/patient.schemas";
import type { DietPlanRecord, Patient, PatientSummary } from "../types/patient.types";
import { hydrateBackendPlan } from "../../diet-plan/services/dietPlan.service";
import { fetchWithSession } from "../../auth/services/session.service";
import { persistedDietPlanSchema } from "../../diet-plan/schemas/dietPlan.schemas";

const apiPatientSchema = patientSchema.omit({ planosAlimentares: true });

const listPatientsResponseSchema = z.object({
    pacientes: z.array(patientSummarySchema),
}).passthrough();

const patientResponseSchema = z.object({
    paciente: apiPatientSchema,
}).passthrough();

const dietPlansResponseSchema = z.object({
    planosAlimentares: z.array(persistedDietPlanSchema),
}).passthrough();

type ApiPatient = z.infer<typeof apiPatientSchema>;
type ApiDietPlanWithId = z.infer<typeof persistedDietPlanSchema>;

function getPayloadMessage(payload: unknown, fallback: string) {
    if (typeof payload !== "object" || payload === null || Array.isArray(payload)) {
        return fallback;
    }

    const message = (payload as { message?: unknown }).message;
    return typeof message === "string" && message.trim() ? message : fallback;
}

async function readJsonPayload(response: Response): Promise<unknown> {
    return response.json().catch(() => null);
}

async function requestPatientApi(endpoint: string, init?: RequestInit): Promise<unknown> {
    const headers = new Headers(init?.headers);

    if (init?.body && !headers.has("Content-Type")) {
        headers.set("Content-Type", "application/json");
    }

    const response = await fetchWithSession(endpoint, {
        ...init,
        headers,
        credentials: "include",
    });
    const payload = await readJsonPayload(response);

    if (!response.ok) {
        throw new Error(getPayloadMessage(payload, "Nao foi possivel concluir a requisicao."));
    }

    return payload;
}

function getPatientDietPlanPatientData(patient: ApiPatient) {
    return {
        nome: `${patient.nome} ${patient.sobrenome}`.trim(),
        email: patient.email || "",
        dataNascimento: patient.dataNascimento || "",
    };
}

async function toDietPlanRecord(
    plan: ApiDietPlanWithId,
    patient: ApiPatient,
): Promise<DietPlanRecord> {
    const now = new Date().toISOString();
    const hydratedPlan = await hydrateBackendPlan(plan, getPatientDietPlanPatientData(patient));

    return {
        ...hydratedPlan,
        id: plan.id,
        createdAt: plan.createdAt || now,
        updatedAt: plan.updatedAt || now,
    };
}

async function fetchPatientDietPlans(patient: ApiPatient): Promise<DietPlanRecord[]> {
    const payload = await requestPatientApi(`/api/pacientes/${encodeURIComponent(patient.id)}/planos-alimentares`, {
        method: "GET",
    });
    const parsedResponse = dietPlansResponseSchema.safeParse(payload);

    if (!parsedResponse.success) {
        throw new Error("Resposta invalida ao buscar planos alimentares do paciente.");
    }

    return Promise.all(
        parsedResponse.data.planosAlimentares.map((plan) => toDietPlanRecord(plan, patient)),
    );
}

async function toPatient(patient: ApiPatient): Promise<Patient> {
    const planosAlimentares = patient.qtdPlanos > 0
        ? await fetchPatientDietPlans(patient)
        : [];

    return {
        ...patient,
        planosAlimentares,
    };
}

export async function listPatientsApi(): Promise<PatientSummary[]> {
    const payload = await requestPatientApi("/api/pacientes", {
        method: "GET",
    });
    const parsedResponse = listPatientsResponseSchema.safeParse(payload);

    if (!parsedResponse.success) {
        throw new Error("Resposta invalida ao buscar pacientes.");
    }

    return parsedResponse.data.pacientes;
}

export async function getPatientApi(patientId: string): Promise<Patient> {
    const payload = await requestPatientApi(`/api/pacientes/${encodeURIComponent(patientId)}`, {
        method: "GET",
    });
    const parsedResponse = patientResponseSchema.safeParse(payload);

    if (!parsedResponse.success) {
        throw new Error("Resposta invalida ao buscar paciente.");
    }

    return toPatient(parsedResponse.data.paciente);
}

export async function createPatientApi(values: PatientFormValues): Promise<Patient> {
    const parsedValues = patientFormSchema.parse(values);
    const payload = await requestPatientApi("/api/pacientes", {
        method: "POST",
        body: JSON.stringify(parsedValues),
    });
    const parsedResponse = patientResponseSchema.safeParse(payload);

    if (!parsedResponse.success) {
        throw new Error("Resposta invalida ao cadastrar paciente.");
    }

    return toPatient(parsedResponse.data.paciente);
}

export async function updatePatientApi(patientId: string, values: PatientFormValues): Promise<Patient> {
    const parsedValues = patientFormSchema.parse(values);
    const payload = await requestPatientApi(`/api/pacientes/${encodeURIComponent(patientId)}`, {
        method: "PATCH",
        body: JSON.stringify(parsedValues),
    });
    const parsedResponse = patientResponseSchema.safeParse(payload);

    if (!parsedResponse.success) {
        throw new Error("Resposta invalida ao atualizar paciente.");
    }

    return toPatient(parsedResponse.data.paciente);
}

export async function deletePatientApi(patientId: string): Promise<void> {
    await requestPatientApi(`/api/pacientes/${encodeURIComponent(patientId)}`, {
        method: "DELETE",
    });
}
