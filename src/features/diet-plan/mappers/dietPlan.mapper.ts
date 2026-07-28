import {
    dietPlanRequestSchema,
    type DietPlanRequest,
} from "../schemas/dietPlan.schemas";
import type { IDietPlanState } from "../types/dietPlan.types";

function optionalString(value: string): string | undefined {
    const trimmed = value.trim();
    return trimmed || undefined;
}

export function mapDietPlanToRequest(plan: IDietPlanState): DietPlanRequest {
    return dietPlanRequestSchema.parse({
        tituloPlano: optionalString(plan.tituloPlano),
        objetivoDoPlano: optionalString(plan.objetivoDoPlano),
        observacoesGerais: optionalString(plan.orientacoesGerais),
        planoAtivo: plan.planoAtivo,
        refeicoes: plan.refeicoes.map((meal) => ({
            nome: meal.nome,
            horario: meal.horario,
            observacoes: optionalString(meal.observacoes),
            alimentos: meal.alimentos.map((food) => ({
                codigoAlimento: food.codigoAlimento,
                quantidade: food.quantidade,
                medidaSelecionada: food.medidaSelecionada,
            })),
        })),
    });
}
