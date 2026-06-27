"use client";

import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts';
import { IDietPlanState } from '../types/dietPlan.types';

interface DietPlanDashboardProps {
    totalMacros: IDietPlanState['totalMacros'];
}

interface MacroTooltipProps {
    active?: boolean;
    payload?: Array<{
        name?: string;
        value?: number;
    }>;
}

function MacroTooltip({ active, payload }: MacroTooltipProps) {
    if (!active || !payload?.length) {
        return null;
    }

    const item = payload[0];

    return (
        <div className="bg-surface-elevated border border-border-default shadow-md p-3 rounded-lg text-body-small">
            <p className="font-semibold text-content-primary mb-1">{item.name}</p>
            <p className="text-content-secondary">
                Total: <span className="font-medium text-content-primary">{Number(item.value || 0).toFixed(1)}g</span>
            </p>
        </div>
    );
}

export default function DietPlanDashboard({ totalMacros }: DietPlanDashboardProps) {
    const data = [
        { name: 'Carboidratos', value: totalMacros.cho, color: 'var(--color-action-primary)' }, // Brand Green
        { name: 'Proteínas', value: totalMacros.ptn, color: '#3B82F6' }, // Blue
        { name: 'Gorduras', value: totalMacros.lip, color: 'var(--color-feedback-warning-solid)' }, // Orange
    ];

    const hasData = totalMacros.cho > 0 || totalMacros.ptn > 0 || totalMacros.lip > 0;

    return (
        <div className="bg-surface-default border border-border-default rounded-xl p-6 shadow-sm flex flex-col h-full">
            <h2 className="text-heading-h4 font-bold text-content-primary mb-6">Resumo do Plano</h2>

            <div className="flex-1 flex flex-col items-center justify-center min-h-[250px]">
                {!hasData ? (
                    <div className="text-center text-content-muted">
                        <div className="w-48 h-48 rounded-full border-4 border-dashed border-border-default mx-auto mb-4 flex items-center justify-center">
                            <span className="text-body-small">Sem alimentos</span>
                        </div>
                        <p className="text-body-small">Adicione refeições para visualizar o gráfico</p>
                    </div>
                ) : (
                    <div className="w-full h-48 relative mb-6">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={data}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                    stroke="none"
                                >
                                    {data.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <RechartsTooltip content={<MacroTooltip />} />
                            </PieChart>
                        </ResponsiveContainer>
                        {/* Centered Total Kcal */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
                            <span className="block text-heading-h3 font-bold text-content-primary">
                                {totalMacros.kcal.toFixed(0)}
                            </span>
                            <span className="block text-caption text-content-secondary uppercase tracking-wider">
                                kcal
                            </span>
                        </div>
                    </div>
                )}

                {hasData && (
                    <div className="w-full flex flex-col gap-3 mt-4">
                        {data.map((item) => (
                            <div key={item.name} className="flex items-center justify-between text-body-small">
                                <div className="flex items-center gap-2">
                                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                                    <span className="text-content-secondary">{item.name}</span>
                                </div>
                                <span className="font-semibold text-content-primary">{item.value.toFixed(1)}g</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
