"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Plus, Save, UtensilsCrossed } from "lucide-react";
import Button from "@/src/components/ui/Button";
import Input from "@/src/components/ui/Input";
import Label from "@/src/components/ui/Label";
import { toast } from "sonner";
import { IDietPlanState, IMeal, IMacroTotals, IPatientData } from "../types/dietPlan.types";
import { NutritionistProfile } from "../../profile/types/profile.types";
import DietPlanSummary from "./DietPlanSummary";
import MealEditorDialog from "./MealEditorDialog";
import PDFGenerator from "./PDFGenerator";

const EMPTY_TOTALS: IMacroTotals = { cho: 0, ptn: 0, lip: 0, kcal: 0 };

const EMPTY_PATIENT: IPatientData = {
    nome: "",
    email: "",
    dataNascimento: "",
};

const INITIAL_STATE: IDietPlanState = {
    titulo: "Plano alimentar",
    objetivoDoPlano: "",
    orientacoesGerais: "",
    paciente: EMPTY_PATIENT,
    refeicoes: [],
    totalMacros: EMPTY_TOTALS,
};

interface DietPlanFormProps {
    initialPlan?: IDietPlanState | null;
    initialPatient?: Partial<IPatientData>;
    profile?: NutritionistProfile;
    backHref?: string;
    onSavePlan?: (plan: IDietPlanState) => void | Promise<void>;
}

function recalcTotals(refeicoes: IMeal[]) {
    return refeicoes.reduce((acc, curr) => ({
        cho: acc.cho + curr.totalMacros.cho,
        ptn: acc.ptn + curr.totalMacros.ptn,
        lip: acc.lip + curr.totalMacros.lip,
        kcal: acc.kcal + curr.totalMacros.kcal,
    }), { ...EMPTY_TOTALS });
}

function createInitialPlan(initialPlan?: IDietPlanState | null, initialPatient?: Partial<IPatientData>): IDietPlanState {
    if (initialPlan) {
        return {
            ...initialPlan,
            paciente: {
                ...EMPTY_PATIENT,
                ...initialPlan.paciente,
            },
            totalMacros: recalcTotals(initialPlan.refeicoes),
        };
    }

    return {
        ...INITIAL_STATE,
        paciente: {
            ...EMPTY_PATIENT,
            ...initialPatient,
        },
    };
}

function hasValidMeals(plan: IDietPlanState) {
    return plan.refeicoes.length > 0 && plan.refeicoes.every((meal) => (
        meal.alimentos.length > 0
    ));
}

