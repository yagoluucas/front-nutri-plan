import { IAlimentoAutocomplete, IAlimentoDetail } from "../types/dietPlan.types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://api-nutri-plan.onrender.com";
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

function getAuthHeader(): Record<string, string> {
    const token = typeof window !== 'undefined' ? localStorage.getItem("nutriplan_token") : null;
    return token ? { "Authorization": `Bearer ${token}` } : {};
}

export async function searchFoods(term: string): Promise<IAlimentoAutocomplete[]> {
    if (!term || term.length < 2) return [];
    
    try {
        const response = await fetchWithTimeout(`${API_URL}/alimentos/autocomplete?foodName=${encodeURIComponent(term)}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                ...getAuthHeader()
            }
        });

        if (!response.ok) {
            throw new Error(`Erro ao buscar alimentos (${response.status})`);
        }

        const data = await response.json();
        return data.alimentos || [];
    } catch (error: any) {
        // AbortError = our own timeout fired
        if (error?.name === "AbortError") {
            throw new Error("O servidor demorou para responder. Aguarde alguns segundos e tente novamente.");
        }
        // TypeError "Failed to fetch" = server offline / cold start / CORS
        if (error?.name === "TypeError") {
            throw new Error("Não foi possível conectar ao servidor. Se for a primeira busca, aguarde ~30s e tente novamente (servidor acordando).");
        }
        throw error;
    }
}

export async function getFoodDetail(code: string): Promise<IAlimentoDetail> {
    try {
        const response = await fetchWithTimeout(`${API_URL}/alimentos?foodCode=${encodeURIComponent(code)}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                ...getAuthHeader()
            }
        });

        if (!response.ok) {
            throw new Error("Erro ao buscar detalhes do alimento");
        }

        const data = await response.json();
        // The API returns { alimentos: [alimentoParsed] }
        if (data.alimentos && data.alimentos.length > 0) {
            return data.alimentos[0];
        }
        
        throw new Error("Alimento não encontrado");
    } catch (error) {
        console.error("Erro no getFoodDetail:", error);
        throw error;
    }
}
