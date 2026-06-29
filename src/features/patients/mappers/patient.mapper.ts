import { Patient } from "../types/patient.types";

export interface BackendPacienteDraft {
    nome: string;
    sobrenome: string;
    email: string;
    dataNascimento: string;
    sexo: "Masculino" | "Feminino" | "Outro";
    planosAlimentares: Array<{
        objetivoDoPlano?: string;
        observacoesGerais?: string;
        refeicoes: Array<{
            nome: string;
            horario: string;
            observacoes?: string;
            alimentos: Array<{
                codigoAlimento: string;
                quantidade: number;
                medidaSelecionada: {
                    nomeMedida: string;
                    total: number;
                    unidadeMedida: string;
                    tipoMedida: "Caseira" | "Tecnica";
                };
            }>;
        }>;
    }>;
}

export function mapPatientToBackendDraft(patient: Patient): BackendPacienteDraft {
    return {
        nome: patient.nome,
        sobrenome: patient.sobrenome,
        email: patient.email || "",
        dataNascimento: patient.dataNascimento || "",
        sexo: patient.sexo,
        planosAlimentares: patient.planosAlimentares.map((plan) => ({
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
    };
}

