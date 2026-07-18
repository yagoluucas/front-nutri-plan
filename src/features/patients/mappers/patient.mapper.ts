import { z } from "zod";
import { Patient } from "../types/patient.types";

export const backendPacienteDraftSchema = z.object({
    idNutricionista: z.string().trim().min(1),
    nome: z.string(),
    sobrenome: z.string(),
    email: z.string().optional(),
    dataNascimento: z.string().optional(),
    sexo: z.enum(["Masculino", "Feminino", "Outro"]),
    observacoes: z.string().optional(),
    planosAlimentares: z.array(z.object({
        titulo: z.string().optional(),
        objetivoDoPlano: z.string().optional(),
        observacoesGerais: z.string().optional(),
        refeicoes: z.array(z.object({
            nome: z.string(),
            horario: z.string(),
            observacoes: z.string().optional(),
            alimentos: z.array(z.object({
                codigoAlimento: z.string(),
                quantidade: z.number(),
                medidaSelecionada: z.object({
                    nomeMedida: z.string(),
                    total: z.number(),
                    unidadeMedida: z.string(),
                    tipoMedida: z.enum(["Caseira", "Tecnica"]),
                }),
            })),
        })),
    })),
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
        sexo: patient.sexo,
        observacoes: optionalString(patient.observacoes),
        planosAlimentares: patient.planosAlimentares.map((plan) => ({
            titulo: optionalString(plan.titulo),
            objetivoDoPlano: plan.objetivoDoPlano || undefined,
            observacoesGerais: plan.orientacoesGerais,
            refeicoes: plan.refeicoes.map((meal) => ({
                nome: meal.nome,
                horario: meal.horario,
                observacoes: meal.observacoes || undefined,
                alimentos: meal.alimentos.map((food) => ({
                    codigoAlimento: food.codigoAlimento,
                    quantidade: food.quantidade,
                    medidaSelecionada: food.medidaSelecionada,
                })),
            })),
        })),
    });
}
