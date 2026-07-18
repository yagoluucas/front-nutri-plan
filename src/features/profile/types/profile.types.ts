import { z } from "zod";
import { profileApiSchema } from "../schemas/profile.schemas";

export type NutritionistProfile = z.infer<typeof profileApiSchema> & {
    profissao?: string;
    fotoPerfil?: string;
};
