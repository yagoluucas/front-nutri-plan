"use client";

import React, { useMemo, useState } from "react";
import {
  Check,
  ChevronDown,
  ChevronUp,
  Pencil,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import { toast } from "sonner";
import Button from "@/src/components/ui/Button";
import Input from "@/src/components/ui/Input";
import Label from "@/src/components/ui/Label";
import FoodSearchCombobox from "./FoodSearchCombobox";
import MealOptionNutritionSummary from "./MealOptionNutritionSummary";
import {
  IAlimentoAutocomplete,
  IAlimentoDetail,
  IMeal,
  IMealFood,
} from "../types/dietPlan.types";
import { getFoodDetail } from "../services/foods.service";
import {
  buildMealFood,
  calculateMealMacros,
  recalculateMealFood,
} from "../utils/nutritionCalculations";

interface MealEditorDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (meal: IMeal) => void;
  existingMeal?: IMeal | null;
}

const DEFAULT_MEAL_NAMES = [
  "Café da Manhã",
  "Lanche da Manhã",
  "Almoço",
  "Lanche da Tarde",
  "Jantar",
  "Ceia",
];

function cloneMealFoods(foods: IMealFood[]) {
  return foods.map((food) => ({
    ...food,
    medidaSelecionada: { ...food.medidaSelecionada },
    medidasCaseiras: food.medidasCaseiras.map((medida) => ({ ...medida })),
    macros: { ...food.macros },
    nutrientesCompletos: food.nutrientesCompletos.map((nutrient) => ({
      ...nutrient,
    })),
    nutrientesOriginais: food.nutrientesOriginais?.map((nutrient) => ({
      ...nutrient,
    })),
  }));
}

function createMealDraft(existingMeal?: IMeal | null) {
  return {
    nome: existingMeal?.nome || "",
    horario: existingMeal?.horario || "",
    observacoes: existingMeal?.observacoes || "",
    alimentos: cloneMealFoods(existingMeal?.alimentos || []),
    substituicaoObservacoes: existingMeal?.substituicao?.observacoes || "",
    substituicaoAlimentos: cloneMealFoods(
      existingMeal?.substituicao?.alimentos || [],
    ),
  };
}

