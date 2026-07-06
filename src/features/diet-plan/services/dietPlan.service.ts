import { z } from "zod";
import { buildMealFood, calculateMealMacros } from "../utils/nutritionCalculations";
import { getFoodDetail } from "./foods.service";
import type { IDietPlanState, IMeal, IMealFood, IMedidaCaseira, IPatientData } from "../types/dietPlan.types";

const backendMeasureSchema = z.object({
    nomeMedida: z.string(),
    total: z.number(),
    unidadeMedida: z.string(),
    tipoMedida: z.enum(["Caseira", "Tecnica"]),
});

const backendFoodSchema = z.object({
    codigoAlimento: z.string(),
    quantidade: z.number(),
    medidaSelecionada: backendMeasureSchema,
});

const backendMealSchema = z.object({
    nome: z.string(),
    horario: z.string(),
    observacoes: z.string().optional(),
    alimentos: z.array(backendFoodSchema),
});

const backendDietPlanSchema = z.object({
    id: z.string().optional(),
    objetivoDoPlano: z.string().optional(),
    observacoesGerais: z.string().optional(),
    refeicoes: z.array(backendMealSchema),
});

const dietPlanResponseSchema = z.object({
    planoAlimentar: backendDietPlanSchema.extend({
        id: z.string(),
    }),
}).passthrough();

const dietPlansResponseSchema = z.object({
    planosAlimentares: z.array(backendDietPlanSchema.extend({
        id: z.string(),
    })),
}).passthrough();

export type BackendDietPlan = z.infer<typeof backendDietPlanSchema>;

function getPayloadMessage(payload: unknown, fallback: string) {
    if (typeof payload !== "object" || payload === null || Array.isArray(payload)) {
        return fallback;
    }

    const message = (payload as { message?: unknown }).message;
    return typeof message === "string" && message.trim() ? message : fallback;
}

async function requestDietPlanApi(endpoint: string, init?: RequestInit): Promise<unknown> {
    const headers = new Headers(init?.headers);

    if (init?.body && !headers.has("Content-Type")) {
        headers.set("Content-Type", "application/json");
    }

    const response = await fetch(endpoint, {
        ...init,
        headers,
        credentials: "include",
    });
    const payload = await response.json().catch(() => null);

    if (!response.ok) {
        throw new Error(getPayloadMessage(payload, "Nao foi possivel salvar o plano alimentar."));
    }

    return payload;
}

function optionalString(value?: string) {
    const trimmed = value?.trim();
    return trimmed || undefined;
}

function mapPlanToBackend(plan: IDietPlanState): BackendDietPlan {
    return backendDietPlanSchema.parse({
        objetivoDoPlano: optionalString(plan.objetivoDoPlano),
        observacoesGerais: optionalString(plan.orientacoesGerais),
        refeicoes: plan.refeicoes.map((meal) => ({
            nome: meal.nome,
            horario: meal.horario,
            observacoes: optionalString(meal.observacoes),
            alimentos: meal.alimentos.map((food) => ({
                codigoAlimento: food.codigoAlimento,
                quantidade: food.quantidade,
                medidaSelecionada: food.medidaSelecionada,
            })),
        })),
    });
}

function findMeasureIndex(measures: IMedidaCaseira[], selectedMeasure: IMedidaCaseira) {
    const foundIndex = measures.findIndex((measure) => (
        measure.nomeMedida === selectedMeasure.nomeMedida &&
        measure.total === selectedMeasure.total &&
        measure.unidadeMedida === selectedMeasure.unidadeMedida &&
        measure.tipoMedida === selectedMeasure.tipoMedida
    ));

    return foundIndex >= 0 ? foundIndex : 0;
}

function fallbackFood(food: z.infer<typeof backendFoodSchema>): IMealFood {
    return {
        id: crypto.randomUUID(),
        codigoAlimento: food.codigoAlimento,
        nomeAlimento: food.codigoAlimento,
        medidasCaseiras: [food.medidaSelecionada],
        medidaSelecionada: food.medidaSelecionada,
        quantidade: food.quantidade,
        totalGramas: food.quantidade * food.medidaSelecionada.total,
        macros: { cho: 0, ptn: 0, lip: 0, kcal: 0 },
        nutrientesCompletos: [],
    };
}

async function hydrateFood(food: z.infer<typeof backendFoodSchema>): Promise<IMealFood> {
    try {
        const detail = await getFoodDetail(food.codigoAlimento);
        const measureIndex = findMeasureIndex(detail.medidasCaseiras, food.medidaSelecionada);

        return buildMealFood(detail, measureIndex, food.quantidade);
    } catch {
        return fallbackFood(food);
    }
}

async function hydrateMeal(meal: z.infer<typeof backendMealSchema>, planId: string, index: number): Promise<IMeal> {
    const alimentos = await Promise.all(meal.alimentos.map(hydrateFood));

    return {
        id: `${planId}-refeicao-${index}`,
        nome: meal.nome,
        horario: meal.horario,
        observacoes: meal.observacoes || "",
        alimentos,
        totalMacros: calculateMealMacros(alimentos),
    };
}

export async function hydrateBackendPlan(
    plan: z.infer<typeof backendDietPlanSchema> & { id: string },
    patient: Partial<IPatientData> = {},
): Promise<IDietPlanState> {
    const refeicoes = await Promise.all(plan.refeicoes.map((meal, index) => hydrateMeal(meal, plan.id, index)));
    const totalMacros = refeicoes.reduce((acc, meal) => ({
        cho: acc.cho + meal.totalMacros.cho,
        ptn: acc.ptn + meal.totalMacros.ptn,
        lip: acc.lip + meal.totalMacros.lip,
        kcal: acc.kcal + meal.totalMacros.kcal,
    }), { cho: 0, ptn: 0, lip: 0, kcal: 0 });

    return {
        id: plan.id,
        titulo: "Plano alimentar",
        objetivoDoPlano: plan.objetivoDoPlano || "",
        orientacoesGerais: plan.observacoesGerais || "",
        paciente: {
            nome: patient.nome || "",
            email: patient.email || "",
            dataNascimento: patient.dataNascimento || "",
        },
        refeicoes,
        totalMacros,
    };
}

export async function listDietPlansApi(patientId: string, patient: Partial<IPatientData> = {}) {
    const payload = await requestDietPlanApi(`/api/pacientes/${encodeURIComponent(patientId)}/planos-alimentares`, {
        method: "GET",
    });
    const parsedResponse = dietPlansResponseSchema.safeParse(payload);

    if (!parsedResponse.success) {
        throw new Error("Resposta invalida ao buscar planos alimentares.");
    }

    return Promise.all(parsedResponse.data.planosAlimentares.map((plan) => hydrateBackendPlan(plan, patient)));
}

export async function saveDietPlanApi(patientId: string, plan: IDietPlanState): Promise<IDietPlanState> {
    const payload = await requestDietPlanApi(
        plan.id
            ? `/api/pacientes/${encodeURIComponent(patientId)}/planos-alimentares/${encodeURIComponent(plan.id)}`
            : `/api/pacientes/${encodeURIComponent(patientId)}/planos-alimentares`,
        {
            method: plan.id ? "PATCH" : "POST",
            body: JSON.stringify(mapPlanToBackend(plan)),
        },
    );
    const parsedResponse = dietPlanResponseSchema.safeParse(payload);

    if (!parsedResponse.success) {
        throw new Error("Resposta invalida ao salvar plano alimentar.");
    }

    return hydrateBackendPlan(parsedResponse.data.planoAlimentar, plan.paciente);
}
