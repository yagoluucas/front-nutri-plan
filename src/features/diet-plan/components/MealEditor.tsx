"use client";

import React, { useState } from "react";
import { X, Plus, Trash2, ChevronDown, ChevronUp, Pencil, Check } from "lucide-react";
import Input from "@/src/components/ui/Input";
import Label from "@/src/components/ui/Label";
import Button from "@/src/components/ui/Button";
import FoodSearchCombobox from "./FoodSearchCombobox";
import { IAlimentoAutocomplete, IAlimentoDetail, IMeal, IMealFood } from "../types/dietPlan.types";
import { getFoodDetail } from "../services/foods.service";
import { toast } from "sonner";

interface MealEditorProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (meal: IMeal) => void;
    existingMeal?: IMeal | null; // for editing an existing meal
}

const DEFAULT_MEAL_NAMES = ["Café da Manhã", "Lanche da Manhã", "Almoço", "Lanche da Tarde", "Jantar", "Ceia"];

// Helper: recalculate all macros for a food given new measure index and quantity
function calcMealFood(base: IMealFood, medidaIndex: number, qty: number): IMealFood {
    const medida = base.medidasCaseiras[medidaIndex];
    const totalGramas = qty * medida.total;

    let cho = 0, ptn = 0, lip = 0, kcal = 0;
    const nutrientesCompletos = base.nutrientesCompletos.map(n => {
        // Back-calculate the original per-100g value from stored valorCalculado
        // We can't do that — instead we need the original nutrientes.
        // For edit, we reuse stored valorCalculado relative to original gramas stored.
        // Best approach: store the original raw nutrientes as well.
        return n; // keep as-is; full recalc only happens on initial add
    });

    // For edits, we recalculate proportionally from the existing macros per gram
    const originalGramas = base.totalGramas;
    if (originalGramas > 0) {
        const ratio = totalGramas / originalGramas;
        cho = base.macros.cho * ratio;
        ptn = base.macros.ptn * ratio;
        lip = base.macros.lip * ratio;
        kcal = base.macros.kcal * ratio;
    }

    return {
        ...base,
        medidaSelecionada: medida,
        quantidade: qty,
        totalGramas,
        macros: { cho, ptn, lip, kcal },
        nutrientesCompletos
    };
}

// Helper: full recalc from raw API data
function buildMealFood(detail: IAlimentoDetail, medidaIndex: number, qty: number, id?: string): IMealFood {
    const medida = detail.medidasCaseiras[medidaIndex];
    const totalGramas = qty * medida.total;
    const multiplier = totalGramas / 100;

    // Build nutrientesCompletos first with per-item calculated values
    const nutrientesCompletos = detail.nutrientes.map(n => ({
        nomeComponente: n.nomeComponente,
        valorCalculado: n.valorPor100G !== null ? n.valorPor100G * multiplier : 0,
        unidadeUtilizada: n.unidadeUtilizada,
    }));

    // Use a priority-based strategy to pick EXACTLY ONE field for each macro.
    // This avoids:
    //   - CHO double-count: "Carboidrato disponível" + "Carboidrato total" both matching
    //   - LIP 0.0g: "Lipídios" (i) vs "Lipídeos" (e) spelling mismatch
    let cho: number | null = null;
    let ptn: number | null = null;
    let lip: number | null = null;
    let kcal: number | null = null;

    for (const nutriente of nutrientesCompletos) {
        const name = nutriente.nomeComponente.toLowerCase().trim();
        const unit = nutriente.unidadeUtilizada.toLowerCase().trim();
        const val  = nutriente.valorCalculado;

        // — KCAL: only "Energia" fields with kcal unit (not kJ) —
        if (kcal === null && name.includes('energia') && unit === 'kcal') {
            kcal = val;
        }

        // — CHO: "Carboidrato disponível" takes priority over "Carboidrato total" —
        if (name.includes('carboidrato disponív') || name.includes('carboidrato disponiv')) {
            cho = val; // highest priority — overwrite even if already set by total
        } else if (cho === null && name.includes('carboidrato')) {
            cho = val; // fallback to any carboidrato (e.g. "Carboidrato total")
        }

        // — PTN: first field that contains 'prote' —
        if (ptn === null && (name.includes('proteína') || name.includes('proteina') || name.startsWith('prote'))) {
            ptn = val;
        }

        // — LIP: covers 'Lipídios' (TACO) and 'Lipídeos' and 'Gordura total' —
        if (lip === null && (
            name.includes('lipídi') ||   // Lipídios
            name.includes('lipídeo') ||  // Lipídeos
            name.includes('lipidio') ||  // without accent
            name.includes('lipideo') ||  // without accent
            name === 'lipídios' ||
            name === 'lipídeos' ||
            name.includes('gordura total')
        )) {
            lip = val;
        }
    }

    return {
        id: id ?? crypto.randomUUID(),
        codigoAlimento: detail.codigoAlimento,
        nomeAlimento: detail.nomeAlimento,
        medidasCaseiras: detail.medidasCaseiras,
        medidaSelecionada: medida,
        quantidade: qty,
        totalGramas,
        macros: { cho: cho ?? 0, ptn: ptn ?? 0, lip: lip ?? 0, kcal: kcal ?? 0 },
        nutrientesCompletos
    };
}