export default function MealEditorDialog({
  isOpen,
  onClose,
  onSave,
  existingMeal,
}: MealEditorDialogProps) {
  const initialDraft = useMemo(
    () => createMealDraft(existingMeal),
    [existingMeal],
  );
  const [nome, setNome] = useState(initialDraft.nome);
  const [horario, setHorario] = useState(initialDraft.horario);
  const [observacoes, setObservacoes] = useState(initialDraft.observacoes);
  const [alimentos, setAlimentos] = useState<IMealFood[]>(
    initialDraft.alimentos,
  );
  const [substituicaoObservacoes, setSubstituicaoObservacoes] = useState(
    initialDraft.substituicaoObservacoes,
  );
  const [substituicaoAlimentos, setSubstituicaoAlimentos] = useState<
    IMealFood[]
  >(initialDraft.substituicaoAlimentos);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [selectedFoodDetail, setSelectedFoodDetail] =
    useState<IAlimentoDetail | null>(null);
  const [medidaSelecionadaIndex, setMedidaSelecionadaIndex] = useState(0);
  const [quantidade, setQuantidade] = useState("1");
  const [isLoadingFood, setIsLoadingFood] = useState(false);
  const [selectedSubstitutionFoodDetail, setSelectedSubstitutionFoodDetail] =
    useState<IAlimentoDetail | null>(null);
  const [substituicaoMedidaIndex, setSubstituicaoMedidaIndex] = useState(0);
  const [substituicaoQuantidade, setSubstituicaoQuantidade] = useState("1");
  const [isLoadingSubstitutionFood, setIsLoadingSubstitutionFood] =
    useState(false);

  if (!isOpen) return null;

  const isDirty =
    JSON.stringify({
      nome,
      horario,
      observacoes,
      alimentos,
      substituicaoObservacoes,
      substituicaoAlimentos,
    }) !== JSON.stringify(initialDraft);

  const handleCancelClick = () => {
    if (isDirty) {
      setShowCancelConfirm(true);
      return;
    }

    onClose();
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

    const newFood = buildMealFood(
      selectedFoodDetail,
      medidaSelecionadaIndex,
      qty,
    );
    setAlimentos((prev) => [...prev, newFood]);
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

    const newFood = buildMealFood(
      selectedSubstitutionFoodDetail,
      substituicaoMedidaIndex,
      qty,
    );
    setSubstituicaoAlimentos((prev) => [...prev, newFood]);
    setSelectedSubstitutionFoodDetail(null);
  };

  const handleRemoveFood = (id: string) => {
    setAlimentos((prev) => prev.filter((food) => food.id !== id));
  };

  const handleUpdateFood = (updated: IMealFood) => {
    setAlimentos((prev) =>
      prev.map((food) => (food.id === updated.id ? updated : food)),
    );
  };

  const handleRemoveSubstitutionFood = (id: string) => {
    setSubstituicaoAlimentos((prev) => prev.filter((food) => food.id !== id));
  };

  const handleUpdateSubstitutionFood = (updated: IMealFood) => {
    setSubstituicaoAlimentos((prev) =>
      prev.map((food) => (food.id === updated.id ? updated : food)),
    );
  };

  const handleSaveMeal = () => {
    if (!nome.trim()) {
      toast.error("Informe o nome da refeição.");
      return;
    }

    if (!horario) {
      toast.error("Informe o horário da refeição.");
      return;
    }

    if (alimentos.length === 0) {
      toast.error("Adicione pelo menos um alimento na opcao principal.");
      return;
    }

    const meal: IMeal = {
      id: existingMeal?.id ?? crypto.randomUUID(),
      nome,
      horario,
      observacoes,
      alimentos,
      totalMacros: calculateMealMacros(alimentos),
      substituicao:
        substituicaoAlimentos.length > 0
          ? {
              id: existingMeal?.substituicao?.id ?? crypto.randomUUID(),
              titulo: "Substituição",
              observacoes: substituicaoObservacoes,
              alimentos: substituicaoAlimentos,
              totalMacros: calculateMealMacros(substituicaoAlimentos),
            }
          : undefined,
    };

    onSave(meal);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      {showCancelConfirm && (
        <div className="absolute inset-0 z-60 flex items-center justify-center bg-black/60">
          <div className="w-full max-w-sm rounded-xl bg-surface-default p-6 shadow-lg">
            <h3 className="mb-2 text-heading-h4 font-bold text-content-primary">
              Deseja realmente cancelar?
            </h3>
            <p className="mb-6 text-body-default text-content-secondary">
              Todos os dados desta refeição serão perdidos.
            </p>
            <div className="flex justify-end gap-3">
              <Button
                variant="ghost"
                onClick={() => setShowCancelConfirm(false)}
              >
                Não, voltar
              </Button>
              <Button variant="destructive" onClick={confirmCancel}>
                Sim, cancelar
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="flex max-h-[90vh] w-full max-w-3xl flex-col rounded-2xl bg-surface-default shadow-xl">
        <div className="flex items-center justify-between border-b border-border-subtle p-6">
          <h2 className="text-heading-h3 font-bold text-content-primary">
            {existingMeal ? "Editar refeição" : "Nova refeição"}
          </h2>
          <button
            type="button"
            onClick={handleCancelClick}
            className="cursor-pointer rounded-lg p-1 text-content-secondary transition-colors hover:bg-surface-muted hover:text-content-primary"
          >
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 space-y-6 overflow-y-auto p-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="meal_nome">Nome da refeição</Label>
              <Input
                id="meal_nome"
                type="text"
                list="meal_names"
                placeholder="Ex: Café da Manhã"
                value={nome}
                onChange={(event) => setNome(event.target.value)}
              />
              <datalist id="meal_names">
                {DEFAULT_MEAL_NAMES.map((mealName) => (
                  <option key={mealName} value={mealName} />
                ))}
              </datalist>
            </div>
            <div className="space-y-2">
              <Label htmlFor="meal_horario">horário</Label>
              <Input
                id="meal_horario"
                type="time"
                value={horario}
                onChange={(event) => setHorario(event.target.value)}
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
              onChange={(event) => setObservacoes(event.target.value)}
            />
          </div>

          <div className="h-px bg-border-subtle" />

          <div className="space-y-4">
            <h3 className="text-heading-h4 font-bold text-content-primary">
              Buscar Alimento
            </h3>
            <FoodSearchCombobox onSelectFood={handleSelectFoodFromCombobox} />
            {isLoadingFood && (
              <p className="animate-pulse text-body-small text-brand-600">
                Carregando detalhes...
              </p>
            )}

            {selectedFoodDetail && (
              <div className="animate-in rounded-xl border border-brand-200 bg-brand-50 p-4 fade-in slide-in-from-top-2">
                <div className="mb-4 flex items-start justify-between">
                  <div>
                    <p className="mb-1 text-caption font-medium uppercase tracking-wider text-brand-700">
                      Alimento selecionado
                    </p>
                    <h4 className="text-body-large font-semibold text-content-primary">
                      {selectedFoodDetail.nomeAlimento}
                    </h4>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedFoodDetail(null)}
                    className="cursor-pointer p-1 text-content-secondary hover:text-content-primary"
                  >
                    <X size={18} />
                  </button>
                </div>

                <div className="grid grid-cols-1 items-end gap-4 md:grid-cols-3">
                  <div className="space-y-2 md:col-span-2">
                    <Label>Medida Caseira</Label>
                    <select
                      className="h-11 w-full cursor-pointer rounded-lg border border-border-default bg-surface-default px-4 text-body-default text-content-primary shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action-primary-focus"
                      value={medidaSelecionadaIndex}
                      onChange={(event) =>
                        setMedidaSelecionadaIndex(Number(event.target.value))
                      }
                    >
                      {selectedFoodDetail.medidasCaseiras.map(
                        (medida, index) => (
                          <option key={index} value={index}>
                            {medida.nomeMedida} ({medida.total}
                            {medida.unidadeMedida})
                          </option>
                        ),
                      )}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label>Quantidade</Label>
                    <input
                      type="number"
                      step="0.5"
                      min="0.1"
                      value={quantidade}
                      onChange={(event) => setQuantidade(event.target.value)}
                      onWheel={(event) => event.currentTarget.blur()}
                      className="h-11 w-full rounded-lg border border-border-default bg-surface-default px-4 text-body-default text-content-primary shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action-primary-focus"
                    />
                  </div>
                </div>

                <div className="mt-4 flex justify-end">
                  <Button variant="primary" onClick={handleAddFood}>
                    <Plus size={18} className="mr-2" />
                    Adicionar Alimento
                  </Button>
                </div>
              </div>
            )}
          </div>

          {alimentos.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-heading-h4 font-bold text-content-primary">
                Alimentos desta refeição
                <span className="ml-2 text-caption font-normal text-content-muted">
                  ({alimentos.length})
                </span>
              </h3>
              <div className="divide-y divide-border-subtle overflow-hidden rounded-xl border border-border-default">
                {alimentos.map((food) => (
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

          {alimentos.length > 0 && (
            <MealOptionNutritionSummary
              label="Resumo da opção principal"
              foods={alimentos}
            />
          )}

          <div className="h-px bg-border-subtle" />

          <div className="space-y-4">
            <div>
              <h3 className="text-heading-h4 font-bold text-content-primary">
                Substituicao da Refeicao
              </h3>
              <p className="mt-1 text-body-small text-content-secondary">
                Monte uma opcao alternativa para esta mesma refeicao.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="meal_substitution_obs">
                Observacoes da substituicao (opcional)
              </Label>
              <Input
                id="meal_substitution_obs"
                type="text"
                placeholder="Ex: usar quando estiver fora de casa"
                value={substituicaoObservacoes}
                onChange={(event) =>
                  setSubstituicaoObservacoes(event.target.value)
                }
              />
            </div>

            <FoodSearchCombobox onSelectFood={handleSelectSubstitutionFood} />
            {isLoadingSubstitutionFood && (
              <p className="animate-pulse text-body-small text-brand-600">
                Carregando detalhes...
              </p>
            )}

            {selectedSubstitutionFoodDetail && (
              <div className="animate-in rounded-xl border border-brand-200 bg-brand-50 p-4 fade-in slide-in-from-top-2">
                <div className="mb-4 flex items-start justify-between">
                  <div>
                    <p className="mb-1 text-caption font-medium uppercase tracking-wider text-brand-700">
                      Alimento selecionado
                    </p>
                    <h4 className="text-body-large font-semibold text-content-primary">
                      {selectedSubstitutionFoodDetail.nomeAlimento}
                    </h4>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedSubstitutionFoodDetail(null)}
                    className="cursor-pointer p-1 text-content-secondary hover:text-content-primary"
                  >
                    <X size={18} />
                  </button>
                </div>

                <div className="grid grid-cols-1 items-end gap-4 md:grid-cols-3">
                  <div className="space-y-2 md:col-span-2">
                    <Label>Medida Caseira</Label>
                    <select
                      className="h-11 w-full cursor-pointer rounded-lg border border-border-default bg-surface-default px-4 text-body-default text-content-primary shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action-primary-focus"
                      value={substituicaoMedidaIndex}
                      onChange={(event) =>
                        setSubstituicaoMedidaIndex(Number(event.target.value))
                      }
                    >
                      {selectedSubstitutionFoodDetail.medidasCaseiras.map(
                        (medida, index) => (
                          <option key={index} value={index}>
                            {medida.nomeMedida} ({medida.total}
                            {medida.unidadeMedida})
                          </option>
                        ),
                      )}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label>Quantidade</Label>
                    <input
                      type="number"
                      step="0.5"
                      min="0.1"
                      value={substituicaoQuantidade}
                      onChange={(event) =>
                        setSubstituicaoQuantidade(event.target.value)
                      }
                      onWheel={(event) => event.currentTarget.blur()}
                      className="h-11 w-full rounded-lg border border-border-default bg-surface-default px-4 text-body-default text-content-primary shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action-primary-focus"
                    />
                  </div>
                </div>

                <div className="mt-4 flex justify-end">
                  <Button variant="primary" onClick={handleAddSubstitutionFood}>
                    <Plus size={18} className="mr-2" />
                    Adicionar substituicao
                  </Button>
                </div>
              </div>
            )}
          </div>

          {substituicaoAlimentos.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-heading-h4 font-bold text-content-primary">
                Alimentos da Substituicao
                <span className="ml-2 text-caption font-normal text-content-muted">
                  ({substituicaoAlimentos.length})
                </span>
              </h3>
              <div className="divide-y divide-border-subtle overflow-hidden rounded-xl border border-border-default">
                {substituicaoAlimentos.map((food) => (
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

          {substituicaoAlimentos.length > 0 && (
            <MealOptionNutritionSummary
              label="Resumo da opção substituta"
              foods={substituicaoAlimentos}
              accent="substitution"
              comparisonFoods={alimentos}
            />
          )}
        </div>

        <div className="flex items-center justify-between rounded-b-2xl border-t border-border-subtle bg-surface-muted/50 p-6">
          <span className="text-body-small text-content-muted">
            {alimentos.length}{" "}
            {alimentos.length === 1 ? "alimento" : "alimentos"}
          </span>
          <div className="flex gap-3">
            <Button variant="ghost" onClick={handleCancelClick}>
              Cancelar
            </Button>
            <Button variant="primary" onClick={handleSaveMeal}>
              {existingMeal ? "Salvar Edição" : "Salvar refeição"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

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
  const [editMedidaIndex, setEditMedidaIndex] = useState(
    food.medidasCaseiras.findIndex(
      (medida) => medida.nomeMedida === food.medidaSelecionada.nomeMedida,
    ) || 0,
  );

  const handleSaveEdit = () => {
    const qty = parseFloat(editQty);
    if (isNaN(qty) || qty <= 0) return;

    onUpdate(recalculateMealFood(food, editMedidaIndex, qty));
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    const selectedIndex = food.medidasCaseiras.findIndex(
      (medida) => medida.nomeMedida === food.medidaSelecionada.nomeMedida,
    );

    setEditQty(String(food.quantidade));
    setEditMedidaIndex(selectedIndex >= 0 ? selectedIndex : 0);
    setIsEditing(false);
  };

  const isLongName = food.nomeAlimento.length > 40;
  const displayName =
    isLongName && !showFullName
      ? `${food.nomeAlimento.slice(0, 40)}...`
      : food.nomeAlimento;

  return (
    <div className="bg-surface-default p-4 transition-colors hover:bg-surface-muted/30">
      <div className="mb-2 flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
            <p className="leading-snug text-content-primary font-semibold">
              {displayName}
            {isLongName && (
              <button
                type="button"
                onClick={() => setShowFullName((current) => !current)}
                className="ml-1 cursor-pointer text-caption text-brand-600 hover:underline focus:outline-none"
              >
                {showFullName ? "ver menos" : "ver mais"}
              </button>
            )}
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-1">
          {!isEditing && (
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="cursor-pointer rounded-lg p-1.5 text-content-secondary transition-colors hover:bg-brand-50 hover:text-action-primary"
              title="Editar alimento"
            >
              <Pencil size={16} />
            </button>
          )}
          <button
            type="button"
            onClick={() => setShowMicros((current) => !current)}
            className="cursor-pointer rounded-lg p-1.5 text-content-secondary transition-colors hover:bg-surface-muted hover:text-content-primary"
            title="Ver micronutrientes"
          >
            {showMicros ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
          {!isEditing && (
            <button
              type="button"
              onClick={onRemove}
              className="cursor-pointer rounded-lg p-1.5 text-content-secondary transition-colors hover:bg-feedback-error-bg hover:text-feedback-error-solid"
              title="Remover alimento"
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>
      </div>

      {isEditing ? (
        <div className="mt-2 space-y-3 rounded-lg border border-brand-200 bg-brand-50 p-3">
          <p className="text-caption font-medium text-brand-700">
            Editar quantidade e medida
          </p>
          <div className="grid grid-cols-1 items-end gap-3 sm:grid-cols-3">
            <div className="space-y-1 sm:col-span-2">
              <label className="text-caption text-content-secondary">
                Medida Caseira
              </label>
              <select
                className="h-10 w-full cursor-pointer rounded-lg border border-border-default bg-surface-default px-3 text-body-small text-content-primary focus:outline-none focus:ring-2 focus:ring-action-primary-focus"
                value={editMedidaIndex}
                onChange={(event) =>
                  setEditMedidaIndex(Number(event.target.value))
                }
              >
                {food.medidasCaseiras.map((medida, index) => (
                  <option key={index} value={index}>
                    {medida.nomeMedida} ({medida.total}
                    {medida.unidadeMedida})
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-caption text-content-secondary">
                Quantidade
              </label>
              <input
                type="number"
                step="0.5"
                min="0.1"
                value={editQty}
                onChange={(event) => setEditQty(event.target.value)}
                onWheel={(event) => event.currentTarget.blur()}
                className="h-10 w-full rounded-lg border border-border-default bg-surface-default px-3 text-body-small text-content-primary focus:outline-none focus:ring-2 focus:ring-action-primary-focus"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={handleCancelEdit}
              className="cursor-pointer rounded-lg px-3 py-1.5 text-body-small text-content-secondary transition-colors hover:bg-surface-muted hover:text-content-primary"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSaveEdit}
              className="flex cursor-pointer items-center gap-1 rounded-lg bg-action-primary px-3 py-1.5 text-body-small font-semibold text-action-primary-text transition-colors hover:bg-action-primary-hover"
            >
              <Check size={14} />
              Confirmar
            </button>
          </div>
        </div>
      ) : (
        <div className="mt-1 flex flex-wrap gap-3 text-caption font-medium">
          <span className="hidden text-content-secondary">
            {food.quantidade}x {food.medidaSelecionada.nomeMedida} Â·{" "}
            {food.totalGramas.toFixed(0)}g
          </span>
          <span className="text-content-secondary">
            {food.quantidade}x {food.medidaSelecionada.nomeMedida} -{" "}
            {food.totalGramas.toFixed(0)}g
          </span>
          <span className="text-brand-700">
            Kcal: {food.macros.kcal.toFixed(1)}
          </span>
          <span className="text-action-primary">
            CHO: {food.macros.cho.toFixed(1)}g
          </span>
          <span className="text-blue-600">
            PTN: {food.macros.ptn.toFixed(1)}g
          </span>
          <span className="text-feedback-warning-text">
            LIP: {food.macros.lip.toFixed(1)}g
          </span>
        </div>
      )}

      {showMicros && !isEditing && (
        <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 border-t border-border-subtle pt-3 md:grid-cols-3 lg:grid-cols-4">
          {food.nutrientesCompletos
            .filter((nutrient) => nutrient.valorCalculado > 0)
            .map((nutrient, index) => (
              <div
                key={index}
                className="flex justify-between gap-2 border-b border-border-subtle pb-1 text-caption"
              >
                <span
                  className="truncate text-content-secondary"
                  title={nutrient.nomeComponente}
                >
                  {nutrient.nomeComponente}
                </span>
                <span className="shrink-0 font-medium text-content-primary">
                  {nutrient.valorCalculado.toFixed(1)}
                  {nutrient.unidadeUtilizada}
                </span>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
