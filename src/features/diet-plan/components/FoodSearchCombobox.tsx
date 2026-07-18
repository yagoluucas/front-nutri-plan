"use client";

import React, { useRef, useState } from "react";
import { Loader2, Search, Star } from "lucide-react";
import { useFoodSearch } from "../hooks/useFoodSearch";
import { IAlimentoAutocomplete } from "../types/dietPlan.types";
import { useOnClickOutside } from "../../../hooks/useOnClickOutside";
import type { FavoriteFood } from "../../profile/schemas/profile.schemas";

interface FoodSearchComboboxProps {
    onSelectFood: (food: IAlimentoAutocomplete) => void;
    favoriteFoods?: FavoriteFood[];
    onToggleFavorite?: (food: IAlimentoAutocomplete) => void;
}

function toAutocompleteFood(food: FavoriteFood): IAlimentoAutocomplete {
    return {
        codigoAlimento: food.idAlimento,
        nomeAlimento: food.nomeAlimento,
    };
}

export default function FoodSearchCombobox({
    onSelectFood,
    favoriteFoods = [],
    onToggleFavorite,
}: FoodSearchComboboxProps) {
    const {
        searchTerm,
        setSearchTerm,
        results,
        isLoading,
        isLoadingNextPage,
        error,
        loadNextPage,
        clearResults,
    } = useFoodSearch();
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const favoriteFoodIds = new Set(favoriteFoods.map((food) => food.idAlimento));
    const shouldShowFavorites = searchTerm.trim().length < 2 && favoriteFoods.length > 0;

    useOnClickOutside(containerRef, () => setIsOpen(false));

    const handleSelect = (food: IAlimentoAutocomplete) => {
        onSelectFood(food);
        setSearchTerm("");
        setIsOpen(false);
        clearResults();
    };

    const handleResultsScroll = (event: React.UIEvent<HTMLDivElement>) => {
        const element = event.currentTarget;
        const distanceFromBottom = element.scrollHeight - element.scrollTop - element.clientHeight;

        if (distanceFromBottom <= 24) {
            void loadNextPage();
        }
    };

    const handleToggleFavorite = (
        event: React.MouseEvent<HTMLButtonElement>,
        food: IAlimentoAutocomplete,
    ) => {
        event.preventDefault();
        event.stopPropagation();
        onToggleFavorite?.(food);
    };

    const renderFoodOption = (food: IAlimentoAutocomplete) => {
        const isFavorite = favoriteFoodIds.has(food.codigoAlimento);

        return (
            <div
                key={food.codigoAlimento}
                className="flex w-full items-center border-b border-border-subtle transition-colors last:border-b-0 hover:bg-surface-muted focus-within:bg-surface-muted"
            >
                <button
                    type="button"
                    className="min-w-0 flex-1 cursor-pointer px-4 py-3 text-left focus:outline-none"
                    onClick={() => handleSelect(food)}
                >
                    <span className="block truncate text-body-default font-medium text-content-primary">
                        {food.nomeAlimento}
                    </span>
                    <span className="mt-0.5 block text-caption text-content-muted">
                        Cod: {food.codigoAlimento}
                    </span>
                </button>

                {onToggleFavorite && (
                    <button
                        type="button"
                        className={`shrink-0 cursor-pointer rounded-md p-1.5 transition-colors focus:outline-none focus:ring-2 focus:ring-action-primary-focus ${
                            isFavorite
                                ? "text-feedback-warning-solid hover:bg-feedback-warning-bg"
                                : "text-content-muted hover:bg-surface-muted hover:text-feedback-warning-text"
                        }`}
                        title={isFavorite ? "Remover dos favoritos" : "Adicionar aos favoritos"}
                        aria-label={isFavorite ? "Remover dos favoritos" : "Adicionar aos favoritos"}
                        aria-pressed={isFavorite}
                        onClick={(event) => handleToggleFavorite(event, food)}
                    >
                        <Star
                            size={18}
                            className={isFavorite ? "fill-feedback-warning-solid" : ""}
                        />
                    </button>
                )}
            </div>
        );
    };

    return (
        <div ref={containerRef} className={`relative w-full ${isOpen ? "z-50" : "z-20"}`}>
            <div className="relative">
                <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-content-placeholder" />
                <input
                    type="text"
                    className="h-11 w-full rounded-lg border border-border-default bg-surface-default pl-10 pr-4 text-body-default text-content-primary shadow-sm transition-all placeholder:text-content-placeholder focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action-primary-focus"
                    placeholder="Buscar alimento no banco de dados..."
                    value={searchTerm}
                    onChange={(event) => {
                        setSearchTerm(event.target.value);
                        setIsOpen(true);
                    }}
                    onFocus={() => setIsOpen(true)}
                />
                {isLoading && (
                    <Loader2 className="absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 animate-spin text-brand-500" />
                )}
            </div>

            {isOpen && (searchTerm.trim().length >= 2 || shouldShowFavorites) && (
                <div
                    className="absolute left-0 top-full z-50 mt-1 max-h-60 w-full overflow-hidden overflow-y-auto rounded-lg border border-border-default bg-surface-elevated shadow-lg"
                    onScroll={handleResultsScroll}
                >
                    {shouldShowFavorites && (
                        <>
                            <div className="border-b border-border-subtle bg-surface-muted px-4 py-2 text-caption font-semibold uppercase text-content-secondary">
                                Alimentos favoritos
                            </div>
                            {favoriteFoods.map((food) => renderFoodOption(toAutocompleteFood(food)))}
                        </>
                    )}

                    {error && (
                        <div className="p-4 text-center text-body-small text-feedback-error-text">
                            {error}
                        </div>
                    )}

                    {!isLoading && !error && searchTerm.trim().length >= 2 && results.length === 0 && (
                        <div className="p-4 text-center text-body-small text-content-secondary">
                            Nenhum alimento encontrado.
                        </div>
                    )}

                    {!error && results.map((food) => renderFoodOption(food))}

                    {isLoadingNextPage && (
                        <div className="flex items-center justify-center gap-2 p-3 text-body-small text-content-secondary">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Carregando mais alimentos...
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
