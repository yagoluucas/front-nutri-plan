import { IAlimentoAutocomplete, IAlimentoDetail } from "../types/dietPlan.types";

const TIMEOUT_MS = 60000; // 60 seconds for Render cold starts

async function fetchWithTimeout(resource: string, options: RequestInit & { timeout?: number } = {}) {
    const { timeout = TIMEOUT_MS } = options;
    
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);
    
    const response = await fetch(resource, {
        ...options,
        signal: controller.signal
    });
    
    clearTimeout(id);
    return response;
}

interface FoodsApiResponse<T> {
    alimentos?: T[];
    message?: string;
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

export async function searchFoods(term: string): Promise<IAlimentoAutocomplete[]> {
    if (!term || term.length < 2) return [];
    
    try {
        const response = await fetchWithTimeout(`/api/alimentos/autocomplete?foodName=${encodeURIComponent(term)}`, {
            method: "GET",
            credentials: "include"
        });

        if (!response.ok) {
            throw new Error(`Erro ao buscar alimentos (${response.status})`);
        }

        const data = await response.json() as FoodsApiResponse<IAlimentoAutocomplete>;
        return data.alimentos || [];
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
        // The API returns { alimentos: [alimentoParsed] }
        if (data.alimentos && data.alimentos.length > 0) {
            return data.alimentos[0];
        }
        
        throw new Error("Alimento não encontrado");
    } catch (error) {
        throw toFoodRequestError(error);
    }
}
