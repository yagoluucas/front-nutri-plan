"use client";

import React, { useState } from "react";
import { X, Plus, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import Input from "@/src/components/ui/Input";
import Label from "@/src/components/ui/Label";
import Button from "@/src/components/ui/Button";
import FoodSearchCombobox from "./FoodSearchCombobox";
import { IAlimentoAutocomplete, IAlimentoDetail, IMeal, IMealFood } from "../types/dietPlan.types";
import { getFoodDetail } from "../services/foods.service";

interface MealEditorProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (meal: IMeal) => void;
}

const DEFAULT_MEAL_NAMES = ["Café da Manhã", "Lanche da Manhã", "Almoço", "Lanche da Tarde", "Jantar", "Ceia"];

export default function MealEditor({ isOpen, onClose, onSave }: MealEditorProps) {
    if (!isOpen) return null;

    return <MealEditorContent onClose={onClose} onSave={onSave} />;
}

function MealEditorContent({ onClose, onSave }: Omit<MealEditorProps, "isOpen">) {
    const [nome, setNome] = useState("");
    const [horario, setHorario] = useState("");
    const [observacoes, setObservacoes] = useState("");
    const [alimentos, setAlimentos] = useState<IMealFood[]>([]);
    const [showCancelConfirm, setShowCancelConfirm] = useState(false);
    
    // State for the food currently being added
    const [selectedFoodDetail, setSelectedFoodDetail] = useState<IAlimentoDetail | null>(null);
    const [medidaSelecionadaIndex, setMedidaSelecionadaIndex] = useState<number>(0);
    const [quantidade, setQuantidade] = useState<string>("1");
    const [isLoadingFood, setIsLoadingFood] = useState(false);

    const handleCancelClick = () => {
        if (nome || horario || alimentos.length > 0) {
            setShowCancelConfirm(true);
        } else {
            onClose();
        }
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
        } catch (error) {
            console.error("Failed to fetch food details", error);
            // Handle error (could use a toast here)
        } finally {
            setIsLoadingFood(false);
        }
    };

    const handleAddFoodToMeal = () => {
        if (!selectedFoodDetail) return;
        
        const medida = selectedFoodDetail.medidasCaseiras[medidaSelecionadaIndex];
        const qty = parseFloat(quantidade);
        
        if (isNaN(qty) || qty <= 0) return;

        const totalGramas = qty * medida.total;
        const multiplier = totalGramas / 100;

        // Calculate macros
        let cho = 0;
        let ptn = 0;
        let lip = 0;
        let kcal = 0;

        const nutrientesCompletos = selectedFoodDetail.nutrientes.map(n => {
            const valorCalculado = n.valorPor100G !== null ? n.valorPor100G * multiplier : 0;
            
            // Map to macros based on common names (adjust if your DB uses different names)
            const nName = n.nomeComponente.toLowerCase();
            if (nName.includes('carboidrato')) cho += valorCalculado;
            else if (nName.includes('proteína') || nName.includes('proteina')) ptn += valorCalculado;
            else if (nName.includes('lipídeos') || nName.includes('lipideo') || nName.includes('gordura total')) lip += valorCalculado;
            else if (nName.includes('energia') && n.unidadeUtilizada.toLowerCase() === 'kcal') kcal += valorCalculado;

            return {
                nomeComponente: n.nomeComponente,
                valorCalculado,
                unidadeUtilizada: n.unidadeUtilizada
            };
        });

        const newMealFood: IMealFood = {
            id: crypto.randomUUID(),
            codigoAlimento: selectedFoodDetail.codigoAlimento,
            nomeAlimento: selectedFoodDetail.nomeAlimento,
            medidaSelecionada: medida,
            quantidade: qty,
            totalGramas,
            macros: { cho, ptn, lip, kcal },
            nutrientesCompletos
        };

        setAlimentos([...alimentos, newMealFood]);
        setSelectedFoodDetail(null); // Reset selection
    };

    const handleRemoveFood = (id: string) => {
        setAlimentos(alimentos.filter(a => a.id !== id));
    };

    const handleSaveMeal = () => {
        if (!nome || !horario || alimentos.length === 0) {
            alert("Preencha nome, horário e adicione pelo menos um alimento.");
            return;
        }

        let totalCho = 0, totalPtn = 0, totalLip = 0, totalKcal = 0;
        alimentos.forEach(a => {
            totalCho += a.macros.cho;
            totalPtn += a.macros.ptn;
            totalLip += a.macros.lip;
            totalKcal += a.macros.kcal;
        });

        const meal: IMeal = {
            id: crypto.randomUUID(),
            nome,
            horario,
            observacoes,
            alimentos,
            totalMacros: { cho: totalCho, ptn: totalPtn, lip: totalLip, kcal: totalKcal }
        };

        onSave(meal);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            {/* Cancel Confirmation Modal */}
            {showCancelConfirm && (
                <div className="absolute inset-0 z-[60] flex items-center justify-center bg-black/50">
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
                    <h2 className="text-heading-h3 font-bold text-content-primary">Nova Refeição</h2>
                    <button onClick={handleCancelClick} className="text-content-secondary hover:text-content-primary transition-colors">
                        <X size={24} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 flex-1 overflow-y-auto space-y-8">
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
                        <Label htmlFor="meal_obs">Observações da Refeição (Opcional)</Label>
                        <Input
                            id="meal_obs"
                            type="text"
                            placeholder="Ex: Comer 30 min antes do treino"
                            value={observacoes}
                            onChange={(e) => setObservacoes(e.target.value)}
                        />
                    </div>

                    <div className="h-px bg-border-subtle w-full" />

                    {/* Add Food Section */}
                    <div className="space-y-4">
                        <h3 className="text-heading-h4 font-bold text-content-primary">Adicionar Alimentos</h3>
                        
                        <FoodSearchCombobox onSelectFood={handleSelectFoodFromCombobox} />

                        {isLoadingFood && <p className="text-body-small text-brand-600">Carregando detalhes do alimento...</p>}

                        {/* Selected Food Form */}
                        {selectedFoodDetail && (
                            <div className="bg-brand-50 p-4 rounded-xl border border-brand-200 mt-4 animate-in fade-in slide-in-from-top-2">
                                <div className="flex justify-between items-start mb-4">
                                    <h4 className="font-semibold text-content-primary">{selectedFoodDetail.nomeAlimento}</h4>
                                    <button onClick={() => setSelectedFoodDetail(null)} className="text-content-secondary hover:text-content-primary">
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
                                        <Input
                                            type="number"
                                            step="0.1"
                                            min="0.1"
                                            value={quantidade}
                                            onChange={(e) => setQuantidade(e.target.value)}
                                        />
                                    </div>
                                </div>
                                
                                <div className="mt-4 flex justify-end">
                                    <Button variant="primary" onClick={handleAddFoodToMeal} className="py-2">
                                        <Plus size={18} className="mr-2" /> Adicionar à Refeição
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Food List */}
                    {alimentos.length > 0 && (
                        <div className="space-y-4">
                            <h3 className="text-heading-h4 font-bold text-content-primary">Alimentos Adicionados</h3>
                            <div className="border border-border-default rounded-xl overflow-hidden divide-y divide-border-subtle">
                                {alimentos.map(food => (
                                    <FoodListItem key={food.id} food={food} onRemove={() => handleRemoveFood(food.id)} />
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-border-subtle flex justify-end gap-3 bg-surface-muted/50 rounded-b-2xl">
                    <Button variant="ghost" onClick={handleCancelClick}>Cancelar</Button>
                    <Button variant="primary" onClick={handleSaveMeal}>Salvar Refeição</Button>
                </div>
            </div>
        </div>
    );
}

// Subcomponent for the food list item with collapsible micronutrients
function FoodListItem({ food, onRemove }: { food: IMealFood, onRemove: () => void }) {
    const [showMicros, setShowMicros] = useState(false);

    return (
        <div className="bg-surface-default p-4 hover:bg-surface-muted/50 transition-colors">
            <div className="flex justify-between items-start gap-4">
                <div className="flex-1">
                    <p className="font-semibold text-content-primary">{food.nomeAlimento}</p>
                    <p className="text-body-small text-content-secondary mt-1">
                        {food.quantidade}x {food.medidaSelecionada.nomeMedida} ({food.totalGramas.toFixed(1)}g)
                    </p>
                    <div className="flex gap-4 mt-2 text-caption font-medium">
                        <span className="text-brand-700">Kcal: {food.macros.kcal.toFixed(1)}</span>
                        <span className="text-action-primary">CHO: {food.macros.cho.toFixed(1)}g</span>
                        <span className="text-blue-600">PTN: {food.macros.ptn.toFixed(1)}g</span>
                        <span className="text-feedback-warning-text">LIP: {food.macros.lip.toFixed(1)}g</span>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button 
                        onClick={() => setShowMicros(!showMicros)}
                        className="p-2 text-content-tertiary hover:text-content-primary transition-colors rounded-lg hover:bg-border-subtle"
                        title="Ver micronutrientes"
                    >
                        {showMicros ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </button>
                    <button 
                        onClick={onRemove}
                        className="p-2 text-content-tertiary hover:text-feedback-error-solid transition-colors rounded-lg hover:bg-feedback-error-bg"
                        title="Remover alimento"
                    >
                        <Trash2 size={18} />
                    </button>
                </div>
            </div>
            
            {showMicros && (
                <div className="mt-4 pt-4 border-t border-border-subtle grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-y-2 gap-x-4">
                    {food.nutrientesCompletos
                        .filter(n => n.valorCalculado > 0)
                        .map((n, idx) => (
                            <div key={idx} className="text-caption flex justify-between gap-2 border-b border-border-subtle pb-1">
                                <span className="text-content-secondary truncate" title={n.nomeComponente}>{n.nomeComponente}</span>
                                <span className="text-content-primary font-medium">{n.valorCalculado.toFixed(1)}{n.unidadeUtilizada}</span>
                            </div>
                        ))}
                </div>
            )}
        </div>
    );
}
