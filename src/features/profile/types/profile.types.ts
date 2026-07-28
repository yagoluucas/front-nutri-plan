import { z } from "zod";
import { nutritionistProfileSchema } from "../schemas/profile.schemas";

export type NutritionistProfile = z.infer<typeof nutritionistProfileSchema>;
