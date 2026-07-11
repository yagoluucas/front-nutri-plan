import { ProfileFormValues } from "../schemas/profile.schemas";

export interface NutritionistProfile extends ProfileFormValues {
    id?: string;
    profissao?: string;
    imagemPerfil?: string;
    imagemCapa?: string;
    fotoPerfil?: string;
    createdAt?: string;
    updatedAt?: string;
}
