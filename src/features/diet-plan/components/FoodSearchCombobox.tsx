"use client";

import React, { useRef, useState } from "react";
import { Search, Loader2 } from "lucide-react";
import { useFoodSearch } from "../hooks/useFoodSearch";
import { IAlimentoAutocomplete } from "../types/dietPlan.types";
import { useOnClickOutside } from "../../../hooks/useOnClickOutside";

interface FoodSearchComboboxProps {
    onSelectFood: (food: IAlimentoAutocomplete) => void;
}

export default function FoodSearchCombobox({ onSelectFood }: FoodSearchComboboxProps) {
    const { searchTerm, setSearchTerm, results, isLoading, error, setResults } = useFoodSearch();
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    useOnClickOutside(containerRef, () => setIsOpen(false));

    const handleSelect = (food: IAlimentoAutocomplete) => {
        onSelectFood(food);
        setSearchTerm("");
        setIsOpen(false);
        setResults([]);
    };

    return (
        <div ref={containerRef} className="relative w-full z-20">
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-content-placeholder w-5 h-5" />
                <input
                    type="text"
                    className="w-full h-11 rounded-lg border border-border-default bg-surface-default pl-10 pr-4 text-body-default text-content-primary placeholder:text-content-placeholder focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action-primary-focus shadow-sm transition-all"
                    placeholder="Buscar alimento no banco de dados..."
                    value={searchTerm}
                    onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setIsOpen(true);
                    }}
                    onFocus={() => setIsOpen(true)}
                />
                {isLoading && (
                    <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-brand-500 w-5 h-5" />
                )}
            </div>

            {isOpen && (searchTerm.length >= 2) && (
                <div className="absolute top-full left-0 w-full mt-1 bg-surface-elevated border border-border-default rounded-lg shadow-lg overflow-hidden max-h-60 overflow-y-auto">
                    {error && (
                        <div className="p-4 text-body-small text-feedback-error-text text-center">
                            {error}
                        </div>
                    )}
                    
                    {!isLoading && !error && results.length === 0 && (
                        <div className="p-4 text-body-small text-content-secondary text-center">
                            Nenhum alimento encontrado.
                        </div>
                    )}

                    {!error && results.map((food) => (
                        <button
                            key={food.codigoAlimento}
                            type="button"
                            className="w-full text-left px-4 py-3 hover:bg-surface-muted transition-colors border-b border-border-subtle last:border-b-0 focus:outline-none focus:bg-surface-muted"
                            onClick={() => handleSelect(food)}
                        >
                            <span className="block text-body-default text-content-primary font-medium truncate">
                                {food.nomeAlimento}
                            </span>
                            <span className="block text-caption text-content-muted mt-0.5">
                                Cód: {food.codigoAlimento}
                            </span>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
