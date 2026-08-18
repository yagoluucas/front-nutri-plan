import { z } from "zod";

const emailSchema = z.string().email("Email inválido, valide e tente novamente.").trim().toLowerCase().min(5).max(100);

export const loginSchema = z.object({
    email: z.string().email("E-mail inválido, verifique e tente novamente."),
    senha: z.string().min(1, "A senha é obrigatória.")
});

export type LoginFormValues = z.infer<typeof loginSchema>;

export const registerSchema = z.object({
    nome: z.string().trim().min(2, "Nome deve ter pelo menos 2 caracteres").max(50, "Nome deve ter no máximo 50 caracteres"),
    sobrenome: z.string().trim().min(2, "Sobrenome deve ter pelo menos 2 caracteres").max(50, "Sobrenome deve ter no máximo 50 caracteres"),
    email: emailSchema,
    dataNascimento: z.coerce.date({ error: "A data de nascimento é obrigatória" })
        .max(new Date(), "A data de nascimento não pode estar no futuro")
        .max(new Date(new Date().getFullYear() - 15, new Date().getMonth(), new Date().getDate()), "Você precisa ter no mínimo 15 anos para se cadastrar"),
    crn: z.string().trim().min(5, "O CRN deve ter no mínimo 5 caracteres").max(15, "O CRN deve ter no máximo 15 caracteres"),
    senha: z.string().min(8, "Senha deve ter pelo menos 8 caracteres").max(20, "Senha deve ter no máximo 20 caracteres"),
    confirmacaoSenha: z.string().min(8, "A confirmação da senha é obrigatória")
}).refine((data) => data.senha === data.confirmacaoSenha, {
    message: "As senhas não coincidem",
    path: ["confirmacaoSenha"],
});

export type RegisterFormValues = z.infer<typeof registerSchema>;

export const confirmRegistrationSchema = z.object({
    token: z.string().trim().min(1, "Token de confirmação ausente.").max(4096, "Token de confirmação inválido."),
}).strict();

export type ConfirmRegistrationValues = z.infer<typeof confirmRegistrationSchema>;

export const resendRegistrationSchema = z.object({
    email: emailSchema,
}).strict();

export type ResendRegistrationValues = z.infer<typeof resendRegistrationSchema>;

const publicAuthResponseSchema = z.object({
    message: z.string().trim().min(1),
    error: z.boolean(),
    statusCode: z.number().int(),
});

export const pendingRegistrationResponseSchema = publicAuthResponseSchema.extend({
    error: z.literal(false),
    statusCode: z.literal(202),
});

export type PendingRegistrationResponse = z.infer<typeof pendingRegistrationResponseSchema>;

export const confirmedRegistrationResponseSchema = publicAuthResponseSchema.extend({
    error: z.literal(false),
    statusCode: z.literal(201),
});

export type ConfirmedRegistrationResponse = z.infer<typeof confirmedRegistrationResponseSchema>;

export const authResponseSchema = z.object({
    message: z.string().optional(),
    error: z.boolean().optional(),
    statusCode: z.number().int().optional(),
}).passthrough();

export type AuthResponse = z.infer<typeof authResponseSchema>;
