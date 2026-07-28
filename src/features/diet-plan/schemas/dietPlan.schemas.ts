import { z } from "zod";

export const nutrientSchema = z.object({
    nomeComponente: z.string(),
    valorPor100G: z.number().nullable(),
    unidadeUtilizada: z.string(),
});

export const measureSchema = z.object({
    nomeMedida: z.string(),
    total: z.number(),
    unidadeMedida: z.string(),
    tipoMedida: z.enum(["Caseira", "Tecnica"]),
});

export const backendMeasureSchema = measureSchema;

export const foodAutocompleteSchema = z.object({
    codigoAlimento: z.string(),
    nomeAlimento: z.string(),
});

export const foodDetailSchema = foodAutocompleteSchema.extend({
    linkAlimento: z.string(),
    grupo: z.string().nullable(),
    marca: z.string().nullable(),
    nutrientes: z.array(nutrientSchema),
    medidasCaseiras: z.array(measureSchema),
});

export const foodAutocompleteApiResponseSchema = z.object({
    alimentos: z.array(foodAutocompleteSchema).default([]),
    message: z.string().optional(),
    page: z.number().optional(),
    hasNextPage: z.boolean().optional(),
}).passthrough();

export const foodDetailApiResponseSchema = z.object({
    alimentos: z.array(foodDetailSchema).default([]),
    message: z.string().optional(),
}).passthrough();

export const foodSearchResponseSchema = z.object({
    alimentos: z.array(foodAutocompleteSchema),
    page: z.number(),
    hasNextPage: z.boolean(),
});

export const backendFoodSchema = z.object({
    codigoAlimento: z.string(),
    quantidade: z.number(),
    medidaSelecionada: measureSchema,
});

export const backendMealSchema = z.object({
    nome: z.string(),
    horario: z.string(),
    observacoes: z.string().optional(),
    alimentos: z.array(backendFoodSchema),
});

export const backendDietPlanSchema = z.object({
    id: z.string().optional(),
    tituloPlano: z.string().optional(),
    objetivoDoPlano: z.string().optional(),
    observacoesGerais: z.string().optional(),
    planoAtivo: z.boolean().default(false),
    refeicoes: z.array(backendMealSchema),
    createdAt: z.string().optional(),
    updatedAt: z.string().optional(),
});

export const persistedDietPlanSchema = backendDietPlanSchema.extend({
    id: z.string().trim().min(1),
});

export const dietPlanRequestSchema = z.object({
    tituloPlano: z.string().trim().min(1).max(200).optional(),
    objetivoDoPlano: z.string().trim().max(500).optional(),
    observacoesGerais: z.string().trim().max(2_000).optional(),
    planoAtivo: z.boolean().default(false),
    refeicoes: z.array(backendMealSchema),
}).strict();

export const macroTotalsSchema = z.object({
    cho: z.number(),
    ptn: z.number(),
    lip: z.number(),
    kcal: z.number(),
});

export const nutrientTotalSchema = z.object({
    nomeComponente: z.string(),
    unidadeUtilizada: z.string(),
    valorCalculado: z.number(),
});

export const mealFoodSchema = z.object({
    id: z.string(),
    codigoAlimento: z.string(),
    nomeAlimento: z.string(),
    medidasCaseiras: z.array(measureSchema),
    medidaSelecionada: measureSchema,
    quantidade: z.number(),
    totalGramas: z.number(),
    macros: macroTotalsSchema,
    nutrientesCompletos: z.array(nutrientTotalSchema),
    nutrientesOriginais: z.array(nutrientSchema).optional(),
});

export const mealOptionSchema = z.object({
    id: z.string(),
    titulo: z.string(),
    observacoes: z.string(),
    alimentos: z.array(mealFoodSchema),
    totalMacros: macroTotalsSchema,
});

export const mealSchema = z.object({
    id: z.string(),
    nome: z.string(),
    horario: z.string(),
    observacoes: z.string(),
    alimentos: z.array(mealFoodSchema),
    substituicao: mealOptionSchema.optional(),
    totalMacros: macroTotalsSchema,
});

export const dietPlanPatientSchema = z.object({
    nome: z.string(),
    email: z.string(),
    dataNascimento: z.string().optional(),
});

export const dietPlanStateSchema = z.object({
    id: z.string().optional(),
    tituloPlano: z.string(),
    objetivoDoPlano: z.string(),
    orientacoesGerais: z.string(),
    planoAtivo: z.boolean(),
    paciente: dietPlanPatientSchema,
    refeicoes: z.array(mealSchema),
    totalMacros: macroTotalsSchema,
});

export const dietPlanRecordSchema = dietPlanStateSchema.extend({
    id: z.string().trim().min(1),
    createdAt: z.string().trim().min(1),
    updatedAt: z.string().trim().min(1),
});

export type DietPlanRequest = z.infer<typeof dietPlanRequestSchema>;
export type PersistedDietPlan = z.infer<typeof persistedDietPlanSchema>;
export type FoodSearchResponse = z.infer<typeof foodSearchResponseSchema>;
