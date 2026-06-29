import { z } from "zod";

const optionalTrimmedString = (maxLength: number, message: string) =>
    z.preprocess(
        (value) => typeof value === "string" && value.trim() === "" ? undefined : value,
        z.string().trim().max(maxLength, message).optional(),
    );

const optionalEmail = z.preprocess(
    (value) => typeof value === "string" && value.trim() === "" ? undefined : value,
    z.string().trim().email("E-mail invalido.").max(100, "E-mail muito longo.").optional(),
);

const optionalBirthDate = z.preprocess(
    (value) => typeof value === "string" && value.trim() === "" ? undefined : value,
    z.string()
        .regex(/^\d{4}-\d{2}-\d{2}$/, "Data invalida.")
        .refine((value) => new Date(`${value}T00:00:00`) <= new Date(), "A data nao pode estar no futuro.")
        .optional(),
);

export const patientFormSchema = z.object({
    nome: z.string().trim().min(2, "Informe o nome do paciente.").max(50, "Nome muito longo."),
    sobrenome: z.string().trim().min(2, "Informe o sobrenome do paciente.").max(50, "Sobrenome muito longo."),
    email: optionalEmail,
    dataNascimento: optionalBirthDate,
    sexo: z.enum(["Masculino", "Feminino", "Outro"], { message: "Selecione o sexo do paciente." }),
    observacoes: optionalTrimmedString(1000, "Observacoes muito longas."),
}).strict();

export type PatientFormValues = z.infer<typeof patientFormSchema>;

