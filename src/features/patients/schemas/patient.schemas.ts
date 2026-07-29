import { z } from "zod";
import { dietPlanRecordSchema } from "../../diet-plan/schemas/dietPlan.schemas";

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

export function getTodayDateInputValue(date = new Date()) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

const optionalFutureOrCurrentDate = z.preprocess(
    (value) => typeof value === "string" && value.trim() === "" ? undefined : value,
    z.string()
        .regex(/^\d{4}-\d{2}-\d{2}$/, "Data invalida.")
        .refine(
            (value) => value >= getTodayDateInputValue(),
            "A data de entrega nao pode estar no passado.",
        )
        .optional(),
);

export const patientFormSchema = z.object({
    nome: z.string().trim().min(2, "Informe o nome do paciente.").max(50, "Nome muito longo."),
    sobrenome: z.string().trim().min(2, "Informe o sobrenome do paciente.").max(50, "Sobrenome muito longo."),
    email: optionalEmail,
    dataNascimento: optionalBirthDate,
    dataEntregaPrimeiroPlano: optionalFutureOrCurrentDate,
    sexo: z.enum(["Masculino", "Feminino", "Outro"], { message: "Selecione o sexo do paciente." }),
    observacoes: optionalTrimmedString(1000, "Observacoes muito longas."),
}).strict();

export type PatientFormValues = z.infer<typeof patientFormSchema>;

export const patientSummarySchema = z.object({
    id: z.string().trim().min(1),
    nome: z.string().trim().min(1),
    sobrenome: z.string().trim().min(1),
    email: z.string().optional(),
    dataNascimento: patientFormSchema.shape.dataNascimento,
    dataEntregaPrimeiroPlano: patientFormSchema.shape.dataEntregaPrimeiroPlano,
    qtdPlanos: z.number().int().min(0),
    createdAt: z.string().trim().min(1),
    updatedAt: z.string().trim().min(1),
});

export const patientSchema = patientFormSchema.extend({
    id: z.string().trim().min(1),
    idNutricionista: z.string().trim().min(1),
    qtdPlanos: z.number().int().min(0),
    planosAlimentares: z.array(dietPlanRecordSchema),
    createdAt: z.string().trim().min(1),
    updatedAt: z.string().trim().min(1),
});
