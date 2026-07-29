import { z } from "zod";
import { Patient } from "../types/patient.types";
import { dietPlanRequestSchema } from "../../diet-plan/schemas/dietPlan.schemas";
import { mapDietPlanToRequest } from "../../diet-plan/mappers/dietPlan.mapper";

export const backendPacienteDraftSchema = z.object({
    idNutricionista: z.string().trim().min(1),
    nome: z.string(),
    sobrenome: z.string(),
    email: z.string().optional(),
    dataNascimento: z.string().optional(),
    dataEntregaPrimeiroPlano: z.string().optional(),
    sexo: z.enum(["Masculino", "Feminino", "Outro"]),
    observacoes: z.string().optional(),
    planosAlimentares: z.array(dietPlanRequestSchema),
}).strict();

export type BackendPacienteDraft = z.infer<typeof backendPacienteDraftSchema>;

function optionalString(value?: string): string | undefined {
    const trimmedValue = value?.trim();
    return trimmedValue || undefined;
}

export function mapPatientToBackendDraft(patient: Patient): BackendPacienteDraft {
    return backendPacienteDraftSchema.parse({
        idNutricionista: patient.idNutricionista,
        nome: patient.nome,
        sobrenome: patient.sobrenome,
        email: optionalString(patient.email),
        dataNascimento: optionalString(patient.dataNascimento),
        dataEntregaPrimeiroPlano: optionalString(patient.dataEntregaPrimeiroPlano),
        sexo: patient.sexo,
        observacoes: optionalString(patient.observacoes),
        planosAlimentares: patient.planosAlimentares.map(mapDietPlanToRequest),
    });
}
