"use client";

import { useMemo, useState } from "react";
import { AlertTriangle, ChevronDown, ChevronUp } from "lucide-react";
import { config } from "@/src/constants/config";
import { IMealFood, INutrientTotal } from "../types/dietPlan.types";
import {
    calculateMealMacros,
    calculateMealMicronutrients,
} from "../utils/nutritionCalculations";

interface MealOptionNutritionSummaryProps {
    label: string;
    foods: IMealFood[];
    accent?: "primary" | "substitution";
    comparisonFoods?: IMealFood[];
}

interface NutrientWarning {
    label: string;
    currentValue: number;
    referenceValue: number;
    unit: string;
}

function formatMicronutrientValue(value: number) {
    return new Intl.NumberFormat("pt-BR", {
        maximumFractionDigits: value >= 10 ? 1 : 2,
    }).format(value);
}

function normalizeComparisonKey(value: string) {
    return value
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .trim();
}

function isRelevantMicronutrient(name: string) {
    const normalizedName = normalizeComparisonKey(name);

    return config.nutrition.relevantMicronutrientTerms.some((term) =>
        normalizedName.includes(term),
    );
}

function calculateComparableMicronutrients(foods: IMealFood[]): INutrientTotal[] {
    const totals = new Map<string, INutrientTotal>();

    for (const food of foods) {
        for (const nutrient of food.nutrientesCompletos) {
            if (
                nutrient.valorCalculado < 0 ||
                !isRelevantMicronutrient(nutrient.nomeComponente)
            ) {
                continue;
            }

            const key = `${normalizeComparisonKey(nutrient.nomeComponente)}|${normalizeComparisonKey(nutrient.unidadeUtilizada)}`;
            const current = totals.get(key);

            if (current) {
                current.valorCalculado += nutrient.valorCalculado;
            } else {
                totals.set(key, { ...nutrient });
            }
        }
    }

    return [...totals.values()];
}

function isSignificantDifference(referenceValue: number, currentValue: number) {
    if (currentValue < 0) {
        return false;
    }

    if (referenceValue <= 0) {
        return currentValue > 0;
    }

    return (
        Math.abs(currentValue - referenceValue) / referenceValue >=
        config.nutrition.significantDifferencePercent / 100
    );
}

function formatDifference(referenceValue: number, currentValue: number) {
    if (referenceValue <= 0) {
        return "não presente na principal";
    }

    const difference = ((currentValue - referenceValue) / referenceValue) * 100;
    return `${difference >= 0 ? "+" : ""}${Math.round(difference)}%`;
}

