"use client";

import React, { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import {
    Cell,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip as RechartsTooltip,
} from "recharts";
import { IDietPlanState } from "../types/dietPlan.types";
import { calculatePlanMicronutrients } from "../utils/nutritionCalculations";

interface DietPlanSummaryProps {
    totalMacros: IDietPlanState["totalMacros"];
    meals: IDietPlanState["refeicoes"];
}

interface MacroTooltipProps {
    active?: boolean;
    payload?: Array<{
        name?: string;
        value?: number;
    }>;
}

function formatMicronutrientValue(value: number) {
    return new Intl.NumberFormat("pt-BR", {
        maximumFractionDigits: value >= 10 ? 1 : 2,
    }).format(value);
}

function MacroTooltip({ active, payload }: MacroTooltipProps) {
    if (!active || !payload?.length) {
        return null;
    }

    const item = payload[0];

    return (
        <div className="rounded-lg border border-border-default bg-surface-elevated p-3 text-body-small shadow-md">
            <p className="mb-1 font-semibold text-content-primary">{item.name}</p>
            <p className="text-content-secondary">
                Total:{" "}
                <span className="font-medium text-content-primary">
                    {Number(item.value || 0).toFixed(1)}g
                </span>
            </p>
        </div>
    );
}

export default function DietPlanSummary({
    totalMacros,
    meals,
}: DietPlanSummaryProps) {
    const [isMicronutrientsExpanded, setIsMicronutrientsExpanded] =
        useState(false);
    const micronutrients = calculatePlanMicronutrients(meals);
    const data = [
        {
            name: "Carboidratos",
            value: totalMacros.cho,
            color: "var(--color-action-primary)",
        },
        { name: "Proteinas", value: totalMacros.ptn, color: "#3B82F6" },
        {
            name: "Gorduras",
            value: totalMacros.lip,
            color: "var(--color-feedback-warning-solid)",
        },
    ];
    const hasData =
        totalMacros.cho > 0 || totalMacros.ptn > 0 || totalMacros.lip > 0;

    return (
        <section className="rounded-xl border border-border-default bg-surface-default p-6 shadow-sm">
            <h2 className="mb-6 text-heading-h4 font-bold text-content-primary">
                Resumo do Plano
            </h2>

            {!hasData ? (
                <div className="flex min-h-[250px] flex-col items-center justify-center text-center text-content-muted">
                    <div className="mx-auto mb-4 flex h-48 w-48 items-center justify-center rounded-full border-4 border-dashed border-border-default">
                        <span className="text-body-small">Sem alimentos</span>
                    </div>
                    <p className="text-body-small">
                        Adicione refeicoes para visualizar o grafico
                    </p>
                </div>
            ) : (
                <div className="mb-6 flex flex-col gap-6 xl:flex-row xl:items-center">
                    <div className="relative h-56 w-full max-w-[340px] self-center xl:flex-shrink-0">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart margin={{ top: 8, right: 8, bottom: 8, left: 8 }}>
                                <Pie
                                    data={data}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={72}
                                    outerRadius={96}
                                    paddingAngle={4}
                                    dataKey="value"
                                    stroke="none"
                                >
                                    {data.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <RechartsTooltip
                                    content={<MacroTooltip />}
                                    cursor={false}
                                    position={{ x: 16, y: 16 }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="flex w-full flex-col gap-4">
                        <div className="rounded-lg border border-border-default bg-background-subtle p-4 text-center xl:text-left">
                            <span className="block text-heading-h2 font-bold text-content-primary">
                                {totalMacros.kcal.toFixed(0)}
                            </span>
                            <span className="block text-caption uppercase tracking-wider text-content-secondary">
                                kcal totais
                            </span>
                        </div>

                        <div className="flex w-full flex-col gap-3">
                            {data.map((item) => (
                                <div
                                    key={item.name}
                                    className="flex items-center justify-between text-body-small"
                                >
                                    <div className="flex items-center gap-2">
                                        <span
                                            className="h-3 w-3 rounded-full"
                                            style={{ backgroundColor: item.color }}
                                        />
                                        <span className="text-content-secondary">{item.name}</span>
                                    </div>
                                    <span className="font-semibold text-content-primary">
                                        {item.value.toFixed(1)}g
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            <div className="border-t border-border-subtle pt-5">
                <button
                    type="button"
                    className="flex w-full items-center justify-between gap-3 rounded-lg border border-border-default bg-background-subtle px-4 py-3 text-left transition-colors hover:bg-background-page"
                    onClick={() =>
                        setIsMicronutrientsExpanded((currentState) => !currentState)
                    }
                >
                    <div>
                        <p className="text-body-default font-semibold text-content-primary">
                            Detalhes Micronutrientes
                        </p>
                        <p className="text-body-small text-content-secondary">
                            Totais somados a partir das refeicoes do plano.
                        </p>
                    </div>
                    {isMicronutrientsExpanded ? (
                        <ChevronUp className="h-4 w-4 shrink-0 text-content-secondary" />
                    ) : (
                        <ChevronDown className="h-4 w-4 shrink-0 text-content-secondary" />
                    )}
                </button>

                {isMicronutrientsExpanded && (
                    <div className="mt-4">
                        {micronutrients.length === 0 ? (
                            <div className="rounded-lg border border-dashed border-border-default bg-background-subtle p-4 text-center text-body-small text-content-secondary">
                                Nenhum micronutriente calculado para este plano.
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 gap-2 md:grid-cols-2 xl:grid-cols-3">
                                {micronutrients.map((nutrient) => (
                                    <div
                                        key={`${nutrient.nomeComponente}-${nutrient.unidadeUtilizada}`}
                                        className="flex items-center justify-between gap-3 rounded-md border border-border-subtle bg-background-subtle px-3 py-2 text-body-small"
                                    >
                                        <span
                                            className="truncate text-content-secondary"
                                            title={nutrient.nomeComponente}
                                        >
                                            {nutrient.nomeComponente}
                                        </span>
                                        <span className="shrink-0 font-semibold text-content-primary">
                                            {formatMicronutrientValue(
                                                nutrient.valorCalculado,
                                            )}
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
