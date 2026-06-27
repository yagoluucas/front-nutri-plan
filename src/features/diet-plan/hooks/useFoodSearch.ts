import { useState, useEffect } from "react";
import { searchFoods } from "../services/foods.service";
import { IAlimentoAutocomplete } from "../types/dietPlan.types";

export function useFoodSearch() {
    const [searchTerm, setSearchTerm] = useState("");
    const [results, setResults] = useState<IAlimentoAutocomplete[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchFoods = async () => {
            if (!searchTerm || searchTerm.length < 2) {
                setResults([]);
                return;
            }

            setIsLoading(true);
            setError(null);

            try {
                const data = await searchFoods(searchTerm);
                setResults(data);
            } catch (error) {
                setError(error instanceof Error ? error.message : "Erro ao buscar alimentos");
            } finally {
                setIsLoading(false);
            }
        };

        const timeoutId = setTimeout(() => {
            fetchFoods();
        }, 300); // 300ms debounce

        return () => clearTimeout(timeoutId);
    }, [searchTerm]);

    return {
        searchTerm,
        setSearchTerm,
        results,
        isLoading,
        error,
        setResults
    };
}
