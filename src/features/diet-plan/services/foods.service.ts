import { IAlimentoAutocomplete, IAlimentoDetail } from "../types/dietPlan.types";
import { fetchWithSession } from "../../auth/services/session.service";

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

interface FoodsApiResponse<T> {
    alimentos?: T[];
    message?: string;
    page?: number;
    hasNextPage?: boolean;
}

export interface FoodSearchResponse {
    alimentos: IAlimentoAutocomplete[];
    page: number;
    hasNextPage: boolean;
}

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

        const data = await response.json() as FoodsApiResponse<IAlimentoAutocomplete>;

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

        const data = await response.json() as FoodsApiResponse<IAlimentoDetail>;
        if (data.alimentos && data.alimentos.length > 0) {
            return data.alimentos[0];
        }
        
        throw new Error("Alimento não encontrado");
    } catch (error) {
        throw toFoodRequestError(error);
    }
}
