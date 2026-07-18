import { z } from "zod";

export const backendMeasureSchema = z.object({
    nomeMedida: z.string(),
    total: z.number(),
    unidadeMedida: z.string(),
    tipoMedida: z.enum(["Caseira", "Tecnica"]),
});

export const backendFoodSchema = z.object({
    codigoAlimento: z.string(),
    quantidade: z.number(),
    medidaSelecionada: backendMeasureSchema,
});

export const backendMealSchema = z.object({
    nome: z.string(),
    horario: z.string(),
    observacoes: z.string().optional(),
    alimentos: z.array(backendFoodSchema),
});

export const backendDietPlanSchema = z.object({
    id: z.string().optional(),
    titulo: z.string().optional(),
    objetivoDoPlano: z.string().optional(),
    observacoesGerais: z.string().optional(),
    refeicoes: z.array(backendMealSchema),
});

export const dietPlanRequestSchema = z.object({
    titulo: z.string().trim().min(1).max(200).optional(),
    objetivoDoPlano: z.string().optional(),
    observacoesGerais: z.string().optional(),
    refeicoes: z.array(backendMealSchema),
}).strict();
