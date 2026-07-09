import { z } from "zod";

export const loginSchema = z.object({
    email: z.string().email("E-mail inválido, verifique e tente novamente."),
    senha: z.string().min(1, "A senha é obrigatória.")
});

export type LoginFormValues = z.infer<typeof loginSchema>;

export const registerSchema = z.object({
    nome: z.string().trim().min(2, "Nome deve ter pelo menos 2 caracteres").max(50, "Nome deve ter no máximo 50 caracteres"),
    sobrenome: z.string().trim().min(2, "Sobrenome deve ter pelo menos 2 caracteres").max(50, "Sobrenome deve ter no máximo 50 caracteres"),
    email: z.string().email("Email inválido, valide e tente novamente.").trim().toLowerCase().min(5).max(100),
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
