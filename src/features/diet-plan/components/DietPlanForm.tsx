"use client";

import React, { useState, useEffect } from "react";
import { Plus, Save, UtensilsCrossed } from "lucide-react";
import Button from "@/src/components/ui/Button";
import { toast } from "sonner";
import { IDietPlanState, IMeal } from "../types/dietPlan.types";
import PatientInfoSection from "./PatientInfoSection";
import DietPlanDashboard from "./DietPlanDashboard";
import MealEditor from "./MealEditor";
import PDFGenerator from "./PDFGenerator";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://api-nutri-plan.onrender.com";

const INITIAL_STATE: IDietPlanState = {
    paciente: { nome: "", sexo: "", email: "", objetivo: "", observacoes: "" },
    refeicoes: [],
    totalMacros: { cho: 0, ptn: 0, lip: 0, kcal: 0 }
};

export default function DietPlanForm() {
    const [planState, setPlanState] = useState<IDietPlanState>(INITIAL_STATE);
    const [isMealEditorOpen, setIsMealEditorOpen] = useState(false);

    // Ping the server on mount to "wake up" Render's free tier before the user needs it
    // Uses no-cors because we only need to wake the server, not read the response
    useEffect(() => {
        fetch(`${API_URL}/health`, { method: "GET", mode: "no-cors" }).catch(() => {
            // Silently ignore — we're just waking up the server in the background
        });
    }, []);

    const handlePatientChange = (field: keyof typeof INITIAL_STATE.paciente, value: string) => {
        setPlanState(prev => ({
            ...prev,
            paciente: { ...prev.paciente, [field]: value }
        }));
    };

    const handleAddMeal = (meal: IMeal) => {
        setPlanState(prev => {
            const newRefeicoes = [...prev.refeicoes, meal];
            // Recalculate grand totals
            const newTotalMacros = newRefeicoes.reduce((acc, curr) => ({
                cho: acc.cho + curr.totalMacros.cho,
                ptn: acc.ptn + curr.totalMacros.ptn,
                lip: acc.lip + curr.totalMacros.lip,
                kcal: acc.kcal + curr.totalMacros.kcal,
            }), { cho: 0, ptn: 0, lip: 0, kcal: 0 });

            return {
                ...prev,
                refeicoes: newRefeicoes,
                totalMacros: newTotalMacros
            };
        });
        toast.success(`Refeição "${meal.nome}" adicionada!`);
    };

    const handleRemoveMeal = (id: string) => {
        setPlanState(prev => {
            const newRefeicoes = prev.refeicoes.filter(m => m.id !== id);
            const newTotalMacros = newRefeicoes.reduce((acc, curr) => ({
                cho: acc.cho + curr.totalMacros.cho,
                ptn: acc.ptn + curr.totalMacros.ptn,
                lip: acc.lip + curr.totalMacros.lip,
                kcal: acc.kcal + curr.totalMacros.kcal,
            }), { cho: 0, ptn: 0, lip: 0, kcal: 0 });

            return {
                ...prev,
                refeicoes: newRefeicoes,
                totalMacros: newTotalMacros
            };
        });
        toast.success("Refeição removida.");
    };

    const handleSavePlan = () => {
        // Just a stub for now as we don't save to DB yet
        toast.success("Plano salvo com sucesso! (Modo Local)");
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 pb-32">
            
            {/* Header Area: Patient Info + Dashboard */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
                <div className="lg:col-span-2">
                    <PatientInfoSection data={planState.paciente} onChange={handlePatientChange} />
                </div>
                <div className="lg:col-span-1">
                    <DietPlanDashboard totalMacros={planState.totalMacros} />
                </div>
            </div>

            {/* Meals Area */}
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-heading-h3 font-bold text-content-primary flex items-center gap-2">
                        <UtensilsCrossed className="text-action-primary" />
                        Refeições
                    </h2>
                </div>

                {planState.refeicoes.length === 0 ? (
                    <div className="bg-surface-default border border-border-default border-dashed rounded-xl p-12 text-center">
                        <p className="text-body-large text-content-secondary mb-4">Nenhuma refeição cadastrada ainda.</p>
                        <Button variant="primary" onClick={() => setIsMealEditorOpen(true)}>
                            <Plus size={20} className="mr-2" /> Adicionar Primeira Refeição
                        </Button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {planState.refeicoes.map(meal => (
                            <div key={meal.id} className="bg-surface-default border border-border-default rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col">
                                <div className="flex justify-between items-start mb-3 border-b border-border-subtle pb-3">
                                    <div>
                                        <h3 className="font-bold text-heading-h4 text-content-primary">{meal.nome}</h3>
                                        <p className="text-body-small text-content-secondary">{meal.horario}</p>
                                    </div>
                                    <div className="text-right">
                                        <span className="block text-body-small font-bold text-brand-700">{meal.totalMacros.kcal.toFixed(0)} kcal</span>
                                    </div>
                                </div>
                                
                                <div className="flex-1 space-y-2 mb-4">
                                    <p className="text-caption text-content-secondary mb-2">
                                        {meal.alimentos.length} {meal.alimentos.length === 1 ? 'alimento' : 'alimentos'}
                                    </p>
                                    {meal.alimentos.slice(0, 3).map(f => (
                                        <p key={f.id} className="text-body-small text-content-primary truncate">
                                            <span className="text-brand-500 mr-1">•</span>
                                            {f.quantidade}x {f.medidaSelecionada.nomeMedida} {f.nomeAlimento}
                                        </p>
                                    ))}
                                    {meal.alimentos.length > 3 && (
                                        <p className="text-caption text-content-muted italic">
                                            + {meal.alimentos.length - 3} outros alimentos...
                                        </p>
                                    )}
                                </div>

                                <div className="mt-auto flex justify-between items-center pt-3 border-t border-border-subtle">
                                    <button 
                                        className="text-body-small text-feedback-error-text font-medium hover:underline"
                                        onClick={() => handleRemoveMeal(meal.id)}
                                    >
                                        Remover
                                    </button>
                                </div>
                            </div>
                        ))}

                        {/* Add new meal card button */}
                        <button
                            onClick={() => setIsMealEditorOpen(true)}
                            className="bg-brand-50 border-2 border-dashed border-brand-200 rounded-xl p-5 flex flex-col items-center justify-center text-brand-700 hover:bg-brand-100 hover:border-brand-300 transition-colors min-h-[200px]"
                        >
                            <Plus size={32} className="mb-2" />
                            <span className="font-semibold text-body-large">Nova Refeição</span>
                        </button>
                    </div>
                )}
            </div>

            {/* Bottom Actions Bar */}
            <div className="fixed bottom-0 left-0 right-0 bg-surface-default/80 backdrop-blur-md border-t border-border-subtle p-4 z-40">
                <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-end items-center gap-4">
                    <PDFGenerator data={planState} disabled={planState.refeicoes.length === 0} />
                    <Button variant="primary" onClick={handleSavePlan} className="w-full sm:w-auto">
                        <Save size={18} className="mr-2" />
                        Salvar Plano
                    </Button>
                </div>
            </div>

            {/* Meal Editor Modal */}
            <MealEditor 
                isOpen={isMealEditorOpen} 
                onClose={() => setIsMealEditorOpen(false)} 
                onSave={handleAddMeal} 
            />
        </div>
    );
}