export default function MealOptionNutritionSummary({
    label,
    foods,
    accent = "primary",
    comparisonFoods,
}: MealOptionNutritionSummaryProps) {
    const [isMicronutrientsExpanded, setIsMicronutrientsExpanded] =
        useState(false);
    const macros = useMemo(() => calculateMealMacros(foods), [foods]);
    const micronutrients = useMemo(
        () => calculateMealMicronutrients(foods),
        [foods],
    );
    const comparisonMacros = useMemo(
        () => (comparisonFoods ? calculateMealMacros(comparisonFoods) : null),
        [comparisonFoods],
    );
    const comparisonMicronutrients = useMemo(
        () =>
            comparisonFoods
                ? calculateComparableMicronutrients(comparisonFoods)
                : [],
        [comparisonFoods],
    );
    const comparableMicronutrients = useMemo(
        () => calculateComparableMicronutrients(foods),
        [foods],
    );
    const macroWarnings = useMemo<NutrientWarning[]>(() => {
        if (!comparisonMacros) {
            return [];
        }

        const candidates = [
            {
                label: "Carboidratos",
                currentValue: macros.cho,
                referenceValue: comparisonMacros.cho,
                unit: "g",
            },
            {
                label: "Proteínas",
                currentValue: macros.ptn,
                referenceValue: comparisonMacros.ptn,
                unit: "g",
            },
            {
                label: "Gorduras",
                currentValue: macros.lip,
                referenceValue: comparisonMacros.lip,
                unit: "g",
            },
        ];

        return candidates.filter((candidate) =>
            isSignificantDifference(candidate.referenceValue, candidate.currentValue),
        );
    }, [comparisonMacros, macros]);
    const micronutrientWarnings = useMemo<NutrientWarning[]>(() => {
        if (!comparisonFoods?.length) {
            return [];
        }

        const referenceByKey = new Map(
            comparisonMicronutrients.map((nutrient) => [
                `${normalizeComparisonKey(nutrient.nomeComponente)}|${normalizeComparisonKey(nutrient.unidadeUtilizada)}`,
                nutrient.valorCalculado,
            ]),
        );

        return comparableMicronutrients
            .map((nutrient) => {
                const key = `${normalizeComparisonKey(nutrient.nomeComponente)}|${normalizeComparisonKey(nutrient.unidadeUtilizada)}`;
                const referenceValue = referenceByKey.get(key) ?? 0;

                return {
                    label: nutrient.nomeComponente,
                    currentValue: nutrient.valorCalculado,
                    referenceValue,
                    unit: nutrient.unidadeUtilizada,
                };
            })
            .filter((nutrient) =>
                isSignificantDifference(nutrient.referenceValue, nutrient.currentValue),
            );
    }, [comparisonFoods, comparisonMicronutrients, comparableMicronutrients]);
    const hasRelevantMicronutrientWarnings =
        micronutrientWarnings.length >=
        config.nutrition.minimumRelevantMicronutrientsForWarning;
    const hasWarnings =
        accent === "substitution" &&
        (macroWarnings.length > 0 || hasRelevantMicronutrientWarnings);
    const borderClass =
        accent === "substitution"
            ? "border-brand-200 bg-brand-50/50"
            : "border-border-default bg-background-subtle";

    return (
        <section className={`rounded-xl border p-4 ${borderClass}`}>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                    <p className="text-caption font-semibold uppercase tracking-wide text-content-secondary">
                        {label}
                    </p>
                    <p className="mt-1 text-body-small text-content-secondary">
                        {foods.length} {foods.length === 1 ? "alimento" : "alimentos"}
                    </p>
                </div>
                <p className="text-heading-h4 font-bold text-content-primary">
                    {macros.kcal.toFixed(0)} kcal
                </p>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2 md:grid-cols-4">
                <MacroValue label="CHO" value={`${macros.cho.toFixed(1)}g`} />
                <MacroValue label="PTN" value={`${macros.ptn.toFixed(1)}g`} />
                <MacroValue label="LIP" value={`${macros.lip.toFixed(1)}g`} />
                <MacroValue label="Kcal" value={macros.kcal.toFixed(0)} />
            </div>

            {hasWarnings && (
                <div
                    className="mt-4 rounded-lg border border-feedback-warning-border bg-feedback-warning-bg p-3 text-feedback-warning-text"
                    role="status"
                    aria-live="polite"
                >
                    <div className="flex items-start gap-2">
                        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                        <div className="min-w-0">
                            <p className="text-body-small font-semibold">
                                Atenção: a opção substituta apresenta diferenças nutricionais relevantes.
                            </p>
                            <p className="mt-1 text-caption">
                                Pelo menos um macronutriente ou {config.nutrition.minimumRelevantMicronutrientsForWarning} micronutrientes principais variam {config.nutrition.significantDifferencePercent}% ou mais. Revise a substituição antes de salvar.
                            </p>
                        </div>
                    </div>

                    <div className="mt-3 space-y-2 text-caption">
                        {macroWarnings.length > 0 && (
                            <WarningGroup
                                title="Macronutrientes"
                                warnings={macroWarnings}
                            />
                        )}
                        {hasRelevantMicronutrientWarnings && (
                            <WarningGroup
                                title="Micronutrientes principais"
                                warnings={micronutrientWarnings}
                            />
                        )}
                    </div>
                </div>
            )}

            <div className="mt-4 border-t border-border-subtle pt-3">
                <button
                    type="button"
                    className="flex w-full cursor-pointer items-center justify-between gap-3 text-left text-body-small font-semibold text-content-primary"
                    onClick={() =>
                        setIsMicronutrientsExpanded((currentState) => !currentState)
                    }
                    aria-expanded={isMicronutrientsExpanded}
                >
                    <span>Micronutrientes da opção</span>
                    {isMicronutrientsExpanded ? (
                        <ChevronUp className="h-4 w-4 shrink-0 text-content-secondary" />
                    ) : (
                        <ChevronDown className="h-4 w-4 shrink-0 text-content-secondary" />
                    )}
                </button>

                {isMicronutrientsExpanded && (
                    <div className="mt-3">
                        {micronutrients.length === 0 ? (
                            <p className="rounded-md border border-dashed border-border-default px-3 py-2 text-body-small text-content-secondary">
                                Nenhum micronutriente calculado para esta opção.
                            </p>
                        ) : (
                            <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                                {micronutrients.map((nutrient) => (
                                    <div
                                        key={`${nutrient.nomeComponente}-${nutrient.unidadeUtilizada}`}
                                        className="flex items-center justify-between gap-3 rounded-md border border-border-subtle bg-surface-default px-3 py-2 text-body-small"
                                    >
                                        <span
                                            className="truncate text-content-secondary"
                                            title={nutrient.nomeComponente}
                                        >
                                            {nutrient.nomeComponente}
                                        </span>
                                        <span className="shrink-0 font-semibold text-content-primary">
                                            {formatMicronutrientValue(nutrient.valorCalculado)}
                                            {nutrient.unidadeUtilizada}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </section>
    );
}

interface MacroValueProps {
    label: string;
    value: string;
}

function MacroValue({ label, value }: MacroValueProps) {
    return (
        <div className="rounded-md border border-border-subtle bg-surface-default px-3 py-2">
            <p className="text-caption font-medium text-content-secondary">{label}</p>
            <p className="mt-1 text-body-small font-semibold text-content-primary">{value}</p>
        </div>
    );
}

interface WarningGroupProps {
    title: string;
    warnings: NutrientWarning[];
}

function WarningGroup({ title, warnings }: WarningGroupProps) {
    return (
        <div>
            <p className="font-semibold">{title} com diferença relevante:</p>
            <ul className="mt-1 space-y-1 pl-4">
                {warnings.map((warning) => (
                    <li key={`${title}-${warning.label}-${warning.unit}`}>
                        {warning.label}: {formatMicronutrientValue(warning.currentValue)}
                        {warning.unit} contra {formatMicronutrientValue(warning.referenceValue)}
                        {warning.unit} ({formatDifference(warning.referenceValue, warning.currentValue)})
                    </li>
                ))}
            </ul>
        </div>
    );
}
