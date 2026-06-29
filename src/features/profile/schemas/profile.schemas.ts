import { z } from "zod";

export const profileFormSchema = z.object({
    nome: z.string().trim().min(2, "Informe seu nome.").max(100, "Nome muito longo."),
    profissao: z.string().trim().min(2, "Informe sua profissao.").max(80, "Profissao muito longa."),
    crn: z.string().trim().min(3, "Informe o CRN.").max(30, "CRN muito longo."),
}).strict();

export type ProfileFormValues = z.infer<typeof profileFormSchema>;

