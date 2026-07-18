import { z } from "zod";
import { patientFormSchema, type PatientFormValues } from "../schemas/patient.schemas";
import type { DietPlanRecord, Patient, PatientSummary } from "../types/patient.types";
import { hydrateBackendPlan } from "../../diet-plan/services/dietPlan.service";
import { fetchWithSession } from "../../auth/services/session.service";

const apiPatientSummarySchema = z.object({
    id: z.string().trim().min(1),
    nome: z.string().trim().min(1),
    sobrenome: z.string().trim().min(1),
    email: z.string().optional(),
    dataNascimento: patientFormSchema.shape.dataNascimento,
    qtdPlanos: z.number().int().min(0),
    createdAt: z.string().trim().min(1),
    updatedAt: z.string().trim().min(1),
});

const apiMealSchema = z.object({
    nome: z.string(),
    horario: z.string(),
    observacoes: z.string().optional(),
    alimentos: z.array(z.object({
        codigoAlimento: z.string(),
        quantidade: z.number(),
        medidaSelecionada: z.object({
            nomeMedida: z.string(),
            total: z.number(),
            unidadeMedida: z.string(),
            tipoMedida: z.enum(["Caseira", "Tecnica"]),
        }),
    })).default([]),
}).passthrough();

const apiDietPlanSchema = z.object({
    id: z.string().trim().min(1).optional(),
    titulo: z.string().optional(),
    objetivoDoPlano: z.string().optional(),
    observacoesGerais: z.string().optional(),
    refeicoes: z.array(apiMealSchema).default([]),
}).passthrough();

const apiDietPlanWithIdSchema = apiDietPlanSchema.extend({
    id: z.string().trim().min(1),
});

const apiPatientSchema = patientFormSchema.extend({
    id: z.string().trim().min(1),
    idNutricionista: z.string().trim().min(1),
    planosAlimentares: z.array(apiDietPlanSchema).optional(),
    createdAt: z.string().trim().min(1),
    updatedAt: z.string().trim().min(1),
});

const listPatientsResponseSchema = z.object({
    pacientes: z.array(apiPatientSummarySchema),
}).passthrough();

const patientResponseSchema = z.object({
    paciente: apiPatientSchema,
}).passthrough();

const dietPlansResponseSchema = z.object({
    planosAlimentares: z.array(apiDietPlanWithIdSchema),
}).passthrough();

type ApiPatient = z.infer<typeof apiPatientSchema>;
type ApiDietPlan = z.infer<typeof apiDietPlanSchema>;
type ApiDietPlanWithId = z.infer<typeof apiDietPlanWithIdSchema>;

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

function hasDietPlanId(plan: ApiDietPlan): plan is ApiDietPlanWithId {
    return typeof plan.id === "string" && plan.id.trim().length > 0;
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
        createdAt: now,
        updatedAt: now,
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
    const patientPlans = patient.planosAlimentares ?? [];
    const planosAlimentares = patientPlans.length === 0
        ? []
        : patientPlans.every(hasDietPlanId)
            ? await Promise.all(patientPlans.map((plan) => toDietPlanRecord(plan, patient)))
            : await fetchPatientDietPlans(patient);

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