export default function DietPlanForm({
    initialPlan,
    initialPatient,
    profile,
    backHref,
    onSavePlan,
}: DietPlanFormProps = {}) {
    const router = useRouter();
    const [planState, setPlanState] = useState<IDietPlanState>(() => createInitialPlan(initialPlan, initialPatient));
    const [isMealEditorOpen, setIsMealEditorOpen] = useState(false);
    const [editingMeal, setEditingMeal] = useState<IMeal | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const planIsReady = hasValidMeals(planState);


    const handlePlanFieldChange = (field: "titulo" | "objetivoDoPlano" | "orientacoesGerais", value: string) => {
        setPlanState(prev => ({
            ...prev,
            [field]: value,
        }));
    };

    const handleSaveMeal = (meal: IMeal) => {
        setPlanState(prev => {
            const exists = prev.refeicoes.some(r => r.id === meal.id);
            const newRefeicoes = exists
                ? prev.refeicoes.map(r => r.id === meal.id ? meal : r)
                : [...prev.refeicoes, meal];
            return { ...prev, refeicoes: newRefeicoes, totalMacros: recalcTotals(newRefeicoes) };
        });
        setEditingMeal(null);
        toast.success(editingMeal ? `Refeição "${meal.nome}" atualizada!` : `Refeição "${meal.nome}" adicionada!`);
    };

    const handleRemoveMeal = (id: string) => {
        setPlanState(prev => {
            const newRefeicoes = prev.refeicoes.filter(m => m.id !== id);
            return { ...prev, refeicoes: newRefeicoes, totalMacros: recalcTotals(newRefeicoes) };
        });
        toast.success("Refeição removida.");
    };

    const handleOpenEdit = (meal: IMeal) => {
        setEditingMeal(meal);
        setIsMealEditorOpen(true);
    };

    const handleOpenNew = () => {
        setEditingMeal(null);
        setIsMealEditorOpen(true);
    };

    const handleSavePlan = async () => {
        if (!planIsReady) {
            toast.error("Inclua pelo menos uma refeicao com opcao principal.");
            return;
        }

        if (onSavePlan) {
            try {
                setIsSaving(true);
                await onSavePlan(planState);
            } catch (error) {
                toast.error(error instanceof Error ? error.message : "Nao foi possivel salvar o plano.");
            } finally {
                setIsSaving(false);
            }
            return;
        }

        toast.success("Rascunho atualizado nesta sessao.");
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 pb-32">
            {backHref && (
                <Button type="button" variant="ghost" className="px-0" onClick={() => router.push(backHref)}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Voltar
                </Button>
            )}

            <section className="rounded-lg border border-border-default bg-surface-default p-6 shadow-sm">
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
                    <div className="space-y-2">
                        <Label htmlFor="plan_titulo">Titulo do plano</Label>
                        <Input
                            id="plan_titulo"
                            type="text"
                            value={planState.titulo}
                            onChange={(event) => handlePlanFieldChange("titulo", event.target.value)}
                            placeholder="Ex: Plano alimentar semanal"
                        />
                    </div>

                    <div className="rounded-lg border border-border-default bg-background-subtle p-4">
                        <p className="text-caption font-semibold uppercase text-content-secondary">Paciente</p>
                        <p className="mt-1 text-heading-h4 font-semibold text-content-primary">
                            {planState.paciente.nome || "Nao informado"}
                        </p>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="plan_objetivo">Objetivo do paciente</Label>
                        <Input
                            id="plan_objetivo"
                            type="text"
                            value={planState.objetivoDoPlano}
                            onChange={(event) => handlePlanFieldChange("objetivoDoPlano", event.target.value)}
                            placeholder="Ex: Hipertrofia, Emagrecimento, Reeducacao Alimentar..."
                        />
                    </div>

                    <div className="space-y-2 lg:col-span-2">
                        <Label htmlFor="plan_orientacoes">Orientações gerais</Label>
                        <textarea
                            id="plan_orientacoes"
                            rows={4}
                            className="w-full resize-none rounded-lg border border-border-default bg-surface-default p-4 text-body-default text-content-primary shadow-sm transition-all placeholder:text-content-placeholder focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action-primary-focus"
                            value={planState.orientacoesGerais}
                            onChange={(event) => handlePlanFieldChange("orientacoesGerais", event.target.value)}
                            placeholder="Hidratacao, rotina, preparos e cuidados gerais."
                        />
                    </div>
                </div>
            </section>
            
            <DietPlanSummary
                totalMacros={planState.totalMacros}
                meals={planState.refeicoes}
            />

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
                        <Button variant="primary" onClick={handleOpenNew}>
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
                                
                                <div className="flex-1 space-y-1.5 mb-4">
                                    <p className="text-caption font-semibold text-content-secondary mb-2">
                                        Opção principal · {meal.alimentos.length} {meal.alimentos.length === 1 ? 'alimento' : 'alimentos'}
                                    </p>
                                    <p className="text-caption text-content-muted mb-2">
                                        {meal.totalMacros.kcal.toFixed(0)} kcal · CHO {meal.totalMacros.cho.toFixed(1)}g · PTN {meal.totalMacros.ptn.toFixed(1)}g · LIP {meal.totalMacros.lip.toFixed(1)}g
                                    </p>
                                    {meal.alimentos.slice(0, 3).map(f => (
                                        <p key={f.id} className="text-body-small text-content-primary truncate">
                                            <span className="text-brand-500 mr-1">•</span>
                                            {f.quantidade}x {f.medidaSelecionada.nomeMedida} · {f.nomeAlimento.length > 30 ? f.nomeAlimento.slice(0, 30) + '…' : f.nomeAlimento}
                                        </p>
                                    ))}
                                    {meal.alimentos.length > 3 && (
                                        <p className="text-caption text-content-muted italic">
                                            + {meal.alimentos.length - 3} outros alimentos...
                                        </p>
                                    )}
                                </div>

                                <div className="mb-4 rounded-lg border border-border-subtle bg-background-subtle p-3">
                                    <p className="mb-2 text-caption font-semibold uppercase text-content-secondary">
                                        Opção substituta
                                    </p>
                                    {meal.substituicao?.alimentos.length ? (
                                        <>
                                            <p className="mb-2 text-caption text-content-muted">
                                                {meal.substituicao.alimentos.length} {meal.substituicao.alimentos.length === 1 ? 'alimento' : 'alimentos'} · {meal.substituicao.totalMacros.kcal.toFixed(0)} kcal · CHO {meal.substituicao.totalMacros.cho.toFixed(1)}g · PTN {meal.substituicao.totalMacros.ptn.toFixed(1)}g · LIP {meal.substituicao.totalMacros.lip.toFixed(1)}g
                                            </p>
                                            {meal.substituicao.alimentos.slice(0, 3).map((food) => (
                                                <p key={food.id} className="truncate text-body-small text-content-primary">
                                                    {food.quantidade}x {food.medidaSelecionada.nomeMedida} - {food.nomeAlimento}
                                                </p>
                                            ))}
                                        </>
                                    ) : (
                                        <p className="text-body-small text-feedback-warning-text">Pendente</p>
                                    )}
                                </div>

                                {/* FIX #4: Edit + Remove buttons on meal cards */}
                                <div className="mt-auto flex justify-between items-center pt-3 border-t border-border-subtle">
                                    <button
                                        type="button"
                                        className="cursor-pointer text-body-small text-feedback-error-text font-medium hover:underline"
                                        onClick={() => handleRemoveMeal(meal.id)}
                                    >
                                        Remover
                                    </button>
                                    <button
                                        type="button"
                                        className="cursor-pointer text-body-small text-brand-700 font-semibold hover:text-brand-900 flex items-center gap-1 transition-colors"
                                        onClick={() => handleOpenEdit(meal)}
                                    >
                                        Editar
                                    </button>
                                </div>
                            </div>
                        ))}

                        {/* Add new meal card button */}
                        <button
                            type="button"
                            onClick={handleOpenNew}
                            className="cursor-pointer bg-brand-50 border-2 border-dashed border-brand-200 rounded-xl p-5 flex flex-col items-center justify-center text-brand-700 hover:bg-brand-100 hover:border-brand-300 transition-colors min-h-50"
                        >
                            <Plus size={32} className="mb-2" />
                            <span className="font-semibold text-body-large">Nova Refeição</span>
                        </button>
                    </div>
                )}
            </div>

            {/* Bottom Actions Bar */}
            <div className="sticky bottom-0 z-40 rounded-lg border border-border-default bg-surface-default/95 p-4 shadow-md backdrop-blur-md">
                <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-end items-center gap-4">
                    <PDFGenerator data={planState} profile={profile} disabled={!planIsReady || isSaving} />
                    <Button variant="primary" onClick={handleSavePlan} disabled={!planIsReady || isSaving} className="w-full sm:w-auto">
                        <Save size={18} className="mr-2" />
                        {isSaving ? "Salvando..." : "Salvar Plano"}
                    </Button>
                </div>
            </div>

            {/* Meal Editor Modal */}
            {isMealEditorOpen && (
                <MealEditorDialog
                    key={editingMeal?.id || "new-meal"}
                    isOpen={isMealEditorOpen}
                    onClose={() => { setIsMealEditorOpen(false); setEditingMeal(null); }}
                    onSave={handleSaveMeal}
                    existingMeal={editingMeal}
                />
            )}
        </div>
    );
}
