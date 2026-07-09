import { useCallback, useEffect, useRef, useState } from "react";
import { searchFoods } from "../services/foods.service";
import { IAlimentoAutocomplete } from "../types/dietPlan.types";

export function useFoodSearch() {
    const [searchTerm, setSearchTerm] = useState("");
    const [results, setResults] = useState<IAlimentoAutocomplete[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingNextPage, setIsLoadingNextPage] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState(1);
    const [hasNextPage, setHasNextPage] = useState(false);

    const activeSearchTermRef = useRef("");

    useEffect(() => {
        const normalizedTerm = searchTerm.trim();
        activeSearchTermRef.current = normalizedTerm;

        let isCurrentRequest = true;

        const fetchFoods = async () => {
            if (!normalizedTerm || normalizedTerm.length < 2) {
                setResults([]);
                setPage(1);
                setHasNextPage(false);
                setError(null);
                setIsLoading(false);
                setIsLoadingNextPage(false);
                return;
            }

            setIsLoading(true);
            setError(null);
            setPage(1);
            setHasNextPage(false);

            try {
                const data = await searchFoods(normalizedTerm, 1);

                if (!isCurrentRequest || activeSearchTermRef.current !== normalizedTerm) {
                    return;
                }

                setResults(data.alimentos);
                setPage(data.page);
                setHasNextPage(data.hasNextPage);
            } catch (error) {
                if (!isCurrentRequest || activeSearchTermRef.current !== normalizedTerm) {
                    return;
                }

                setError(error instanceof Error ? error.message : "Erro ao buscar alimentos");
            } finally {
                if (isCurrentRequest && activeSearchTermRef.current === normalizedTerm) {
                    setIsLoading(false);
                }
            }
        };

        const timeoutId = setTimeout(() => {
            void fetchFoods();
        }, 300); // 300ms debounce

        return () => {
            isCurrentRequest = false;
            clearTimeout(timeoutId);
        };
    }, [searchTerm]);

    const loadNextPage = useCallback(async () => {
        const normalizedTerm = searchTerm.trim();

        if (
            !normalizedTerm ||
            normalizedTerm.length < 2 ||
            isLoading ||
            isLoadingNextPage ||
            !hasNextPage
        ) {
            return;
        }

        const nextPage = page + 1;

        setIsLoadingNextPage(true);
        setError(null);

        try {
            const data = await searchFoods(normalizedTerm, nextPage);

            if (activeSearchTermRef.current !== normalizedTerm) {
                return;
            }

            setResults((currentResults) => {
                const existingFoodCodes = new Set(
                    currentResults.map((food) => food.codigoAlimento)
                );

                const newFoods = data.alimentos.filter(
                    (food) => !existingFoodCodes.has(food.codigoAlimento)
                );

                return [...currentResults, ...newFoods];
            });

            setPage(data.page);
            setHasNextPage(data.hasNextPage);
        } catch (error) {
            if (activeSearchTermRef.current === normalizedTerm) {
                setError(error instanceof Error ? error.message : "Erro ao buscar mais alimentos");
            }
        } finally {
            if (activeSearchTermRef.current === normalizedTerm) {
                setIsLoadingNextPage(false);
            }
        }
    }, [hasNextPage, isLoading, isLoadingNextPage, page, searchTerm]);

    const clearResults = useCallback(() => {
        setResults([]);
        setPage(1);
        setHasNextPage(false);
        setError(null);
    }, []);

    return {
        searchTerm,
        setSearchTerm,
        results,
        isLoading,
        isLoadingNextPage,
        error,
        hasNextPage,
        loadNextPage,
        clearResults
    };
}
