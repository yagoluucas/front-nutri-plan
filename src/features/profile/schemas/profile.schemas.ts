import { z } from "zod";

const profileImageSrcSchema = z
    .string()
    .trim()
    .min(1, "Imagem invalida.")
    .max(2_800_000, "Imagem muito grande.")
    .refine((value) => {
        if (/^https?:\/\/[^\s]+$/i.test(value)) {
            return true;
        }

        return value.startsWith("/");
    }, "Imagem invalida.");

export const optionalProfileImageSchema = z.preprocess(
    (value) => value === null || value === "" ? undefined : value,
    profileImageSrcSchema.optional(),
);

const profileFormBirthDateSchema = z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Data invalida.")
    .refine((value) => new Date(`${value}T00:00:00`) <= new Date(), "A data nao pode estar no futuro.");

const profileApiBirthDateSchema = z.string()
    .trim()
    .refine((value) => !Number.isNaN(Date.parse(value)), "Data invalida.");

export const profileFormSchema = z.object({
    nome: z.string().trim().min(2, "Informe seu nome.").max(50, "Nome muito longo."),
    sobrenome: z.string().trim().min(2, "Informe seu sobrenome.").max(50, "Sobrenome muito longo."),
    email: z.string().trim().toLowerCase().email("E-mail invalido.").min(5).max(100),
    dataNascimento: profileFormBirthDateSchema,
    crn: z.string().trim().min(5, "O CRN deve ter no minimo 5 caracteres.").max(15, "O CRN deve ter no maximo 15 caracteres."),
}).strict();

export type ProfileFormValues = z.infer<typeof profileFormSchema>;

export const favoriteFoodSchema = z.object({
    idAlimento: z.string().trim().min(1, "Id do alimento e obrigatorio."),
    nomeAlimento: z.string().trim().min(1, "Nome do alimento favorito e obrigatorio."),
}).strict();

export const favoriteFoodsSchema = z.array(favoriteFoodSchema).default([]);

export type FavoriteFood = z.infer<typeof favoriteFoodSchema>;

export const profileApiSchema = profileFormSchema.extend({
    dataNascimento: profileApiBirthDateSchema,
    id: z.string().trim().min(1),
    imagemPerfil: optionalProfileImageSchema,
    imagemCapa: optionalProfileImageSchema,
    alimentosFavoritos: favoriteFoodsSchema,
    createdAt: z.string().optional(),
    updatedAt: z.string().optional(),
});

export const profileUpdateApiSchema = profileFormSchema.partial().extend({
    alimentosFavoritos: favoriteFoodsSchema.optional(),
});
