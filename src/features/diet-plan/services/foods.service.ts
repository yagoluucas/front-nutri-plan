import { IAlimentoDetail } from "../types/dietPlan.types";
import { fetchWithSession } from "../../auth/services/session.service";
import {
    foodAutocompleteApiResponseSchema,
    foodDetailApiResponseSchema,
    type FoodSearchResponse,
} from "../schemas/dietPlan.schemas";

const TIMEOUT_MS = 60000; // 60 seconds for Render cold starts

async function fetchWithTimeout(resource: string, options: RequestInit & { timeout?: number } = {}) {
    const { timeout = TIMEOUT_MS } = options;
    
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);
    
    try {
        return await fetchWithSession(resource, {
            ...options,
            signal: controller.signal
        });
    } finally {
        clearTimeout(id);
    }
}

export type { FoodSearchResponse } from "../schemas/dietPlan.schemas";

function hasErrorName(error: unknown, name: string) {
    return typeof error === "object" && error !== null && "name" in error && error.name === name;
}

function toFoodRequestError(error: unknown) {
    if (hasErrorName(error, "AbortError")) {
        return new Error("O servidor demorou para responder. Aguarde alguns segundos e tente novamente.");
    }

    if (hasErrorName(error, "TypeError")) {
        return new Error("Não foi possível conectar ao servidor. Se for a primeira busca, aguarde ~30s e tente novamente.");
    }

    return error instanceof Error ? error : new Error("Não foi possível concluir a busca de alimentos.");
}

export async function searchFoods(term: string, page = 1): Promise<FoodSearchResponse> {
    const normalizedTerm = term.trim();

    if (!normalizedTerm || normalizedTerm.length < 2) {
        return {
            alimentos: [],
            page,
            hasNextPage: false
        };
    }
    
    try {
        const searchParams = new URLSearchParams({
            foodName: normalizedTerm,
            page: String(page)
        });

        const response = await fetchWithTimeout(`/api/alimentos/autocomplete?${searchParams.toString()}`, {
            method: "GET",
            credentials: "include"
        });

        if (!response.ok) {
            throw new Error(`Erro ao buscar alimentos (${response.status})`);
        }

        const parsedData = foodAutocompleteApiResponseSchema.safeParse(await response.json());

        if (!parsedData.success) {
            throw new Error("Resposta invalida ao buscar alimentos.");
        }

        const data = parsedData.data;

        return {
            alimentos: data.alimentos || [],
            page: typeof data.page === "number" ? data.page : page,
            hasNextPage: Boolean(data.hasNextPage)
        };
    } catch (error) {
        throw toFoodRequestError(error);
    }
}

export async function getFoodDetail(code: string): Promise<IAlimentoDetail> {
    try {
        const response = await fetchWithTimeout(`/api/alimentos?foodCode=${encodeURIComponent(code)}`, {
            method: "GET",
            credentials: "include"
        });

        if (!response.ok) {
            throw new Error("Erro ao buscar detalhes do alimento");
        }

        const parsedData = foodDetailApiResponseSchema.safeParse(await response.json());

        if (!parsedData.success) {
            throw new Error("Resposta invalida ao buscar detalhes do alimento.");
        }

        const data = parsedData.data;
        if (data.alimentos.length > 0) {
            return data.alimentos[0];
        }
        
        throw new Error("Alimento não encontrado");
    } catch (error) {
        throw toFoodRequestError(error);
    }
}