export default function MealEditor({ isOpen, onClose, onSave, existingMeal }: MealEditorProps) {
    const [nome, setNome] = useState(existingMeal?.nome || "");
    const [horario, setHorario] = useState(existingMeal?.horario || "");
    const [observacoes, setObservacoes] = useState(existingMeal?.observacoes || "");
    const [alimentos, setAlimentos] = useState<IMealFood[]>(existingMeal?.alimentos || []);
    const [substituicaoObservacoes, setSubstituicaoObservacoes] = useState(existingMeal?.substituicao?.observacoes || "");
    const [substituicaoAlimentos, setSubstituicaoAlimentos] = useState<IMealFood[]>(existingMeal?.substituicao?.alimentos || []);
    const [showCancelConfirm, setShowCancelConfirm] = useState(false);

    // State for adding a new food
    const [selectedFoodDetail, setSelectedFoodDetail] = useState<IAlimentoDetail | null>(null);
    const [medidaSelecionadaIndex, setMedidaSelecionadaIndex] = useState<number>(0);
    const [quantidade, setQuantidade] = useState<string>("1");
    const [isLoadingFood, setIsLoadingFood] = useState(false);
    const [selectedSubstitutionFoodDetail, setSelectedSubstitutionFoodDetail] = useState<IAlimentoDetail | null>(null);
    const [substituicaoMedidaIndex, setSubstituicaoMedidaIndex] = useState<number>(0);
    const [substituicaoQuantidade, setSubstituicaoQuantidade] = useState<string>("1");
    const [isLoadingSubstitutionFood, setIsLoadingSubstitutionFood] = useState(false);

    if (!isOpen) return null;

    const handleCancelClick = () => {
        const isDirty = nome || horario || alimentos.length > 0 || substituicaoAlimentos.length > 0;
        if (isDirty) setShowCancelConfirm(true);
        else onClose();
    };

    const confirmCancel = () => {
        setShowCancelConfirm(false);
        onClose();
    };

    const handleSelectFoodFromCombobox = async (food: IAlimentoAutocomplete) => {
        setIsLoadingFood(true);
        try {
            const detail = await getFoodDetail(food.codigoAlimento);
            setSelectedFoodDetail(detail);
            setMedidaSelecionadaIndex(0);
            setQuantidade("1");
        } catch {
            toast.error("Erro ao carregar detalhes do alimento.");
        } finally {
            setIsLoadingFood(false);
        }
    };

    const handleAddFood = () => {
        if (!selectedFoodDetail) return;
        const qty = parseFloat(quantidade);
        if (isNaN(qty) || qty <= 0) return;
        const newFood = buildMealFood(selectedFoodDetail, medidaSelecionadaIndex, qty);
        setAlimentos(prev => [...prev, newFood]);
        setSelectedFoodDetail(null);
    };

    const handleSelectSubstitutionFood = async (food: IAlimentoAutocomplete) => {
        setIsLoadingSubstitutionFood(true);
        try {
            const detail = await getFoodDetail(food.codigoAlimento);
            setSelectedSubstitutionFoodDetail(detail);
            setSubstituicaoMedidaIndex(0);
            setSubstituicaoQuantidade("1");
        } catch {
            toast.error("Erro ao carregar detalhes do alimento.");
        } finally {
            setIsLoadingSubstitutionFood(false);
        }
    };

    const handleAddSubstitutionFood = () => {
        if (!selectedSubstitutionFoodDetail) return;
        const qty = parseFloat(substituicaoQuantidade);
        if (isNaN(qty) || qty <= 0) return;
        const newFood = buildMealFood(selectedSubstitutionFoodDetail, substituicaoMedidaIndex, qty);
        setSubstituicaoAlimentos(prev => [...prev, newFood]);
        setSelectedSubstitutionFoodDetail(null);
    };

    const handleRemoveFood = (id: string) => {
        setAlimentos(prev => prev.filter(a => a.id !== id));
    };

    const handleUpdateFood = (updated: IMealFood) => {
        setAlimentos(prev => prev.map(a => a.id === updated.id ? updated : a));
    };

    const handleRemoveSubstitutionFood = (id: string) => {
        setSubstituicaoAlimentos(prev => prev.filter(a => a.id !== id));
    };

    const handleUpdateSubstitutionFood = (updated: IMealFood) => {
        setSubstituicaoAlimentos(prev => prev.map(a => a.id === updated.id ? updated : a));
    };

    const handleSaveMeal = () => {
        if (!nome.trim()) { toast.error("Informe o nome da refeição."); return; }
        if (!horario) { toast.error("Informe o horário da refeição."); return; }
        if (alimentos.length === 0) { toast.error("Adicione pelo menos um alimento na opcao principal."); return; }
        if (substituicaoAlimentos.length === 0) { toast.error("Adicione pelo menos um alimento na substituicao."); return; }

        const totalMacros = alimentos.reduce((acc, a) => ({
            cho: acc.cho + a.macros.cho,
            ptn: acc.ptn + a.macros.ptn,
            lip: acc.lip + a.macros.lip,
            kcal: acc.kcal + a.macros.kcal,
        }), { cho: 0, ptn: 0, lip: 0, kcal: 0 });

        const substituicaoTotalMacros = substituicaoAlimentos.reduce((acc, a) => ({
            cho: acc.cho + a.macros.cho,
            ptn: acc.ptn + a.macros.ptn,
            lip: acc.lip + a.macros.lip,
            kcal: acc.kcal + a.macros.kcal,
        }), { cho: 0, ptn: 0, lip: 0, kcal: 0 });

        const meal: IMeal = {
            id: existingMeal?.id ?? crypto.randomUUID(),
            nome,
            horario,
            observacoes,
            alimentos,
            totalMacros,
            substituicao: {
                id: existingMeal?.substituicao?.id ?? crypto.randomUUID(),
                titulo: "Substituicao",
                observacoes: substituicaoObservacoes,
                alimentos: substituicaoAlimentos,
                totalMacros: substituicaoTotalMacros,
            },
        };

        onSave(meal);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            {/* Cancel Confirmation */}
            {showCancelConfirm && (
                <div className="absolute inset-0 z-[60] flex items-center justify-center bg-black/60">
                    <div className="bg-surface-default p-6 rounded-xl max-w-sm w-full shadow-lg">
                        <h3 className="text-heading-h4 font-bold text-content-primary mb-2">Deseja realmente cancelar?</h3>
                        <p className="text-body-default text-content-secondary mb-6">Todos os dados desta refeição serão perdidos.</p>
                        <div className="flex justify-end gap-3">
                            <Button variant="ghost" onClick={() => setShowCancelConfirm(false)}>Não, voltar</Button>
                            <Button variant="destructive" onClick={confirmCancel}>Sim, cancelar</Button>
                        </div>
                    </div>
                </div>
            )}

            <div className="bg-surface-default rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-xl">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-border-subtle">
                    <h2 className="text-heading-h3 font-bold text-content-primary">
                        {existingMeal ? "Editar Refeição" : "Nova Refeição"}
                    </h2>
                    <button onClick={handleCancelClick} className="text-content-secondary hover:text-content-primary transition-colors p-1 rounded-lg hover:bg-surface-muted">
                        <X size={24} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 flex-1 overflow-y-auto space-y-6">
                    {/* Basic Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="meal_nome">Nome da Refeição</Label>
                            <Input
                                id="meal_nome"
                                type="text"
                                list="meal_names"
                                placeholder="Ex: Café da Manhã"
                                value={nome}
                                onChange={(e) => setNome(e.target.value)}
                            />
                            <datalist id="meal_names">
                                {DEFAULT_MEAL_NAMES.map(n => <option key={n} value={n} />)}
                            </datalist>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="meal_horario">Horário</Label>
                            <Input
                                id="meal_horario"
                                type="time"
                                value={horario}
                                onChange={(e) => setHorario(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="meal_obs">Observações (opcional)</Label>
                        <Input
                            id="meal_obs"
                            type="text"
                            placeholder="Ex: Comer 30 min antes do treino"
                            value={observacoes}
                            onChange={(e) => setObservacoes(e.target.value)}
                        />
                    </div>

                    <div className="h-px bg-border-subtle" />

                    {/* Add Food Section */}
                    <div className="space-y-4">
                        <h3 className="text-heading-h4 font-bold text-content-primary">Buscar Alimento</h3>
                        <FoodSearchCombobox onSelectFood={handleSelectFoodFromCombobox} />
                        {isLoadingFood && <p className="text-body-small text-brand-600 animate-pulse">Carregando detalhes...</p>}

                        {/* Selected Food Preview — "Add Food" card */}
                        {selectedFoodDetail && (
                            <div className="bg-brand-50 p-4 rounded-xl border border-brand-200 animate-in fade-in slide-in-from-top-2">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <p className="text-caption text-brand-700 font-medium uppercase tracking-wider mb-1">Alimento selecionado</p>
                                        <h4 className="font-semibold text-content-primary text-body-large">{selectedFoodDetail.nomeAlimento}</h4>
                                    </div>
                                    <button onClick={() => setSelectedFoodDetail(null)} className="text-content-secondary hover:text-content-primary p-1">
                                        <X size={18} />
                                    </button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                                    <div className="space-y-2 md:col-span-2">
                                        <Label>Medida Caseira</Label>
                                        <select
                                            className="w-full h-11 rounded-lg border border-border-default bg-surface-default px-4 text-body-default text-content-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action-primary-focus shadow-sm"
                                            value={medidaSelecionadaIndex}
                                            onChange={(e) => setMedidaSelecionadaIndex(Number(e.target.value))}
                                        >
                                            {selectedFoodDetail.medidasCaseiras.map((m, idx) => (
                                                <option key={idx} value={idx}>
                                                    {m.nomeMedida} ({m.total}{m.unidadeMedida})
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Quantidade</Label>
                                        <input
                                            type="number"
                                            step="0.5"
                                            min="0.1"
                                            value={quantidade}
                                            onChange={(e) => setQuantidade(e.target.value)}
                                            // FIX #1: Prevent scroll from changing the value
                                            onWheel={(e) => e.currentTarget.blur()}
                                            className="w-full h-11 rounded-lg border border-border-default bg-surface-default px-4 text-body-default text-content-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action-primary-focus shadow-sm"
                                        />
                                    </div>
                                </div>

                                <div className="mt-4 flex justify-end">
                                    {/* FIX #2: Button text is now "Adicionar Alimento" */}
                                    <Button variant="primary" onClick={handleAddFood}>
                                        <Plus size={18} className="mr-2" /> Adicionar Alimento
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Food List */}
                    {alimentos.length > 0 && (
                        <div className="space-y-3">
                            <h3 className="text-heading-h4 font-bold text-content-primary">
                                Alimentos desta Refeição
                                <span className="ml-2 text-caption font-normal text-content-muted">({alimentos.length})</span>
                            </h3>
                            <div className="border border-border-default rounded-xl overflow-hidden divide-y divide-border-subtle">
                                {alimentos.map(food => (
                                    <FoodListItem
                                        key={food.id}
                                        food={food}
                                        onRemove={() => handleRemoveFood(food.id)}
                                        onUpdate={handleUpdateFood}
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="h-px bg-border-subtle" />

                    <div className="space-y-4">
                        <div>
                            <h3 className="text-heading-h4 font-bold text-content-primary">Substituicao da Refeicao</h3>
                            <p className="mt-1 text-body-small text-content-secondary">
                                Monte uma opcao alternativa para esta mesma refeicao.
                            </p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="meal_substitution_obs">Observacoes da substituicao (opcional)</Label>
                            <Input
                                id="meal_substitution_obs"
                                type="text"
                                placeholder="Ex: usar quando estiver fora de casa"
                                value={substituicaoObservacoes}
                                onChange={(e) => setSubstituicaoObservacoes(e.target.value)}
                            />
                        </div>

                        <FoodSearchCombobox onSelectFood={handleSelectSubstitutionFood} />
                        {isLoadingSubstitutionFood && <p className="text-body-small text-brand-600 animate-pulse">Carregando detalhes...</p>}

                        {selectedSubstitutionFoodDetail && (
                            <div className="bg-brand-50 p-4 rounded-xl border border-brand-200 animate-in fade-in slide-in-from-top-2">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <p className="text-caption text-brand-700 font-medium uppercase tracking-wider mb-1">Alimento selecionado</p>
                                        <h4 className="font-semibold text-content-primary text-body-large">{selectedSubstitutionFoodDetail.nomeAlimento}</h4>
                                    </div>
                                    <button onClick={() => setSelectedSubstitutionFoodDetail(null)} className="text-content-secondary hover:text-content-primary p-1">
                                        <X size={18} />
                                    </button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                                    <div className="space-y-2 md:col-span-2">
                                        <Label>Medida Caseira</Label>
                                        <select
                                            className="w-full h-11 rounded-lg border border-border-default bg-surface-default px-4 text-body-default text-content-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action-primary-focus shadow-sm"
                                            value={substituicaoMedidaIndex}
                                            onChange={(e) => setSubstituicaoMedidaIndex(Number(e.target.value))}
                                        >
                                            {selectedSubstitutionFoodDetail.medidasCaseiras.map((m, idx) => (
                                                <option key={idx} value={idx}>
                                                    {m.nomeMedida} ({m.total}{m.unidadeMedida})
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Quantidade</Label>
                                        <input
                                            type="number"
                                            step="0.5"
                                            min="0.1"
                                            value={substituicaoQuantidade}
                                            onChange={(e) => setSubstituicaoQuantidade(e.target.value)}
                                            onWheel={(e) => e.currentTarget.blur()}
                                            className="w-full h-11 rounded-lg border border-border-default bg-surface-default px-4 text-body-default text-content-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action-primary-focus shadow-sm"
                                        />
                                    </div>
                                </div>

                                <div className="mt-4 flex justify-end">
                                    <Button variant="primary" onClick={handleAddSubstitutionFood}>
                                        <Plus size={18} className="mr-2" /> Adicionar substituicao
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>

                    {substituicaoAlimentos.length > 0 && (
                        <div className="space-y-3">
                            <h3 className="text-heading-h4 font-bold text-content-primary">
                                Alimentos da Substituicao
                                <span className="ml-2 text-caption font-normal text-content-muted">({substituicaoAlimentos.length})</span>
                            </h3>
                            <div className="border border-border-default rounded-xl overflow-hidden divide-y divide-border-subtle">
                                {substituicaoAlimentos.map(food => (
                                    <FoodListItem
                                        key={food.id}
                                        food={food}
                                        onRemove={() => handleRemoveSubstitutionFood(food.id)}
                                        onUpdate={handleUpdateSubstitutionFood}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-border-subtle flex justify-between items-center bg-surface-muted/50 rounded-b-2xl">
                    <span className="text-body-small text-content-muted">
                        {alimentos.length} {alimentos.length === 1 ? "alimento" : "alimentos"}
                    </span>
                    <div className="flex gap-3">
                        <Button variant="ghost" onClick={handleCancelClick}>Cancelar</Button>
                        <Button variant="primary" onClick={handleSaveMeal}>
                            {existingMeal ? "Salvar Edição" : "Salvar Refeição"}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ------- FoodListItem — FIX #3 (edit inline) & FIX #5 (truncated name) -------
interface FoodListItemProps {
    food: IMealFood;
    onRemove: () => void;
    onUpdate: (updated: IMealFood) => void;
}

function FoodListItem({ food, onRemove, onUpdate }: FoodListItemProps) {
    const [showMicros, setShowMicros] = useState(false);
    const [showFullName, setShowFullName] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editQty, setEditQty] = useState(String(food.quantidade));
    const [editMedidaIndex, setEditMedidaIndex] = useState(() =>
        food.medidasCaseiras.findIndex(m => m.nomeMedida === food.medidaSelecionada.nomeMedida) ?? 0
    );

    const handleSaveEdit = () => {
        const qty = parseFloat(editQty);
        if (isNaN(qty) || qty <= 0) return;
        const updated = calcMealFood(food, editMedidaIndex, qty);
        onUpdate(updated);
        setIsEditing(false);
    };

    const handleCancelEdit = () => {
        setEditQty(String(food.quantidade));
        setEditMedidaIndex(food.medidasCaseiras.findIndex(m => m.nomeMedida === food.medidaSelecionada.nomeMedida) ?? 0);
        setIsEditing(false);
    };

    const isLongName = food.nomeAlimento.length > 40;
    const displayName = isLongName && !showFullName
        ? food.nomeAlimento.slice(0, 40) + "…"
        : food.nomeAlimento;

    return (
        <div className="bg-surface-default p-4 hover:bg-surface-muted/30 transition-colors">
            {/* Name row */}
            <div className="flex justify-between items-start gap-2 mb-2">
                <div className="flex-1 min-w-0">
                    {/* FIX #5: Truncated name with expand toggle */}
                    <p className="font-semibold text-content-primary leading-snug">
                        {displayName}
                        {isLongName && (
                            <button
                                onClick={() => setShowFullName(!showFullName)}
                                className="ml-1 text-brand-600 text-caption hover:underline focus:outline-none"
                            >
                                {showFullName ? "ver menos" : "ver mais"}
                            </button>
                        )}
                    </p>
                </div>
                {/* Action buttons */}
                <div className="flex items-center gap-1 shrink-0">
                    {!isEditing && (
                        <button
                            onClick={() => setIsEditing(true)}
                            className="p-1.5 text-content-secondary hover:text-action-primary hover:bg-brand-50 transition-colors rounded-lg"
                            title="Editar alimento"
                        >
                            <Pencil size={16} />
                        </button>
                    )}
                    <button
                        onClick={() => setShowMicros(!showMicros)}
                        className="p-1.5 text-content-secondary hover:text-content-primary transition-colors rounded-lg hover:bg-surface-muted"
                        title="Ver micronutrientes"
                    >
                        {showMicros ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>
                    {!isEditing && (
                        <button
                            onClick={onRemove}
                            className="p-1.5 text-content-secondary hover:text-feedback-error-solid hover:bg-feedback-error-bg transition-colors rounded-lg"
                            title="Remover alimento"
                        >
                            <Trash2 size={16} />
                        </button>
                    )}
                </div>
            </div>

            {/* FIX #3: Inline edit mode */}
            {isEditing ? (
                <div className="mt-2 p-3 bg-brand-50 rounded-lg border border-brand-200 space-y-3">
                    <p className="text-caption text-brand-700 font-medium">Editar quantidade e medida</p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
                        <div className="space-y-1 sm:col-span-2">
                            <label className="text-caption text-content-secondary">Medida Caseira</label>
                            <select
                                className="w-full h-10 rounded-lg border border-border-default bg-surface-default px-3 text-body-small text-content-primary focus:outline-none focus:ring-2 focus:ring-action-primary-focus"
                                value={editMedidaIndex}
                                onChange={(e) => setEditMedidaIndex(Number(e.target.value))}
                            >
                                {food.medidasCaseiras.map((m, idx) => (
                                    <option key={idx} value={idx}>
                                        {m.nomeMedida} ({m.total}{m.unidadeMedida})
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="space-y-1">
                            <label className="text-caption text-content-secondary">Quantidade</label>
                            <input
                                type="number"
                                step="0.5"
                                min="0.1"
                                value={editQty}
                                onChange={(e) => setEditQty(e.target.value)}
                                onWheel={(e) => e.currentTarget.blur()}
                                className="w-full h-10 rounded-lg border border-border-default bg-surface-default px-3 text-body-small text-content-primary focus:outline-none focus:ring-2 focus:ring-action-primary-focus"
                            />
                        </div>
                    </div>
                    <div className="flex justify-end gap-2">
                        <button onClick={handleCancelEdit} className="text-body-small text-content-secondary hover:text-content-primary px-3 py-1.5 rounded-lg hover:bg-surface-muted transition-colors">
                            Cancelar
                        </button>
                        <button onClick={handleSaveEdit} className="text-body-small font-semibold text-action-primary-text bg-action-primary hover:bg-action-primary-hover px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1">
                            <Check size={14} /> Confirmar
                        </button>
                    </div>
                </div>
            ) : (
                <div className="flex flex-wrap gap-3 text-caption font-medium mt-1">
                    <span className="text-content-secondary">
                        {food.quantidade}x {food.medidaSelecionada.nomeMedida} · {food.totalGramas.toFixed(0)}g
                    </span>
                    <span className="text-brand-700">Kcal: {food.macros.kcal.toFixed(1)}</span>
                    <span className="text-action-primary">CHO: {food.macros.cho.toFixed(1)}g</span>
                    <span className="text-blue-600">PTN: {food.macros.ptn.toFixed(1)}g</span>
                    <span className="text-feedback-warning-text">LIP: {food.macros.lip.toFixed(1)}g</span>
                </div>
            )}

            {/* Micronutrients accordion */}
            {showMicros && !isEditing && (
                <div className="mt-3 pt-3 border-t border-border-subtle grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-y-2 gap-x-4">
                    {food.nutrientesCompletos
                        .filter(n => n.valorCalculado > 0)
                        .map((n, idx) => (
                            <div key={idx} className="text-caption flex justify-between gap-2 border-b border-border-subtle pb-1">
                                <span className="text-content-secondary truncate" title={n.nomeComponente}>{n.nomeComponente}</span>
                                <span className="text-content-primary font-medium shrink-0">{n.valorCalculado.toFixed(1)}{n.unidadeUtilizada}</span>
                            </div>
                        ))}
                </div>
            )}
        </div>
    );
}
