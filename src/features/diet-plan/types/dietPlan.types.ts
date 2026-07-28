import { z } from "zod";
import {
    dietPlanPatientSchema,
    dietPlanStateSchema,
    foodAutocompleteSchema,
    foodDetailSchema,
    macroTotalsSchema,
    mealFoodSchema,
    mealOptionSchema,
    mealSchema,
    measureSchema,
    nutrientSchema,
    nutrientTotalSchema,
} from "../schemas/dietPlan.schemas";

export type INutriente = z.infer<typeof nutrientSchema>;
export type IMedidaCaseira = z.infer<typeof measureSchema>;
export type IAlimentoDetail = z.infer<typeof foodDetailSchema>;
export type IAlimentoAutocomplete = z.infer<typeof foodAutocompleteSchema>;
export type IMealFood = z.infer<typeof mealFoodSchema>;
export type IMacroTotals = z.infer<typeof macroTotalsSchema>;
export type INutrientTotal = z.infer<typeof nutrientTotalSchema>;
export type IMealOption = z.infer<typeof mealOptionSchema>;
export type IMeal = z.infer<typeof mealSchema>;
export type IPatientData = z.infer<typeof dietPlanPatientSchema>;
export type IDietPlanState = z.infer<typeof dietPlanStateSchema>;
